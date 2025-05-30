"use client"

import { generateEmbeddings } from '@/actions/generateEmbeddings';
import { db, storage } from '@/firebase';
import { useUser } from '@clerk/nextjs';
import { error } from 'console';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';

export enum Statustext{
    UPLOADING= "Uploading file...",
    UPLOADED= "File uploaded successfully",
    SAVING= "Saving file to database...",
    GENERATING= "Generating AI Embeddings, This will only take a few seconds...",
}

export type Status = Statustext[keyof Statustext];

function useUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const handleUpload = async (file: File) => {
    if(!file || !user) return;

    //FREE OR PRO USER

    const fileIdToUploadTo = uuidv4();

    //uploading into firebase storage
    const storageRef = ref(storage, `users/${user.id}/files/${fileIdToUploadTo}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed", (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setStatus(Statustext.UPLOADING);
        setProgress(percent);
        }, (error) => {
            console.log("Error uploading the file : ", error);
            //toast
        }, async () => {
            setStatus(Statustext.UPLOADED);

            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

            setStatus(Statustext.SAVING);
            //storing into firestore
            await setDoc(doc(db, "users", user.id, "files", fileIdToUploadTo), {
                name: file.name,
                size: file.size,
                type: file.type,
                downloadUrl: downloadUrl,
                ref: uploadTask.snapshot.ref.fullPath,
                createdAt: new Date(),
            })

            setStatus(Statustext.GENERATING);
            //Generating AI Embedings...
            await generateEmbeddings(fileIdToUploadTo);

            setFileId(fileIdToUploadTo);
        }
    );

  }

  return { progress, status, fileId, handleUpload };

}

export default useUpload;