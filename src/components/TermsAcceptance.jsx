import React, { useState } from 'react';

/**
 * TermsAcceptance Component
 * Displays terms and conditions modal for doctors and patients during registration
 * Requires explicit acceptance before registration can be completed
 */
const TermsAcceptance = ({ userType = 'patient', onAccept, onDecline }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [acceptances, setAcceptances] = useState({
    readTerms: false,
    agreeToTerms: false,
    privacyPolicy: false,
    ...(userType === 'doctor' && {
      licenseCompliance: false,
      patientConfidentiality: false,
      companyRules: false,
      malpracticeInsurance: false,
    }),
  });

  const handleScroll = (e) => {
    const element = e.target;
    const isScrolledToBottom = 
      element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    
    if (isScrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleCheckboxChange = (key) => {
    setAcceptances(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allAccepted = Object.values(acceptances).every(value => value === true);

  const handleAccept = () => {
    if (allAccepted && hasScrolledToBottom) {
      onAccept({
        acceptedAt: new Date().toISOString(),
        ipAddress: 'logged', // In production, capture actual IP
        userType,
        acceptances
      });
      setIsOpen(false);
    }
  };

  const handleDecline = () => {
    onDecline();
    setIsOpen(false);
  };

  const openTerms = () => {
    setIsOpen(true);
  };

  const doctorTermsContent = `
# DOCTOR TERMS AND CONDITIONS

## GlobalDoc Platform - Healthcare Provider Agreement

**Effective Date:** January 1, 2026

---

## MANDATORY COMPLIANCE REQUIREMENTS

### 1. PROFESSIONAL LICENSE COMPLIANCE
- You must maintain active, unrestricted medical license in good standing
- You must be board-certified or board-eligible in your specialty
- You must comply with all state and federal licensing requirements
- You agree to immediate notification of any license suspension, restriction, or investigation

### 2. PATIENT CONFIDENTIALITY AND HIPAA COMPLIANCE
- You SHALL maintain strict confidentiality of all patient information
- You SHALL comply with HIPAA regulations and all privacy laws
- You SHALL NOT disclose patient information without proper authorization
- You SHALL implement appropriate security measures for patient data
- Violation of patient confidentiality will result in immediate termination and legal action

### 3. COMPANY RULES AND POLICIES COMPLIANCE
- You agree to follow all GlobalDoc Platform policies and procedures
- You agree to maintain professional conduct at all times
- You agree to provide quality care consistent with applicable standards
- You agree to respond to patient inquiries within required timeframes
- You agree to complete consultations thoroughly and professionally

### 4. MALPRACTICE INSURANCE REQUIREMENT
- You MUST maintain medical malpractice insurance with minimum coverage:
  - $1,000,000 per occurrence
  - $3,000,000 aggregate per year
- You must provide proof of insurance before account activation
- You must notify Platform immediately if insurance lapses or is cancelled

### 5. PROFESSIONAL CONDUCT
- You SHALL NOT practice medicine while impaired
- You SHALL NOT engage in sexual misconduct or harassment
- You SHALL NOT discriminate based on protected characteristics
- You SHALL maintain appropriate professional boundaries
- You SHALL report any potential patient safety concerns

### 6. PLATFORM FEE AGREEMENT
- Platform retains 15-25% of consultation fees (based on volume)
- Payments processed within 7 business days
- You are responsible for applicable taxes
- Fee structure may be adjusted with 30 days notice

### 7. QUALITY ASSURANCE
- You consent to quality monitoring and consultation recordings
- You agree to participate in quality improvement initiatives
- You agree to peer review processes
- You agree to continuing education requirements

### 8. TERMINATION
- Platform may terminate your account for:
  - Violation of terms and conditions
  - Patient safety concerns
  - License suspension or revocation
  - Multiple patient complaints
  - Failure to maintain insurance
  - Unprofessional conduct

### 9. LIMITATION OF LIABILITY
- You are an independent contractor, not an employee
- You are solely responsible for medical advice and treatment decisions
- You maintain your own malpractice insurance
- Platform is not liable for your medical malpractice

### 10. DISPUTE RESOLUTION
- All disputes resolved through binding arbitration
- Governed by laws of the United States
- You waive right to class action participation

---

## ACKNOWLEDGMENT OF UNDERSTANDING

By accepting these terms, you acknowledge and agree that:

1. You have read and understood all terms and conditions
2. You meet all professional requirements and qualifications
3. You will maintain all required licenses and insurance
4. You will comply with HIPAA and patient confidentiality requirements
5. You will follow all company rules and policies
6. You understand the consequences of violations
7. You agree to the platform fee structure
8. You accept full responsibility for your medical practice
9. You understand you are an independent contractor
10. You have had the opportunity to seek legal counsel regarding these terms

**Failure to comply with these terms may result in immediate account termination, loss of earnings, and potential legal action.**

For complete terms and conditions, please refer to DOCTOR_TERMS_AND_CONDITIONS.md
`;

  const patientTermsContent = `
# PATIENT TERMS AND CONDITIONS

## GlobalDoc Platform - Patient Agreement

**Effective Date:** January 1, 2026

---

## KEY TERMS YOU MUST UNDERSTAND

### 1. ELIGIBILITY
- You must be at least 12 years old to use this platform
- If you are 12-17 years old, a parent or guardian must manage your account
- You must provide accurate medical information

### 2. TELEHEALTH SERVICES
- This platform connects you with licensed doctors for virtual consultations
- NOT FOR EMERGENCIES - Call 911 for emergencies
- Doctors cannot perform physical examinations remotely
- Service quality depends on your internet connection

### 3. PRIVACY AND CONFIDENTIALITY
- Your health information is protected under HIPAA
- We use encryption to protect your data
- Only your healthcare providers can access your medical records
- We NEVER sell your personal health information

### 4. YOUR RESPONSIBILITIES
- Provide accurate medical history and information
- Follow or don't follow medical advice (your choice, but affects outcomes)
- Maintain device with camera and microphone for consultations
- Grant permissions for camera/sensors when requested for vital measurements

### 5. VITAL PARAMETERS MONITORING
During consultations, doctors may request measurements:
- Heart rate, respiratory rate, blood oxygen (SpO2)
- Stress levels, tremor tests, reaction time
- You consent to use of your device's camera and sensors

### 6. PAYMENTS AND REFUNDS
- Pay consultation fees at time of booking
- Cancellation 24+ hours in advance: Full refund minus 5% processing fee
- Cancellation 12-24 hours: 50% refund
- Less than 12 hours or no-show: No refund

### 7. CONSENT TO TELEHEALTH
You consent to:
- Receiving medical care via video/audio technology
- Electronic transmission of your medical information
- Recording of consultations for quality assurance (with notification)
- Use of camera/sensors for vital measurements

### 8. RISKS AND LIMITATIONS
- Technology failures may interrupt consultations
- Doctors have limited ability to perform physical examinations
- Potential delays in treatment compared to in-person care
- Misdiagnosis risk due to remote assessment limitations

### 9. LIMITATION OF LIABILITY
- Platform connects you with independent doctors
- Platform does NOT provide medical advice
- Platform is NOT liable for doctor malpractice
- Doctors maintain their own malpractice insurance

### 10. YOUR RIGHTS
- Access your medical records anytime
- Refuse telehealth services
- Decline recording consent
- Refuse specific measurements
- Terminate your account anytime

---

## IMPORTANT NOTICES

⚠️ **EMERGENCY DISCLAIMER**: Do NOT use this platform for medical emergencies. For emergencies, call 911 or go to the nearest emergency room.

⚠️ **AGE REQUIREMENT**: You must be at least 12 years old. If under 18, a parent or guardian must manage your account.

⚠️ **NOT A REPLACEMENT**: Telehealth supplements but does not replace in-person medical care.

---

## ACKNOWLEDGMENT

By accepting these terms, you confirm that:

1. You are at least 12 years old (or have parent/guardian consent)
2. You understand this is NOT for emergencies
3. You understand the limitations of telehealth
4. You consent to data collection and privacy practices
5. You agree to provide accurate medical information
6. You understand payment and refund policies
7. You consent to vital parameters monitoring
8. You have had the opportunity to ask questions

For complete terms and conditions, please refer to PATIENT_TERMS_AND_CONDITIONS.md
`;

  const termsContent = userType === 'doctor' ? doctorTermsContent : patientTermsContent;

  return (
    <div>
      {/* Terms Button/Link */}
      <button
        type="button"
        onClick={openTerms}
        className="text-blue-600 hover:text-blue-800 underline text-sm"
      >
        View and Accept Terms & Conditions
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {userType === 'doctor' ? 'Healthcare Provider' : 'Patient'} Terms and Conditions
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Please read carefully and scroll to the bottom
              </p>
            </div>

            {/* Terms Content - Scrollable */}
            <div 
              className="flex-1 overflow-y-auto px-6 py-4 text-sm text-gray-700 leading-relaxed"
              onScroll={handleScroll}
            >
              <pre className="whitespace-pre-wrap font-sans">
                {termsContent}
              </pre>

              {/* Scroll indicator */}
              {!hasScrolledToBottom && (
                <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-yellow-100 to-transparent py-4 text-center">
                  <p className="text-yellow-800 font-semibold animate-bounce">
                    ⬇️ Please scroll to the bottom to continue ⬇️
                  </p>
                </div>
              )}
            </div>

            {/* Acceptance Checkboxes */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="space-y-3 mb-4">
                {/* Common checkboxes */}
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptances.readTerms}
                    onChange={() => handleCheckboxChange('readTerms')}
                    disabled={!hasScrolledToBottom}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that I have read and understood the complete Terms and Conditions
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptances.agreeToTerms}
                    onChange={() => handleCheckboxChange('agreeToTerms')}
                    disabled={!hasScrolledToBottom}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to be legally bound by these Terms and Conditions
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptances.privacyPolicy}
                    onChange={() => handleCheckboxChange('privacyPolicy')}
                    disabled={!hasScrolledToBottom}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">
                    I consent to data collection and processing as described in the Privacy Policy
                  </span>
                </label>

                {/* Doctor-specific checkboxes */}
                {userType === 'doctor' && (
                  <>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptances.licenseCompliance}
                        onChange={() => handleCheckboxChange('licenseCompliance')}
                        disabled={!hasScrolledToBottom}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <span className="text-sm font-semibold text-red-700">
                        ✓ I confirm that I maintain an active, unrestricted medical license in good standing and will comply with all licensing requirements
                      </span>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptances.patientConfidentiality}
                        onChange={() => handleCheckboxChange('patientConfidentiality')}
                        disabled={!hasScrolledToBottom}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <span className="text-sm font-semibold text-red-700">
                        ✓ I agree to maintain strict patient confidentiality and comply with HIPAA regulations and all privacy laws
                      </span>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptances.companyRules}
                        onChange={() => handleCheckboxChange('companyRules')}
                        disabled={!hasScrolledToBottom}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <span className="text-sm font-semibold text-red-700">
                        ✓ I agree to follow all GlobalDoc Platform rules, policies, and professional conduct standards
                      </span>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptances.malpracticeInsurance}
                        onChange={() => handleCheckboxChange('malpracticeInsurance')}
                        disabled={!hasScrolledToBottom}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <span className="text-sm font-semibold text-red-700">
                        ✓ I confirm that I maintain medical malpractice insurance ($1M per occurrence, $3M aggregate) and will provide proof before account activation
                      </span>
                    </label>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAccept}
                  disabled={!allAccepted || !hasScrolledToBottom}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    allAccepted && hasScrolledToBottom
                      ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {hasScrolledToBottom ? 'I Accept - Complete Registration' : 'Scroll to Bottom First'}
                </button>
                <button
                  onClick={handleDecline}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  I Decline - Cancel Registration
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                By clicking "I Accept", you electronically sign this agreement on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsAcceptance;
