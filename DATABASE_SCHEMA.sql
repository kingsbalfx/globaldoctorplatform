-- DATABASE_SCHEMA.sql
-- SQL schema for GlobalDoc Connect
-- Run this in PostgreSQL to create the core application tables.

-- Doctors authentication and profile data
CREATE TABLE IF NOT EXISTS doctors_auth (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location TEXT NOT NULL,
  license_number TEXT NOT NULL,
  bank_account TEXT,
  bank_code TEXT,
  account_name TEXT,
  currency TEXT DEFAULT 'USD',
  earnings_tokens NUMERIC DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location TEXT NOT NULL,
  languages TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  availability TEXT DEFAULT 'Available upon request',
  verified BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  fee NUMERIC(10,2) DEFAULT 50,
  price JSONB,
  license_verified BOOLEAN DEFAULT FALSE,
  license_number TEXT,
  license_issuer TEXT,
  license_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  bank_account TEXT,
  bank_code TEXT,
  account_name TEXT,
  currency TEXT DEFAULT 'USD',
  earnings_tokens NUMERIC DEFAULT 0
);

-- Patients and authentication
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  tokens INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patient_tokens (
  id SERIAL PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS token_transactions (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reviews left by patients for doctors
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Referrals for cross-specialty routing
CREATE TABLE IF NOT EXISTS referrals (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  from_specialty TEXT NOT NULL,
  to_specialty TEXT NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Subscriptions and token bundles
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  tokens_included INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Emergency request history
CREATE TABLE IF NOT EXISTS emergency_requests (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications stored for users
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_resource_type TEXT,
  related_resource_id TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  notification_channels TEXT[] DEFAULT ARRAY['in_app'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Payments and transactions
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE SET NULL,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  client_secret TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Patient file storage metadata
CREATE TABLE IF NOT EXISTS patient_files (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  content_base64 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Appointments and reminders
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  consultation_type TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  subscription_type TEXT,
  tokens_charged INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointment_reminders (
  id TEXT PRIMARY KEY,
  appointment_id TEXT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  should_send_to TEXT[] NOT NULL,
  notification_channels TEXT[] NOT NULL,
  scheduled_send_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat and consultation messaging
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  consultation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  message_content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Administrative uploaded files metadata
CREATE TABLE IF NOT EXISTS uploaded_files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optional settings table
CREATE TABLE IF NOT EXISTS server_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optionally create a row for minimum subscription settings
INSERT INTO server_settings (key, value)
VALUES ('minimumSubscriptionUSD', '5')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vital Parameters for Telehealth Consultations
CREATE TABLE IF NOT EXISTS vital_parameters (
  id SERIAL PRIMARY KEY,
  consultation_id TEXT,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id TEXT REFERENCES doctors(id) ON DELETE SET NULL,
  parameter_name TEXT NOT NULL,
  parameter_value TEXT NOT NULL,
  unit TEXT,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  device_type TEXT DEFAULT 'smartphone',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_vital_parameters_patient ON vital_parameters(patient_id);
CREATE INDEX idx_vital_parameters_consultation ON vital_parameters(consultation_id);
CREATE INDEX idx_vital_parameters_measured_at ON vital_parameters(measured_at DESC);

-- Vital Parameters History View
CREATE OR REPLACE VIEW vital_parameters_summary AS
SELECT 
  vp.patient_id,
  vp.parameter_name,
  vp.parameter_value,
  vp.measured_at,
  p.name as patient_name,
  d.name as doctor_name
FROM vital_parameters vp
LEFT JOIN patients p ON vp.patient_id = p.id
LEFT JOIN doctors d ON vp.doctor_id = d.id
ORDER BY vp.measured_at DESC;

-- Seed Admin Account
INSERT INTO admins (email, password, name)
VALUES ('shafiuabdullahi.sa3@gmail.com', '014/Pt/014', 'System Administrator')
ON CONFLICT (email) DO NOTHING;
