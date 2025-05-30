"use client"

import React from 'react'
import { Button } from './ui/button'
import { Landmark, PlusCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PlaceholderDocument = () => {

  const router = useRouter();

  const handleClick = () => {
    //check if user is free tier and if they over the file limit, push to the upgrade page
    router.push("/dashboard/upload");
  }

  return (
    <Button onClick={handleClick} className='flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-gray-200 drop-shadow-md text-gray-400'>
    <PlusCircleIcon className='w-16 h-16'/>
      <p>Add a document</p>
    </Button>
  )
}

export default PlaceholderDocument