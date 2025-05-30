import Documents from '@/components/Documents';
import React from 'react'

export const dynamic = "force-dynamic";

function Dashboard() {
  return (
    <div className='max-w-7xl mx-auto min-h-screen flex flex-col'>
        <h1 className='bg-gray-100 text-3xl p-5 font-extralight text-indigo-600'>My Documents</h1>
        <Documents />
    </div>
  )
}

export default Dashboard