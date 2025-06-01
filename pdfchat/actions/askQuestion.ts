'use server';

import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";

const PRO_LIMIT = 20;
const FREE_LIMIT = 3;

export async function askQuestion(id: string, question: string) {
    auth.protect();
    const { userId } = await auth();

    const chatRef = adminDb.collection("users").doc(userId!).collection("files").doc(id).collection("chat");

    //check how many user messages are in the chat
    const chatSnapshot = await chatRef.get();
    const userMessages = chatSnapshot.docs.filter(
        (doc) => doc.data().role === "human"
    );

    //limit FREE/PRO users here
    const userRef = await adminDb.collection("users").doc(userId!).get();
    if (!userRef.data()?.hasActiveMembership) {
        if (userMessages.length >= FREE_LIMIT) {
            return {
                success: false,
                message: `Chat limit exceeded. You will need to switch to Premium Plan to continue!`
            }
        }
    }
    if (userRef.data()?.hasActiveMembership) {
        if (userMessages.length >= PRO_LIMIT) {
            return {
                success: false,
                message: `You have reached chat limit of ${PRO_LIMIT} questions per document!`
            }
        }
    }

    const userMessage: Message = {
        role: "human",
        message: question,
        createdAt: new Date(),
    }

    await chatRef.add(userMessage);

    //Generate AI Response
    const reply = await generateLangchainCompletion(id, question);

    const aiMessage: Message = {
        role: "ai",
        message: reply,
        createdAt: new Date(),
    }

    await chatRef.add(aiMessage);

    return { success : true, message : null};
}