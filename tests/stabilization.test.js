import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const server = readFileSync(new URL('../server/index.js', import.meta.url), 'utf8')
const schema = readFileSync(new URL('../SUPABASE_FULL_REPAIR_SCHEMA.sql', import.meta.url), 'utf8')
const calendar = readFileSync(new URL('../src/components/CalendarScheduler.jsx', import.meta.url), 'utf8')
const adminDashboard = readFileSync(new URL('../src/pages/AdminDashboard.jsx', import.meta.url), 'utf8')
const platformAdminDashboard = readFileSync(new URL('../src/pages/PlatformAdminDashboard.jsx', import.meta.url), 'utf8')
const doctorAvailabilityManager = readFileSync(new URL('../src/components/DoctorAvailabilityManager.jsx', import.meta.url), 'utf8')
const fileManager = readFileSync(new URL('../src/components/FileManager.jsx', import.meta.url), 'utf8')
const doctorDashboard = readFileSync(new URL('../src/pages/AdminDashboard.jsx', import.meta.url), 'utf8')
const chatPanel = readFileSync(new URL('../src/components/ChatPanel.jsx', import.meta.url), 'utf8')
const communityChat = readFileSync(new URL('../src/components/DoctorCommunityChat.jsx', import.meta.url), 'utf8')
const patientDashboard = readFileSync(new URL('../src/pages/PatientDashboard.jsx', import.meta.url), 'utf8')

test('doctor availability is deterministic and database-backed', () => {
  assert.match(server, /doctor_availability_slots/)
  assert.match(server, /getDoctorAvailabilityForDate/)
  assert.match(adminDashboard, /DoctorAvailabilityManager/)
  assert.match(doctorAvailabilityManager, /PATCH/)
  assert.doesNotMatch(server, /DOCTOR AVAILABILITY \(mock\)/)
  assert.doesNotMatch(calendar, /generateMockSlots/)
  assert.doesNotMatch(calendar, /Math\.random/)
})

test('admin files are persisted instead of mocked', () => {
  assert.match(schema, /CREATE TABLE IF NOT EXISTS public\.admin_files/)
  assert.match(server, /from\('admin_files'\)/)
  assert.match(platformAdminDashboard, /FileManager/)
  assert.match(fileManager, /headers/)
  assert.doesNotMatch(server, /mockFiles/)
  assert.doesNotMatch(server, /Sample Document\.pdf/)
})

test('video signaling requires Supabase persistence', () => {
  assert.match(server, /video_signals/)
  assert.match(server, /rememberFallbackVideoSignal/)
  assert.match(server, /readFallbackVideoSignals/)
  assert.doesNotMatch(server, /stored in memory only/)
  assert.doesNotMatch(server, /videoSignalRooms/)
})

test('Kora payment initialization does not return fake checkout success without configuration', () => {
  assert.match(server, /Kora payment is not configured/)
  assert.match(server, /Kora subscription payment is not configured/)
  assert.doesNotMatch(server, /Payment initialized \(mock - no KORA key\)/)
  assert.doesNotMatch(server, /Subscription payment initialized \(mock - no KORA key\)/)
  assert.doesNotMatch(server, /Payment request queued\. Add KORA_SECRET_KEY/)
})

test('patient token wallet writes tolerate older schema cache', () => {
  assert.match(server, /async function upsertPatientTokenBalance/)
  assert.match(server, /getMissingColumnName\(result\.error\) === 'updated_at'/)
  assert.match(server, /mode: 'without_updated_at'/)
  assert.match(server, /const walletUpdate = await upsertPatientTokenBalance\(patientId, newBalance\)/)
})

test('Kora verification records actual payment method details', () => {
  assert.match(server, /function extractKoraPaymentMethod/)
  assert.match(server, /paymentMethod/)
  assert.match(server, /bank_transfer/)
  assert.match(server, /bank_deposit/)
  assert.match(server, /async function annotatePaymentFromKora/)
  assert.match(server, /koraPaymentMethod/)
  assert.match(server, /payment_method: method\.paymentMethod/)
})

test('doctor withdrawal sends current payout form details', () => {
  assert.match(adminDashboard, /JSON\.stringify\(\{ tokens, payoutDetails \}\)/)
  assert.match(server, /normalizePayoutDetailsFromBody/)
  assert.match(server, /req\.body\?\.payoutDetails/)
})

test('schema includes recent repair columns and indexes', () => {
  assert.match(schema, /last_seen_at timestamptz/)
  assert.match(schema, /ALTER TABLE public\.patient_tokens ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now\(\)/)
  assert.match(schema, /reference text/)
  assert.match(schema, /metadata jsonb/)
  assert.match(schema, /idx_doctor_availability_slots_doctor_date/)
  assert.match(schema, /idx_token_transactions_patient_reference/)
})

test('doctor online status requires a recent heartbeat', () => {
  assert.match(server, /doctor\.last_seen_at \|\| nested\.last_seen_at/)
  assert.match(server, /if \(!rawSeenAt\) return false/)
  assert.doesNotMatch(server, /doctor\.last_seen_at \|\| doctor\.updated_at \|\| nested\.last_seen_at \|\| nested\.updated_at/)
})

test('PHC facility consultations use facility wallet funding instead of patient tokens', () => {
  assert.match(server, /channel === 'facility_phc'/)
  assert.match(server, /facility_topup_ngn: total/)
  assert.match(server, /doctor_ngn: total/)
  assert.match(server, /chargePatient: false/)
  assert.match(server, /debitFacilityTopup: channel === 'facility_phc'/)
})

test('specialty referral creation uses bounded snapshot and non-blocking notifications', () => {
  assert.match(server, /snapshot query timeout/)
  assert.match(server, /Referral doctor notifications skipped/)
  assert.match(server, /buildQuery\(false\)/)
})

test('specialty referral acceptance is idempotent and opens room without charging patient again', () => {
  assert.match(server, /Existing consultation room reopened/)
  assert.match(server, /source: 'specialty_referral',[\s\S]*chargePatient: false/)
  assert.match(server, /Referral accepted and consultation room opened/)
  assert.match(server, /if \(referral\.target_doctor_id\) return String\(referral\.target_doctor_id\) === targetDoctorId/)
  assert.match(server, /if \(status === 'accepted'\) return String\(referral\.accepted_by_doctor_id/)
})

test('patient token balance reconciles wallet and patient mirrors', () => {
  assert.match(server, /const reconciledBalance = ledgerRows\.length > 0/)
  assert.match(server, /token_transactions'\)\.select\('amount'\)/)
  assert.match(server, /ledgerRows\.reduce/)
  assert.match(server, /Patient token mirror repair skipped/)
})

test('doctor dashboard uses waiting-room alert without forced tab navigation', () => {
  assert.match(doctorDashboard, /Patient waiting now/)
  assert.match(doctorDashboard, /animate-ping/)
  assert.doesNotMatch(doctorDashboard, /hasAutoOpenedPatients/)
})

test('doctor queue hides offline patients and expires stale waiting signals', () => {
  assert.match(server, /function isPatientRecentlyOnline/)
  assert.match(server, /const videoWaiting = patientOnline && recentJoinRequest/)
  assert.match(server, /rows = rows\.filter\(\(patient\) => patient\.is_online\)/)
  assert.match(server, /Date\.now\(\) - createdAt <= PATIENT_ONLINE_WINDOW_MS/)
  assert.match(patientDashboard, /window\.setInterval\(markOnline, 60 \* 1000\)/)
  assert.match(schema, /ALTER TABLE public\.patients ADD COLUMN IF NOT EXISTS last_seen_at timestamptz/)
})

test('accepted offline referrals do not force an empty doctor video workspace', () => {
  assert.match(doctorDashboard, /The patient is offline, so the consultation room will appear/)
  assert.match(server, /The patient is offline and will be notified to join later/)
  assert.match(server, /room will become available when they come online/)
})

test('chat panels show six recent messages inside fixed scroll areas', () => {
  assert.match(chatPanel, /useState\(6\)/)
  assert.match(chatPanel, /h-\[420px\] overflow-y-auto/)
  assert.match(chatPanel, /Load \{Math\.min\(6, hiddenMessageCount\)\} older messages/)
  assert.match(communityChat, /useState\(6\)/)
  assert.match(communityChat, /h-\[420px\]/)
})
