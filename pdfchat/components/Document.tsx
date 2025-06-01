"use client";

import { useRouter } from "next/navigation";
import byteSize from "byte-size";

import React, { useState, useTransition } from 'react'
import { Button } from "./ui/button";
import { Download, Loader2Icon, Trash2Icon } from "lucide-react";
import useSubscription from "@/hooks/useSubscription";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteDocument } from "@/actions/deleteDocument";

function Document({
  id,
  name,
  size,
  downloadUrl,
}: {
  id: string;
  name: string;
  size: number;
  downloadUrl: string;
}) {
  const router = useRouter();
  const { hasActiveMembership } = useSubscription();
  const [isDeleting, startTransaction] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  
  return (
    <div className="flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all transform hover:scale-105 hover:bg-indigo-600 hover:text-white cursor-pointer group">
        <div 
        className="flex-1"
        onClick={() => {router.push(`/dashboard/files/${id}`)
        }}>
            <p className="font-semibold line-clamp-2">{name}</p>
            <p className="text-sm text-gray-500 group-hover:text-indigo-100">{byteSize(size).value} KB</p>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" className="text-black hover:bg-white border-indigo-600 border-2 hover:text-indigo-600" asChild>
            <a href={downloadUrl} download>
              <Download className="cursor-pointer h-6 w-6"/>
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                onClick={() => setShowDialog(!showDialog)} 
                variant="outline" 
                className="text-black hover:text-white  hover:bg-red-500 ml-2 border-indigo-600 border-2 cursor-context-menu" 
                disabled={isDeleting || !hasActiveMembership}
              >
                  {hasActiveMembership && !isDeleting ? (
                    <Trash2Icon size={50} className="cursor-pointer"/>
                  ): hasActiveMembership && isDeleting ? (
                    <p>Deleting...</p>
                  ):(
                    <p className="flex justify-center items-center"><Trash2Icon size={15} fill="red" color="red" className="w-15 h-15" /><span className="ml-2">Upgrade to Delete</span></p>
                  )}

              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Delete <b>{name}</b><br />
                  This action cannot be undone. This will permanently delete your
                  document.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => {
                    startTransaction(async () => {
                      await deleteDocument(id);
                    })
                  }} 
                  className="bg-red-600"
                >
                  {isDeleting ? (
                    <Loader2Icon />
                  ): (
                    <p>Delete</p>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
    </div>
  )
}

export default Document;