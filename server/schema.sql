-- Database schema for GlobalDoc Connect

CREATE TABLE doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  specialty TEXT NOT NULL,
  location TEXT NOT NULL,
  languages TEXT[] NOT NULL,
  rating NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  availability TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  license_verified BOOLEAN DEFAULT FALSE,
  license_number TEXT,
  license_issuer TEXT,
  license_expiry DATE,
  consultation_fee NUMERIC(8,2) NOT NULL,
  -- GDPR/HIPAA Compliance Fields
  data_processing_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  data_retention_period INTERVAL,
  last_data_access TIMESTAMP WITH TIME ZONE,
  data_encryption_enabled BOOLEAN DEFAULT TRUE,
  audit_log_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  country TEXT,
  date_of_birth DATE,
  gender TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  -- GDPR/HIPAA Compliance Fields
  verified_patient BOOLEAN DEFAULT FALSE,
  accepted_terms BOOLEAN DEFAULT FALSE,
  accepted_privacy_policy BOOLEAN DEFAULT FALSE,
  data_processing_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  medical_data_consent BOOLEAN DEFAULT FALSE,
  data_retention_period INTERVAL DEFAULT INTERVAL '7 years',
  last_data_access TIMESTAMP WITH TIME ZONE,
  data_encryption_enabled BOOLEAN DEFAULT TRUE,
  audit_log_enabled BOOLEAN DEFAULT TRUE,
  consent_withdrawn BOOLEAN DEFAULT FALSE,
  consent_withdrawal_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  verified BOOLEAN DEFAULT FALSE,
  -- GDPR/HIPAA Compliance Fields
  anonymized BOOLEAN DEFAULT FALSE,
  consent_given BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_reference TEXT,
  -- GDPR/HIPAA Compliance Fields
  payment_data_encrypted BOOLEAN DEFAULT TRUE,
  pci_compliant BOOLEAN DEFAULT TRUE,
  refund_policy_accepted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL, -- 'doctor' or 'patient'
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE data_access_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL,
  request_type TEXT NOT NULL, -- 'access', 'rectification', 'erasure', 'portability'
  status TEXT DEFAULT 'pending',
  requested_data TEXT,
  response_data JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_doctor_specialty ON doctors(specialty);
CREATE INDEX idx_doctor_location ON doctors(location);
CREATE INDEX idx_doctor_email ON doctors(email);
CREATE INDEX idx_patient_email ON patients(email);
CREATE INDEX idx_review_doctor ON reviews(doctor_id);
CREATE INDEX idx_payment_patient ON payments(patient_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_data_request_user ON data_access_requests(user_id);

-- GDPR/HIPAA Compliance Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
