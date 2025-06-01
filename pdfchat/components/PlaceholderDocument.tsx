"use client"

import React from 'react'
import { Button } from './ui/button'
import { CrownIcon, PlusCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSubscription from '@/hooks/useSubscription'
import '../app/globals.css';

const PlaceholderDocument = () => {

  const router = useRouter();
  const { isOverFileLimit } = useSubscription();

  const handleClick = () => {
    //check if user is free tier and if they over the file limit, push to the upgrade page
    if (isOverFileLimit){
      router.push("/dashboard/upgrade");
    }else{
      router.push("/dashboard/upload");
    }
  }

  return (
    <Button onClick={handleClick} className='flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-gray-300 drop-shadow-md text-gray-500'>
    {isOverFileLimit ? (
      <CrownIcon className='crown-icon fill-yellow-400 text-yellow-600' />
    ) : (
      <PlusCircleIcon className='w-16 h-16'/>
    )}
    {isOverFileLimit ? (
      <div className='flex'>
        <p className='flex mr-1'>Upgrade to Upload</p>
      </div>
    ):(
      <p>Add a document</p>
    )}
    </Button>
  )
}

export default PlaceholderDocument