"use client";

import useUpload, { Statustext } from '@/hooks/useUpload';
import { CheckCircleIcon, CircleArrowDown, HammerIcon, RocketIcon, SaveIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { JSX, useCallback, useEffect, useState } from 'react';
import { Accept, useDropzone } from 'react-dropzone';

const FileUploader = () => {
  const [error, setError] = useState<string | null>(null);
  const { progress, status, fileId, handleUpload } = useUpload();
  const router = useRouter();

  useEffect(() => {
    if(fileId){
        router.push(`/dashboard/files/${fileId}`);
    }
  }, [fileId, router]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    console.log("Accepted files:", acceptedFiles);
    
    const file = acceptedFiles[0];

    if(file){
      await handleUpload(file);
    }else{
      //handle here
    }

  }, []);

  const onDropRejected = useCallback((fileRejections: any) => {
    setError("Only PDF files are allowed!");
  }, []);

  const statusIcons: { [key in Statustext]: JSX.Element; }  = {
    [Statustext.UPLOADING]: (
      <RocketIcon className="h-20 w-20 text-indigo-600" />
    ),
    [Statustext.UPLOADED]: (
      <CheckCircleIcon className="h-20 w-20 text-indigo-600" />
    ),
    [Statustext.SAVING]: (
      <SaveIcon className="h-20 w-20 text-indigo-600 animate-pulse" />
    ),
    [Statustext.GENERATING]: (
      <HammerIcon className="h-20 w-20 text-indigo-600 animate-bounce" />
    ),
  };

  const accept: Accept = {
    'application/pdf': ['.pdf'],
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
  } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    multiple: false,
  });

  const uploadInProgress = progress != null && progress >= 0 && progress <= 100;

  return (
    <div className="flex flex-col gap-4 items-center justify-center max-w-7xl mx-auto">

      {uploadInProgress && (
        <div className='mt-32 flex flex-col gap-5 justify-center items-center'>
          <div 
            className={`radial-progress bg-indigo-300 text-white border-indigo-600 border-4  ${progress === 100 && "hidden"}`}
            role='progressbar'
            style={{
              // @ts-ignore
              "--value": progress,
              "--size": "12rem",
              "--thickness": "1.3rem"
            }}
            >
              {progress} %
          </div>

          {
            //@ts-ignore
            statusIcons[status!]
          }

          {/* @ts-ignore */}
          <p className='text-indigo-600 animate-pulse'>{status}</p>
        </div>
      )}

      {!uploadInProgress && <div
        {...getRootProps()}
        className={`p-10 border-dashed border-2 mt-10 w-[90%] flex justify-center items-center h-96 text-indigo-500 rounded-lg transition-colors ${
          isFocused || isDragAccept ? 'bg-indigo-500 text-white' : 'bg-indigo-100'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive && isDragAccept ? (
          <div className="flex flex-col gap-2 justify-center items-center">
            <RocketIcon className="w-12 h-12 animate-bounce" />
            <p>Drop the files here ...</p>
          </div>
        ) : isDragActive && !isDragAccept ? (
            <div className="flex flex-col gap-2 justify-center items-center">
                <X className="w-12 h-12 animate-bounce" color='red' />
                <p className='text-red-500'>Accepts PDFs Only !</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 justify-center items-center">
            <CircleArrowDown className="w-12 h-12 animate-bounce" />
            <p>Drag & drop a PDF file here, or click to select one</p>
            {error || !isFocused && <p className="font-semibold mt-2">{error}</p>}
          </div>
        )}
      </div>}
    </div>
  );
};

export default FileUploader;