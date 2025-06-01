"use client"

import { createCheckoutSession } from '@/actions/createCheckoutSession';
import { createStripePortal } from '@/actions/createStripePortal';
import { Button } from '@/components/ui/button';
import useSubscription from '@/hooks/useSubscription';
import getStripe from '@/lib/stripe-js';
import { useUser } from '@clerk/nextjs';
import { CheckIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react'

export type UserDetails = {
  email: string;
  name: string;
}

function PricingPage() {
  const { user } = useUser();
  const router = useRouter();
  const { hasActiveMembership, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = () => {
    if(!user) return;

    const primaryEmail = user.primaryEmailAddress?.toString();
    const fullName = user.fullName;

    if (!primaryEmail || !fullName) {
      console.error("User is missing email or full name");
      return;
    }

    const userDetails: UserDetails = {
      email: primaryEmail,
      name: fullName,
    };

    startTransition(async () => {
      //load stripe
      const stripe = await getStripe();

      if(hasActiveMembership) {
        //create stripe portal...
        const stripePortalUrl = await createStripePortal();
        return router.push(stripePortalUrl);
      }

      const sessionId = await createCheckoutSession(userDetails);

      await stripe?.redirectToCheckout({
        sessionId,
      });

    });
  
  }

  return (
    <div>
      <div className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className='text-base font-semibold leading-7 text-indigo-600'>
          Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Scale Your Document Intelligence
          </p>
        </div>

        <p className='mx-auto mt-6 max-w-2xl px-10 text-center text-lg leading-8 text-gray-600'>
          Choose a smarter plan to interact with your PDFs — enhance productivity, streamline your workflow, and get instant answers.
        </p>

        <div className='max-w-md mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 md:max-w-2xl gap-8 lg:max-w-4xl'>
          <div className='ring-1 ring-gray-200 p-8 h-fit pb-12 rounded-3xl'>
            <h3 className="text-lg font-semibold leading-8 text-gray-900">
              Smarter Plan
            </h3>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Explore Core Features at No Cost
            </p>
            <p className='mt-6 flex items-baseline gap-x-1'>
              <span className='text-4xl font-bold tracking-tight text-gray-900'>Free</span>
            </p>

            <ul role='list' className='mt-8 space-y-3 text-sm leading-6 text-gray-600'>
              <li className='flex gap-x-3'>
                <CheckIcon className="h-6 w-5 flex-none text-indigo-600" />
                3 Documents
              </li>
              <li className='flex gap-x-3'>
                <CheckIcon className="h-6 w-5 flex-none text-indigo-600" />
                upto 5 messages per document
              </li>
              <li className='flex gap-x-3'>
                <CheckIcon className="h-6 w-5 flex-none text-indigo-600" />
                Try out the AI Chat Functionality
              </li>
            </ul>
          </div>

          <div className='ring-1 ring-indigo-600 p-8 h-fit pb-12 rounded-3xl'>
            <h3 className="text-lg font-semibold leading-8 text-indigo-600">
              Premium Plan
            </h3>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Maximize Productivity with PRO Features
            </p>
            <p className='mt-6 flex items-baseline gap-x-1'>
              <span className='text-4xl font-bold tracking-tight text-gray-900'>$6.99</span>
              <span className='text-sm font-semibold leading-6 text-gray-900'>/ month</span>
            </p>

            <ul role='list' className='mt-8 space-y-3 text-sm leading-6 text-gray-600'>
              <li className='flex gap-x-3'>
                <CheckIcon className="h-6 w-5 flex-none text-indigo-600" />
                Store upto 20 Documents
              </li>
              <li className='flex gap-x-3'>
                <CheckIcon className="h-6 w-5 flex-none text-indigo-600" />
                Upto 100 chats per Document
              </li>
              <li className='flex gap-x-3'>
                <CheckIcon className="h-6 w-5 flex-none text-indigo-600" />
                AI Chat Assistant
              </li>
              <li className='flex gap-x-3'>
                <CheckIcon className="h-6 w-5 flex-none text-indigo-600" />
                Advanced Analytics
              </li>
              <li className='flex gap-x-3'>
                <CheckIcon className="h-6 w-5 flex-none text-indigo-600" />
                24/7 Team Support
              </li>
            </ul>

            <Button className="bg-indigo-600 text-white w-full shadow-sm hover:bg-indigo-800 mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-800 cursor-pointer"
            disabled={loading || isPending}
            onClick={handleUpgrade}
            >
              {isPending || loading ? "loading..." : hasActiveMembership ? "Manage Your Plan" : "Upgrade to Premium"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingPage