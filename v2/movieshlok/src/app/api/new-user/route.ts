import { env } from "@/env.mjs";
import { db } from "@/server/db";

import { Webhook } from "svix";
import { headers } from "next/headers";
import { type WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(env.WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  if (evt.type === "user.created") {
    await db.user.create({
      data: {
        clerkId: evt.data.id,
        firstName: evt.data.first_name,
        lastName: evt.data.last_name,
        fullName: `${evt.data.first_name} ${evt.data.last_name}`,
        username: `${evt.data.first_name} ${evt.data.last_name}`,
        imageUrl: evt.data.image_url,
      },
    });
  }

  return new Response("", { status: 201 });
}
