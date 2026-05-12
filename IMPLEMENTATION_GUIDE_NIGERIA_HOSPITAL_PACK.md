# Nigeria Hospital Pack (2026 NG) — Implementation Guide

This repo runs a **Vite + React** frontend and an **Express** backend (`server/index.js`). The “Nigeria Hospital Pack” adds **facility wallets**, **facility referrals**, **NGN consultation revenue splits**, **labs commission**, and **audit logs** while keeping the existing **token + Kora** flow working.

## Economics (NGN)

### Channels

1) `direct_home` (patient starts at home)
- Economy: **₦2,000 / 15min**
- Premium: **₦5,000 / 15min**
- Split: **Doctor 60%**, **Platform 35%**, **Data fund 5%**

2) `facility_private` (clinic-origin consult)
- **₦5,000 / 15min**
- Split: **Doctor 50%**, **Facility 30%**, **Platform 15%**, **Data fund 5%**

3) `facility_phc` (PHC tablet, no NGO)
- Patient copay: **₦500**
- Facility topup (from PHC wallet): **₦1,000**
- Total: **₦1,500**
- Fixed split per 15min block:
  - Doctor: **₦900**
  - Facility: **₦300**
  - Platform: **₦200**
  - Data fund: **₦100**

### Labs
- Platform commission: **10%** (`lab_commission_pct = 0.10`)

## Core Flows

### A) Facility (PHC / Private Clinic) → Start Consultation

1. Staff logs in via **Facility Portal** (`/facility`) using **Facility ID + 6-digit PIN**
2. Staff registers a patient (no email required):
   - Patient **Full Name**
   - Patient **6-digit PIN**
   - (optional) Phone
3. Staff selects an **online doctor** and starts consultation:
   - PHC → channel `facility_phc`
   - Private clinic → channel `facility_private`
4. Staff ends consultation to record the split:
   - PHC topup is deducted from the **PHC wallet**
   - Facility share is credited to the **facility wallet**
   - Doctor NGN earnings credited (in-memory)
   - Platform + data fund ledgers updated

### B) Doctor → Create Facility Referral (Clinic/PHC/Lab)

1. Doctor Dashboard → **Referrals** → **Facility Referrals**
2. Choose facility and create code
3. Facility redeems the code in Facility Portal (credits facility wallet if payout exists)

### C) Labs

1. Doctor creates lab order: `/api/labs/order`
2. Lab/Platform records payment: `/api/labs/pay`
3. Platform takes **10% commission** and lab wallet gets the **net**

### D) Audit Logs

Every sensitive event / money movement writes to `auditLogs[]` (in-memory).
- Platform admin can view via `/api/admin/audit-logs`

## UI Entry Points

- Patient Portal: `/patient`
- Doctor Portal: `/doctor` (email/password or Google OAuth if Supabase configured)
- Doctor Dashboard: `/doctor/dashboard`
- Facility Portal: `/facility`
- Platform Admin: `/platform-admin` (login via Doctor Portal using `ADMIN_EMAIL` + `ADMIN_PASSWORD`)

## Backend Endpoints (Hospital Pack)

Facilities / Wallets:
- `POST /api/facilities` (admin header auth)
- `GET /api/facilities?type=private_clinic|phc|lab` (admin headers include PIN in response)
- `POST /api/facilities/auth` (Facility ID + PIN)
- `POST /api/admin/facilities/:facilityId/fund` (admin header auth)

Consultations:
- `POST /api/consultations/start` (facility channels require facility PIN)
- `POST /api/consultations/end` (facility consults require facility PIN)

Facility referrals:
- `POST /api/referrals/facility/create`
- `GET /api/referrals/facility?doctorId=...|facilityId=...`
- `POST /api/referrals/facility/redeem` (facility PIN required)

Labs:
- `POST /api/labs/order`
- `POST /api/labs/pay`

Audit:
- `GET /api/admin/audit-logs` (admin header auth)

Patient record aggregation:
- `GET /api/patients/:patientId/record`

## Auth Notes

- Facility-created patients use **Clinic/PHC PIN** login (no email required).
- Google OAuth is implemented using **Supabase Auth**:
  - Callback path: `/auth/callback`
  - After OAuth, the app calls `/api/auth/oauth/bridge` to create/login an in-memory profile.
  - This bridge is **demo-grade** and should be replaced with proper server-side JWT verification when moving fully to Supabase.

## Where Pricing Logic Lives

Pure functions (future Supabase swap friendly):
- `src/lib/ngPricing.js`

Backend uses it here:
- `server/index.js` (`/api/consultations/start` + `/api/consultations/end`)

