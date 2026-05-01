-- ============================================
-- GlobalDoc Connect - Comprehensive SQL Schema
-- GDPR/HIPAA Compliant Database Design
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Doctors Table with License and Verification
CREATE TABLE doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  specialty TEXT NOT NULL,
  sub_specialty TEXT,
  bio TEXT,
  location TEXT NOT NULL,
  country TEXT,
  region TEXT,
  timezone TEXT,
  languages TEXT[] DEFAULT ARRAY['English'],
  
  -- Professional Information
  license_number TEXT NOT NULL UNIQUE,
  license_issuer TEXT,
  license_expiry DATE,
  license_verified BOOLEAN DEFAULT FALSE,
  license_verification_date TIMESTAMP WITH TIME ZONE,
  license_document_url TEXT,
  
  -- Rating System
  rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Availability & Pricing
  availability TEXT DEFAULT 'Available upon request',
  consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  priority_access_fee NUMERIC(10,2),
  hours_per_week INTEGER,
  
  -- Verification Status
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  
  -- Experience
  years_experience INTEGER,
  qualifications JSONB,
  certifications JSONB,
  
  -- GDPR/HIPAA Compliance Fields
  data_processing_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  notification_opt_in BOOLEAN DEFAULT TRUE,
  terms_accepted BOOLEAN DEFAULT FALSE,
  privacy_policy_accepted BOOLEAN DEFAULT FALSE,
  code_of_conduct_accepted BOOLEAN DEFAULT FALSE,
  data_retention_period INTERVAL DEFAULT INTERVAL '7 years',
  encryption_enabled BOOLEAN DEFAULT TRUE,
  audit_log_enabled BOOLEAN DEFAULT TRUE,
  last_data_access TIMESTAMP WITH TIME ZONE,
  consent_withdrawal_date TIMESTAMP WITH TIME ZONE,
  
  -- Account Management
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'inactive', 'deleted')),
  suspended_reason TEXT,
  suspended_date TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT consent_check CHECK (NOT (consent_withdrawal_date IS NOT NULL AND data_processing_consent))
);

-- Patients Table with Comprehensive Health Info
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  
  -- Demographics
  date_of_birth DATE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  blood_type TEXT CHECK (blood_type IN ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-')),
  country TEXT,
  region TEXT,
  timezone TEXT,
  language_preference TEXT DEFAULT 'English',
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  -- Medical History
  medical_history JSONB,
  allergies JSONB,
  current_medications JSONB,
  chronic_conditions JSONB,
  
  -- Verification & Status
  verified_patient BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'inactive', 'deleted')),
  
  -- GDPR/HIPAA Compliance Fields
  accepted_terms BOOLEAN DEFAULT FALSE,
  terms_acceptance_date TIMESTAMP WITH TIME ZONE,
  accepted_privacy_policy BOOLEAN DEFAULT FALSE,
  privacy_policy_acceptance_date TIMESTAMP WITH TIME ZONE,
  data_processing_consent BOOLEAN DEFAULT FALSE,
  medical_data_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  research_consent BOOLEAN DEFAULT FALSE,
  data_retention_period INTERVAL DEFAULT INTERVAL '7 years',
  last_data_access TIMESTAMP WITH TIME ZONE,
  encryption_enabled BOOLEAN DEFAULT TRUE,
  audit_log_enabled BOOLEAN DEFAULT TRUE,
  consent_withdrawn BOOLEAN DEFAULT FALSE,
  consent_withdrawal_date TIMESTAMP WITH TIME ZONE,
  data_access_requests_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations/Bookings Table
CREATE TABLE consultations (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  
  -- Consultation Details
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('telehealth', 'in-person', 'virtual', 'follow-up')),
  specialty TEXT NOT NULL,
  description TEXT,
  
  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  cancellation_reason TEXT,
  
  -- Pricing & Payment
  base_fee NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2),
  total_fee NUMERIC(10,2),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded', 'failed')),
  
  -- Medical Records
  medical_notes TEXT,
  diagnosis TEXT,
  prescription JSONB,
  recommendations TEXT,
  
  -- Files & Attachments
  attachment_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- GDPR/HIPAA Compliance
  data_classification TEXT CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
  encryption_enabled BOOLEAN DEFAULT TRUE,
  access_log_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews/Ratings Table
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  clinical_competence_rating INTEGER CHECK (clinical_competence_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  time_management_rating INTEGER CHECK (time_management_rating BETWEEN 1 AND 5),
  
  -- Review Status
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  
  -- GDPR/HIPAA Compliance
  anonymized BOOLEAN DEFAULT FALSE,
  consent_given BOOLEAN DEFAULT TRUE,
  patient_consent_withdrawal_date TIMESTAMP WITH TIME ZONE,
  redaction_needed BOOLEAN DEFAULT FALSE,
  redaction_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments & Transactions
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  consultation_id TEXT REFERENCES consultations(id) ON DELETE SET NULL,
  
  -- Payment Details
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('consultation', 'priority_access', 'subscription', 'refund')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
  
  -- Payment Method
  payment_method TEXT,
  payment_provider TEXT,
  provider_reference TEXT,
  provider_transaction_id TEXT,
  
  -- Platform Fees
  platform_fee NUMERIC(12,2),
  doctor_payout NUMERIC(12,2),
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
  payout_date TIMESTAMP WITH TIME ZONE,
  
  -- GDPR/HIPAA Compliance
  payment_data_encrypted BOOLEAN DEFAULT TRUE,
  pci_compliant BOOLEAN DEFAULT TRUE,
  refund_policy_accepted BOOLEAN DEFAULT TRUE,
  refund_eligible BOOLEAN DEFAULT TRUE,
  refund_deadline TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals Table
CREATE TABLE referrals (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  referring_doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  referred_doctor_id TEXT REFERENCES doctors(id) ON DELETE SET NULL,
  
  -- Referral Details
  referring_specialty TEXT NOT NULL,
  target_specialty TEXT NOT NULL,
  referral_reason TEXT NOT NULL,
  clinical_notes TEXT,
  urgency_level TEXT DEFAULT 'normal' CHECK (urgency_level IN ('routine', 'normal', 'urgent', 'emergency')),
  
  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'declined', 'cancelled')),
  status_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Medical Records Included
  include_medical_history BOOLEAN DEFAULT TRUE,
  include_test_results BOOLEAN DEFAULT TRUE,
  include_imaging BOOLEAN DEFAULT FALSE,
  
  -- Encryption & Security
  encryption_enabled BOOLEAN DEFAULT TRUE,
  secure_link_token TEXT,
  link_expiry TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table - Comprehensive Activity Tracking
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('doctor', 'patient', 'admin', 'system')),
  
  -- Action Information
  action TEXT NOT NULL,
  action_category TEXT,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  
  -- Change Tracking
  changes JSONB,
  old_values JSONB,
  new_values JSONB,
  
  -- System Information
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  -- Compliance Tracking
  sensitive_data_involved BOOLEAN DEFAULT FALSE,
  personal_data_involved BOOLEAN DEFAULT FALSE,
  health_data_involved BOOLEAN DEFAULT FALSE,
  compliance_flag TEXT,
  
  -- Status
  result TEXT CHECK (result IN ('success', 'failure', 'denied')),
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Access Requests Table - GDPR Right to Access
CREATE TABLE data_access_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('doctor', 'patient')),
  
  -- Request Details
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'objection', 'restriction')),
  request_reason TEXT,
  
  -- Status & Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'denied', 'partially_granted')),
  priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
  
  -- Processing Timeline
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  response_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Response Details
  response_format TEXT CHECK (response_format IN ('email', 'secure_link', 'encrypted_file', 'api')),
  response_url TEXT,
  response_data JSONB,
  denial_reason TEXT,
  
  -- Audit
  processed_by TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent History Table - Track All Consent Changes
CREATE TABLE consent_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('doctor', 'patient')),
  
  -- Consent Details
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_version TEXT,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  timestamp_given TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  withdrawal_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verification_method TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files & Attachments Table
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  uploaded_by TEXT NOT NULL,
  upload_type TEXT CHECK (upload_type IN ('patient_document', 'medical_record', 'prescription', 'test_result', 'imaging', 'other')),
  
  -- File Details
  original_filename TEXT NOT NULL,
  file_extension TEXT,
  mime_type TEXT,
  file_size BIGINT,
  storage_url TEXT,
  
  -- Encryption & Security
  encryption_key_id TEXT,
  encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
  checksum TEXT,
  checksum_algorithm TEXT DEFAULT 'SHA-256',
  
  -- Relationship
  consultation_id TEXT REFERENCES consultations(id) ON DELETE CASCADE,
  referral_id TEXT REFERENCES referrals(id) ON DELETE CASCADE,
  
  -- Access Control
  access_level TEXT DEFAULT 'restricted' CHECK (access_level IN ('public', 'internal', 'restricted', 'encrypted')),
  virus_scanned BOOLEAN DEFAULT FALSE,
  scan_result TEXT,
  
  -- Retention
  retention_until TIMESTAMP WITH TIME ZONE,
  auto_delete BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Retention Policies Table
CREATE TABLE data_retention_policies (
  id TEXT PRIMARY KEY,
  data_type TEXT UNIQUE NOT NULL,
  
  -- Retention Rules
  retention_period INTERVAL NOT NULL,
  deletion_method TEXT CHECK (deletion_method IN ('soft_delete', 'hard_delete', 'archive', 'anonymize')),
  auto_delete BOOLEAN DEFAULT FALSE,
  requires_audit BOOLEAN DEFAULT TRUE,
  
  -- Compliance
  gdpr_compliant BOOLEAN DEFAULT TRUE,
  hipaa_compliant BOOLEAN DEFAULT TRUE,
  ccpa_compliant BOOLEAN DEFAULT TRUE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Events Table
CREATE TABLE security_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'failed_login', 'password_change', 'api_error', 'access_denied', 'data_breach', 'suspicious_activity')),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  
  -- Event Details
  user_id TEXT,
  user_type TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Description
  description TEXT,
  details JSONB,
  
  -- Response
  action_taken TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Doctor Indexes
CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_doctors_location ON doctors(location);
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_verified ON doctors(verified);
CREATE INDEX idx_doctors_license_number ON doctors(license_number);
CREATE INDEX idx_doctors_rating ON doctors(rating DESC);
CREATE INDEX idx_doctors_account_status ON doctors(account_status);

-- Patient Indexes
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_verified ON patients(verified_patient);
CREATE INDEX idx_patients_account_status ON patients(account_status);
CREATE INDEX idx_patients_country ON patients(country);

-- Consultation Indexes
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled_date ON consultations(scheduled_date);
CREATE INDEX idx_consultations_specialty ON consultations(specialty);

-- Review Indexes
CREATE INDEX idx_reviews_doctor_id ON reviews(doctor_id);
CREATE INDEX idx_reviews_patient_id ON reviews(patient_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_verified ON reviews(verified);

-- Payment Indexes
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_payments_doctor_id ON payments(doctor_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Referral Indexes
CREATE INDEX idx_referrals_patient_id ON referrals(patient_id);
CREATE INDEX idx_referrals_referring_doctor_id ON referrals(referring_doctor_id);
CREATE INDEX idx_referrals_target_specialty ON referrals(target_specialty);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Audit Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Data Access Request Indexes
CREATE INDEX idx_data_access_requests_user_id ON data_access_requests(user_id);
CREATE INDEX idx_data_access_requests_status ON data_access_requests(status);
CREATE INDEX idx_data_access_requests_type ON data_access_requests(request_type);

-- Consent History Indexes
CREATE INDEX idx_consent_history_user_id ON consent_history(user_id);
CREATE INDEX idx_consent_history_timestamp ON consent_history(timestamp_given DESC);

-- File Indexes
CREATE INDEX idx_files_consultation_id ON files(consultation_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_access_level ON files(access_level);

-- Security Events Indexes
CREATE INDEX idx_security_events_event_type ON security_events(event_type);
CREATE INDEX idx_security_events_date ON security_events(created_at DESC);
CREATE INDEX idx_security_events_severity ON security_events(severity);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Update modified timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to multiple tables
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_access_requests_updated_at BEFORE UPDATE ON data_access_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger for sensitive operations
CREATE OR REPLACE FUNCTION log_doctor_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verified != OLD.verified THEN
    INSERT INTO audit_logs (id, user_id, user_type, action, resource_type, resource_id, changes, result, created_at)
    VALUES (
      'audit-' || gen_random_uuid(),
      'system',
      'system',
      'doctor_verification_' || NEW.verified,
      'doctors',
      NEW.id,
      jsonb_build_object('verified', OLD.verified, 'verification_date', NEW.verification_date),
      'success',
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_doctor_verification AFTER UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION log_doctor_verification();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Dashboard Stats View
CREATE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM doctors WHERE verified = TRUE) as verified_doctors,
  (SELECT COUNT(*) FROM doctors WHERE account_status = 'active') as active_doctors,
  (SELECT COUNT(*) FROM patients WHERE verified_patient = TRUE) as verified_patients,
  (SELECT COUNT(*) FROM consultations WHERE status = 'completed') as completed_consultations,
  (SELECT SUM(amount) FROM payments WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE) as today_revenue,
  (SELECT AVG(rating) FROM doctors WHERE verified = TRUE) as average_doctor_rating;

-- Active Consultations View
CREATE VIEW active_consultations AS
SELECT
  c.id,
  c.patient_id,
  c.doctor_id,
  p.name as patient_name,
  d.name as doctor_name,
  d.specialty,
  c.consultation_type,
  c.scheduled_date,
  c.status,
  c.created_at
FROM consultations c
JOIN patients p ON c.patient_id = p.id
JOIN doctors d ON c.doctor_id = d.id
WHERE c.status IN ('pending', 'confirmed');

-- Monthly Revenue View
CREATE VIEW monthly_revenue AS
SELECT
  DATE_TRUNC('month', created_at)::DATE as month,
  SUM(amount) as total_revenue,
  COUNT(*) as transaction_count,
  AVG(amount) as average_transaction
FROM payments
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Doctor Performance View
CREATE VIEW doctor_performance AS
SELECT
  d.id,
  d.name,
  d.specialty,
  d.location,
  d.verified,
  d.rating,
  d.rating_count,
  COUNT(DISTINCT c.id) as total_consultations,
  COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) as completed_consultations,
  AVG(r.rating) as average_patient_rating,
  SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_earnings
FROM doctors d
LEFT JOIN consultations c ON d.id = c.doctor_id
LEFT JOIN reviews r ON d.id = r.doctor_id
LEFT JOIN payments p ON d.id = p.doctor_id
WHERE d.account_status = 'active'
GROUP BY d.id;

-- ============================================
-- CONSTRAINTS & RULES
-- ============================================

-- Ensure data consistency
ALTER TABLE patients ADD CONSTRAINT check_age CHECK (age >= 0 AND age <= 150);
ALTER TABLE doctors ADD CONSTRAINT check_experience CHECK (years_experience >= 0);
ALTER TABLE consultations ADD CONSTRAINT check_duration CHECK (duration_minutes > 0);
ALTER TABLE payments ADD CONSTRAINT check_amount CHECK (amount > 0);

-- ============================================
-- END OF SCHEMA
-- ============================================
