# Face. — Setup Guide

A daily athlete identification game. Built with Next.js, Supabase, and Vercel.

---

## What you'll need

- A computer with [Node.js](https://nodejs.org) installed (v18 or later)
- A free [Supabase](https://supabase.com) account (your database)
- A free [Vercel](https://vercel.com) account (hosting)
- A free [GitHub](https://github.com) account (connects Vercel to your code)

---

## Step 1 — Install Node.js

Download and install from https://nodejs.org (choose the LTS version).

Verify it works by opening Terminal (Mac) or Command Prompt (Windows) and typing:
```
node --version
```
You should see something like `v20.11.0`.

---

## Step 2 — Set up your Supabase database

1. Go to https://supabase.com and create a free account
2. Click **New project** and give it a name (e.g. "face-app")
3. Choose a region close to you and set a database password
4. Once created, go to **SQL Editor** in the left sidebar
5. Click **New query**, paste the entire contents of `supabase-schema.sql`, and click **Run**

This creates your `athletes` table and seeds it with sample players.

6. Go to **Settings > API** and copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → this is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

---

## Step 3 — Set up the project locally

Open Terminal and run these commands one at a time:

```bash
# Navigate to where you want the project (e.g. your Desktop)
cd ~/Desktop

# Copy the face-app folder here, then enter it
cd face-app

# Install all dependencies
npm install

# Copy the example env file
cp .env.local.example .env.local
```

Now open `.env.local` in a text editor and fill in your three Supabase values from Step 2.

---

## Step 4 — Run it locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see Face. running!

---

## Step 5 — Deploy to Vercel (make it live)

1. Push your code to GitHub:
   - Create a new repo at https://github.com/new
   - Follow GitHub's instructions to push your local folder

2. Go to https://vercel.com and click **Add New Project**
3. Import your GitHub repo
4. Under **Environment Variables**, add your three `.env.local` values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` — make up any random string, e.g. `face-cron-secret-xyz`
5. Click **Deploy**

Your app is now live at a `.vercel.app` URL! You can add a custom domain later.

---

## Step 6 — Add more athletes

The easiest way to add athletes is directly in Supabase:

1. Go to your Supabase project → **Table Editor** → `athletes`
2. Click **Insert row**
3. Fill in the fields:
   - `name` — full name, e.g. `"Travis Kelce"`
   - `sport` — must be one of: `NFL`, `NBA`, `MLB`, `NHL`, `CFB`, `CBB`
   - `team` — e.g. `"Kansas City Chiefs"`
   - `position` — e.g. `"TE"`
   - `conference` — only for college athletes, e.g. `"Big Ten"` (leave blank for pros)
   - `photo_url` — a direct link to a photo (Wikimedia Commons is free)
   - `aliases` — array of acceptable guesses: `{"travis kelce","kelce","travis"}`
   - `hints` — shown after wrong guesses: `{"Kansas City Chiefs","Super Bowl Champion","#87"}`
   - `is_star` — check this for well-known athletes
   - `active` — leave checked to show in the game

---

## How daily picks work

The cron job at `/api/cron/seed-daily` runs at midnight every day. It:
1. Picks 5 random athletes for each sport filter (All, NFL, NBA, etc.)
2. Saves them to the `daily_picks` table
3. Every player who opens the app that day gets the same athletes

Until the cron runs for the first time, the app falls back to random athletes — so it works immediately.

---

## Project structure

```
face-app/
├── app/
│   ├── api/
│   │   ├── athletes/route.ts    ← returns athletes for the current filters
│   │   ├── guess/route.ts       ← validates guesses server-side
│   │   └── cron/seed-daily/     ← midnight cron to set daily picks
│   ├── layout.tsx               ← fonts, metadata
│   ├── page.tsx                 ← main app controller
│   └── globals.css
├── components/
│   ├── SetupScreen.tsx          ← sport/conference/difficulty picker
│   ├── GameScreen.tsx           ← progress bar, score tracker
│   ├── AthleteCard.tsx          ← photo + guessing UI
│   └── FinalScreen.tsx          ← results + share button
├── lib/
│   ├── supabase.ts              ← database client + types
│   └── athletes.ts              ← fetch/filter logic
├── supabase-schema.sql          ← run this in Supabase to set up your DB
├── vercel.json                  ← cron schedule config
└── .env.local.example           ← copy to .env.local and fill in your keys
```
