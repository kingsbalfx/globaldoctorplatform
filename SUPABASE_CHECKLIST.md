# Supabase Setup Checklist ✅

## Account & Project
- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project (name: globaldoctorplatform)
- [ ] Wait for project creation to complete (2-3 minutes)

## Get Keys
- [ ] Go to Settings → API
- [ ] Copy Project URL: `https://your-project-id.supabase.co`
- [ ] Copy anon/public key: `eyJ...` (NOT service_role key)

## Environment Variables
- [ ] Create `.env` file with:
  ```env
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_KEY=eyJ...your-anon-key...
  ```
- [ ] For Vercel: Add same variables in Vercel dashboard

## Authentication Setup
- [ ] Go to Authentication → Settings
- [ ] Set Site URL: `https://globaldoctorplatform.vercel.app`
- [ ] Add Redirect URLs:
  - `https://globaldoctorplatform.vercel.app/auth/callback`
  - `http://localhost:5173/auth/callback`

## Google OAuth (Optional but Recommended)
- [ ] Go to Google Cloud Console
- [ ] Create OAuth 2.0 Client ID
- [ ] Add redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
- [ ] In Supabase → Authentication → Providers → Enable Google
- [ ] Add Google Client ID and Client Secret

## Test
- [ ] Run `npm run dev` locally
- [ ] Test login with email/password
- [ ] Test Google OAuth (if enabled)
- [ ] Deploy to Vercel and test production URLs

## Common Issues
- [ ] "Invalid API key" → Check VITE_SUPABASE_KEY is anon/public key
- [ ] "Session expired" → Verify redirect URLs match exactly
- [ ] Google OAuth fails → Check Google Cloud Console redirect URI

---
✅ **All done?** Your GlobalDoc platform is ready for authentication!</content>
<parameter name="filePath">c:\Users\kingsbal\Documents\GitHub\globaldoc-platform\globaldoctorplatform\SUPABASE_CHECKLIST.md