-- GlobalDoc Connect - Phase 2 Clinical Workflow
-- Structured medication orders, lab results, and final visit summaries.
-- Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS medication_orders (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  consultation_id TEXT,
  diagnosis TEXT,
  patient_age TEXT,
  pregnancy_status TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  current_medications JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft',
  verification_code TEXT UNIQUE,
  verification_url TEXT,
  expires_at TIMESTAMPTZ,
  issued_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medication_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES medication_orders(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dose TEXT,
  route TEXT,
  frequency TEXT,
  duration TEXT,
  quantity TEXT,
  instructions TEXT,
  allow_substitution BOOLEAN DEFAULT FALSE,
  refill_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medication_order_checks (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES medication_orders(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  item_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_verifications (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES medication_orders(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL,
  verified_by_type TEXT,
  verified_by_id TEXT,
  verified_by_name TEXT,
  result TEXT DEFAULT 'viewed',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_results (
  id TEXT PRIMARY KEY,
  lab_order_id TEXT,
  patient_id TEXT NOT NULL,
  doctor_id TEXT,
  facility_id TEXT,
  test_name TEXT NOT NULL,
  result_text TEXT,
  result_value TEXT,
  unit TEXT,
  reference_range TEXT,
  abnormal_flag BOOLEAN DEFAULT FALSE,
  critical_flag BOOLEAN DEFAULT FALSE,
  doctor_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  status TEXT DEFAULT 'uploaded',
  uploaded_by_type TEXT DEFAULT 'facility',
  uploaded_by_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultation_summaries (
  id TEXT PRIMARY KEY,
  consultation_id TEXT,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  reason_for_visit TEXT,
  clinical_findings TEXT,
  diagnosis TEXT,
  treatment_given TEXT,
  medication_summary TEXT,
  lab_summary TEXT,
  follow_up_plan TEXT,
  red_flags TEXT,
  patient_friendly_summary TEXT,
  status TEXT DEFAULT 'draft',
  finalized_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medication_orders_patient ON medication_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_orders_doctor ON medication_orders(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medication_orders_consultation ON medication_orders(consultation_id);
CREATE INDEX IF NOT EXISTS idx_medication_orders_verification ON medication_orders(verification_code);
CREATE INDEX IF NOT EXISTS idx_medication_order_items_order ON medication_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_medication_order_checks_order ON medication_order_checks(order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_order ON lab_results(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_critical ON lab_results(critical_flag, abnormal_flag);
CREATE INDEX IF NOT EXISTS idx_consultation_summaries_patient ON consultation_summaries(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_summaries_consultation ON consultation_summaries(consultation_id);
