# GlobalDoc Connect - Vercel Deployment Guide

## 🚀 Complete Deployment to Vercel

This guide will walk you through deploying your full-stack telehealth platform to Vercel.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Stripe Account**: For payment processing
4. **Supabase Account**: For database (optional, can use demo data)

### Step 1: Prepare Your Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# Database (Optional - using demo data if not set)
DATABASE_URL=postgresql://username:password@host:5432/database

# Stripe Payment Processing (Required)
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# Supabase (Optional - for real-time features)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your_actual_supabase_anon_key

# API Configuration
VITE_API_BASE=https://your-vercel-app.vercel.app
PORT=4000

# Security (Generate a random string)
JWT_SECRET=your_secure_random_jwt_secret_here
```

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 3: Login to Vercel

```bash
vercel login
```

### Step 4: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Navigate to your project directory:**
   ```bash
   cd /path/to/your/globaldoc-platform
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new? → Create new
   - Project name → `globaldoc-platform` (or your choice)
   - Directory → `./` (current directory)

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect your settings

### Step 5: Configure Environment Variables

In the Vercel dashboard:

1. Go to your project → Settings → Environment Variables
2. Add all variables from your `.env` file:

| Variable | Value | Environment |
|----------|-------|-------------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | Production |
| `STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | Production |
| `VITE_SUPABASE_URL` | Your Supabase URL | Production |
| `VITE_SUPABASE_KEY` | Your Supabase anon key | Production |
| `VITE_API_BASE` | `https://your-app-name.vercel.app` | Production |
| `JWT_SECRET` | Random secure string | Production |
| `NODE_ENV` | `production` | Production |

### Step 6: Configure Stripe Webhooks (Optional but Recommended)

1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app-name.vercel.app/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### Step 7: Deploy and Test

1. **Trigger deployment:**
   ```bash
   vercel --prod
   ```

2. **Check deployment status:**
   - Visit your Vercel dashboard
   - Check build logs for any errors

3. **Test your application:**
   - Frontend: `https://your-app-name.vercel.app`
   - API: `https://your-app-name.vercel.app/api/doctors`

### Step 8: Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `VITE_API_BASE` environment variable with your custom domain

### Troubleshooting

#### Build Failures
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify `vercel.json` configuration

#### API Issues
- Check that `VITE_API_BASE` is set correctly
- Verify environment variables are set in Vercel dashboard
- Test API endpoints directly

#### Static Asset Issues
- Ensure `logo.png` and `background.png` are in `public/` folder
- Check that paths in code use `/logo.png` (not `./logo.png`)

### Production Checklist

- [ ] Environment variables configured
- [ ] Stripe keys are production keys (not test)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Database connected (if using external DB)
- [ ] All features tested:
  - [ ] Doctor search
  - [ ] Patient registration/login
  - [ ] Payment processing
  - [ ] Video chat (if implemented)
  - [ ] Admin dashboard
  - [ ] File uploads

### Performance Optimization

1. **Enable Analytics**: Vercel → Settings → Analytics
2. **Configure Caching**: Add cache headers in API responses
3. **Optimize Images**: Use Vercel's Image Optimization
4. **Monitor Usage**: Check Vercel dashboard for usage metrics

### Support

- Vercel Docs: https://vercel.com/docs
- Stripe Docs: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs

Your telehealth platform is now live! 🎉