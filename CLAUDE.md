# Ion 1308 — Roommate Coordination App

## Project Overview
Mobile-first web app for 4 roommates. Two features: **Laundry** (machine status + SMS alerts) and **Dishes** (anonymous SMS reminders). MVP only — no auth, no multi-group, no admin.

## Tech Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS
- **Backend:** Next.js API routes (serverless)
- **DB:** Supabase (PostgreSQL)
- **SMS:** Twilio (server-side only, never exposed to frontend)
- **Deploy:** Vercel

## Data Model

### Tables
- `groups` — id, name, pin_hash, created_at
- `users` — id, name, group_id, phone_number
- `laundry_sessions` — id, group_id, machine (washer|dryer), user_id, state (in_use|ready_to_transfer|done), checked_in_at, checked_out_at
- `laundry_notifications` — id, session_id, sent_at
- `dish_reports` — id, group_id, reported_user_id, sent_at

## Identity / Auth
- No login. On first visit: "Who are you?" screen with 4 name cards.
- Selected name saved to `localStorage`. Subsequent visits skip to dashboard.
- "Switch user" accessible via settings icon in top corner.

## Routes
- `/` — Identity selection (if no localStorage identity)
- `/dashboard` — Laundry card + Dishes card (summary)
- `/laundry` — Laundry detail
- `/dishes` — Dishes detail

## Laundry Logic
**States:** `free` → `in_use` → `ready_to_transfer` (washer) or `done` (dryer) → `free`

**Rules:**
- Can only check in if machine is `free`
- Can only check out of machine you checked into
- "Notify Them" button appears if machine occupied by someone else for 60+ min
- SMS cooldown: 60 min per session per machine
- During cooldown: show muted clock + "Notified Xm ago" (no button)

**SMS messages:**
- Washer: `"Hey [Name], your laundry has been in the washer for [X] minutes. Time to move it to the dryer! 🧺"`
- Dryer: `"Hey [Name], your laundry has been in the dryer for [X] minutes. Time to take it out! 🌀"`

## Dishes Logic
- Any roommate can notify any other roommate
- SMS cooldown: 12 hours per reported user (group-wide, not per-reporter)
- During cooldown: greyed-out icon + countdown label (e.g. "8h 22m left")
- **SMS:** `"Hey [Name], someone noticed your dishes are in the sink. Time to clean up! 🍽️"`

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Key Constraints
- SMS calls go in API routes only — never in client components
- Phone numbers never exposed to frontend
- All Twilio/Supabase service role calls are server-side
- Reporters are always anonymous (SMS never reveals who sent it)
- `group_id` FK on all tables — scaffold for v2 multi-group even if unused in MVP

## Users (Ion 1308)
Neelabh, Vignesh, Aviral, Vishanth — all equal permissions, no admin role.

## Out of Scope (MVP)
Native app, multi-group UI, full auth, push notifications, admin panel, chore/grocery/expense features, notification log UI, user-configurable cooldowns.
