# Production Database Migration Guide (PostgreSQL on Netlify)

This guide provides the exact steps to migrate the MN Brand WhatsApp CRM from local SQLite to a production-ready cloud PostgreSQL database (such as **Supabase** or **Neon**) for permanent, high-concurrency multi-agent persistence on Netlify.

---

## 1. Why SQLite Fails on Netlify

Netlify deploys Next.js API routes and server components inside **stateless serverless functions** (AWS Lambda containers):
- **Read-Only Filesystem**: Serverless instances cannot write to `/var/task` where repository files reside.
- **Ephemeral Storage**: Any file created in `/tmp` is wiped as soon as the container spins down.
- **No Shared State**: When 50 agents log in and send messages simultaneously, each request may hit a different serverless instance, meaning a local SQLite file cannot be shared.

A cloud PostgreSQL database gives you a single, shared, high-speed database with persistent data.

---

## 2. Step 1: Create a Free PostgreSQL Database (Takes 60 Seconds)

You can choose either **Supabase** or **Neon** (both offer generous 100% free tiers):

### Option A: Supabase (Recommended)
1. Go to **[https://supabase.com](https://supabase.com)** and sign up / log in with GitHub.
2. Click **New Project**, choose a project name (e.g. `mnbrand-crm`), and choose a strong database password.
3. Once created, go to **Project Settings** → **Database** → **Connection String**.
4. Select **URI** (or **Session Pooler**) and copy the connection string. It looks like:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

### Option B: Neon Serverless Postgres
1. Go to **[https://neon.tech](https://neon.tech)** and sign in.
2. Click **Create Project**.
3. Copy the pooled connection string:
   ```env
   DATABASE_URL="postgresql://[USER]:[PASSWORD]@[ENDPOINT].neon.tech/neondb?sslmode=require"
   ```

---

## 3. Step 2: Update `prisma/schema.prisma`

Change the datasource provider in `prisma/schema.prisma` from `sqlite` to `postgresql`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 4. Step 3: Push Schema & Seed 2,000 Leads to Cloud DB

In your local terminal, replace `DATABASE_URL` with your Supabase or Neon connection string, then run:

```powershell
# 1. Set the cloud connection string
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# 2. Push tables to your cloud PostgreSQL
npx prisma db push

# 3. Seed 50 staff members and 2,000 leads
node_modules/.bin/ts-node --transpile-only --project tsconfig.seed.json prisma/seed-2000.ts
```

Your cloud database will now contain all tables, 50 staff members, and 2,000+ leads equally partitioned.

---

## 5. Step 4: Configure Netlify Environment Variables

In your Netlify Dashboard:
1. Go to **Site Configuration** → **Environment variables**.
2. Add the following variables:

| Variable | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres` | Your Supabase or Neon connection string |
| `NEXTAUTH_SECRET` | `mnbrand-crm-super-secret-key-2024-xk9mq` | JWT signature secret |
| `NEXTAUTH_URL` | `https://your-site-name.netlify.app` | Your live Netlify deployment URL |

3. Trigger a **Clear cache and deploy site** on Netlify.

---

## 6. Verification
Once deployed:
1. Open your Netlify URL: `https://your-site-name.netlify.app/login`
2. Log in as:
   - **Admin**: `admin@mnbrand.com` / `admin123`
   - **Agent**: `sara@mnbrand.com` / `agent123`
3. Notice all 2,000 leads, 50 staff members, AI auto-replies, and voice notes loading directly from your persistent cloud database!
