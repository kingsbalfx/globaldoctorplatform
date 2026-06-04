import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * ReferralSystem Component
 * Handles bidirectional referral requests between patients and doctors
 * - Patients can request referrals from current doctor (button in patient dashboard)
 * - Doctors can initiate referrals (button in doctor dashboard)
 * - Both sides must accept before referral is completed
 * - Options: Accept / No / Not Yet (if tokens not available)
 */
const ReferralSystem = ({ 
  userType, // 'patient' or 'doctor'
  userId, 
  consultationId,
  onReferralComplete 
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [referralRequest, setReferralRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [tokensAvailable, setTokensAvailable] = useState(0);
  const [referralReason, setReferralReason] = useState('');

  // Load available specialties and token balance
  useEffect(() => {
    loadSpecialties();
    if (userType === 'patient') {
      checkTokenBalance();
    }
  }, [userType, userId]);

  // Poll for incoming referral requests
  useEffect(() => {
    const interval = setInterval(() => {
      checkPendingReferrals();
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [userId, consultationId]);

  const loadSpecialties = async () => {
    try {
      const response = await axios.get('/api/specialties');
      setSpecialties(response.data);
    } catch (error) {
      console.error('Error loading specialties:', error);
    }
  };

  const checkTokenBalance = async () => {
    try {
      const response = await axios.get(`/api/tokens/balance/${userId}`);
      setTokensAvailable(response.data.available_tokens || 0);
    } catch (error) {
      console.error('Error checking token balance:', error);
    }
  };

  const checkPendingReferrals = async () => {
    try {
      const response = await axios.get(`/api/referrals/pending/${userId}/${consultationId}`);
      if (response.data && response.data.id) {
        setReferralRequest(response.data);
        setShowPrompt(true);
      }
    } catch (error) {
      // No pending referrals or error
    }
  };

  // Patient initiates referral request
  const handlePatientRequestReferral = async () => {
    if (!selectedSpecialty) {
      alert('Please select a specialty for referral');
      return;
    }

    setLoading(true);
    try {
      // Create referral request that doctor must approve
      const response = await axios.post('/api/referrals/request', {
        patient_id: userId,
        consultation_id: consultationId,
        requested_specialty: selectedSpecialty,
        reason: referralReason,
        initiated_by: 'patient',
        status: 'pending_doctor_approval'
      });

      alert('Referral request sent to your doctor. Waiting for approval...');
      setShowPrompt(false);
    } catch (error) {
      console.error('Error requesting referral:', error);
      alert('Failed to request referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Doctor initiates referral
  const handleDoctorInitiateReferral = async () => {
    if (!selectedSpecialty) {
      alert('Please select a specialty for referral');
      return;
    }

    setLoading(true);
    try {
      // Create referral that patient must approve
      const response = await axios.post('/api/referrals/initiate', {
        doctor_id: userId,
        consultation_id: consultationId,
        referred_specialty: selectedSpecialty,
        reason: referralReason,
        initiated_by: 'doctor',
        status: 'pending_patient_approval'
      });

      alert('Referral initiated. Waiting for patient approval...');
      setShowPrompt(false);
    } catch (error) {
      console.error('Error initiating referral:', error);
      alert('Failed to initiate referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle response to referral request (Accept/No/Not Yet)
  const handleReferralResponse = async (response) => {
    setLoading(true);
    try {
      const tokensRequired = getTokensForSpecialty(referralRequest.specialty);
      
      if (response === 'accept') {
        // Check if patient has enough tokens
        if (userType === 'patient' && tokensAvailable < tokensRequired) {
          // Not enough tokens - set to "not yet"
          response = 'not_yet';
          alert(`Insufficient tokens. You need ${tokensRequired} tokens for ${referralRequest.specialty} consultation. Status set to "Not Yet".`);
        }
      }

      await axios.patch(`/api/referrals/${referralRequest.id}/respond`, {
        status: response,
        responded_by: userType,
        response_date: new Date().toISOString()
      });

      if (response === 'accept') {
        // Deduct tokens based on specialty
        if (userType === 'patient') {
          await axios.post('/api/tokens/deduct', {
            user_id: userId,
            specialty: referralRequest.specialty,
            tokens_used: tokensRequired,
            referral_id: referralRequest.id
          });
        }

        alert('Referral accepted! You will be connected with a specialist shortly.');
        if (onReferralComplete) {
          onReferralComplete(referralRequest);
        }
      } else if (response === 'not_yet') {
        alert('Referral postponed. You can accept when tokens are available.');
      } else {
        alert('Referral declined.');
      }

      setShowPrompt(false);
      setReferralRequest(null);
    } catch (error) {
      console.error('Error responding to referral:', error);
      alert('Failed to process response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get token cost by specialty
  const getTokensForSpecialty = (specialty) => {
    const tokenCosts = {
      'General Practice': 1,
      'Cardiology': 2,
      'Neurology': 2,
      'Dermatology': 1,
      'Pediatrics': 1,
      'Psychiatry': 2,
      'Orthopedics': 2,
      'Oncology': 3,
      'Endocrinology': 2,
      'Gastroenterology': 2,
      'Pulmonology': 2,
      'Nephrology': 2,
      'Rheumatology': 2,
      'Urology': 2,
      'Ophthalmology': 1,
      'ENT': 1,
      'OB/GYN': 2,
      'Gynaecologist': 2
    };

    return tokenCosts[specialty] || 1;
  };

  return (
    <div className="referral-system">
      {/* Patient View - Request Referral Button */}
      {userType === 'patient' && !showPrompt && (
        <button
          onClick={() => setShowPrompt(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Request Referral to Specialist</span>
        </button>
      )}

      {/* Doctor View - Refer Patient Button */}
      {userType === 'doctor' && !showPrompt && (
        <button
          onClick={() => setShowPrompt(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Refer Patient to Specialist</span>
        </button>
      )}

      {/* Referral Request/Initiation Modal */}
      {showPrompt && !referralRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {userType === 'patient' ? 'Request Referral' : 'Refer Patient'}
            </h3>

            {/* Token Balance for Patients */}
            {userType === 'patient' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Available Tokens:</strong> {tokensAvailable}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Token cost varies by specialty (1-3 tokens per consultation)
                </p>
              </div>
            )}

            {/* Specialty Selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Specialty --</option>
                <option value="Cardiology">Cardiology (2 tokens)</option>
                <option value="Neurology">Neurology (2 tokens)</option>
                <option value="Dermatology">Dermatology (1 token)</option>
                <option value="Pediatrics">Pediatrics (1 token)</option>
                <option value="Psychiatry">Psychiatry (2 tokens)</option>
                <option value="Orthopedics">Orthopedics (2 tokens)</option>
                <option value="Oncology">Oncology (3 tokens)</option>
                <option value="Endocrinology">Endocrinology (2 tokens)</option>
                <option value="Gastroenterology">Gastroenterology (2 tokens)</option>
                <option value="Pulmonology">Pulmonology (2 tokens)</option>
                <option value="Nephrology">Nephrology (2 tokens)</option>
                <option value="Rheumatology">Rheumatology (2 tokens)</option>
                <option value="Urology">Urology (2 tokens)</option>
                <option value="Ophthalmology">Ophthalmology (1 token)</option>
                <option value="ENT">ENT (1 token)</option>
                <option value="OB/GYN">OB/GYN (2 tokens)</option>
                <option value="Gynaecologist">Gynaecologist (2 tokens)</option>
              </select>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Referral
              </label>
              <textarea
                value={referralReason}
                onChange={(e) => setReferralReason(e.target.value)}
                rows={3}
                placeholder="Describe why this referral is needed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={userType === 'patient' ? handlePatientRequestReferral : handleDoctorInitiateReferral}
                disabled={loading || !selectedSpecialty}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Processing...' : 'Submit'}
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                disabled={loading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Approval Prompt */}
      {showPrompt && referralRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Referral {referralRequest.initiated_by === 'patient' ? 'Request' : 'Recommendation'}
            </h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-800">
                <strong>Specialty:</strong> {referralRequest.specialty}
              </p>
              <p className="text-sm text-gray-800 mt-2">
                <strong>Reason:</strong> {referralRequest.reason}
              </p>
              <p className="text-sm text-gray-800 mt-2">
                <strong>Initiated by:</strong> {referralRequest.initiated_by === 'patient' ? 'Patient' : 'Doctor'}
              </p>
              {userType === 'patient' && (
                <p className="text-sm text-gray-800 mt-2">
                  <strong>Token Cost:</strong> {getTokensForSpecialty(referralRequest.specialty)} tokens
                </p>
              )}
            </div>

            {/* Token Warning for Patients */}
            {userType === 'patient' && tokensAvailable < getTokensForSpecialty(referralRequest.specialty) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-semibold">
                  ⚠️ Insufficient Tokens
                </p>
                <p className="text-xs text-red-600 mt-1">
                  You need {getTokensForSpecialty(referralRequest.specialty)} tokens but only have {tokensAvailable}. 
                  You can select "Not Yet" and accept when tokens are available.
                </p>
              </div>
            )}

            {/* Response Options */}
            <div className="space-y-3">
              <button
                onClick={() => handleReferralResponse('accept')}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Accept Referral</span>
              </button>

              <button
                onClick={() => handleReferralResponse('not_yet')}
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Not Yet (Insufficient Tokens)</span>
              </button>

              <button
                onClick={() => handleReferralResponse('declined')}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Decline Referral</span>
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              {loading ? 'Processing your response...' : 'Please select an option'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralSystem;
