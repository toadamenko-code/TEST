# Deploying VitalFlow to Vercel

## Step 1: Push to GitHub

1. Go to github.com and create a new **private** repository called `vitalflow`
2. Copy the repository URL (looks like `https://github.com/yourname/vitalflow.git`)
3. Open a terminal and run:
   ```
   cd vitalflow
   git init
   git add .
   git commit -m "Initial VitalFlow build"
   git remote add origin YOUR_GITHUB_URL
   git push -u origin main
   ```

---

## Step 2: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → open your project
2. Click **SQL Editor** in the left sidebar
3. Copy the **entire contents** of `src/lib/supabase/schema.sql`
4. Paste it in and click **Run** — this creates all your tables
5. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ`)
   - **service_role** key (keep this one SECRET — never share it!)

---

## Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → click **Add New Project**
2. Click **Import Git Repository** → select your `vitalflow` repo
3. Before clicking Deploy, scroll down to **Environment Variables**
4. Add these one by one:

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `ANTHROPIC_API_KEY` | Your Claude API key (from console.anthropic.com) |
| `HEALTH_SYNC_KEY` | Make up any random string, e.g. `vitalflow-health-2024` |

5. Click **Deploy** — Vercel builds and deploys automatically (takes ~2 min)
6. Your app will be live at `https://vitalflow-[something].vercel.app` 🎉

---

## Step 4: Enable Supabase Auth

1. In Supabase → **Authentication → Providers → Email**
2. Make sure "Enable Email" is **ON**
3. Go to **Authentication → URL Configuration**
4. Set **Site URL** to your Vercel URL (e.g. `https://vitalflow-abc123.vercel.app`)
5. Under **Redirect URLs**, add: `https://vitalflow-abc123.vercel.app/**`
6. Click Save

---

## Step 5: First Login

1. Visit your Vercel URL
2. Enter your email → you'll receive a magic link email
3. Click the link → you're in! No password needed. 🎉

---

## Importing Apple Health Data

1. On your iPhone → open the **Health** app
2. Tap your profile picture (top right) → **Export All Health Data**
3. Tap **Export** → it creates a zip file
4. Unzip it → find the file called `export.xml`
5. In VitalFlow → go to **Fitness** → tap **Import from Apple Health**
6. Upload your `export.xml` file
7. Your steps, sleep, heart rate, and workouts will appear automatically!

---

## Getting Your Anthropic API Key (for AI features)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Add it to Vercel under Environment Variables → `ANTHROPIC_API_KEY`
6. Redeploy (Vercel does this automatically when you save env vars)

---

## Re-deploying After Changes

Whenever you push a new commit to GitHub, Vercel **automatically rebuilds and deploys** your app. No extra steps needed!

---

## Troubleshooting

**"Failed to fetch" on AI features** → Check that `ANTHROPIC_API_KEY` is set in Vercel

**Can't log in / email not arriving** → Check Supabase Auth settings and that Site URL matches your Vercel URL exactly

**Data not saving** → Check that Supabase URL and anon key are set correctly in Vercel env vars
