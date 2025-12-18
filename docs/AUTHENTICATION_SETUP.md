# MedExpert Authentication Setup Guide

Complete guide to set up and configure the authentication system for the MedExpert medical platform using **Render PostgreSQL** and **pgAdmin**.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Render Database Setup](#render-database-setup)
4. [Connecting pgAdmin to Render](#connecting-pgAdmin-to-render)
5. [Environment Configuration](#environment-configuration)
6. [Running Migrations](#running-migrations)
7. [Starting the Application](#starting-the-application)
8. [API Endpoints](#api-endpoints)
9. [Frontend Integration](#frontend-integration)
10. [Local Storage After Authentication](#local-storage-after-authentication)
11. [Protected Routes](#protected-routes)
12. [Testing the Authentication](#testing-the-authentication)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the authentication system, ensure you have:

| Requirement | Description |
|-------------|-------------|
| Node.js | Version 18.x or higher (`node --version`) |
| npm | Version 9.x or higher (`npm --version`) |
| pgAdmin | Installed on your machine |
| Render Account | With a PostgreSQL database created |
| Git | Any recent version |

---

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Front-module1-STI
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `drizzle-orm` - Database ORM
- `pg` - PostgreSQL client
- `better-auth` - Authentication library
- `bcrypt` - Password hashing
- `jose` - JWT handling
- `zod` - Input validation

### Step 3: Verify Installation

```bash
npm list drizzle-orm pg bcrypt jose zod
```

---

## Render Database Setup

### Step 1: Create a PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **PostgreSQL**
3. Configure your database:
   - **Name:** `medexpert-db` (or your preferred name)
   - **Database:** `medexpert`
   - **User:** Leave as auto-generated or customize
   - **Region:** Choose closest to your users
   - **Plan:** Free (for development) or paid for production
4. Click **Create Database**

### Step 2: Get Your Connection Details

Once created, go to your database dashboard on Render. You'll find:

| Field | Example Value |
|-------|---------------|
| **Hostname** | `dpg-xxxxx-a.oregon-postgres.render.com` |
| **Port** | `5432` |
| **Database** | `medexpert` |
| **Username** | `medexpert_user` |
| **Password** | `AbCdEf123456...` (auto-generated) |
| **Internal Database URL** | For Render services only |
| **External Database URL** | `postgresql://user:pass@host:5432/db` |

**Important:** Copy the **External Database URL** - you'll need it for both pgAdmin and your `.env.local` file.

### Step 3: Note the Connection String Format

Render provides a connection string like:

```
postgresql://medexpert_user:YourPassword123@dpg-xxxxx-a.oregon-postgres.render.com:5432/medexpert
```

Breaking it down:
- **Username:** `medexpert_user`
- **Password:** `YourPassword123`
- **Host:** `dpg-xxxxx-a.oregon-postgres.render.com`
- **Port:** `5432`
- **Database:** `medexpert`

---

## Connecting pgAdmin to Render

### Step 1: Open pgAdmin

Launch pgAdmin on your computer.

### Step 2: Register a New Server

1. Right-click on **Servers** in the left panel
2. Select **Register** → **Server...**

### Step 3: Configure the Connection

**General Tab:**
| Field | Value |
|-------|-------|
| Name | `MedExpert Render` (any name you prefer) |

**Connection Tab:**
| Field | Value |
|-------|-------|
| Host name/address | `dpg-xxxxx-a.oregon-postgres.render.com` (from Render) |
| Port | `5432` |
| Maintenance database | `medexpert` |
| Username | `medexpert_user` (from Render) |
| Password | Your password from Render |
| Save password? | ✅ Yes (recommended for development) |

**SSL Tab:**
| Field | Value |
|-------|-------|
| SSL mode | `Require` |

### Step 4: Save and Connect

1. Click **Save**
2. The server should appear in your left panel
3. Expand it to see your `medexpert` database

### Step 5: Verify Connection

In pgAdmin:
1. Expand **Servers** → **MedExpert Render** → **Databases** → **medexpert**
2. Right-click on **medexpert** → **Query Tool**
3. Run: `SELECT version();`
4. You should see the PostgreSQL version

---

## Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example file
cp .env.example .env.local
```

### Step 2: Configure Environment Variables

Open `.env.local` and configure with your Render credentials:

```env
# ===========================================
# DATABASE CONFIGURATION (RENDER)
# ===========================================

# External Database URL from Render Dashboard
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=postgresql://medexpert_user:YourPassword123@dpg-xxxxx-a.oregon-postgres.render.com:5432/medexpert

# ===========================================
# JWT CONFIGURATION
# ===========================================

# Secret key for signing JWT tokens (minimum 32 characters)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=paste-your-generated-secret-here

# Token expiration time
JWT_EXPIRES_IN=7d

# ===========================================
# BETTER AUTH CONFIGURATION
# ===========================================

# Secret key for Better Auth (minimum 32 characters)
BETTER_AUTH_SECRET=paste-another-generated-secret-here

# Base URL for authentication callbacks
BETTER_AUTH_URL=http://localhost:3000

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 3: Generate Secure Keys

Open your terminal and run:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate BETTER_AUTH_SECRET (run again for a different key)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy each output and paste into your `.env.local` file.

### Step 4: Verify Your Configuration

Your `.env.local` should look like this (with your actual values):

```env
DATABASE_URL=postgresql://medexpert_user:AbCd1234XyZ@dpg-abc123-a.oregon-postgres.render.com:5432/medexpert
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_EXPIRES_IN=7d
BETTER_AUTH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Running Migrations

### Option 1: Push Schema Directly (Recommended for Development)

```bash
npm run db:push
```

This command will:
- Connect to your Render database
- Create the `doctors` and `sessions` tables
- Set up all indexes and constraints

### Option 2: Generate and Apply Migrations (Production)

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

### Verify Tables in pgAdmin

1. Open pgAdmin
2. Connect to your MedExpert Render server
3. Navigate to: **Databases** → **medexpert** → **Schemas** → **public** → **Tables**
4. You should see:
   - `doctors`
   - `sessions`

5. Right-click on `doctors` → **View/Edit Data** → **All Rows** to verify the table structure

### View Table Structure in pgAdmin

Right-click on `doctors` → **Properties** → **Columns** tab:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | varchar(255) | Unique email |
| password_hash | text | Hashed password |
| first_name | varchar(100) | First name |
| last_name | varchar(100) | Last name |
| full_name | varchar(200) | Full name |
| specialty | medical_specialty | Enum type |
| role | role | Enum (doctor/admin) |
| is_active | varchar(10) | Account status |
| email_verified | timestamp | Verification date |
| created_at | timestamp | Creation date |
| updated_at | timestamp | Last update |

---

## Starting the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Verify the Server is Running

Open your browser:
- Home page: http://localhost:3000
- Login page: http://localhost:3000/en/login
- Register page: http://localhost:3000/en/register

---

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`

Register a new doctor account.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"dr.smith@hospital.com\",\"password\":\"SecurePass123\",\"firstName\":\"John\",\"lastName\":\"Smith\",\"specialty\":\"cardiology\"}"
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Professional email address |
| password | string | Yes | Min 8 chars, uppercase, lowercase, number |
| firstName | string | Yes | Doctor's first name |
| lastName | string | Yes | Doctor's last name |
| specialty | string | Yes | Medical specialty (see valid values below) |

**Valid Specialties:**
- `cardiology`
- `dermatology`
- `general_medicine`
- `pediatrics`
- `neurology`
- `orthopedics`
- `psychiatry`
- `radiology`
- `surgery`
- `other`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "doctor": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "dr.smith@hospital.com",
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "specialty": "cardiology",
      "role": "doctor",
      "createdAt": "2025-12-18T10:30:00.000Z"
    }
  }
}
```

**Error Response (400 - Validation Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "password": "Password must contain at least one uppercase letter"
  }
}
```

**Error Response (409 - Email Exists):**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

#### POST `/api/auth/login`

Authenticate a doctor and receive an access token.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"dr.smith@hospital.com\",\"password\":\"SecurePass123\"}"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "doctor": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "dr.smith@hospital.com",
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "specialty": "cardiology",
      "role": "doctor"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

---

#### GET `/api/auth/me`

Get the current authenticated doctor's profile.

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "dr.smith@hospital.com",
      "firstName": "John",
      "lastName": "Smith",
      "fullName": "John Smith",
      "specialty": "cardiology",
      "role": "doctor",
      "isActive": "true",
      "createdAt": "2025-12-18T10:30:00.000Z",
      "updatedAt": "2025-12-18T10:30:00.000Z"
    }
  }
}
```

---

#### GET `/api/doctors/profile`

Get current doctor's profile (protected route).

```bash
curl -X GET http://localhost:3000/api/doctors/profile ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

#### PATCH `/api/doctors/profile`

Update current doctor's profile.

```bash
curl -X PATCH http://localhost:3000/api/doctors/profile ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Jonathan\",\"specialty\":\"neurology\"}"
```

---

## Frontend Integration

### Using the Auth Context

The `AuthProvider` is already configured. Use the `useAuth` hook:

```tsx
"use client";

import { useAuth } from "@/app/components/auth/AuthContext";

export default function DashboardPage() {
  const {
    doctor,           // Current doctor profile or null
    isAuthenticated,  // Boolean - is user logged in
    isLoading,        // Boolean - initial auth check in progress
    login,            // Function to login
    logout,           // Function to logout
    register,         // Function to register
    refreshUser       // Function to refresh user data
  } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access this page.</div>;
  }

  return (
    <div>
      <h1>Welcome, Dr. {doctor?.fullName}</h1>
      <p>Specialty: {doctor?.specialty}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Making Authenticated API Calls

```tsx
import { authFetch } from "@/lib/auth/client";

async function fetchProtectedData() {
  const response = await authFetch("/api/doctors/profile");
  const data = await response.json();
  return data;
}
```

---

## Local Storage After Authentication

After a successful login or registration, two items are stored in the browser's local storage:

1.  **`auth-token`**: This key holds the JWT (JSON Web Token) received from the authentication API. It is used to authenticate subsequent requests to protected API endpoints.

    **Example Value:**
    ```
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZWZh…
    ```

2.  **`doctor-profile`**: This key stores the authenticated doctor's profile information as a JSON string. This data can be used by the frontend to display user-specific details without requiring an additional API call immediately after login.

    **Example Value:**
    ```json
    {
      "id": "some-uuid-v4",
      "email": "doctor@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "specialty": "general_medicine",
      "role": "doctor",
      "isActive": "true",
      "emailVerified": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
    ```

---

## Protected Routes

### Page Protection (Middleware)

These routes require authentication:
- `/dashboard`
- `/cases`
- `/profile`
- `/settings`

Unauthenticated users are redirected to `/login`.

### API Route Protection

Use the `withAuth` wrapper:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { withAuth, TokenPayload } from "@/lib/auth";

export const GET = withAuth(
  async (
    request: NextRequest,
    { auth }: { params: Promise<Record<string, string>>; auth: TokenPayload }
  ) => {
    // auth.sub = doctor ID
    // auth.email = doctor email
    // auth.role = doctor role

    return NextResponse.json({
      message: "Protected data",
      doctorId: auth.sub
    });
  }
);
```

---

## Testing the Authentication

### PowerShell Test Script (Windows)

Create `test-auth.ps1`:

```powershell
$BASE_URL = "http://localhost:3000"

Write-Host "=== Testing Registration ===" -ForegroundColor Green

$registerBody = @{
    email = "test.doctor@hospital.com"
    password = "TestPass123"
    firstName = "Test"
    lastName = "Doctor"
    specialty = "cardiology"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody

    $registerResponse | ConvertTo-Json -Depth 10
    $token = $registerResponse.data.accessToken
    Write-Host "Token received!" -ForegroundColor Green
} catch {
    Write-Host "Registration failed (user may already exist)" -ForegroundColor Yellow
}

Write-Host "`n=== Testing Login ===" -ForegroundColor Green

$loginBody = @{
    email = "test.doctor@hospital.com"
    password = "TestPass123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$loginResponse | ConvertTo-Json -Depth 10
$token = $loginResponse.data.accessToken

Write-Host "`n=== Testing Protected Route ===" -ForegroundColor Green

$headers = @{
    Authorization = "Bearer $token"
}

$profileResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/me" `
    -Method GET `
    -Headers $headers

$profileResponse | ConvertTo-Json -Depth 10

Write-Host "`n=== All Tests Passed! ===" -ForegroundColor Green
```

Run with:
```powershell
.\test-auth.ps1
```

### Verify Data in pgAdmin

After running tests:

1. Open pgAdmin
2. Connect to your Render database
3. Navigate to **Tables** → **doctors**
4. Right-click → **View/Edit Data** → **All Rows**
5. You should see your test user

---

## Troubleshooting

### 1. Cannot Connect to Render Database

**Error:** `ECONNREFUSED` or `timeout`

**Solutions:**
- Verify you're using the **External Database URL** (not Internal)
- Check if your IP is blocked (Render free tier has no IP restrictions)
- Ensure SSL is required in the connection

**Test connection:**
```bash
node -e "const { Pool } = require('pg'); const p = new Pool({connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false}}); p.query('SELECT 1').then(() => console.log('Connected!')).catch(console.error)"
```

### 2. SSL Connection Required

**Error:** `SSL connection is required`

**Solution:** Render requires SSL. The connection should work automatically, but if issues persist, update `lib/db/index.ts`:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
```

### 3. pgAdmin Connection Failed

**Error:** `could not connect to server`

**Checklist:**
- ✅ Using External Database URL host
- ✅ SSL mode set to "Require"
- ✅ Correct username and password
- ✅ Port is 5432

### 4. Migration Errors

**Error:** `relation already exists`

**Solution in pgAdmin:**
1. Open Query Tool
2. Run:
```sql
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TYPE IF EXISTS role;
DROP TYPE IF EXISTS medical_specialty;
```
3. Re-run `npm run db:push`

### 5. JWT Token Invalid

**Error:** `Invalid or expired token`

**Solutions:**
- Ensure `JWT_SECRET` hasn't changed since token was issued
- Check token expiration (default 7 days)
- Verify `Bearer ` prefix in Authorization header

### 6. Render Database Sleeping (Free Tier)

**Issue:** First request is slow or times out

**Explanation:** Render free tier databases sleep after 15 minutes of inactivity.

**Solution:** The first request may take 30-60 seconds while the database wakes up. Subsequent requests will be fast.

---

## NPM Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to Render database |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |

---

## Environment Variables Reference

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Yes | 32+ character random string |
| `JWT_EXPIRES_IN` | No | `7d` (default) |
| `BETTER_AUTH_SECRET` | Yes | 32+ character random string |
| `BETTER_AUTH_URL` | No | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` |
| `NODE_ENV` | No | `development` or `production` |

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore` (already configured)
- [ ] Using strong, unique secrets for JWT and Better Auth
- [ ] Render database password is secure
- [ ] HTTPS enabled in production
- [ ] Never commit credentials to git
