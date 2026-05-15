# Supabase Setup for GlobalDoc Platform

> 📖 **Complete Setup Guide**: See [`SUPABASE_COMPLETE_SETUP_GUIDE.md`](SUPABASE_COMPLETE_SETUP_GUIDE.md) for detailed step-by-step instructions.

## Quick Setup

### 1. Get Your Supabase Keys

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project → Settings → API
3. Copy:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: `eyJ...` (starts with `eyJ`)

### 2. Environment Variables

Create `.env` in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=eyJ...your-anon-public-key...
```

### 3. Vercel Deployment

In Vercel dashboard → Project Settings → Environment Variables:

- `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
- `VITE_SUPABASE_KEY`: `eyJ...your-anon-public-key...`

### 4. Configure Redirect URLs

In Supabase → Authentication → Settings:

**Site URL**: `https://globaldoctorplatform.vercel.app`

**Redirect URLs**:
```
https://globaldoctorplatform.vercel.app/auth/callback
http://localhost:5173/auth/callback
```

### 5. Enable Google OAuth

In Supabase → Authentication → Providers:

- Enable Google
- Add your Google Client ID & Secret
- Ensure Google Cloud Console has the redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`

## Troubleshooting

- **"Invalid API key"**: Check `VITE_SUPABASE_KEY` is the **anon/public** key (not service_role)
- **"Session expired"**: Verify redirect URLs match your domain exactly
- **Google OAuth fails**: Check Google Cloud Console redirect URI matches Supabase callback URL

## Security Notes

- 🔒 Never commit `.env` files to Git
- 🔒 Only use anon/public keys in frontend code
- 🔒 Keep service_role keys server-side only

### Common Google redirect URLs

- `http://localhost:5173/auth/callback`
- `https://globaldoctorplatform.vercel.app/auth/callback`
- `https://<your-production-domain>/auth/callback`

## 6. How the app uses redirect URLs

The app currently sends users to the `/auth/callback` page after Google login.

- Doctor signup/login sends them to: `/auth/callback?role=doctor&next=/doctor/dashboard`
- Patient signup/login sends them to: `/auth/callback?role=patient&next=/patient`

The callback page finalizes the Supabase session and then routes the user into the correct portal.

## 7. Supabase Auth Settings

In Supabase project settings, also verify:

- `Site URL` includes your app origin
- `Redirect URLs` include `/auth/callback`
- `Enable OAuth` is turned on for Google
- `External OAuth redirect` is allowed for your origin

## 8. Troubleshooting

- If the callback page shows no `code`, confirm the redirect URL is exactly the same as the one configured in Supabase.
- If `Failed to fetch` appears, check CORS and ensure the frontend origin is listed in Supabase Auth settings.
- If `Supabase is not configured` appears in the app, verify `.env` is loaded and the values are present in `import.meta.env`.
- Do not share your personal login email or password in public documentation or chat messages. Treat your Supabase credentials as private.

## 9. Recommended redirect URL list

For local development:

- `http://localhost:5173/auth/callback`

For production:

- `https://<your-domain>/auth/callback`

If you want the app to support multiple subdomains or staging, add each one.
