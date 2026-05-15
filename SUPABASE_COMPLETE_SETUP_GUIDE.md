# Supabase Setup Guide for GlobalDoc Platform

## 🚀 Quick Start Guide

This guide will walk you through setting up Supabase for the GlobalDoc platform authentication system.

---

## Step 1: Create a Supabase Account

1. **Go to Supabase**: Visit [https://supabase.com](https://supabase.com)
2. **Sign Up**: Click "Start your project" and create a free account
3. **Verify Email**: Check your email and click the verification link

---

## Step 2: Create a New Project

1. **Dashboard**: After login, click "New project"
2. **Project Details**:
   - **Name**: `globaldoctorplatform` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users (e.g., "West EU (London)" for Europe, "East US (North Virginia)" for US)
3. **Create Project**: Click "Create new project"

> ⏳ **Wait**: Project creation takes 2-3 minutes. You'll see a progress bar.

---

## Step 3: Get Your Project Keys

Once your project is ready:

1. **Go to Settings**: Click the gear icon ⚙️ in the left sidebar
2. **API Settings**: Click "API" in the settings menu
3. **Copy Keys**:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: Starts with `eyJ...` (this is your `VITE_SUPABASE_KEY`)
   - **service_role key**: Keep this secret! (not needed for frontend)

---

## Step 4: Configure Authentication

### Enable Google OAuth

1. **Go to Authentication**: Click "Authentication" in the left sidebar
2. **Providers**: Click the "Providers" tab
3. **Enable Google**:
   - Toggle "Enable sign in with Google"
   - **Client ID**: Get this from Google Cloud Console (see below)
   - **Client Secret**: Get this from Google Cloud Console (see below)
4. **Save**: Click "Save"

### Get Google OAuth Credentials

1. **Google Cloud Console**: Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. **Create Project**: If you don't have one, create a new project
3. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - **Application type**: "Web application"
   - **Name**: "GlobalDoc Platform"
   - **Authorized redirect URIs**: Add your Supabase callback URL:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
5. **Copy Credentials**:
   - **Client ID**: Copy this
   - **Client Secret**: Copy this

### Set Redirect URLs

1. **Back in Supabase**: Go to Authentication > Settings
2. **Site URL**: Set to your production URL:
   ```
   https://globaldoctorplatform.vercel.app
   ```
3. **Redirect URLs**: Add these URLs:
   ```
   https://globaldoctorplatform.vercel.app/auth/callback
   http://localhost:5173/auth/callback  (for local development)
   ```

---

## Step 5: Configure Environment Variables

### For Local Development

Create a `.env` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your-anon-public-key-here

# API Configuration
VITE_API_BASE=http://localhost:4000
```

### For Vercel Deployment

1. **Vercel Dashboard**: Go to your project settings
2. **Environment Variables**: Add these variables:
   - `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_KEY`: `your-anon-public-key-here`
   - `VITE_API_BASE`: `https://globaldoctorplatform.vercel.app`

---

## Step 6: Test Your Setup

### Local Development

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Test Authentication**:
   - Go to `http://localhost:5173`
   - Try logging in with Google
   - Check browser console for any errors

### Production Testing

1. **Deploy to Vercel**:
   ```bash
   npm run build
   vercel --prod
   ```

2. **Test on Vercel**:
   - Visit `https://globaldoctorplatform.vercel.app`
   - Try Google authentication
   - Check that redirect URLs work correctly

---

## Step 7: Database Setup (Optional)

If you need to set up custom tables for doctors/patients:

1. **Go to SQL Editor**: In Supabase dashboard, click "SQL Editor"
2. **Run Schema**: Copy and run the SQL from `server/schema.sql`
3. **Verify Tables**: Check "Table Editor" to see your tables

---

## Troubleshooting

### "Invalid API key" Error

- ✅ Check that `VITE_SUPABASE_KEY` is set correctly
- ✅ Verify the key starts with `eyJ`
- ✅ Make sure you're using the **anon/public** key, not service_role

### "Session expired" Error

- ✅ Check redirect URLs in Supabase settings
- ✅ Ensure your Vercel domain is added to Site URL
- ✅ Try signing in from the same browser tab

### Google OAuth Not Working

- ✅ Verify Google Client ID and Secret are correct
- ✅ Check that Google+ API is enabled
- ✅ Confirm redirect URI matches: `https://your-project-id.supabase.co/auth/v1/callback`

### Environment Variables Not Working

- ✅ For Vercel: Variables must start with `VITE_` to be exposed to frontend
- ✅ Restart your development server after changing `.env`
- ✅ Check Vercel deployment logs for missing variables

---

## Security Notes

- 🔒 **Never commit** your `.env` file to Git
- 🔒 **Never share** your service_role key
- 🔒 **Only use** anon/public keys in frontend code
- 🔒 **Keep** your Google Client Secret secure

---

## Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set
3. Test with a fresh browser/incognito window
4. Check Supabase dashboard for authentication logs

Your Supabase project URL and keys are now ready for the GlobalDoc platform! 🎉