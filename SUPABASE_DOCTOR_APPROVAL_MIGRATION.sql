-- Doctor approval workflow migration for GlobalDoc Connect.
-- Run this once in Supabase SQL Editor before deploying the approval workflow.

ALTER TABLE IF EXISTS public.doctors_auth
  ADD COLUMN IF NOT EXISTS bank_code TEXT,
  ADD COLUMN IF NOT EXISTS bank_account TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

ALTER TABLE IF EXISTS public.doctors
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS license_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS license_number TEXT,
  ADD COLUMN IF NOT EXISTS license_issuer TEXT,
  ADD COLUMN IF NOT EXISTS license_expiry TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS payout_method TEXT DEFAULT 'bank_account',
  ADD COLUMN IF NOT EXISTS mobile_money_operator TEXT,
  ADD COLUMN IF NOT EXISTS mobile_money_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_code TEXT,
  ADD COLUMN IF NOT EXISTS bank_account TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

CREATE INDEX IF NOT EXISTS idx_doctors_auth_verified ON public.doctors_auth(verified);
CREATE INDEX IF NOT EXISTS idx_doctors_verified_license ON public.doctors(verified, license_verified);
CREATE INDEX IF NOT EXISTS idx_doctors_license_number ON public.doctors(license_number);

-- Existing doctors stay pending until the platform admin explicitly approves them.
UPDATE public.doctors_auth
SET verified = COALESCE(verified, FALSE);

UPDATE public.doctors
SET
  verified = COALESCE(verified, FALSE),
  license_verified = COALESCE(license_verified, FALSE);
