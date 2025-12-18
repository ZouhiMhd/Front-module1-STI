# MedExpert Quick Start Guide

Get the authentication system running in 5 minutes with **Render PostgreSQL**.

---

## Prerequisites

- Node.js 18+
- pgAdmin installed
- Render account with PostgreSQL database

---

## Step 1: Install Dependencies

```bash
npm install
```

---

## Step 2: Get Render Database URL

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your PostgreSQL database
3. Copy the **External Database URL**

It looks like:
```
postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com:5432/dbname
```

---

## Step 3: Configure Environment

```bash
# Copy example file
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@dpg-xxxxx.oregon-postgres.render.com:5432/dbname
JWT_SECRET=your-32-character-secret-key-here
BETTER_AUTH_SECRET=another-32-character-secret-here
```

Generate secrets (run twice, once for each):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4: Setup Database Tables

```bash
npm run db:push
```

---

## Step 5: Verify in pgAdmin

1. Open pgAdmin
2. Register server:
   - **Host:** `dpg-xxxxx.oregon-postgres.render.com`
   - **Port:** `5432`
   - **Database:** Your database name
   - **Username/Password:** From Render
   - **SSL Mode:** Require
3. Check that `doctors` and `sessions` tables exist

---

## Step 6: Start the App

```bash
npm run dev
```

Open http://localhost:3000/en/register and create an account.

---

## Test with PowerShell

```powershell
# Register
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@hospital.com","password":"Test1234","firstName":"Test","lastName":"Doctor","specialty":"cardiology"}'

# Login
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"test@hospital.com","password":"Test1234"}'
```

---

## NPM Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run db:push` | Push schema to Render |
| `npm run db:studio` | Open Drizzle Studio |

---

For detailed documentation, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)
