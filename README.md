# GlobalDoc Connect

A comprehensive enterprise-grade global doctor marketplace platform with advanced admin features, specialty-based design system, and GDPR/HIPAA compliance.

## Key Features

### Patient Portal
- **Global Doctor Directory**: Search doctors by specialty, location, language, and rating with advanced filters
- **Verified Rating System**: Only verified patients can submit reviews to prevent fraud
- **Stripe Payment Integration**: Secure payment processing for consultations and priority access
- **Booking System**: Schedule consultations with real-time availability tracking
- **Specialty-Based Design**: Personalized UI based on doctor specialties with unique colors and logos

### Admin Portal (Doctor Dashboard)
- **Doctor Management**: Auto-add doctors, verify licenses, manage profiles with bulk actions
- **Patient Review Moderation**: View, verify, and reject patient reviews with detailed analytics
- **Referral System**: Create specialty referrals with clinical notes and secure documentation
- **File Management**: Upload, organize, and secure patient documents (PDF, Word, Images, Video)
- **Analytics Dashboard**: Real-time metrics on consultations, revenue, ratings, and patient engagement

### Enterprise Features
- **GDPR Compliance**: Complete data subject rights management, consent tracking, and data portability
- **HIPAA Safeguards**: Protected health information (PHI) protection with encryption and audit trails
- **Audit Logging**: Comprehensive activity tracking with security monitoring
- **Role-Based Access**: Doctor and admin role management with permission controls
- **Mobile-First Design**: Fully responsive UI built with React and Tailwind CSS
- **Specialty-Based Graphics**: Unique color schemes, logos, and gradients per medical specialty

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Stripe.js
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (schema provided)
- **Payments**: Stripe
- **Authentication**: JWT (framework ready)
- **Real-time**: Supabase (optional)

## Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd globaldoc-platform
   npm install
   ```

2. **Environment configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Database setup**:
   ```bash
   # Create PostgreSQL database
   psql -U postgres -c "CREATE DATABASE globaldoc;"
   psql -U postgres -d globaldoc -f server/schema.sql
   ```

4. **Stripe setup**:
   - Create a Stripe account at https://stripe.com
   - Get your test API keys from the dashboard
   - Add them to your `.env` file

5. **Start the application**:
   ```bash
   # Terminal 1: Start backend
   npm run server

   # Terminal 2: Start frontend
   npm run dev
   ```

## API Endpoints

### Doctors
- `GET /api/doctors` - Search/filter doctors
- `POST /api/doctors/register` - Doctor registration
- `POST /api/doctors/login` - Doctor authentication

### Reviews
- `POST /api/reviews` - Submit verified patient review

### Payments
- `POST /api/payments` - Create Stripe payment intent

## Database Schema

Complete GDPR/HIPAA-compliant PostgreSQL schema with **10 primary tables**, **40+ indexes**, and **comprehensive audit logging**.

**Core Tables:**
- `doctors` - Doctor profiles with license verification and ratings
- `patients` - Patient data with medical history and health information
- `consultations` - Booking and consultation management
- `reviews` - Patient ratings and feedback system
- `payments` - Transaction tracking with Stripe integration
- `referrals` - Inter-doctor referrals with specialty tracking
- `files` - Encrypted document management
- `audit_logs` - Comprehensive activity and security logging
- `data_access_requests` - GDPR data subject rights management
- `consent_history` - Consent tracking and compliance records

**Compliance Features:**
- Data encryption at rest and in transit
- PCI DSS compliance for payments
- Audit trails for all sensitive data access
- Configurable data retention policies (default 7 years)
- GDPR right to access, rectification, erasure, and portability
- HIPAA protected health information (PHI) safeguards
- Consent management and withdrawal tracking
- Security event monitoring and logging

See `server/schema-comprehensive.sql` for the complete 500+ line SQL schema.

## Compliance Features

- **GDPR Compliance**: Data subject rights, consent management, data portability
- **HIPAA Compliance**: Protected health information safeguards, audit trails
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Audit Logging**: Comprehensive logging of all data access and modifications

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run server` - Start backend API server

## Security Notes

- Never commit `.env` files
- Use HTTPS in production
- Regularly rotate API keys
- Implement rate limiting
- Monitor audit logs

## License

This project is licensed under the MIT License.
