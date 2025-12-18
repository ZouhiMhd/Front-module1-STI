-- MedExpert Authentication Schema
-- PostgreSQL Database Setup Script
-- Run this in pgAdmin Query Tool

-- =============================================
-- Step 1: Create ENUM types
-- =============================================

-- Role enum (doctor, admin)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE role AS ENUM ('doctor', 'admin');
    END IF;
END $$;

-- Medical specialty enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medical_specialty') THEN
        CREATE TYPE medical_specialty AS ENUM (
            'cardiology',
            'dermatology',
            'general_medicine',
            'pediatrics',
            'neurology',
            'orthopedics',
            'psychiatry',
            'radiology',
            'surgery',
            'other'
        );
    END IF;
END $$;

-- =============================================
-- Step 2: Create doctors table
-- =============================================

CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    specialty medical_specialty NOT NULL,
    role role NOT NULL DEFAULT 'doctor',
    is_active VARCHAR(10) NOT NULL DEFAULT 'true',
    email_verified TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- Step 3: Create sessions table
-- =============================================

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- Step 4: Create indexes for better performance
-- =============================================

-- Index on doctors email (for login lookups)
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);

-- Index on sessions doctor_id (for session lookups)
CREATE INDEX IF NOT EXISTS idx_sessions_doctor_id ON sessions(doctor_id);

-- Index on sessions token (for token validation)
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- Index on sessions expires_at (for cleanup queries)
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- =============================================
-- Verification queries (optional - run to verify)
-- =============================================

-- Check tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check doctors table structure:
-- \d doctors

-- Check sessions table structure:
-- \d sessions
