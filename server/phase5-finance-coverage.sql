-- GlobalDoc Connect - Phase 5 Finance / Coverage OS
-- Patient wallets, invoices, coverage claims, sponsorship pools,
-- payment reconciliation, and service price catalog.
-- Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS service_price_catalog (
  id TEXT PRIMARY KEY,
  service_code TEXT UNIQUE NOT NULL,
  service_name TEXT NOT NULL,
  service_type TEXT DEFAULT 'consultation',
  facility_id TEXT,
  currency TEXT DEFAULT 'NGN',
  base_price NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_wallets (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_code TEXT,
  wallet_code TEXT UNIQUE NOT NULL,
  currency TEXT DEFAULT 'NGN',
  balance NUMERIC DEFAULT 0,
  sponsor_balance NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  wallet_id TEXT,
  patient_id TEXT,
  patient_code TEXT,
  transaction_type TEXT DEFAULT 'credit',
  amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  reference TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_invoices (
  id TEXT PRIMARY KEY,
  invoice_code TEXT UNIQUE NOT NULL,
  patient_id TEXT,
  patient_code TEXT,
  facility_id TEXT,
  consultation_id TEXT,
  currency TEXT DEFAULT 'NGN',
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  sponsor_amount NUMERIC DEFAULT 0,
  total_due NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  due_date TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  service_code TEXT,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  line_total NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coverage_claims (
  id TEXT PRIMARY KEY,
  claim_code TEXT UNIQUE NOT NULL,
  invoice_id TEXT,
  patient_id TEXT,
  patient_code TEXT,
  payer_name TEXT,
  coverage_type TEXT DEFAULT 'insurance',
  amount_claimed NUMERIC DEFAULT 0,
  amount_approved NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsorship_pools (
  id TEXT PRIMARY KEY,
  pool_code TEXT UNIQUE NOT NULL,
  sponsor_name TEXT NOT NULL,
  facility_id TEXT,
  target_group TEXT,
  currency TEXT DEFAULT 'NGN',
  total_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_reconciliations (
  id TEXT PRIMARY KEY,
  reconciliation_code TEXT UNIQUE NOT NULL,
  facility_id TEXT,
  payment_reference TEXT,
  expected_amount NUMERIC DEFAULT 0,
  received_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_catalog_facility ON service_price_catalog(facility_id, active);
CREATE INDEX IF NOT EXISTS idx_wallet_patient ON patient_wallets(patient_id, patient_code);
CREATE INDEX IF NOT EXISTS idx_wallet_code ON patient_wallets(wallet_code);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_patient ON patient_invoices(patient_id, patient_code);
CREATE INDEX IF NOT EXISTS idx_invoice_facility ON patient_invoices(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_claim_invoice ON coverage_claims(invoice_id, status);
CREATE INDEX IF NOT EXISTS idx_sponsor_facility ON sponsorship_pools(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_reconciliation_facility ON payment_reconciliations(facility_id, status);

CREATE OR REPLACE FUNCTION update_phase5_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_service_price_catalog_updated_at ON service_price_catalog;
CREATE TRIGGER update_service_price_catalog_updated_at BEFORE UPDATE ON service_price_catalog FOR EACH ROW EXECUTE FUNCTION update_phase5_updated_at();

DROP TRIGGER IF EXISTS update_patient_wallets_updated_at ON patient_wallets;
CREATE TRIGGER update_patient_wallets_updated_at BEFORE UPDATE ON patient_wallets FOR EACH ROW EXECUTE FUNCTION update_phase5_updated_at();

DROP TRIGGER IF EXISTS update_wallet_transactions_updated_at ON wallet_transactions;
CREATE TRIGGER update_wallet_transactions_updated_at BEFORE UPDATE ON wallet_transactions FOR EACH ROW EXECUTE FUNCTION update_phase5_updated_at();

DROP TRIGGER IF EXISTS update_patient_invoices_updated_at ON patient_invoices;
CREATE TRIGGER update_patient_invoices_updated_at BEFORE UPDATE ON patient_invoices FOR EACH ROW EXECUTE FUNCTION update_phase5_updated_at();

DROP TRIGGER IF EXISTS update_coverage_claims_updated_at ON coverage_claims;
CREATE TRIGGER update_coverage_claims_updated_at BEFORE UPDATE ON coverage_claims FOR EACH ROW EXECUTE FUNCTION update_phase5_updated_at();

DROP TRIGGER IF EXISTS update_sponsorship_pools_updated_at ON sponsorship_pools;
CREATE TRIGGER update_sponsorship_pools_updated_at BEFORE UPDATE ON sponsorship_pools FOR EACH ROW EXECUTE FUNCTION update_phase5_updated_at();

DROP TRIGGER IF EXISTS update_payment_reconciliations_updated_at ON payment_reconciliations;
CREATE TRIGGER update_payment_reconciliations_updated_at BEFORE UPDATE ON payment_reconciliations FOR EACH ROW EXECUTE FUNCTION update_phase5_updated_at();
