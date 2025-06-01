"use client"

import React, { useEffect, useRef, useState, useTransition, FormEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2Icon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { collection, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { askQuestion } from '@/actions/askQuestion';
import ChatMessage from './ChatMessage';
import { toast } from 'sonner';

export type Message = {
    id?: string;
    role: "human" | "ai" | "placeholder";
    message: string;
    createdAt: Date;
};

function  Chat({ id } : { id:string }) {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const messagesRef = useRef<Message[]>([]);

  const bottomOfChatRef = useRef<HTMLDivElement>(null);
  const [snapShot, loading, error] = useCollection(
    user && query(
        collection(db, "users", user?.id, "files", id, "chat"),
        orderBy("createdAt", "asc")
    )
  );

  useEffect(() => {
  if (error) {
    console.error("Firestore error:", error);
    toast.error("Failed to load chat messages");
  }
  }, [error]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
  if (!snapShot) return;

  console.log("Updated snapshot", snapShot.docs);

  const currentMessages = [...messagesRef.current];

  const lastMessage = currentMessages.pop();

  if (lastMessage?.role === "ai" && lastMessage.message === "Thinking...") {
    // Placeholder AI message — skip update
    return;
  }

  const newMessages = snapShot.docs.map(doc => {
    const { role, message, createdAt } = doc.data();

    return {
      id: doc.id,
      role,
      message,
      createdAt: createdAt.toDate(),
    };
  });

  setMessages(newMessages);
}, [snapShot]);

  useEffect(() => {
    bottomOfChatRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const q = input;

    setInput("");

    //Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        role: "human",
        message: q,
        createdAt: new Date(),
      },
      {
        role: "ai",
        message: "Thinking...",
        createdAt: new Date(),
      }
    ]);

    startTransition(async () => {
      const { success, message } = await askQuestion(id, q);

      if(!success){
        //toast...
        toast.warning(message);
        
        setMessages((prev) => prev.slice(0,prev.length-1).concat([
          {
            role: "ai",
            message: `Whoops... ${message}`,
            createdAt: new Date(),
          }
        ]))

      }

    })
    
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable chat message area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600" />
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <ChatMessage
                key={"placeholder"}
                message={{
                  role: "ai",
                  message: "Ask me anything about the document!",
                  createdAt: new Date(),
                }}
              />
            )}

            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            <div ref={bottomOfChatRef} />
          </>
        )}
      </div>

      {/* Sticky input form */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 w-full space-x-2 p-5 bg-indigo-600/75 flex"
      >
        <Input
          className="bg-white flex-1"
          placeholder="Ask a Question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" disabled={!input || isPending}>
          {isPending ? (
            <Loader2Icon className="animate-spin w-5 h-5 text-white" />
          ) : (
            "Ask"
          )}
        </Button>
      </form>
    </div>
  )
}

export default Chat