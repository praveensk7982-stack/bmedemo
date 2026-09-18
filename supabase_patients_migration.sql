-- =========================================================
-- Hospivio Patient Auth Migration & RLS Policies
-- Execute this SQL in your Supabase SQL Editor to setup table & policies
-- =========================================================

-- 1. Create patients table if not exists
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  mobile_number TEXT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Case-insensitive unique index on lower(email)
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_lower_email ON public.patients (LOWER(email));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public insert on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow public select on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow public update on patients" ON public.patients;

-- 5. Create RLS Policies for Anon & Authenticated Roles

-- Policy A: Allow public/anon insert for new patient registration
CREATE POLICY "Allow public insert on patients" ON public.patients
  FOR INSERT WITH CHECK (true);

-- Policy B: Allow public/anon select for email & mobile login validation
CREATE POLICY "Allow public select on patients" ON public.patients
  FOR SELECT USING (true);

-- Policy C: Allow public/anon update for profile & verification status updates
CREATE POLICY "Allow public update on patients" ON public.patients
  FOR UPDATE USING (true);
