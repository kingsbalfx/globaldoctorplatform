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

test('doctor withdrawal sends current payout form details', () => {
  assert.match(adminDashboard, /JSON\.stringify\(\{ tokens, payoutDetails \}\)/)
  assert.match(server, /normalizePayoutDetailsFromBody/)
  assert.match(server, /req\.body\?\.payoutDetails/)
})

test('schema includes recent repair columns and indexes', () => {
  assert.match(schema, /last_seen_at timestamptz/)
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
