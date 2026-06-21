-- GlobalDoc Connect - Phase 4 Population Health Intelligence
-- Care programs, follow-up tasks, outreach campaigns, facility inventory alerts,
-- and quality metrics. Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS population_care_programs (
  id TEXT PRIMARY KEY,
  program_code TEXT UNIQUE NOT NULL,
  facility_id TEXT,
  program_name TEXT NOT NULL,
  program_type TEXT DEFAULT 'general',
  target_group TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_by_type TEXT DEFAULT 'admin',
  created_by_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_followup_tasks (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_code TEXT,
  facility_id TEXT,
  program_id TEXT,
  task_type TEXT DEFAULT 'follow_up',
  title TEXT NOT NULL,
  details TEXT,
  due_date TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'open',
  assigned_to TEXT,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id TEXT PRIMARY KEY,
  campaign_code TEXT UNIQUE NOT NULL,
  facility_id TEXT,
  campaign_name TEXT NOT NULL,
  audience TEXT,
  channel TEXT DEFAULT 'sms',
  message TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'draft',
  scheduled_for TEXT,
  created_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facility_inventory_alerts (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT DEFAULT 'medicine',
  current_stock TEXT,
  minimum_stock TEXT,
  severity TEXT DEFAULT 'warning',
  status TEXT DEFAULT 'open',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facility_quality_metrics (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value TEXT,
  period TEXT,
  risk_level TEXT DEFAULT 'normal',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_population_programs_facility ON population_care_programs(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_population_programs_code ON population_care_programs(program_code);
CREATE INDEX IF NOT EXISTS idx_followup_patient ON patient_followup_tasks(patient_id, patient_code);
CREATE INDEX IF NOT EXISTS idx_followup_facility ON patient_followup_tasks(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_outreach_facility ON outreach_campaigns(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_facility ON facility_inventory_alerts(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_quality_facility ON facility_quality_metrics(facility_id, period);

CREATE OR REPLACE FUNCTION update_phase4_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_population_care_programs_updated_at ON population_care_programs;
CREATE TRIGGER update_population_care_programs_updated_at BEFORE UPDATE ON population_care_programs FOR EACH ROW EXECUTE FUNCTION update_phase4_updated_at();

DROP TRIGGER IF EXISTS update_patient_followup_tasks_updated_at ON patient_followup_tasks;
CREATE TRIGGER update_patient_followup_tasks_updated_at BEFORE UPDATE ON patient_followup_tasks FOR EACH ROW EXECUTE FUNCTION update_phase4_updated_at();

DROP TRIGGER IF EXISTS update_outreach_campaigns_updated_at ON outreach_campaigns;
CREATE TRIGGER update_outreach_campaigns_updated_at BEFORE UPDATE ON outreach_campaigns FOR EACH ROW EXECUTE FUNCTION update_phase4_updated_at();

DROP TRIGGER IF EXISTS update_facility_inventory_alerts_updated_at ON facility_inventory_alerts;
CREATE TRIGGER update_facility_inventory_alerts_updated_at BEFORE UPDATE ON facility_inventory_alerts FOR EACH ROW EXECUTE FUNCTION update_phase4_updated_at();

DROP TRIGGER IF EXISTS update_facility_quality_metrics_updated_at ON facility_quality_metrics;
CREATE TRIGGER update_facility_quality_metrics_updated_at BEFORE UPDATE ON facility_quality_metrics FOR EACH ROW EXECUTE FUNCTION update_phase4_updated_at();
