# INTEGRATION GUIDE - TERMS & REFERRALS SYSTEM

## Overview
This guide explains how to integrate the new Terms & Conditions acceptance and Referral System into your GlobalDoc Platform.

---

## 1. TERMS & CONDITIONS ACCEPTANCE

### Components Created
- `DOCTOR_TERMS_AND_CONDITIONS.md` - Legal document for doctors
- `PATIENT_TERMS_AND_CONDITIONS.md` - Legal document for patients (min age: 12 years)
- `src/components/TermsAcceptance.jsx` - React component for T&C modal

### Key Features
- **Children Under 12**: Must have parent/guardian present during consultations
- **Confidentiality Assurance**: Strong privacy protection messaging
- **Mandatory Compliance for Doctors**:
  - License compliance
  - HIPAA & patient confidentiality
  - Company rules adherence
  - Malpractice insurance ($1M/$3M coverage)

### Integration in Registration

#### Doctor Registration
```jsx
import TermsAcceptance from './components/TermsAcceptance';

function DoctorRegistration() {
  const [formData, setFormData] = useState({...});

  const handleTermsAccept = async (acceptanceData) => {
    // Save acceptance data to database
    const response = await axios.post('/api/doctors/register', {
      ...formData,
      terms_accepted_at: acceptanceData.acceptedAt,
      terms_version: '1.0',
      terms_ip_address: acceptanceData.ipAddress,
      hipaa_compliance_accepted: acceptanceData.acceptances.patientConfidentiality,
      company_rules_accepted: acceptanceData.acceptances.companyRules,
      // ... other fields
    });
    
    // Redirect to dashboard or next step
    navigate('/doctor-dashboard');
  };

  const handleTermsDecline = () => {
    alert('You must accept the terms to register as a doctor.');
    navigate('/');
  };

  return (
    <form>
      {/* Registration form fields */}
      
      {/* Terms Acceptance Component */}
      <div className="mt-6">
        <TermsAcceptance 
          userType="doctor"
          onAccept={handleTermsAccept}
          onDecline={handleTermsDecline}
        />
      </div>
    </form>
  );
}
```

#### Patient Registration
```jsx
import TermsAcceptance from './components/TermsAcceptance';

function PatientRegistration() {
  const [formData, setFormData] = useState({...});
  const [age, setAge] = useState(null);
  const [isUnder12, setIsUnder12] = useState(false);

  const handleTermsAccept = async (acceptanceData) => {
    const response = await axios.post('/api/patients/register', {
      ...formData,
      terms_accepted_at: acceptanceData.acceptedAt,
      terms_version: '1.0',
      terms_ip_address: acceptanceData.ipAddress,
      is_under_12: isUnder12,
      // ... other fields
    });
    
    navigate('/patient-dashboard');
  };

  const handleTermsDecline = () => {
    alert('You must accept the terms to register.');
    navigate('/');
  };

  return (
    <form>
      {/* Registration form fields */}
      
      {/* Age verification */}
      {isUnder12 && (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
          <p className="text-yellow-800 font-semibold">
            ⚠️ Important: Children under 12 must have a parent or guardian present during all consultations.
          </p>
        </div>
      )}
      
      {/* Terms Acceptance Component */}
      <div className="mt-6">
        <TermsAcceptance 
          userType="patient"
          onAccept={handleTermsAccept}
          onDecline={handleTermsDecline}
        />
      </div>
    </form>
  );
}
```

---

## 2. REFERRAL SYSTEM

### Components Created
- `src/components/ReferralSystem.jsx` - Bidirectional referral component

### Key Features
- **Patient-Initiated Referrals**: Button in patient dashboard
- **Doctor-Initiated Referrals**: Button in doctor dashboard
- **Two-Way Approval**: Both parties must accept
- **Response Options**:
  - ✅ **Accept** - Proceed with referral
  - ❌ **Decline** - Reject referral
  - ⏰ **Not Yet** - Insufficient tokens, accept later
- **Token-Based Specialty System**:
  - General Practice: 1 token
  - Cardiology, Neurology, etc.: 2 tokens
  - Oncology: 3 tokens

### Integration in Patient Dashboard

```jsx
import ReferralSystem from './components/ReferralSystem';

function PatientDashboard() {
  const [user, setUser] = useState(null);
  const [currentConsultation, setCurrentConsultation] = useState(null);

  useEffect(() => {
    // Load user data and current consultation
    loadUserData();
    loadCurrentConsultation();
  }, []);

  const handleReferralComplete = (referral) => {
    // Refresh consultation list
    alert(`Referral to ${referral.specialty} accepted! Specialist will contact you soon.`);
    loadConsultations();
  };

  return (
    <div className="patient-dashboard">
      <h1>Patient Dashboard</h1>
      
      {/* Show referral button if in active consultation */}
      {currentConsultation && (
        <div className="mt-6">
          <ReferralSystem
            userType="patient"
            userId={user.id}
            consultationId={currentConsultation.id}
            onReferralComplete={handleReferralComplete}
          />
        </div>
      )}
      
      {/* Rest of dashboard content */}
    </div>
  );
}
```

### Integration in Doctor Dashboard

```jsx
import ReferralSystem from './components/ReferralSystem';

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [activeConsultations, setActiveConsultations] = useState([]);

  const handleReferralComplete = (referral) => {
    alert(`Patient referred to ${referral.specialty} specialist.`);
    loadConsultations();
  };

  return (
    <div className="doctor-dashboard">
      <h1>Doctor Dashboard</h1>
      
      {/* Show referral button for each active consultation */}
      {activeConsultations.map(consultation => (
        <div key={consultation.id} className="consultation-card">
          <h3>Patient: {consultation.patient_name}</h3>
          
          <ReferralSystem
            userType="doctor"
            userId={doctor.id}
            consultationId={consultation.id}
            onReferralComplete={handleReferralComplete}
          />
        </div>
      ))}
    </div>
  );
}
```

### Integration During Video Call

```jsx
import ReferralSystem from './components/ReferralSystem';
import VitalParametersMonitor from './components/VitalParametersMonitor';

function VideoConsultation({ consultationId, patientId, doctorId, userType }) {
  return (
    <div className="video-consultation">
      {/* Video call interface */}
      <div className="video-container">
        {/* Agora/Daily.co video */}
      </div>
      
      {/* Side panel with tools */}
      <div className="side-panel">
        {/* Vital Parameters Monitor */}
        <VitalParametersMonitor
          consultationId={consultationId}
          patientId={patientId}
          doctorId={doctorId}
          userType={userType}
        />
        
        {/* Referral System */}
        <div className="mt-4">
          <ReferralSystem
            userType={userType}
            userId={userType === 'patient' ? patientId : doctorId}
            consultationId={consultationId}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 3. DATABASE SETUP

### Using Supabase

1. **Create Supabase Project**: Go to https://supabase.com and create a new project

2. **Run SQL Schema**:
   ```bash
   # In Supabase SQL Editor, copy and paste content from:
   DATABASE_SCHEMA_WITH_RLS.sql
   ```

3. **Enable Row Level Security**: 
   - Already configured in the SQL file
   - All tables have RLS policies

4. **Configure Storage Buckets**:
   - profile-pictures (private)
   - medical-records (private, HIPAA compliant)
   - consultation-recordings (private)
   - prescriptions (private)
   - doctor-credentials (private)

5. **Enable Realtime** (for referral notifications):
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE consultations;
   ALTER PUBLICATION supabase_realtime ADD TABLE referrals;
   ALTER PUBLICATION supabase_realtime ADD TABLE vital_parameters;
   ```

### Environment Variables

Update your `.env` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Terms & Conditions
VITE_TERMS_VERSION=1.0

# Token System
VITE_DEFAULT_TOKEN_PACKAGE=standard
```

---

## 4. API ENDPOINTS TO IMPLEMENT

### Server-side endpoints needed:

#### Terms Acceptance
```javascript
// server/index.js or server/routes/terms.js

// Save terms acceptance
app.post('/api/terms/accept', async (req, res) => {
  const { userId, userType, acceptedAt, version, ipAddress, acceptances } = req.body;
  
  // Update user record
  await supabase
    .from('users')
    .update({
      terms_accepted_at: acceptedAt,
      terms_version: version,
      terms_ip_address: ipAddress
    })
    .eq('id', userId);
  
  // For doctors, update additional fields
  if (userType === 'doctor') {
    await supabase
      .from('doctors')
      .update({
        terms_accepted_at: acceptedAt,
        hipaa_compliance_accepted: acceptances.patientConfidentiality,
        company_rules_accepted: acceptances.companyRules
      })
      .eq('user_id', userId);
  }
  
  res.json({ success: true });
});
```

#### Referral Endpoints
```javascript
// Create referral request (patient-initiated)
app.post('/api/referrals/request', async (req, res) => {
  const { patient_id, consultation_id, requested_specialty, reason } = req.body;
  
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      patient_id,
      consultation_id,
      referring_doctor_id: req.consultationDoctorId, // Get from consultation
      referred_specialty: requested_specialty,
      reason,
      initiated_by: 'patient',
      status: 'pending_doctor_approval',
      tokens_required: getTokenCostForSpecialty(requested_specialty)
    })
    .select()
    .single();
  
  res.json(data);
});

// Create referral (doctor-initiated)
app.post('/api/referrals/initiate', async (req, res) => {
  const { doctor_id, consultation_id, referred_specialty, reason } = req.body;
  
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      referring_doctor_id: doctor_id,
      consultation_id,
      patient_id: req.consultationPatientId, // Get from consultation
      referred_specialty,
      reason,
      initiated_by: 'doctor',
      status: 'pending_patient_approval',
      tokens_required: getTokenCostForSpecialty(referred_specialty)
    })
    .select()
    .single();
  
  res.json(data);
});

// Check pending referrals
app.get('/api/referrals/pending/:userId/:consultationId', async (req, res) => {
  const { userId, consultationId } = req.params;
  
  const { data } = await supabase
    .from('referrals')
    .select('*')
    .eq('consultation_id', consultationId)
    .or(`patient_id.eq.${userId},referring_doctor_id.eq.${userId}`)
    .in('status', ['pending_patient_approval', 'pending_doctor_approval'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  res.json(data || {});
});

// Respond to referral
app.patch('/api/referrals/:id/respond', async (req, res) => {
  const { id } = req.params;
  const { status, responded_by, response_date } = req.body;
  
  const updateData = {
    status,
    [`${responded_by}_response`]: status,
    [`${responded_by}_response_date`]: response_date
  };
  
  const { data, error } = await supabase
    .from('referrals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  res.json(data);
});

// Helper function
function getTokenCostForSpecialty(specialty) {
  const costs = {
    'General Practice': 1,
    'Cardiology': 2,
    'Neurology': 2,
    'Oncology': 3,
    // ... add all specialties
  };
  return costs[specialty] || 1;
}
```

#### Token Management
```javascript
// Get token balance
app.get('/api/tokens/balance/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const { data } = await supabase
    .from('user_tokens')
    .select('available_tokens, total_purchased, total_used, expiry_date')
    .eq('user_id', userId)
    .single();
  
  res.json(data || { available_tokens: 0 });
});

// Deduct tokens
app.post('/api/tokens/deduct', async (req, res) => {
  const { user_id, specialty, tokens_used, referral_id } = req.body;
  
  // Use the stored procedure
  const { data, error } = await supabase.rpc('deduct_tokens', {
    p_user_id: user_id,
    p_specialty: specialty,
    p_referral_id: referral_id
  });
  
  res.json({ success: data });
});
```

---

## 5. TESTING CHECKLIST

### Terms Acceptance
- [ ] Doctor can view and scroll through terms
- [ ] All checkboxes must be checked before accepting
- [ ] Cannot accept until scrolled to bottom
- [ ] Terms acceptance data saved to database
- [ ] Declining terms redirects user away

### Referral System - Patient Side
- [ ] Patient can click "Request Referral" button
- [ ] Specialty selection dropdown works
- [ ] Token balance displays correctly
- [ ] Request sent to doctor successfully
- [ ] Patient receives prompt when doctor initiates referral
- [ ] Accept/Decline/Not Yet buttons work
- [ ] Insufficient tokens triggers "Not Yet" automatically

### Referral System - Doctor Side
- [ ] Doctor can click "Refer Patient" button
- [ ] Can select specialty and provide reason
- [ ] Referral sent to patient successfully
- [ ] Doctor receives patient referral requests
- [ ] Can approve/decline patient requests

### Token System
- [ ] Tokens deducted based on specialty
- [ ] General Practice costs 1 token
- [ ] Specialists cost 2 tokens
- [ ] Oncology costs 3 tokens
- [ ] "Not Yet" response when insufficient tokens
- [ ] Token balance updates in real-time

### Database & Security
- [ ] RLS policies prevent unauthorized access
- [ ] Patients can only see own data
- [ ] Doctors can only see consultation-related data
- [ ] Storage buckets are private
- [ ] Realtime updates work for referrals

---

## 6. DEPLOYMENT NOTES

### Before Deployment
1. Update all `[placeholder]` values in terms documents
2. Have legal team review all terms and conditions
3. Test all RLS policies thoroughly
4. Configure Supabase storage bucket policies
5. Set up proper backup procedures for medical records

### Environment-Specific Configuration
- **Development**: Use Supabase test project
- **Staging**: Use separate Supabase project for testing
- **Production**: Use production Supabase project with backups enabled

### HIPAA Compliance
- Enable Supabase encryption at rest and in transit
- Sign BAA (Business Associate Agreement) with Supabase
- Implement audit logging for all medical record access
- Regular security assessments

---

## 7. TROUBLESHOOTING

### Terms Modal Not Appearing
- Check that component is imported correctly
- Verify user type is passed correctly
- Check console for errors

### Referral Requests Not Showing
- Verify realtime subscriptions are enabled
- Check RLS policies allow user to view referrals
- Confirm consultation_id is correct

### Token Deduction Fails
- Check user has sufficient tokens
- Verify specialty name matches database exactly
- Check deduct_tokens function exists in database
- Review token_transactions table for errors

### Storage Upload Fails
- Check RLS policies on storage buckets
- Verify bucket exists and is private
- Check file size limits
- Verify user authentication

---

## 8. NEXT STEPS

1. **Implement API endpoints** in `server/index.js`
2. **Integrate TermsAcceptance** in registration pages
3. **Add ReferralSystem** to dashboards
4. **Deploy database schema** to Supabase
5. **Test all workflows** end-to-end
6. **Configure storage buckets** and RLS policies
7. **Set up monitoring** for referral notifications
8. **Add analytics** for tracking referral success rates

---

## Support & Documentation

- **Component Documentation**: See inline comments in JSX files
- **Database Schema**: `DATABASE_SCHEMA_WITH_RLS.sql`
- **Legal Documents**: `DOCTOR_TERMS_AND_CONDITIONS.md`, `PATIENT_TERMS_AND_CONDITIONS.md`
- **API Reference**: Create OpenAPI/Swagger documentation

---

**Version**: 1.0  
**Last Updated**: May 9, 2026  
**Contact**: support@globaldocplatform.com
