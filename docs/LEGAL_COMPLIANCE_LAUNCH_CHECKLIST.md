# GlobalDoc Connect Legal and Compliance Launch Checklist

This checklist is for controlled launch planning. It is not legal advice. A qualified lawyer, data protection consultant, and licensed medical reviewer should sign off before full public launch.

## 1. Corporate and product readiness

- Confirm company name, CAC documents, business address, directors, ownership, and operating entity.
- Confirm brand ownership for GlobalDoc Connect, logo, and domain.
- Keep the LICENSE file in the repository.
- Prepare signed agreements for doctors, facilities, support staff, and contractors.

## 2. Nigeria launch requirements

- Consult a Nigerian healthcare lawyer for telehealth operating structure.
- Confirm whether GlobalDoc Connect is only a technology platform or also a healthcare provider/facility operator.
- Verify all doctors through MDCN or the applicable professional regulator.
- Confirm pharmacy and lab workflows are handled only by licensed providers.
- Engage a licensed data protection compliance professional for NDPA/NDPC compliance.
- Prepare privacy notice, terms, consent forms, data subject request process, breach response plan, and staff access policy.

## 3. Global launch country-by-country gate

Do not open clinical services in a country until this is complete:

- Local medical practice/telemedicine legal review.
- Doctor licensing requirements for patient location and doctor location.
- Prescription, pharmacy, lab, and emergency routing rules.
- Health data hosting and cross-border transfer requirements.
- Consumer protection and payment/refund rules.
- Local privacy notice or country-specific addendum.

## 4. Medical governance

- Create medical advisory board or named clinical lead.
- Verify doctor licences before activation.
- Keep doctor scope of practice per country.
- Require clinical notes for each consultation.
- Require human review for AI summaries.
- Prohibit AI diagnosis and automatic prescriptions.
- Require emergency disclaimers and escalation instructions.

## 5. Security gate

- Confirm no service role keys are exposed in frontend variables.
- Enable Supabase RLS before real patient data.
- Use least-privilege access for admin, doctors, facility staff, and support users.
- Log access to patient files and sensitive records.
- Test upload/download permissions.
- Add MFA for admin and doctor accounts as soon as possible.
- Perform manual penetration test before public release.

## 6. Policy review gate

- Terms of Service updated and reviewed.
- Privacy Policy updated and reviewed.
- Cookie notice prepared if analytics or marketing cookies are used.
- Doctor agreement prepared.
- Facility agreement prepared.
- Data processing agreement prepared.
- Patient consent wording prepared.
- Emergency limitation wording prepared.

## 7. Launch decision

Recommended launch type after one week: controlled pilot, not unrestricted global public hospital launch.

Minimum pilot restrictions:

- Only verified clinicians.
- Only approved countries.
- Manual support monitoring.
- No emergency-care promises.
- No unsupervised AI clinical output.
- No automated prescriptions.
