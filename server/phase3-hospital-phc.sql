-- GlobalDoc Connect - Phase 3 Hospital / PHC Operations
-- Adds PHC patient PIN workflow, facility queue, referrals,
-- pharmacy dispensing and lab workflow records.
-- Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS phc_patients (
  id TEXT PRIMARY KEY,
  patient_code TEXT UNIQUE NOT NULL,
  facility_id TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  date_of_birth TEXT,
  gender TEXT,
  pin_hash TEXT NOT NULL,
  consent_given BOOLEAN DEFAULT FALSE,
  emergency_contact TEXT,
  notes TEXT,
  created_by_type TEXT DEFAULT 'facility',
  created_by_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facility_queue_entries (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL,
  patient_id TEXT,
  patient_code TEXT,
  queue_type TEXT DEFAULT 'triage',
  priority TEXT DEFAULT 'normal',
  reason TEXT,
  vitals JSONB DEFAULT '{}'::jsonb,
  assigned_to TEXT,
  status TEXT DEFAULT 'waiting',
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facility_referrals (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_code TEXT,
  from_facility_id TEXT,
  to_facility_id TEXT,
  specialty TEXT,
  reason TEXT NOT NULL,
  urgency TEXT DEFAULT 'routine',
  status TEXT DEFAULT 'pending',
  referred_by_type TEXT DEFAULT 'facility',
  referred_by_id TEXT,
  accepted_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pharmacy_dispense_records (
  id TEXT PRIMARY KEY,
  facility_id TEXT,
  patient_id TEXT,
  patient_code TEXT,
  medication_order_id TEXT,
  medicine_name TEXT NOT NULL,
  quantity TEXT,
  dispensed_by TEXT,
  status TEXT DEFAULT 'dispensed',
  notes TEXT,
  dispensed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_workflow_orders (
  id TEXT PRIMARY KEY,
  facility_id TEXT,
  patient_id TEXT,
  patient_code TEXT,
  doctor_id TEXT,
  test_name TEXT NOT NULL,
  specimen_type TEXT,
  status TEXT DEFAULT 'requested',
  priority TEXT DEFAULT 'routine',
  requested_by TEXT,
  collected_at TIMESTAMPTZ,
  resulted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phc_patients_code ON phc_patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_phc_patients_facility ON phc_patients(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_queue_facility ON facility_queue_entries(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_facility_queue_patient ON facility_queue_entries(patient_id, patient_code);
CREATE INDEX IF NOT EXISTS idx_facility_referrals_patient ON facility_referrals(patient_id, patient_code);
CREATE INDEX IF NOT EXISTS idx_facility_referrals_from ON facility_referrals(from_facility_id, status);
CREATE INDEX IF NOT EXISTS idx_pharmacy_dispense_patient ON pharmacy_dispense_records(patient_id, patient_code);
CREATE INDEX IF NOT EXISTS idx_lab_workflow_patient ON lab_workflow_orders(patient_id, patient_code);
CREATE INDEX IF NOT EXISTS idx_lab_workflow_facility ON lab_workflow_orders(facility_id, status);

CREATE OR REPLACE FUNCTION update_phase3_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_phc_patients_updated_at ON phc_patients;
CREATE TRIGGER update_phc_patients_updated_at BEFORE UPDATE ON phc_patients FOR EACH ROW EXECUTE FUNCTION update_phase3_updated_at();

DROP TRIGGER IF EXISTS update_facility_queue_updated_at ON facility_queue_entries;
CREATE TRIGGER update_facility_queue_updated_at BEFORE UPDATE ON facility_queue_entries FOR EACH ROW EXECUTE FUNCTION update_phase3_updated_at();

DROP TRIGGER IF EXISTS update_facility_referrals_updated_at ON facility_referrals;
CREATE TRIGGER update_facility_referrals_updated_at BEFORE UPDATE ON facility_referrals FOR EACH ROW EXECUTE FUNCTION update_phase3_updated_at();

DROP TRIGGER IF EXISTS update_pharmacy_dispense_updated_at ON pharmacy_dispense_records;
CREATE TRIGGER update_pharmacy_dispense_updated_at BEFORE UPDATE ON pharmacy_dispense_records FOR EACH ROW EXECUTE FUNCTION update_phase3_updated_at();

DROP TRIGGER IF EXISTS update_lab_workflow_updated_at ON lab_workflow_orders;
CREATE TRIGGER update_lab_workflow_updated_at BEFORE UPDATE ON lab_workflow_orders FOR EACH ROW EXECUTE FUNCTION update_phase3_updated_at();
