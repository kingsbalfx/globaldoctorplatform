-- ============================================
-- GlobalDoc Connect - Phase 1 Advanced Health OS Core
-- Adds health passport events, consent capture, emergency triage,
-- care plans, structured SOAP notes, and advanced audit events.
-- Safe to run multiple times.
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS patient_consents (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_version TEXT DEFAULT 'phase1-v1',
  source TEXT DEFAULT 'health_os',
  actor_type TEXT DEFAULT 'patient',
  actor_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clinical_triage_events (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  symptoms TEXT NOT NULL,
  duration TEXT,
  severity TEXT DEFAULT 'unknown',
  pregnancy_status TEXT,
  age TEXT,
  red_flags JSONB DEFAULT '[]'::jsonb,
  emergency_recommended BOOLEAN DEFAULT FALSE,
  recommended_action TEXT,
  source TEXT DEFAULT 'ai_health_os',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_care_plans (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT,
  consultation_id TEXT,
  title TEXT NOT NULL,
  diagnosis TEXT,
  goals TEXT,
  instructions TEXT,
  red_flags TEXT,
  follow_up_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_by_type TEXT DEFAULT 'system',
  created_by_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_plan_tasks (
  id TEXT PRIMARY KEY,
  care_plan_id TEXT NOT NULL REFERENCES patient_care_plans(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  task_type TEXT DEFAULT 'instruction',
  title TEXT NOT NULL,
  details TEXT,
  due_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clinical_soap_notes (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  consultation_id TEXT,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  diagnosis TEXT,
  follow_up TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'signed', 'amended', 'voided')),
  signed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_passport_events (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  source_table TEXT,
  source_id TEXT,
  event_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS advanced_audit_events (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  risk_level TEXT DEFAULT 'info',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_consents_patient ON patient_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_consents_type ON patient_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_triage_patient ON clinical_triage_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_triage_emergency ON clinical_triage_events(emergency_recommended);
CREATE INDEX IF NOT EXISTS idx_care_plans_patient ON patient_care_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_plan_tasks_plan ON care_plan_tasks(care_plan_id);
CREATE INDEX IF NOT EXISTS idx_care_plan_tasks_patient ON care_plan_tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_soap_patient ON clinical_soap_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_soap_doctor ON clinical_soap_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_health_passport_patient ON health_passport_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_advanced_audit_actor ON advanced_audit_events(actor_id, actor_type);
CREATE INDEX IF NOT EXISTS idx_advanced_audit_resource ON advanced_audit_events(resource_type, resource_id);

CREATE OR REPLACE FUNCTION update_health_os_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_patient_care_plans_updated_at ON patient_care_plans;
CREATE TRIGGER update_patient_care_plans_updated_at BEFORE UPDATE ON patient_care_plans FOR EACH ROW EXECUTE FUNCTION update_health_os_updated_at();

DROP TRIGGER IF EXISTS update_clinical_soap_notes_updated_at ON clinical_soap_notes;
CREATE TRIGGER update_clinical_soap_notes_updated_at BEFORE UPDATE ON clinical_soap_notes FOR EACH ROW EXECUTE FUNCTION update_health_os_updated_at();
