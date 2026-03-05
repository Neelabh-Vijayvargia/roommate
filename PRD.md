# Product Requirements Document
## Ion 1308 — Roommate Coordination App
**Version:** 1.0 (MVP)
**Last Updated:** March 2026
**Status:** Draft

---

## 1. Overview

Ion 1308 is a mobile-first web application designed to reduce everyday friction between apartment roommates. The MVP targets four roommates at Ion 1308 and solves two specific pain points: laundry machine awareness and dish cleanliness accountability. The architecture is designed to be extensible to support multiple groups and additional features in the future.

---

## 2. Goals & Non-Goals

### Goals
- Give roommates real-time visibility into laundry machine status
- Enable anonymous, low-friction dish reminders via SMS
- Work seamlessly on mobile browsers without requiring a native app install
- Persist user identity per device so roommates don't need to log in repeatedly
- Be extensible to multi-group support later

### Non-Goals (MVP)
- Native iOS/Android app
- Multi-group support (deferred to v2)
- Full user account management (email/password auth, password reset, etc.)
- Push notifications via Web Push / service workers
- Admin panel or moderation tools

---

## 3. Users

### Roommates (Ion 1308)
| Name | Role |
|------|------|
| Neelabh | Roommate |
| Vignesh | Roommate |
| Aviral | Roommate |
| Vishanth | Roommate |

All four users have equal permissions. There is no admin role in the MVP.

---

## 4. Authentication & Identity

### MVP: Name Selection (No PIN)
- On first visit, the user is shown a simple "Who are you?" screen with the four roommate names as tappable cards
- They tap their name and are immediately taken to the dashboard — no PIN required
- This is intentionally frictionless for the single-group MVP

### Device Persistence
- The selected identity is saved to `localStorage`
- On subsequent visits, the user lands directly on the dashboard
- A **"Switch user"** option is accessible from a settings/profile icon in the top corner for when a different roommate uses the same device

### Future Extensibility
- The name-selection screen is designed to be replaced by a PIN + name flow, then eventually full account auth (email/password or OAuth), without changing any downstream app logic
- The `groups` table and `group_id` foreign keys are present in the data model from day one to support multi-group in v2

---

## 5. Information Architecture

```
/                    → PIN entry (if not authenticated)
/dashboard           → Home: Laundry card + Dishes card
/laundry             → Laundry detail page
/dishes              → Dishes detail page
```

### Navigation
- Bottom tab bar (mobile-native feel) with two tabs: **Laundry** and **Dishes**
- Dashboard is the default landing page after auth

---

## 6. Dashboard

The dashboard displays two tappable summary cards stacked vertically.

### Laundry Card
- Shows current status of the washer and dryer at a glance
- Status options: **Free** (green) or **In Use — [Name]** (red/yellow)
- Tapping the card navigates to the Laundry detail page

### Dishes Card
- Shows a compact row of roommate avatars/names
- Any roommate with an active dish report has a notification badge
- Tapping the card navigates to the Dishes detail page

---

## 7. Laundry Feature

### Machine States
Each machine (washer, dryer) can be in one of the following states:

| State | Description |
|-------|-------------|
| `free` | Machine is empty and available |
| `in_use` | A roommate has checked in |
| `ready_to_transfer` | Wash cycle done, ready to move to dryer |
| `done` | Dryer cycle complete, ready to remove |

### Check-In / Check-Out Flow

**Washer:**
1. Check into washer → state: `in_use`
2. Mark wash done (transfer to dryer) → state: `ready_to_transfer`
3. Check into dryer → washer state resets to `free`

**Dryer:**
1. Check into dryer → state: `in_use`
2. Mark dryer done → state: `done`
3. Check out (laundry removed) → state resets to `free`

A user can only check in to a machine if it is currently `free`. A user can only check out of a machine they personally checked into.

### Laundry Detail Page
- Two cards: **Washer** and **Dryer**
- Each card shows:
  - Machine name and current state
  - If occupied: name of occupant + elapsed time (e.g. "Vignesh — 47 min ago")
  - Contextual action button based on state (e.g. "Check In", "Mark Done", "Check Out")
- If a machine is occupied by someone else and has been in use for 60+ minutes, a **"Notify Them"** button appears

### "Notify Them" — SMS Alert
- Any roommate can tap "Notify Them" on an occupied machine
- This sends an SMS to the occupant:
  - Washer: *"Hey [Name], your laundry has been in the washer for [X] minutes. Time to move it to the dryer! 🧺"*
  - Dryer: *"Hey [Name], your laundry has been in the dryer for [X] minutes. Time to take it out! 🌀"*
- The notification is anonymous (the occupant does not know who sent it)
- A cooldown period of 60 minutes prevents duplicate notifications being sent to the same person for the same machine session
- During cooldown, the "Notify Them" button is replaced with a muted clock icon and small elapsed time label (e.g. "Notified 12m ago"), styled to clearly indicate it's inactive without taking up extra space

---

## 8. Dishes Feature

### Overview
Any roommate can report that another roommate's dishes are in the sink. This triggers an anonymous SMS reminder to the reported roommate.

### Dishes Detail Page
- Displays a list/grid of all four roommates
- Each roommate row has:
  - Their name
  - A **"Notify"** button (bell or dish icon)
  - A badge showing number of active reports (if any)
- Tapping "Notify" sends an SMS to that roommate and logs the report

### SMS Alert
When a roommate is notified:
- *"Hey [Name], someone noticed your dishes are in the sink. Time to clean up! 🍽️"*
- The reporter is anonymous

### Cooldown / Rate Limiting
- Once any roommate sends a dish notification to a given person, that person cannot be notified again for 12 hours — regardless of which roommate tries to send it
- During the cooldown window, the "Notify" button is replaced with a subtle greyed-out dish icon and a small countdown label (e.g. "8h 22m left"), making it immediately clear that a nudge was already sent without being accusatory or cluttered

---

## 9. SMS Notifications

### Provider
- **Twilio** (SMS)
- One shared Twilio phone number sends all outbound messages

### Configuration
Each roommate's phone number is stored in the database at setup time. Phone numbers are not exposed in the frontend.

### Message Types
| Trigger | Recipient | Message |
|---------|-----------|---------|
| "Notify Them" on washer | Washer occupant | Laundry in washer reminder |
| "Notify Them" on dryer | Dryer occupant | Laundry in dryer reminder |
| "Notify" on dishes | Selected roommate | Dishes in sink reminder |

---

## 10. Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS — mobile-first, utility-based
- **State:** React state + `localStorage` for device identity persistence
- **Design:** Component-driven; UI layer is intentionally decoupled so visual design (e.g. from a Figma mockup) can be swapped in without changing logic

### Backend
- **API:** Next.js API routes (serverless functions)
- **Database:** Supabase (PostgreSQL) — free tier
- **SMS:** Twilio REST API (called from API routes, never from frontend)

### Hosting
- **Vercel** (free tier) — native Next.js hosting, zero-config deployment

---

## 11. Data Model (MVP)

### `groups`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | Primary key |
| `name` | text | e.g. "Ion 1308" |
| `pin_hash` | text | Hashed shared PIN |
| `created_at` | timestamp | |

### `users`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | Primary key |
| `name` | text | e.g. "Neelabh" |
| `group_id` | uuid | FK → groups |
| `phone_number` | text | For SMS, stored securely |

### `laundry_sessions`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | Primary key |
| `group_id` | uuid | FK → groups |
| `machine` | enum | `washer` or `dryer` |
| `user_id` | uuid | FK → users |
| `state` | enum | `in_use`, `ready_to_transfer`, `done` |
| `checked_in_at` | timestamp | |
| `checked_out_at` | timestamp | Null if still active |

### `laundry_notifications`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | Primary key |
| `session_id` | uuid | FK → laundry_sessions |
| `sent_at` | timestamp | For cooldown enforcement |

### `dish_reports`
| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | Primary key |
| `group_id` | uuid | FK → groups |
| `reported_user_id` | uuid | FK → users |
| `sent_at` | timestamp | For cooldown enforcement |

---

## 12. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

---

## 13. Future Considerations (v2+)

- **Auth progression:** Name-only (MVP) → Shared PIN + name (v1.5) → Full accounts with email/password or OAuth (v2)
- **More features:** Chore rotation, grocery lists, shared expenses
- **UI refresh:** Figma-based redesign can be implemented by swapping Tailwind component layer without touching API or data logic
- **Web Push notifications:** Can replace or supplement SMS using service workers
- **Notification preferences:** Per-user opt-in/out for SMS

---

## 14. Out of Scope (MVP)

- Group creation / management UI
- Editing or deleting roommate profiles
- Message history / notification log UI
- User-configurable cooldown timers
- Analytics or usage dashboards