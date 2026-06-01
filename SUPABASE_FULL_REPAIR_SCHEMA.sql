-- GlobalDoc Platform - full Supabase repair schema
-- Run this in Supabase SQL Editor. It is designed to repair an existing database
-- without deleting patient, doctor, facility, wallet, payment, or chat data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.check_password(pass text, hashed text)
RETURNS boolean AS $$
BEGIN
  IF hashed IS NULL THEN
    RETURN false;
  END IF;
  IF pass = hashed THEN
    RETURN true;
  END IF;
  RETURN hashed = crypt(pass, hashed);
EXCEPTION WHEN others THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  IF to_jsonb(NEW) ? 'updated_at' THEN
    NEW := jsonb_populate_record(NEW, jsonb_build_object('updated_at', now()));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.admins (
  id text PRIMARY KEY DEFAULT ('admin-' || extract(epoch from clock_timestamp())::bigint || '-' || encode(gen_random_bytes(4), 'hex')),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text,
  role text DEFAULT 'platform_admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.server_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.server_settings(key, value) VALUES
  ('minimumSubscriptionUSD', '10'),
  ('patientMinimumDepositUSD', '10'),
  ('tokenPerUSDFirstPurchase', '10'),
  ('tokenPerUSDRepeatPurchase', '7.5'),
  ('tokenToUSD', '10'),
  ('doctorMinimumWithdrawalUSD', '5')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.doctors_auth (
  id text PRIMARY KEY DEFAULT ('doc-' || extract(epoch from clock_timestamp())::bigint || '-' || encode(gen_random_bytes(4), 'hex')),
  email text UNIQUE NOT NULL,
  password text DEFAULT '',
  name text NOT NULL,
  specialty text DEFAULT 'General Practitioner',
  location text DEFAULT 'Nigeria',
  license_number text,
  signature_data_url text,
  passport_data_url text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.doctors (
  id text PRIMARY KEY,
  email text UNIQUE,
  name text NOT NULL,
  specialty text DEFAULT 'General Practitioner',
  location text DEFAULT 'Nigeria',
  languages text[] DEFAULT ARRAY['English'],
  rating numeric(4,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  availability text DEFAULT 'Available upon request',
  verified boolean DEFAULT false,
  license_verified boolean DEFAULT false,
  license_number text,
  signature_data_url text,
  passport_data_url text,
  license_issuer text,
  license_expiry date,
  fee numeric(12,2) DEFAULT 35,
  consultation_fee numeric(12,2) DEFAULT 35,
  price jsonb DEFAULT '{"basic":50,"premium":100}'::jsonb,
  is_online boolean DEFAULT false,
  earnings_tokens numeric(14,2) DEFAULT 0,
  bank_code text,
  bank_account text,
  currency text,
  payout_method text DEFAULT 'bank_account',
  mobile_money_operator text,
  mobile_money_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patients (
  id text PRIMARY KEY,
  email text UNIQUE,
  password text DEFAULT '',
  name text NOT NULL,
  phone text,
  country text,
  language text DEFAULT 'English',
  date_of_birth date,
  gender text,
  tokens integer DEFAULT 0,
  is_online boolean DEFAULT false,
  portal_pin text,
  registered_via text DEFAULT 'patient',
  facility_id text,
  facility_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_tokens (
  patient_id text PRIMARY KEY REFERENCES public.patients(id) ON DELETE CASCADE,
  balance integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.token_transactions (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  transaction_type text,
  amount integer DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  plan text,
  amount_usd numeric(12,2),
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payouts (
  id text PRIMARY KEY,
  doctor_id text REFERENCES public.doctors(id) ON DELETE SET NULL,
  amount_tokens numeric(14,2) DEFAULT 0,
  amount_usd numeric(14,2) DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id text PRIMARY KEY,
  doctor_id text REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  rating integer,
  comment text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id text REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name text,
  doctor_specialty text,
  consultation_type text,
  subscription_type text,
  scheduled_date timestamptz,
  duration_minutes integer DEFAULT 30,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointment_reminders (
  id text PRIMARY KEY,
  appointment_id text REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  reminder_type text,
  should_send_to text[] DEFAULT ARRAY[]::text[],
  notification_channels text[] DEFAULT ARRAY['in_app']::text[],
  scheduled_for timestamptz,
  scheduled_send_time timestamptz,
  sent boolean DEFAULT false,
  is_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  user_type text NOT NULL,
  title text,
  message text,
  type text DEFAULT 'info',
  notification_type text,
  related_resource_type text,
  related_resource_id text,
  notification_channels text[] DEFAULT ARRAY['in_app']::text[],
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id text PRIMARY KEY,
  appointment_id text,
  consultation_id text,
  sender_id text,
  sender_type text,
  recipient_id text,
  recipient_type text,
  message_type text DEFAULT 'text',
  message_content text,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_files (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  name text,
  file_name text,
  file_type text,
  mime_type text,
  file_size text,
  content_base64 text,
  url text,
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name text,
  reason text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_messages (
  id text PRIMARY KEY,
  sender_id text NOT NULL,
  sender_name text,
  sender_type text,
  phone text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.facilities (
  id text PRIMARY KEY,
  type text NOT NULL,
  name text NOT NULL,
  state text,
  lga text,
  address text,
  phone text,
  email text,
  pin text NOT NULL,
  referral_payout_ngn integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.facility_wallets (
  facility_id text PRIMARY KEY REFERENCES public.facilities(id) ON DELETE CASCADE,
  balance_ngn integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.facility_wallet_tx (
  id text PRIMARY KEY,
  facility_id text REFERENCES public.facilities(id) ON DELETE CASCADE,
  direction text,
  amount_ngn integer DEFAULT 0,
  reason text,
  ref_type text,
  ref_id text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_balances (
  id integer PRIMARY KEY DEFAULT 1,
  platform_balance_ngn integer DEFAULT 0,
  data_fund_balance_ngn integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.platform_balances(id, platform_balance_ngn, data_fund_balance_ngn)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.consultations_ng (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id text REFERENCES public.doctors(id) ON DELETE SET NULL,
  facility_id text REFERENCES public.facilities(id) ON DELETE SET NULL,
  channel text,
  track text,
  duration_min integer DEFAULT 15,
  blocks integer DEFAULT 1,
  total_ngn integer DEFAULT 0,
  status text DEFAULT 'in_progress',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DROP VIEW IF EXISTS public.consultation_ng;
CREATE VIEW public.consultation_ng AS SELECT * FROM public.consultations_ng;

CREATE TABLE IF NOT EXISTS public.revenue_splits_ng (
  id text PRIMARY KEY,
  consultation_id text REFERENCES public.consultations_ng(id) ON DELETE CASCADE,
  channel text,
  track text,
  total_ngn integer DEFAULT 0,
  doctor_ngn integer DEFAULT 0,
  platform_ngn integer DEFAULT 0,
  facility_ngn integer DEFAULT 0,
  data_fee_ngn integer DEFAULT 0,
  patient_copay_ngn integer DEFAULT 0,
  facility_topup_ngn integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.facility_referrals (
  id text PRIMARY KEY,
  code text UNIQUE NOT NULL,
  from_doctor_id text REFERENCES public.doctors(id) ON DELETE SET NULL,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  facility_id text REFERENCES public.facilities(id) ON DELETE CASCADE,
  facility_type text,
  reason text,
  notes text,
  payout_ngn integer DEFAULT 0,
  status text DEFAULT 'pending',
  redeemed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_orders (
  id text PRIMARY KEY,
  consultation_id text,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name text,
  doctor_id text REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name text,
  doctor_license_number text,
  doctor_signature_data_url text,
  facility_id text REFERENCES public.facilities(id) ON DELETE SET NULL,
  company_name text DEFAULT 'GlobalDoc',
  logo_text text DEFAULT 'GD',
  tests jsonb DEFAULT '[]'::jsonb,
  total_price_ngn integer DEFAULT 0,
  status text DEFAULT 'ordered',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lab_payments (
  id text PRIMARY KEY,
  order_id text REFERENCES public.lab_orders(id) ON DELETE CASCADE,
  facility_id text REFERENCES public.facilities(id) ON DELETE SET NULL,
  amount_paid_ngn integer DEFAULT 0,
  platform_commission_ngn integer DEFAULT 0,
  facility_net_ngn integer DEFAULT 0,
  method text DEFAULT 'cash',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id text PRIMARY KEY,
  audience text NOT NULL,
  severity text DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id text PRIMARY KEY DEFAULT ('audit-' || extract(epoch from clock_timestamp())::bigint || '-' || encode(gen_random_bytes(4), 'hex')),
  user_id text,
  user_type text,
  action text,
  resource_type text,
  resource_id text,
  ip_address text,
  user_agent text,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id text PRIMARY KEY,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id text REFERENCES public.doctors(id) ON DELETE SET NULL,
  consultation_id text,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'NGN',
  type text DEFAULT 'token_purchase',
  payment_type text DEFAULT 'token_purchase',
  status text DEFAULT 'pending',
  provider text DEFAULT 'kora',
  payment_provider text DEFAULT 'kora',
  payment_method text,
  reference text UNIQUE,
  provider_reference text,
  provider_transaction_id text,
  description text,
  customer jsonb,
  metadata jsonb,
  platform_fee numeric(14,2) DEFAULT 0,
  doctor_payout numeric(14,2) DEFAULT 0,
  payout_status text DEFAULT 'pending',
  payout_date timestamptz,
  payment_data_encrypted boolean DEFAULT true,
  pci_compliant boolean DEFAULT true,
  refund_policy_accepted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.token_revenue_splits (
  id text PRIMARY KEY,
  payment_id text,
  patient_id text REFERENCES public.patients(id) ON DELETE SET NULL,
  amount_ngn integer DEFAULT 0,
  doctors_pool_ngn integer DEFAULT 0,
  admin_ngn integer DEFAULT 0,
  company_ngn integer DEFAULT 0,
  status text DEFAULT 'pending_distribution',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
  id text PRIMARY KEY,
  consultation_id text,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name text,
  doctor_id text REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name text,
  doctor_license_number text,
  doctor_signature_data_url text,
  facility_id text REFERENCES public.facilities(id) ON DELETE SET NULL,
  company_name text DEFAULT 'GlobalDoc',
  logo_text text DEFAULT 'GD',
  medications text NOT NULL,
  prescription_text text,
  notes text,
  status text DEFAULT 'sent',
  issued_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vital_parameter_requests (
  id text PRIMARY KEY,
  consultation_id text,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id text REFERENCES public.doctors(id) ON DELETE SET NULL,
  parameter_name text NOT NULL,
  instructions text,
  status text DEFAULT 'pending',
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vital_parameters (
  id text PRIMARY KEY,
  consultation_id text,
  patient_id text REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id text REFERENCES public.doctors(id) ON DELETE SET NULL,
  request_id text REFERENCES public.vital_parameter_requests(id) ON DELETE SET NULL,
  parameter_name text NOT NULL,
  parameter_value text NOT NULL,
  unit text,
  source text DEFAULT 'manual',
  confidence numeric(4,2),
  metadata jsonb,
  measured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id text PRIMARY KEY,
  user_email text NOT NULL,
  user_type text NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Patch older tables in place. These fix the exact schema-cache errors reported.
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS password text DEFAULT '';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS language text DEFAULT 'English';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS tokens integer DEFAULT 0;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS portal_pin text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS registered_via text DEFAULT 'patient';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS facility_id text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS facility_type text;
ALTER TABLE public.patients ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.patients ALTER COLUMN date_of_birth DROP NOT NULL;

ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS fee numeric(12,2) DEFAULT 35;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS signature_data_url text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS passport_data_url text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS availability text DEFAULT 'Available upon request';
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS consultation_fee numeric(12,2) DEFAULT 35;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS price jsonb DEFAULT '{"basic":50,"premium":100}'::jsonb;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS earnings_tokens numeric(14,2) DEFAULT 0;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS bank_code text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS bank_account text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS currency text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS payout_method text DEFAULT 'bank_account';
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS mobile_money_operator text;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS mobile_money_number text;
ALTER TABLE public.doctors ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.doctors ALTER COLUMN license_number DROP NOT NULL;
ALTER TABLE public.doctors ALTER COLUMN consultation_fee SET DEFAULT 35;
ALTER TABLE public.doctors ALTER COLUMN consultation_fee DROP NOT NULL;
ALTER TABLE public.doctors ALTER COLUMN availability SET DEFAULT 'Available upon request';
ALTER TABLE public.doctors ALTER COLUMN availability DROP NOT NULL;

INSERT INTO public.doctors (
  id, email, name, specialty, location, languages, verified, license_verified, is_online, fee, consultation_fee, price
) VALUES (
  'system-doctor',
  'system-doctor@globaldoc.local',
  'GlobalDoc System Doctor',
  'General Practitioner',
  'GlobalDoc',
  ARRAY['English'],
  true,
  true,
  false,
  0,
  0,
  '{"basic":0,"premium":0}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  email = COALESCE(public.doctors.email, EXCLUDED.email),
  verified = true,
  license_verified = true;

ALTER TABLE public.doctors_auth ADD COLUMN IF NOT EXISTS password text DEFAULT '';
ALTER TABLE public.doctors_auth ADD COLUMN IF NOT EXISTS specialty text DEFAULT 'General Practitioner';
ALTER TABLE public.doctors_auth ADD COLUMN IF NOT EXISTS location text DEFAULT 'Nigeria';
ALTER TABLE public.doctors_auth ADD COLUMN IF NOT EXISTS license_number text;
ALTER TABLE public.doctors_auth ADD COLUMN IF NOT EXISTS signature_data_url text;
ALTER TABLE public.doctors_auth ADD COLUMN IF NOT EXISTS passport_data_url text;
ALTER TABLE public.doctors_auth ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS lga text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS pin text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS referral_payout_ngn integer DEFAULT 0;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE public.facility_wallets ADD COLUMN IF NOT EXISTS balance_ngn integer DEFAULT 0;
ALTER TABLE public.facility_wallets ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.facility_wallet_tx ADD COLUMN IF NOT EXISTS direction text;
ALTER TABLE public.facility_wallet_tx ADD COLUMN IF NOT EXISTS amount_ngn integer DEFAULT 0;
ALTER TABLE public.facility_wallet_tx ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE public.facility_wallet_tx ADD COLUMN IF NOT EXISTS ref_type text;
ALTER TABLE public.facility_wallet_tx ADD COLUMN IF NOT EXISTS ref_id text;
ALTER TABLE public.facility_wallet_tx ADD COLUMN IF NOT EXISTS meta jsonb;

ALTER TABLE public.consultations_ng ADD COLUMN IF NOT EXISTS patient_id text;
ALTER TABLE public.consultations_ng ADD COLUMN IF NOT EXISTS doctor_id text;
ALTER TABLE public.consultations_ng ADD COLUMN IF NOT EXISTS facility_id text;
ALTER TABLE public.consultations_ng ADD COLUMN IF NOT EXISTS channel text;
ALTER TABLE public.consultations_ng ADD COLUMN IF NOT EXISTS track text;
ALTER TABLE public.consultations_ng ADD COLUMN IF NOT EXISTS duration_min integer DEFAULT 15;
ALTER TABLE public.consultations_ng ADD COLUMN IF NOT EXISTS blocks integer DEFAULT 1;
ALTER TABLE public.consultations_ng ADD COLUMN IF NOT EXISTS total_ngn integer DEFAULT 0;
ALTER TABLE public.consultations_ng ADD COLUMN IF NOT EXISTS status text DEFAULT 'in_progress';
ALTER TABLE public.consultations_ng ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE public.community_messages ADD COLUMN IF NOT EXISTS sender_id text;
ALTER TABLE public.community_messages ADD COLUMN IF NOT EXISTS sender_name text;
ALTER TABLE public.community_messages ADD COLUMN IF NOT EXISTS sender_type text;
ALTER TABLE public.community_messages ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.community_messages ADD COLUMN IF NOT EXISTS message text;

ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS consultation_id text;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS recipient_id text;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS recipient_type text;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS message_content text;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS doctor_name text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS doctor_specialty text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS consultation_type text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS subscription_type text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS scheduled_date timestamptz;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 30;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS tokens_charged integer DEFAULT 0;

ALTER TABLE public.appointment_reminders ADD COLUMN IF NOT EXISTS should_send_to text[] DEFAULT ARRAY[]::text[];
ALTER TABLE public.appointment_reminders ADD COLUMN IF NOT EXISTS notification_channels text[] DEFAULT ARRAY['in_app']::text[];
ALTER TABLE public.appointment_reminders ADD COLUMN IF NOT EXISTS scheduled_send_time timestamptz;
ALTER TABLE public.appointment_reminders ADD COLUMN IF NOT EXISTS is_sent boolean DEFAULT false;

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS notification_type text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_resource_type text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_resource_id text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS notification_channels text[] DEFAULT ARRAY['in_app']::text[];

ALTER TABLE public.lab_orders ADD COLUMN IF NOT EXISTS patient_name text;
ALTER TABLE public.lab_orders ADD COLUMN IF NOT EXISTS doctor_name text;
ALTER TABLE public.lab_orders ADD COLUMN IF NOT EXISTS doctor_license_number text;
ALTER TABLE public.lab_orders ADD COLUMN IF NOT EXISTS doctor_signature_data_url text;
ALTER TABLE public.lab_orders ADD COLUMN IF NOT EXISTS company_name text DEFAULT 'GlobalDoc';
ALTER TABLE public.lab_orders ADD COLUMN IF NOT EXISTS logo_text text DEFAULT 'GD';

ALTER TABLE public.patient_files ADD COLUMN IF NOT EXISTS file_name text;
ALTER TABLE public.patient_files ADD COLUMN IF NOT EXISTS file_type text;
ALTER TABLE public.patient_files ADD COLUMN IF NOT EXISTS mime_type text;
ALTER TABLE public.patient_files ADD COLUMN IF NOT EXISTS file_size text;
ALTER TABLE public.patient_files ADD COLUMN IF NOT EXISTS content_base64 text;
ALTER TABLE public.patient_files ADD COLUMN IF NOT EXISTS url text;

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_type text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_type text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS resource_id text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_agent text;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS changes jsonb;

ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS audience text;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS severity text DEFAULT 'info';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS expires_at timestamptz;

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS consultation_id text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS type text DEFAULT 'token_purchase';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'token_purchase';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider text DEFAULT 'kora';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_provider text DEFAULT 'kora';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS reference text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_reference text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_transaction_id text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS customer jsonb;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS metadata jsonb;

ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS consultation_id text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS patient_id text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS patient_name text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS doctor_id text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS doctor_name text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS doctor_license_number text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS doctor_signature_data_url text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS facility_id text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS company_name text DEFAULT 'GlobalDoc';
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS logo_text text DEFAULT 'GD';
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS medications text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS prescription_text text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent';
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS issued_at timestamptz DEFAULT now();
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.vital_parameter_requests ADD COLUMN IF NOT EXISTS consultation_id text;
ALTER TABLE public.vital_parameter_requests ADD COLUMN IF NOT EXISTS patient_id text;
ALTER TABLE public.vital_parameter_requests ADD COLUMN IF NOT EXISTS doctor_id text;
ALTER TABLE public.vital_parameter_requests ADD COLUMN IF NOT EXISTS parameter_name text;
ALTER TABLE public.vital_parameter_requests ADD COLUMN IF NOT EXISTS instructions text;
ALTER TABLE public.vital_parameter_requests ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.vital_parameter_requests ADD COLUMN IF NOT EXISTS requested_at timestamptz DEFAULT now();
ALTER TABLE public.vital_parameter_requests ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.vital_parameter_requests ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS consultation_id text;
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS patient_id text;
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS doctor_id text;
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS request_id text;
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS parameter_name text;
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS parameter_value text;
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS confidence numeric(4,2);
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS measured_at timestamptz DEFAULT now();
ALTER TABLE public.vital_parameters ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.token_revenue_splits ADD COLUMN IF NOT EXISTS payment_id text;
ALTER TABLE public.token_revenue_splits ADD COLUMN IF NOT EXISTS patient_id text;
ALTER TABLE public.token_revenue_splits ADD COLUMN IF NOT EXISTS amount_ngn integer DEFAULT 0;
ALTER TABLE public.token_revenue_splits ADD COLUMN IF NOT EXISTS doctors_pool_ngn integer DEFAULT 0;
ALTER TABLE public.token_revenue_splits ADD COLUMN IF NOT EXISTS admin_ngn integer DEFAULT 0;
ALTER TABLE public.token_revenue_splits ADD COLUMN IF NOT EXISTS company_ngn integer DEFAULT 0;
ALTER TABLE public.token_revenue_splits ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending_distribution';
ALTER TABLE public.token_revenue_splits ADD COLUMN IF NOT EXISTS metadata jsonb;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.payments'::regclass
      AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.payments ALTER COLUMN doctor_id DROP NOT NULL;
ALTER TABLE public.payments ALTER COLUMN patient_id DROP NOT NULL;
ALTER TABLE public.payments ALTER COLUMN payment_type SET DEFAULT 'token_purchase';
ALTER TABLE public.payments ALTER COLUMN type SET DEFAULT 'token_purchase';
ALTER TABLE public.payments ALTER COLUMN status SET DEFAULT 'pending';

-- Backfill missing token rows and wallet rows.
INSERT INTO public.patient_tokens(patient_id, balance)
SELECT p.id, COALESCE(p.tokens, 0)
FROM public.patients p
LEFT JOIN public.patient_tokens pt ON pt.patient_id = p.id
WHERE pt.patient_id IS NULL;

INSERT INTO public.facility_wallets(facility_id, balance_ngn)
SELECT f.id, 0
FROM public.facilities f
LEFT JOIN public.facility_wallets fw ON fw.facility_id = f.id
WHERE fw.facility_id IS NULL;

-- Helpful indexes.
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_facility_id ON public.patients(facility_id);
CREATE INDEX IF NOT EXISTS idx_patients_portal_pin ON public.patients(portal_pin);
CREATE INDEX IF NOT EXISTS idx_doctors_online ON public.doctors(is_online);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_consultations_ng_patient ON public.consultations_ng(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_ng_doctor ON public.consultations_ng(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_ng_facility ON public.consultations_ng(facility_id);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON public.facilities(type);
CREATE INDEX IF NOT EXISTS idx_facility_wallet_tx_facility ON public.facility_wallet_tx(facility_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_patient ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_facility ON public.prescriptions(facility_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON public.prescriptions(consultation_id);
CREATE INDEX IF NOT EXISTS idx_vital_requests_consultation ON public.vital_parameter_requests(consultation_id);
CREATE INDEX IF NOT EXISTS idx_vital_requests_patient_status ON public.vital_parameter_requests(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_vitals_consultation ON public.vital_parameters(consultation_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON public.vital_parameters(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_doctor ON public.vital_parameters(doctor_id);
CREATE INDEX IF NOT EXISTS idx_token_revenue_splits_payment ON public.token_revenue_splits(payment_id);
CREATE INDEX IF NOT EXISTS idx_token_revenue_splits_patient ON public.token_revenue_splits(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON public.community_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_audience ON public.announcements(audience, is_active);

-- Keep updated_at fresh on key tables.
DROP TRIGGER IF EXISTS trg_admins_updated_at ON public.admins;
CREATE TRIGGER trg_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_doctors_auth_updated_at ON public.doctors_auth;
CREATE TRIGGER trg_doctors_auth_updated_at BEFORE UPDATE ON public.doctors_auth FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_doctors_updated_at ON public.doctors;
CREATE TRIGGER trg_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_patients_updated_at ON public.patients;
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_facilities_updated_at ON public.facilities;
CREATE TRIGGER trg_facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER trg_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_vital_requests_updated_at ON public.vital_parameter_requests;
CREATE TRIGGER trg_vital_requests_updated_at BEFORE UPDATE ON public.vital_parameter_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_vital_parameters_updated_at ON public.vital_parameters;
CREATE TRIGGER trg_vital_parameters_updated_at BEFORE UPDATE ON public.vital_parameters FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Recreate compatibility view after all consultation columns are patched so PostgREST sees it.
DROP VIEW IF EXISTS public.consultation_ng;
CREATE VIEW public.consultation_ng AS SELECT * FROM public.consultations_ng;

NOTIFY pgrst, 'reload schema';
