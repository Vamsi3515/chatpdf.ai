import Chat from "@/components/Chat";
import PdfView from "@/components/PdfView";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import React from "react";

async function ChatToFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  auth.protect(); 
  const { userId } = await auth();

  if (!userId) {
    return <div>User not authenticated.</div>;
  }

  const ref = await adminDb.collection("users").doc(userId).collection("files").doc(id).get();
  const url = ref.data()?.downloadUrl;

  return (
    <div className="grid md:grid-cols-5 lg:grid-cols-5 h-screen">
      <div className="col-span-5 md:col-span-2 lg:col-span-2 overflow-auto">
        <Chat id={id} />
      </div>
      <div className="col-span-5 md:col-span-3 lg:col-span-3 bg-gray-100 lg:border-indigo-600 border-r-2 lg:-order-1 overflow-auto">
        {url ? (
          <PdfView url={url} />
        ) : (
          <div className="flex items-center justify-center h-screen text-lg text-gray-600">
            <p>Document not found or no download URL available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatToFilePage;