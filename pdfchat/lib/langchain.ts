// Groq for Chat
import { ChatGroq } from "@langchain/groq";

//Cohere for Embeddings
import { CohereEmbeddings } from "@langchain/cohere";

//OpenAI
// import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

//OPENAI
// const model = new ChatOpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//   modelName: "gpt-3.5-turbo",
// });

// GROQ - Use llama3 or mixtral
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-70b-8192", // or "mixtral-8x7b-32768"
});

const LIMIT = 10;

export const indexName = "chatpdf";

async function generateDocs(docId: string) {
    const { userId } = await auth();

    if(!userId){
        throw new Error("User not found");
    }

    console.log("---Fetching the download URL from Firebase...---");
    const firebaseRef = await adminDb.collection("users").doc(userId).collection("files").doc(docId).get();
    const downloadUrl = firebaseRef.data()?.downloadUrl;

    if(!downloadUrl){
        throw new Error("Download  URL not found");
    }

    console.log(`--- Download URL fetched successfully: ${downloadUrl} ---`);

    //fetch the PDF from the specified URL
    const response = await fetch(downloadUrl);

    //load the PDF into PDFDocument object
    const data = await response.blob();

    //load the PDF document from the specified path
    console.log("---Loading PDF document...---");
    const loader = new PDFLoader(data);
    const docs = await loader.load();

    //split the loaded document into smaller parts for easier processing
    console.log("---Splitting the document into smaller parts...---");
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(docs);
    console.log(`---Split into ${splitDocs.length} parts---`);

    return splitDocs;
}

async function namespaceExists(index: Index<RecordMetadata>, namespace: string) {
    if (namespace === null) throw new Error("No namespacevalue provided.");
    const { namespaces } = await index.describeIndexStats();
    return namespaces?.[namespace] !== undefined;
}

export async function generateEmbeddingsInPineconeVectoreStore(docId: string) {
    const { userId } = await auth();

    if(!userId){
        throw new Error("user not found");
    }

    let pineconeVectorStore;

    //Generate embeddings (numerical representations) for the split documents
    console.log("---Generating embeddings...---");

    //OPENAI
    // const embeddings = new OpenAIEmbeddings();

    //COHERE EMBEDDINGS
    const embeddings = new CohereEmbeddings({
        apiKey: process.env.COHERE_API_KEY,
        model: "embed-english-v3.0",
    });

    const index = await pineconeClient.index(indexName);
    const namespaceAlreadyExists =  await namespaceExists(index, docId);

    if(namespaceAlreadyExists) {
        console.log(`---Namespace ${docId} already exists, reusing existing embeddings...---`);

        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: index,
            namespace: docId,
        });

        return pineconeVectorStore;
    }else{
        //if namespace does not exist, download pdf from firestore via the embeddings and store them in the pinecone vectore store
        const splitDocs = await generateDocs(docId);

        console.log(`---Namespace ${docId} does not exist, generating and storing new embeddings...---`);
        pineconeVectorStore = await PineconeStore.fromDocuments(
            splitDocs, 
            embeddings,
            {
                pineconeIndex: index,
                namespace: docId,
            }
        )   

        return pineconeVectorStore;
    }
}

export async function fetchMessagesFromDB(docId: string) {
    const { userId } = await auth();

    if(!userId){
        throw new Error("user not found");
    }

    const chats = await adminDb.collection("users").doc(userId).collection("files").doc(docId).collection("chat").orderBy("createdAt", "desc").limit(LIMIT).get();

    const chatHistory = chats.docs.map((doc) => doc.data().role === "human" ? new HumanMessage(doc.data().message) : new AIMessage(doc.data().message));

    console.log(`--- fetched the last ${chatHistory.length} messages successfully ---`);
    console.log(chatHistory.map((msg) => msg.content.toString()));

    return chatHistory;
}

export async function generateLangchainCompletion(docId: string, question: string) {

    const pineconeVectorStore = await generateEmbeddingsInPineconeVectoreStore(docId);
    if(!pineconeVectorStore){
        throw new Error("Pinecone vector store not found");
    }

    //create a retriever to search throw the vector store
    console.log("--- Creating a retriever... ---");
    const retriever = pineconeVectorStore.asRetriever();

    //fetch chat history from database
    const chatHistory = await fetchMessagesFromDB(docId);

    //define a prompt template for generating search queries based on conversation history
    console.log("--- Defining a prompt template... ---");
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        ...chatHistory,
        ["user", "{input}"],
        [
            "user",
            "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
        ],
    ]);

    //create a history-aware retriever chain that uses the model, retriever, and prompt
    console.log("--- Creating a history-aware retriever chain... ---");
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: model,
        retriever,
        rephrasePrompt: historyAwarePrompt,
    });

    //define a prompt template for answering questions based on retrieved context
    const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "Answer the user's questions based on the below context:\n\n{context}",
        ],
        ...chatHistory,
        ["user", "{input}"],
    ]);

    //create a chain to combine the retrieved documents into a coherent response
    console.log("--- Creating a document combining chain... ---");
    const historyAwareCobineDocsChain = await createStuffDocumentsChain({
        llm: model,
        prompt: historyAwareRetrievalPrompt,
    });

    //create the main retrieval chain that combines the history-aware retriever and document combining chains
    console.log("--- Creating the main retrieval chain... ---");
    const conversationalRetrievalChain = await createRetrievalChain({
        retriever: historyAwareRetrieverChain,
        combineDocsChain: historyAwareCobineDocsChain,
    });

    console.log("--- Running the chain with a sample conversation... ---");
    const reply = await conversationalRetrievalChain.invoke({
        chat_history: chatHistory,
        input: question,
    });

    console.log(reply.answer);
    return reply.answer;  
};

export { model };