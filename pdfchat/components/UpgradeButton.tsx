'use client'

import useSubscription from '@/hooks/useSubscription'
import React, { useTransition } from 'react'
import { Button } from './ui/button';
import Link from 'next/link';
import { Crown, Loader2Icon } from 'lucide-react';
import { createStripePortal } from '@/actions/createStripePortal';
import { useRouter } from 'next/navigation';

const UpgradeButton = () => {
  const { hasActiveMembership, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAccount = () => {
    startTransition(async () => {
        const stripePortalUrl = await createStripePortal();
        router.push(stripePortalUrl);
    });
  };

  if (!hasActiveMembership && !loading){
    return (
        <Button asChild variant="destructive" className='border-indigo-600 bg-indigo-600 hover:bg-indigo-500'>
            <Link href="/dashboard/upgrade">
               Upgrade <Crown className='fill-yellow-400 text-yellow-400' />
            </Link>
        </Button>
    );
  }

  if(loading)
    return (
        <Button variant="default" className='border-indigo-600 bg-indigo-600'>
            <Loader2Icon className='animate-spin' />
        </Button>
    );
  
  return (
    <Button 
        className='cursor-pointer'
        onClick={handleAccount}
        disabled={isPending}
    >
        {isPending ? (
            <Loader2Icon className='animate-spin' />
        ) : (
            <p>
                Manage Plan
            </p>
        )}
    </Button>
  )
}

export default UpgradeButton