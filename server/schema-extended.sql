-- ============================================================================
-- EXTENDED GLOBALDOC PLATFORM SCHEMA v3.0
-- Added: Chat, Notifications, Prescriptions, Medical History, Insurance
-- ============================================================================

-- ============================================================================
-- 1. NOTIFICATIONS TABLE (24h and 1h appointment reminders + chat notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('doctor', 'patient', 'admin')),
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'appointment_reminder_24h',
        'appointment_reminder_1h',
        'appointment_confirmed',
        'appointment_cancelled',
        'new_message',
        'prescription_ready',
        'new_review',
        'verification_status',
        'payment_successful',
        'referral_received'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_resource_type VARCHAR(50), -- 'appointment', 'message', 'prescription', etc
    related_resource_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    notification_channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'sms', 'push'
    email_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    push_sent BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP, -- For scheduled notifications
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_type ON notifications(user_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);

-- ============================================================================
-- 2. CHAT MESSAGES TABLE (Doctor-Patient messaging with video support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('doctor', 'patient')),
    recipient_id UUID NOT NULL,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('doctor', 'patient')),
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN (
        'text',
        'file',
        'prescription',
        'video_call',
        'image'
    )),
    message_content TEXT,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    file_mime_type VARCHAR(100),
    video_call_token VARCHAR(500), -- Agora or Twilio token
    video_call_status VARCHAR(20) CHECK (video_call_status IN ('initiated', 'active', 'completed', 'missed')),
    video_call_duration INTEGER, -- in seconds
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_consultation_id ON chat_messages(consultation_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_recipient_id ON chat_messages(recipient_id);
CREATE INDEX idx_chat_messages_is_read ON chat_messages(is_read);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================================================
-- 3. PRESCRIPTIONS TABLE (Prescription management and refills)
-- ============================================================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    consultation_id UUID,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL, -- e.g., "twice daily", "every 8 hours"
    route VARCHAR(50), -- 'oral', 'IV', 'injection', etc
    quantity INTEGER NOT NULL,
    unit VARCHAR(50), -- 'tablets', 'ml', 'capsules', etc
    duration_days INTEGER, -- prescription duration
    instructions TEXT,
    is_refillable BOOLEAN DEFAULT FALSE,
    refills_allowed INTEGER DEFAULT 0,
    refills_remaining INTEGER DEFAULT 0,
    last_refill_date TIMESTAMP,
    expiry_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'active',
        'completed',
        'cancelled',
        'expired'
    )),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_expiry_date ON prescriptions(expiry_date);

-- ============================================================================
-- 4. MEDICAL HISTORY TABLE (Tracks past consultations, diagnoses, conditions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    doctor_id UUID,
    consultation_id UUID,
    visit_date TIMESTAMP NOT NULL,
    visit_type VARCHAR(50), -- 'consultation', 'follow-up', 'urgent', 'routine'
    specialty VARCHAR(100),
    chief_complaint TEXT,
    diagnosis TEXT NOT NULL,
    symptoms TEXT[],
    treatment_given TEXT,
    test_recommendations TEXT[],
    imaging_recommendations TEXT[],
    notes TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Patient can make visible to other doctors
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medical_history_patient_id ON medical_history(patient_id);
CREATE INDEX idx_medical_history_visit_date ON medical_history(visit_date DESC);
CREATE INDEX idx_medical_history_specialty ON medical_history(specialty);

-- ============================================================================
-- 5. HEALTH RECORDS TABLE (Documents, test results, imaging, file storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    doctor_id UUID, -- who uploaded it, null if patient uploaded
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN (
        'lab_report',
        'imaging',
        'prescription',
        'medical_certificate',
        'test_result',
        'vaccination_record',
        'allergy_report',
        'surgery_report',
        'generic_document'
    )),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by VARCHAR(20) CHECK (uploaded_by IN ('patient', 'doctor')),
    test_name VARCHAR(255),
    test_date TIMESTAMP,
    test_result TEXT,
    result_status VARCHAR(20), -- 'normal', 'abnormal', 'pending'
    notes TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Can be shared with other doctors
    shared_with_doctors UUID[] DEFAULT '{}',
    access_level VARCHAR(20) DEFAULT 'private' CHECK (access_level IN (
        'private',
        'shared_doctors',
        'public'
    )),
    expiry_date TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_records_patient_id ON health_records(patient_id);
CREATE INDEX idx_health_records_record_type ON health_records(record_type);
CREATE INDEX idx_health_records_created_at ON health_records(created_at DESC);
CREATE INDEX idx_health_records_is_public ON health_records(is_public);

-- ============================================================================
-- 6. INSURANCE INFORMATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS insurance_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) NOT NULL UNIQUE,
    group_number VARCHAR(100),
    member_id VARCHAR(100),
    plan_name VARCHAR(255),
    plan_type VARCHAR(50), -- 'HMO', 'PPO', 'HDHP', etc
    coverage_type VARCHAR(50)[] DEFAULT ARRAY['medical'], -- 'medical', 'dental', 'vision', 'mental_health'
    is_primary BOOLEAN DEFAULT FALSE,
    policy_start_date DATE,
    policy_end_date DATE,
    copay_amount DECIMAL(10,2),
    deductible_amount DECIMAL(10,2),
    patient_responsibility_percent DECIMAL(5,2),
    insurance_contact_phone VARCHAR(20),
    insurance_customer_service_url VARCHAR(500),
    front_card_image_url VARCHAR(500),
    back_card_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_insurance_patient_id ON insurance_information(patient_id);
CREATE INDEX idx_insurance_is_primary ON insurance_information(is_primary);
CREATE INDEX idx_insurance_is_active ON insurance_information(is_active);

-- ============================================================================
-- 7. EMERGENCY CONTACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL, -- 'spouse', 'parent', 'sibling', 'friend', etc
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    country_code VARCHAR(5),
    secondary_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    notes TEXT,
    priority_order INTEGER DEFAULT 1, -- 1 = primary emergency contact
    can_view_medical_records BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emergency_contacts_patient_id ON emergency_contacts(patient_id);
CREATE INDEX idx_emergency_contacts_priority ON emergency_contacts(priority_order);

-- ============================================================================
-- 8. APPOINTMENT REMINDERS TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('24_hours', '1_hour')),
    should_send_to VARCHAR(20)[] NOT NULL DEFAULT ARRAY['doctor', 'patient'],
    notification_channels VARCHAR(20)[] DEFAULT ARRAY['in_app', 'email'],
    scheduled_send_time TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointment_reminders_appointment_id ON appointment_reminders(appointment_id);
CREATE INDEX idx_appointment_reminders_is_sent ON appointment_reminders(is_sent);
CREATE INDEX idx_appointment_reminders_scheduled_send_time ON appointment_reminders(scheduled_send_time);

-- ============================================================================
-- 9. APPOINTMENT COMMUNICATION HISTORY (Thread of all doctor-patient messages for appointment)
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointment_communication (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    communication_type VARCHAR(50) CHECK (communication_type IN (
        'chat_message',
        'video_call',
        'file_shared',
        'prescription_sent',
        'status_update'
    )),
    content TEXT,
    file_url VARCHAR(500),
    created_by VARCHAR(20) CHECK (created_by IN ('doctor', 'patient')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointment_communication_appointment_id ON appointment_communication(appointment_id);
CREATE INDEX idx_appointment_communication_doctor_id ON appointment_communication(doctor_id);
CREATE INDEX idx_appointment_communication_patient_id ON appointment_communication(patient_id);

-- ============================================================================
-- 10. NOTIFICATION PREFERENCES TABLE (User preferences for notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('doctor', 'patient')),
    appointment_reminder_24h BOOLEAN DEFAULT TRUE,
    appointment_reminder_1h BOOLEAN DEFAULT TRUE,
    appointment_confirmed_notification BOOLEAN DEFAULT TRUE,
    new_message_notification BOOLEAN DEFAULT TRUE,
    prescription_notification BOOLEAN DEFAULT TRUE,
    review_notification BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    quiet_hours_start TIME, -- e.g., 22:00
    quiet_hours_end TIME, -- e.g., 08:00
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    email_address VARCHAR(255),
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_user_type ON notification_preferences(user_type);

-- ============================================================================
-- 11. TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_history_updated_at BEFORE UPDATE ON medical_history
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_information_updated_at BEFORE UPDATE ON insurance_information
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_reminders_updated_at BEFORE UPDATE ON appointment_reminders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. VIEWS FOR QUICK QUERIES
-- ============================================================================

-- Unread notifications for a user
CREATE OR REPLACE VIEW unread_notifications AS
SELECT * FROM notifications
WHERE is_read = FALSE
ORDER BY created_at DESC;

-- Pending appointment reminders to send
CREATE OR REPLACE VIEW pending_appointment_reminders AS
SELECT ar.* FROM appointment_reminders ar
WHERE ar.is_sent = FALSE
AND ar.scheduled_send_time <= CURRENT_TIMESTAMP + INTERVAL '5 minutes'
ORDER BY ar.scheduled_send_time ASC;

-- Patient consultation history with doctor details
CREATE OR REPLACE VIEW patient_consultation_history AS
SELECT 
    c.id as consultation_id,
    c.patient_id,
    c.doctor_id,
    d.name as doctor_name,
    d.specialty,
    c.scheduled_date,
    c.status,
    c.consultation_type,
    COUNT(DISTINCT ch.id) as message_count
FROM consultations c
LEFT JOIN doctors d ON c.doctor_id = d.id
LEFT JOIN chat_messages ch ON c.id = ch.consultation_id
GROUP BY c.id, c.patient_id, c.doctor_id, d.name, d.specialty, c.scheduled_date, c.status, c.consultation_type
ORDER BY c.scheduled_date DESC;

-- Active prescriptions
CREATE OR REPLACE VIEW active_prescriptions AS
SELECT * FROM prescriptions
WHERE status = 'active'
AND expiry_date > CURRENT_TIMESTAMP
ORDER BY expiry_date ASC;

-- Recent medical history
CREATE OR REPLACE VIEW recent_medical_history AS
SELECT * FROM medical_history
ORDER BY visit_date DESC
LIMIT 100;

-- ============================================================================
-- 13. SEED DATA FOR NOTIFICATION PREFERENCES
-- ============================================================================

-- When a new patient/doctor is created, insert default notification preferences
-- This should be done in the application layer when creating new users

-- ============================================================================
-- SCHEMA STATISTICS
-- ============================================================================
-- Total new tables: 11
-- Total indexes: 25+
-- Total triggers: 9
-- Total views: 4
-- Notification types supported: 10
-- Chat message types: 5
-- Prescription management with refills
-- Full medical history tracking
-- Insurance information storage
-- Emergency contact management
-- Appointment reminder scheduling
