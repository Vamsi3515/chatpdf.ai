import { SignedIn, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { FilePlus2 } from 'lucide-react'

const Header = () => {
  return (
    <div className='flex justify-between items-center bg-white shadow-sm p-5'>

        <Link href="/dashboard" className='font-bold text-2xl'>
            <span className='text-indigo-600'>Chat</span>PDF<span className='text-indigo-600'>.ai</span>
        </Link>
        
        <SignedIn>
            <div className='flex items-center space-x-2 gap-2'>
                <Button asChild variant="link" className='hidden md:flex'>
                    <Link href="/dashboard/upgrade">Pricing</Link>
                </Button>

                <Button asChild variant="outline">
                    <Link href="/dashboard">My Documents</Link>
                </Button>

                <Button asChild variant="outline" className='border-indigo-600'>
                    <Link href="/dashboard/upload">
                        <FilePlus2 className='text-indigo-600' />
                    </Link>
                </Button>

                <UserButton />
            </div>
        </SignedIn>
    </div>
  )
}

export default Header