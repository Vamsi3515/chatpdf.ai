'use server';

import { UserDetails } from "@/app/dashboard/upgrade/page";
import { adminDb } from "@/firebaseAdmin";
import getBaseUrl from "@/lib/getBaseUrl";
import stripe from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

export async function createCheckoutSession(userDetails: UserDetails) {
    auth.protect();
    const { userId } = await auth();

    if(!userId){
        throw new Error("User not found");
    }

    //first check if user already has a stripeCustomerId
    let stripeCustomerId;

    const user = await adminDb.collection("users").doc(userId).get();
    stripeCustomerId = user.data()?.stripeCustomerId;

    if(!stripeCustomerId){
        //create new stripe customer
        const customer = await stripe.customers.create({
            email: userDetails.email,
            name: userDetails.name,
            metadata: {
                //to connect stripe with clerk user id
                userId
            }
        });

        await adminDb.collection("users").doc(userId).set({
            stripeCustomerId: customer.id,
        });

        stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "paypal", "amazon_pay"],
        line_items: [
            {
                price: process.env.STRIPE_PREMIUM_PLAN_ID,
                quantity: 1,
            },
        ],
        mode: "subscription",
        customer: stripeCustomerId,
        success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
        cancel_url: `${getBaseUrl()}/upgrade`,
    });

    return session.id;
}