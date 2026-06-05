import { db } from '@/db'
import { users } from '@/db/schema'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req)

        // Do something with payload
        // For this guide, log payload to console
        const eventType = evt.type

        if (eventType === 'user.created') {
            const data = evt.data
            await db.insert(users).values({
                clerkId: data.id,
                name: `${data.first_name} ${data.last_name}`,
                imageUrl: data.image_url
            })
        }

        if (eventType === 'user.deleted') {
            const data = evt.data
            if (data.id == null) {
                return new Response('Missing User ID', { status: 400 })
            }

            await db.delete(users).where(eq(users.clerkId, data.id))
        }

        if (eventType === 'user.updated') {
            const data = evt.data
            if (data.id == null) {
                return new Response('Missing User ID', { status: 400 })
            }

            await db.update(users).set({
                name: `${data.first_name} ${data.last_name}`,
                imageUrl: data.image_url
            }).where(eq(users.clerkId, data.id))
        }



        return new Response('Webhook received', { status: 200 })
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error verifying webhook', { status: 400 })
    }
}