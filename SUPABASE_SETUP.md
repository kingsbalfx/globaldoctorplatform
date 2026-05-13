# Supabase Setup for GlobalDoc Platform

## 1. Supabase Project Configuration

1. Go to https://app.supabase.com and sign in.
2. Create a new project for your GlobalDoc platform.
3. In the project dashboard, go to `Settings` > `API` and note these values:
   - `Project URL`
   - `anon/public API key`

These values are used in your frontend environment variables.

## 2. Environment Variables

In the frontend project root, create or update `.env` with:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_KEY=<your-anon-public-api-key>
```

If your project also uses a backend service with Supabase, keep the keys secure and do not commit them.

## 3. Allowed Redirect URLs

For Google sign-in and OAuth callback to work, register each redirect URL in Supabase.

### Required redirect URLs

- `http://localhost:5173/auth/callback`
- `https://globaldoctorplatform.vercel.app/auth/callback`
- `https://<your-production-domain>/auth/callback`

If you have other environments or routes, add them too.

## 4. Site URL

Set the Site URL in Supabase to match your app root, for example:

- `http://localhost:5173`
- `https://<your-production-domain>`

This ensures OAuth flow returns users to the correct origin.

## 5. OAuth Provider Setup (Google)

1. In Supabase, go to `Authentication` > `Providers`.
2. Enable `Google`.
3. Provide the required `Client ID` and `Client Secret` from Google Cloud Console.
4. In the Google Cloud Console OAuth consent screen, add the same redirect URLs.

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
