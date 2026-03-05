# Notification System
## Ion 1308
**Version:** 1.0 (MVP)
**Last Updated:** March 2026

---

## Overview

Ion 1308 uses **Resend** as its notification provider for MVP. Resend handles transactional email delivery and requires minimal setup — no phone verification, no waiting period. The notification layer is intentionally abstracted so that the underlying provider (Resend, Twilio SMS, etc.) can be swapped without touching the rest of the app.

---

## Provider: Resend (MVP)

### Why Resend
- No domain or phone verification required to start sending
- Free tier: 3,000 emails/month (more than sufficient for 4 roommates)
- Native Next.js/TypeScript support
- Simple API — sending an email is a single function call
- Easy to swap out later for SMS once Twilio verification clears

### Limitations
- Email only (no SMS in MVP)
- Default sender is `onboarding@resend.dev` until a custom domain is configured
- Emails may land in spam for some providers if using the default sender address

### Future: Twilio SMS
Twilio SMS is the intended long-term notification provider. It is blocked in MVP only due to toll-free number verification delays. Once the Twilio account is verified, the `notify` utility can be updated to send SMS instead of (or in addition to) email, with no changes needed elsewhere in the app.

---

## Setup (Resend)

### 1. Create a Resend account
Sign up at [resend.com](https://resend.com). No credit card required for the free tier.

### 2. Get your API key
In the Resend dashboard: **API Keys → Create API Key**. Copy the key — it's only shown once.

### 3. Install the SDK
```bash
npm install resend
```

### 4. Add to environment variables
In `.env.local`:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTIFY_FROM=Ion 1308 <onboarding@resend.dev>
```

---

## Architecture

### Abstraction Layer
All notification logic lives in a single utility file: `lib/notify.ts`. The rest of the app always calls `sendNotification()` and never directly calls Resend or Twilio. This makes provider swaps seamless.

```
Frontend (button tap)
  → API route (e.g. /api/laundry/notify)
    → lib/notify.ts → sendNotification()
      → Resend (MVP) or Twilio (v2)
```

### `lib/notify.ts`
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface NotificationPayload {
  to: string        // recipient email (MVP) or phone number (v2)
  subject: string
  message: string
}

export async function sendNotification({ to, subject, message }: NotificationPayload) {
  try {
    await resend.emails.send({
      from: process.env.NOTIFY_FROM!,
      to,
      subject,
      text: message,
    })
  } catch (error) {
    console.error('Notification error:', error)
    throw error
  }
}
```

---

## Notification Types

### Laundry — "Notify Them"
**Trigger:** A roommate taps "Notify Them" on a machine occupied for 60+ minutes

**Recipient:** The roommate who checked in to that machine

**Subject:** `🧺 Your laundry is ready to move`

**Message:**
- Washer: `Hey [Name], your laundry has been in the washer for [X] minutes. Time to move it to the dryer!`
- Dryer: `Hey [Name], your laundry has been in the dryer for [X] minutes. Time to take it out!`

**Cooldown:** 60 minutes per machine session. After a notification is sent, the "Notify Them" button is replaced with a muted clock icon and elapsed time label (e.g. "Notified 12m ago").

---

### Dishes — Anonymous Reminder
**Trigger:** A roommate taps "Notify" next to another roommate's name on the dishes page

**Recipient:** The roommate whose name was tapped

**Subject:** `🍽️ Dishes reminder`

**Message:** `Hey [Name], someone noticed your dishes are in the sink. Time to clean up!`

**Cooldown:** 12 hours, apartment-wide. Once any roommate sends a dish notification to a given person, no one can notify them again for 12 hours. During cooldown, the notify button is replaced with a greyed-out icon and a countdown label (e.g. "8h 22m left").

---

## Roommate Contact Info

Phone numbers and email addresses are stored in Supabase in the `users` table. They are **never exposed to the frontend** — API routes fetch contact details server-side before calling `sendNotification()`.

The `users` table stores both `email` and `phone_number` fields from day one, so switching from email to SMS requires no schema changes.

---

## Migrating to Twilio SMS (v2)

When Twilio verification is complete, update `lib/notify.ts` to use the Twilio client instead of Resend. No other files need to change.

```typescript
// lib/notify.ts (v2 — Twilio)
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendNotification({ to, message }: NotificationPayload) {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  })
}
```

New environment variables needed at that point:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15121234567
```

---

## Environment Variables Summary

| Variable | Used In | Description |
|----------|---------|-------------|
| `RESEND_API_KEY` | MVP | Resend API key |
| `NOTIFY_FROM` | MVP | Sender address shown in emails |
| `TWILIO_ACCOUNT_SID` | v2 | Twilio account identifier |
| `TWILIO_AUTH_TOKEN` | v2 | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | v2 | Twilio outbound phone number |