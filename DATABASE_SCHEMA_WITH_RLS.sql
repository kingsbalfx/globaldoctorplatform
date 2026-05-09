-- =====================================================
-- GLOBALDOC PLATFORM - COMPREHENSIVE DATABASE SCHEMA
-- WITH ROW LEVEL SECURITY (RLS) POLICIES
-- For Supabase PostgreSQL
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USERS & AUTHENTICATION TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  profile_picture_url TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  zip_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  terms_version VARCHAR(20),
  terms_ip_address INET
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Doctors can view patient profiles during consultation" ON public.users
  FOR SELECT USING (
    role = 'patient' AND EXISTS (
      SELECT 1 FROM consultations c
      WHERE (c.patient_id = id OR c.doctor_id = auth.uid())
      AND c.status IN ('scheduled', 'ongoing', 'completed')
    )
  );

CREATE POLICY "Admins can view all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 2. DOCTORS PROFILE & CREDENTIALS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  specialty VARCHAR(100) NOT NULL,
  sub_specialty VARCHAR(100),
  license_number VARCHAR(100) UNIQUE NOT NULL,
  license_state VARCHAR(100) NOT NULL,
  license_expiry DATE NOT NULL,
  board_certification VARCHAR(255),
  years_of_experience INTEGER,
  education TEXT,
  medical_school VARCHAR(255),
  graduation_year INTEGER,
  languages_spoken TEXT[], -- Array of languages
  consultation_fee DECIMAL(10, 2) DEFAULT 50.00,
  bio TEXT,
  availability_schedule JSONB, -- Flexible schedule storage
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_consultations INTEGER DEFAULT 0,
  malpractice_insurance_provider VARCHAR(255),
  malpractice_insurance_policy VARCHAR(100),
  malpractice_insurance_expiry DATE,
  malpractice_coverage_amount DECIMAL(12, 2),
  background_check_status VARCHAR(50) DEFAULT 'pending',
  background_check_date DATE,
  terms_accepted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  hipaa_compliance_accepted BOOLEAN DEFAULT FALSE,
  company_rules_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_approved BOOLEAN DEFAULT FALSE,
  approval_date TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id)
);

-- Enable RLS on doctors table
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctors
CREATE POLICY "Doctors can view and edit own profile" ON public.doctors
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public can view approved doctors" ON public.doctors
  FOR SELECT USING (is_approved = TRUE AND EXISTS (
    SELECT 1 FROM public.users WHERE id = user_id AND is_active = TRUE
  ));

CREATE POLICY "Admins can manage all doctors" ON public.doctors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 3. PATIENTS PROFILE & MEDICAL HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blood_type VARCHAR(5),
  height_cm DECIMAL(5, 2),
  weight_kg DECIMAL(5, 2),
  allergies TEXT[],
  chronic_conditions TEXT[],
  current_medications TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  insurance_provider VARCHAR(255),
  insurance_policy_number VARCHAR(100),
  insurance_group_number VARCHAR(100),
  primary_care_physician VARCHAR(255),
  is_under_12 BOOLEAN DEFAULT FALSE,
  guardian_id UUID REFERENCES public.users(id),  -- If patient is under 12
  guardian_relationship VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on patients table
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Patients can view and edit own profile" ON public.patients
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Guardians can view ward profiles" ON public.patients
  FOR SELECT USING (guardian_id = auth.uid());

CREATE POLICY "Doctors can view patient profiles during consultation" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM consultations c
      WHERE c.patient_id = user_id 
      AND c.doctor_id = auth.uid()
      AND c.status IN ('scheduled', 'ongoing', 'completed')
    )
  );

CREATE POLICY "Admins can view all patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 4. CONSULTATIONS/APPOINTMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'no_show')),
  consultation_type VARCHAR(50) DEFAULT 'general' CHECK (consultation_type IN ('general', 'follow_up', 'specialist', 'emergency')),
  chief_complaint TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescription_issued BOOLEAN DEFAULT FALSE,
  notes TEXT,
  video_call_url TEXT,
  video_call_id VARCHAR(255),
  agora_channel_name VARCHAR(255),
  agora_token TEXT,
  consultation_fee DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_id VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.users(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on consultations table
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultations
CREATE POLICY "Patients can view own consultations" ON public.consultations
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view own consultations" ON public.consultations
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create consultations" ON public.consultations
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can update consultations" ON public.consultations
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "Users can cancel own consultations" ON public.consultations
  FOR UPDATE USING (patient_id = auth.uid() OR doctor_id = auth.uid());

-- =====================================================
-- 5. REFERRALS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referring_doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_to_doctor_id UUID REFERENCES public.users(id),
  referred_specialty VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  urgency VARCHAR(20) DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  initiated_by VARCHAR(20) NOT NULL CHECK (initiated_by IN ('patient', 'doctor')),
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
    'pending_doctor_approval',
    'pending_patient_approval', 
    'accepted',
    'declined',
    'not_yet',
    'completed',
    'expired'
  )),
  patient_response VARCHAR(20),  -- 'accept', 'declined', 'not_yet'
  doctor_response VARCHAR(20),   -- 'accept', 'declined', 'not_yet'
  patient_response_date TIMESTAMP WITH TIME ZONE,
  doctor_response_date TIMESTAMP WITH TIME ZONE,
  tokens_required INTEGER NOT NULL DEFAULT 1,
  tokens_deducted BOOLEAN DEFAULT FALSE,
  medical_summary TEXT,
  attachments JSONB,  -- Array of file references
  new_consultation_id UUID REFERENCES public.consultations(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Patients can view own referrals" ON public.referrals
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view referrals they created or received" ON public.referrals
  FOR SELECT USING (referring_doctor_id = auth.uid() OR referred_to_doctor_id = auth.uid());

CREATE POLICY "Patients can create referral requests" ON public.referrals
  FOR INSERT WITH CHECK (patient_id = auth.uid() AND initiated_by = 'patient');

CREATE POLICY "Doctors can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (referring_doctor_id = auth.uid() AND initiated_by = 'doctor');

CREATE POLICY "Patients can respond to referrals" ON public.referrals
  FOR UPDATE USING (patient_id = auth.uid());

CREATE POLICY "Doctors can respond to referrals" ON public.referrals
  FOR UPDATE USING (referring_doctor_id = auth.uid() OR referred_to_doctor_id = auth.uid());

-- =====================================================
-- 6. TOKEN MANAGEMENT SYSTEM (Specialty-Based)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.token_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  number_of_tokens INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  valid_days INTEGER DEFAULT 365,  -- Valid for 1 year
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Token specialty costs
CREATE TABLE IF NOT EXISTS public.specialty_token_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialty VARCHAR(100) UNIQUE NOT NULL,
  tokens_required INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User tokens balance
CREATE TABLE IF NOT EXISTS public.user_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  available_tokens INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Token transactions log
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'use', 'refund', 'expiry', 'bonus')),
  tokens_amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  specialty VARCHAR(100),  -- For tracking specialty usage
  consultation_id UUID REFERENCES public.consultations(id),
  referral_id UUID REFERENCES public.referrals(id),
  package_id UUID REFERENCES public.token_packages(id),
  payment_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on token tables
ALTER TABLE public.token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialty_token_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tokens
CREATE POLICY "Anyone can view token packages" ON public.token_packages
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Anyone can view specialty costs" ON public.specialty_token_costs
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can view own token balance" ON public.user_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own token transactions" ON public.token_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage tokens" ON public.user_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 7. VITAL PARAMETERS MONITORING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.vital_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parameter_name VARCHAR(50) NOT NULL CHECK (parameter_name IN (
    'heart_rate', 'respiratory_rate', 'blood_oxygen', 'blood_pressure_systolic', 
    'blood_pressure_diastolic', 'temperature', 'hrv_stress', 'tremor_score', 'reaction_time'
  )),
  parameter_value DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  device_type VARCHAR(50),  -- 'camera', 'sensor', 'manual'
  measurement_method VARCHAR(100),
  is_abnormal BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on vital_parameters table
ALTER TABLE public.vital_parameters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vital parameters
CREATE POLICY "Patients can view own vitals" ON public.vital_parameters
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view and insert vitals for their consultations" ON public.vital_parameters
  FOR ALL USING (doctor_id = auth.uid());

-- =====================================================
-- 8. PRESCRIPTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  quantity INTEGER,
  refills_allowed INTEGER DEFAULT 0,
  instructions TEXT,
  pharmacy_name VARCHAR(255),
  pharmacy_phone VARCHAR(20),
  prescription_number VARCHAR(100) UNIQUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on prescriptions table
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prescriptions
CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can manage prescriptions for their consultations" ON public.prescriptions
  FOR ALL USING (doctor_id = auth.uid());

-- =====================================================
-- 9. MEDICAL RECORDS & DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES public.consultations(id),
  doctor_id UUID REFERENCES public.users(id),
  record_type VARCHAR(50) NOT NULL CHECK (record_type IN (
    'lab_result', 'imaging', 'report', 'document', 'note', 'consent_form'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(50),
  storage_path TEXT,  -- Supabase storage bucket path
  uploaded_by UUID REFERENCES public.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_sensitive BOOLEAN DEFAULT TRUE,
  shared_with UUID[],  -- Array of doctor IDs who can access
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on medical_records table
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical records
CREATE POLICY "Patients can view own medical records" ON public.medical_records
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Patients can upload own medical records" ON public.medical_records
  FOR INSERT WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can view medical records shared with them" ON public.medical_records
  FOR SELECT USING (auth.uid() = ANY(shared_with) OR doctor_id = auth.uid());

CREATE POLICY "Doctors can upload medical records for consultations" ON public.medical_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM consultations c
      WHERE c.id = consultation_id AND c.doctor_id = auth.uid()
    )
  );

-- =====================================================
-- 10. STORAGE BUCKETS (Supabase Storage with RLS)
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('profile-pictures', 'profile-pictures', false),
  ('medical-records', 'medical-records', false),
  ('consultation-recordings', 'consultation-recordings', false),
  ('prescriptions', 'prescriptions', false),
  ('doctor-credentials', 'doctor-credentials', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for profile-pictures bucket
CREATE POLICY "Users can upload own profile picture" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own profile picture" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own profile picture" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policies for medical-records bucket
CREATE POLICY "Patients can upload own medical records" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-records' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Patients can view own medical records" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-records' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Doctors can view medical records during consultation" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-records' AND
    EXISTS (
      SELECT 1 FROM medical_records mr
      JOIN consultations c ON c.patient_id = mr.patient_id
      WHERE c.doctor_id = auth.uid()
      AND c.status IN ('scheduled', 'ongoing', 'completed')
      AND storage.filename(name) = mr.file_name
    )
  );

-- RLS Policies for doctor-credentials bucket
CREATE POLICY "Doctors can upload own credentials" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'doctor-credentials' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Doctors can view own credentials" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'doctor-credentials' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view doctor credentials" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'doctor-credentials' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 11. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled_at ON consultations(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);

CREATE INDEX IF NOT EXISTS idx_referrals_patient ON referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referring_doctor ON referrals(referring_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_doctor ON referrals(referred_to_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

CREATE INDEX IF NOT EXISTS idx_vital_parameters_patient ON vital_parameters(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_parameters_consultation ON vital_parameters(consultation_id);
CREATE INDEX IF NOT EXISTS idx_vital_parameters_measured_at ON vital_parameters(measured_at);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON prescriptions(consultation_id);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON token_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_approved ON doctors(is_approved);

-- =====================================================
-- 12. INSERT DEFAULT DATA
-- =====================================================

-- Insert default token packages
INSERT INTO public.token_packages (name, description, number_of_tokens, price, valid_days) VALUES
  ('Starter Pack', '5 general consultations', 5, 25.00, 180),
  ('Standard Pack', '10 consultations with mixed specialties', 10, 45.00, 365),
  ('Premium Pack', '20 consultations including specialist access', 20, 80.00, 365),
  ('Enterprise Pack', '50 consultations for families', 50, 180.00, 365)
ON CONFLICT DO NOTHING;

-- Insert specialty token costs
INSERT INTO public.specialty_token_costs (specialty, tokens_required, description) VALUES
  ('General Practice', 1, 'Standard general practitioner consultation'),
  ('Cardiology', 2, 'Heart and cardiovascular specialist'),
  ('Neurology', 2, 'Brain and nervous system specialist'),
  ('Dermatology', 1, 'Skin conditions and treatments'),
  ('Pediatrics', 1, 'Children''s healthcare'),
  ('Psychiatry', 2, 'Mental health and psychiatric care'),
  ('Orthopedics', 2, 'Bone, joint, and muscle specialist'),
  ('Oncology', 3, 'Cancer treatment and care'),
  ('Endocrinology', 2, 'Hormone and metabolism specialist'),
  ('Gastroenterology', 2, 'Digestive system specialist'),
  ('Pulmonology', 2, 'Lung and respiratory specialist'),
  ('Nephrology', 2, 'Kidney specialist'),
  ('Rheumatology', 2, 'Autoimmune and joint disease specialist'),
  ('Urology', 2, 'Urinary tract and male reproductive system'),
  ('Ophthalmology', 1, 'Eye care specialist'),
  ('ENT', 1, 'Ear, nose, and throat specialist'),
  ('OB/GYN', 2, 'Women''s health and reproductive specialist')
ON CONFLICT (specialty) DO NOTHING;

-- =====================================================
-- 13. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to deduct tokens
CREATE OR REPLACE FUNCTION deduct_tokens(
  p_user_id UUID,
  p_specialty VARCHAR,
  p_consultation_id UUID DEFAULT NULL,
  p_referral_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tokens_required INTEGER;
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get tokens required for specialty
  SELECT tokens_required INTO v_tokens_required
  FROM specialty_token_costs
  WHERE specialty = p_specialty;
  
  IF v_tokens_required IS NULL THEN
    v_tokens_required := 1;  -- Default to 1 if specialty not found
  END IF;
  
  -- Get current balance
  SELECT available_tokens INTO v_current_balance
  FROM user_tokens
  WHERE user_id = p_user_id;
  
  IF v_current_balance IS NULL OR v_current_balance < v_tokens_required THEN
    RETURN FALSE;  -- Insufficient tokens
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_balance - v_tokens_required;
  
  -- Update balance
  UPDATE user_tokens
  SET available_tokens = v_new_balance,
      total_used = total_used + v_tokens_required,
      updated_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id;
  
  -- Log transaction
  INSERT INTO token_transactions (
    user_id, transaction_type, tokens_amount, balance_before, balance_after,
    specialty, consultation_id, referral_id, description
  ) VALUES (
    p_user_id, 'use', v_tokens_required, v_current_balance, v_new_balance,
    p_specialty, p_consultation_id, p_referral_id,
    'Tokens deducted for ' || p_specialty || ' consultation'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE consultations;
ALTER PUBLICATION supabase_realtime ADD TABLE referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE vital_parameters;
