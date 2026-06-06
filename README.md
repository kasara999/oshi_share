# Oshi Share

**[日本語版はこちら](README.ja.md)**

Share your favorite character or person with a stranger — anonymously.

🔗 **https://oshi-share.vercel.app**

---

## Motivation

I came across a website where strangers exchange their favorite music with each other anonymously. That made me think: what if you could do the same thing with your favorite characters or people? Just like music, there's often a feeling of *"I want someone to know about this person"* behind having a favorite. I wanted to build a space where that feeling can be shared — randomly, anonymously, with someone you've never met.

---

## Concept

- No login required — fully anonymous
- Submit a card about your favorite, and get matched with a stranger at the same time
- Both sides see each other's cards simultaneously
- Like the card if it resonates with you

---

## Features

- Create a card (image, name, description, tags, external URL)
- Random bidirectional matching
- Real-time match notification via Supabase Realtime
- Like functionality
- Match history
- Explore others' favorites by tag

---

## Tech Stack

| Role | Technology |
|---|---|
| Frontend & API | Next.js 15 (App Router, TypeScript) |
| UI | Tailwind CSS / shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Real-time | Supabase Realtime |
| State management | Zustand + localStorage |
| Deployment | Vercel |

---

## Design Highlights

**Race condition safety**

Matching is handled atomically by a PostgreSQL stored function using `FOR UPDATE SKIP LOCKED`, ensuring the same card is never matched to two users simultaneously.

**Anonymous identity**

On first visit, a UUID is generated and stored in `localStorage`. It is sent as an `X-Sender-Token` header on every API request, allowing the server to identify users without any login.

**Image upload**

Images are uploaded directly from the browser to Supabase Storage via a signed URL, bypassing the Next.js server. Before upload, the client converts the image to WebP and enforces a 5 MB size limit.

**Real-time notifications**

The waiting screen subscribes to the `matches` table via Supabase Realtime and automatically redirects to the match page the moment a match is created.

---

## Local Setup

**Requirements**
- Node.js 18+
- A Supabase project

**Steps**

```bash
git clone https://github.com/kasara999/oshi_share.git
cd oshi_share
npm install
cp .env.local.example .env.local
# Fill in your Supabase URL and API keys in .env.local
npm run dev
```

For the Supabase schema, run `supabase/schema.sql` and `supabase/rls.sql` in the Supabase SQL Editor.
