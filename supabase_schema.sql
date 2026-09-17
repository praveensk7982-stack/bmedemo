-- =========================================================
-- CareMesh Healthcare Web Application - Database Schema
-- Run this SQL in your Supabase SQL Editor to initialize tables
-- =========================================================

-- 1. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rating NUMERIC(3,2) DEFAULT 4.5,
  reviews TEXT DEFAULT '1.0k',
  address TEXT NOT NULL,
  distance TEXT NOT NULL,
  phone TEXT NOT NULL,
  open TEXT DEFAULT '08:00 AM',
  close TEXT DEFAULT '09:00 PM',
  depts TEXT[] DEFAULT ARRAY['General'],
  more INTEGER DEFAULT 0,
  wait INTEGER DEFAULT 20,
  queue INTEGER DEFAULT 5,
  tint TEXT DEFAULT '#7fa8c9',
  accent TEXT DEFAULT '#1f5f9e',
  city TEXT DEFAULT 'Chennai',
  alert JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id TEXT PRIMARY KEY,
  hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  spec TEXT NOT NULL,
  hospital TEXT NOT NULL,
  qualification TEXT NOT NULL,
  experience_years INTEGER DEFAULT 10,
  rating NUMERIC(3,2) DEFAULT 4.5,
  reviews_count INTEGER DEFAULT 100,
  fee NUMERIC(10,2) DEFAULT 500,
  available BOOLEAN DEFAULT true,
  when_available TEXT DEFAULT 'Today',
  sex CHAR(1) DEFAULT 'm',
  about TEXT,
  education TEXT[],
  available_days TEXT[],
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name TEXT NOT NULL,
  doctor_spec TEXT NOT NULL,
  doctor_sex CHAR(1) DEFAULT 'm',
  hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL,
  department TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status TEXT CHECK (status IN ('Upcoming', 'Completed', 'Cancelled')) DEFAULT 'Upcoming',
  patient_name TEXT NOT NULL,
  reason TEXT,
  fee NUMERIC(10,2) DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUEUE TOKENS TABLE
CREATE TABLE IF NOT EXISTS public.queue_tokens (
  id TEXT PRIMARY KEY,
  hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE CASCADE,
  hospital_name TEXT NOT NULL,
  department TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  current_token INTEGER DEFAULT 1,
  user_token INTEGER DEFAULT 1,
  people_waiting INTEGER DEFAULT 0,
  estimated_wait_mins INTEGER DEFAULT 15,
  status TEXT CHECK (status IN ('In Queue', 'Called', 'Completed', 'Delayed')) DEFAULT 'In Queue',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMERGENCY SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.emergency_services (
  id TEXT PRIMARY KEY,
  hospital_name TEXT NOT NULL,
  distance TEXT NOT NULL,
  er_phone TEXT NOT NULL,
  ambulance_phone TEXT NOT NULL,
  er_availability TEXT CHECK (er_availability IN ('Available', 'High Demand', 'Full')) DEFAULT 'Available',
  blood_bank_available BOOLEAN DEFAULT true,
  blood_groups_available TEXT[],
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NEARBY FACILITIES TABLE
CREATE TABLE IF NOT EXISTS public.nearby_facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Hospital', 'Clinic', 'Pharmacy', 'Diagnostic', 'Blood Bank')) NOT NULL,
  distance TEXT NOT NULL,
  location TEXT NOT NULL,
  rating NUMERIC(3,2) DEFAULT 4.5,
  is_open BOOLEAN DEFAULT true,
  hours TEXT DEFAULT '24 Hours Open',
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HEALTH RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.health_records (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('Prescription', 'Lab Report', 'Scan Report', 'Doctor Note', 'Appointment Summary')) NOT NULL,
  date DATE NOT NULL,
  doctor_name TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  file_size TEXT DEFAULT '1 MB',
  file_type TEXT DEFAULT 'PDF',
  notes TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  id TEXT PRIMARY KEY DEFAULT 'user_1',
  name TEXT DEFAULT 'John Doe',
  email TEXT DEFAULT 'john.doe@caremesh.org',
  phone TEXT DEFAULT '+91 98765 43210',
  blood_group TEXT DEFAULT 'O+',
  emergency_contact TEXT DEFAULT '+91 98765 00000',
  language TEXT DEFAULT 'English',
  theme TEXT DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  appointment_reminders BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC READ ACCESS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nearby_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to hospitals" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Allow public read access to doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public access to appointments" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Allow public access to queue_tokens" ON public.queue_tokens FOR ALL USING (true);
CREATE POLICY "Allow public read access to emergency_services" ON public.emergency_services FOR SELECT USING (true);
CREATE POLICY "Allow public read access to nearby_facilities" ON public.nearby_facilities FOR SELECT USING (true);
CREATE POLICY "Allow public access to health_records" ON public.health_records FOR ALL USING (true);
CREATE POLICY "Allow public access to user_settings" ON public.user_settings FOR ALL USING (true);
