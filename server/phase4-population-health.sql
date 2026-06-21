-- GlobalDoc Connect - Phase 4 Compliance Hardening
-- Role permissions, access logs, data requests, consent history and MFA-ready records.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS gd_role_permissions (
  id TEXT PRIMARY KEY,
  role_name TEXT NOT NULL,
  permission_key TEXT NOT NULL,
  permission_scope TEXT DEFAULT 'global',
  allowed BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gd_file_access_events (
  id TEXT PRIMARY KEY,
  file_id TEXT,
  file_name TEXT,
  patient_id TEXT,
  patient_code TEXT,
  actor_id TEXT,
  actor_type TEXT,
  access_reason TEXT,
  action_name TEXT DEFAULT 'viewed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gd_patient_data_requests (
  id TEXT PRIMARY KEY,
  request_code TEXT UNIQUE NOT NULL,
  patient_id TEXT,
  patient_code TEXT,
  request_type TEXT DEFAULT 'export',
  contact TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gd_consent_history (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_code TEXT,
  consent_type TEXT NOT NULL,
  consent_status TEXT DEFAULT 'given',
  version TEXT DEFAULT 'v1',
  source TEXT DEFAULT 'app',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gd_admin_security_steps (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_type TEXT DEFAULT 'admin',
  method_name TEXT DEFAULT 'email',
  destination TEXT,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gd_role_permissions ON gd_role_permissions(role_name, permission_key);
CREATE INDEX IF NOT EXISTS idx_gd_file_access_patient ON gd_file_access_events(patient_id, patient_code);
CREATE INDEX IF NOT EXISTS idx_gd_patient_data_requests ON gd_patient_data_requests(patient_id, patient_code, status);
CREATE INDEX IF NOT EXISTS idx_gd_consent_history ON gd_consent_history(patient_id, patient_code, consent_type);
CREATE INDEX IF NOT EXISTS idx_gd_admin_security_steps ON gd_admin_security_steps(user_id, user_type, status);
