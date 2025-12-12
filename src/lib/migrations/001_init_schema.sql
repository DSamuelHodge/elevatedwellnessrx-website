-- Create enum types
CREATE TYPE contact_reason AS ENUM ('general', 'new', 'transfer', 'refill', 'rpm');
CREATE TYPE waitlist_status AS ENUM ('active', 'contacted', 'enrolled');
CREATE TYPE service_preference AS ENUM ('pickup', 'delivery');

-- ============================================
-- Contact Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255) NOT NULL,
  reason contact_reason NOT NULL,
  message TEXT NOT NULL,
  consent BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);

-- ============================================
-- Waitlist Entries Table
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  status waitlist_status NOT NULL DEFAULT 'active',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_waitlist_entries_email ON waitlist_entries(email);
CREATE INDEX idx_waitlist_entries_status ON waitlist_entries(status);
CREATE INDEX idx_waitlist_entries_timestamp ON waitlist_entries(timestamp);

-- ============================================
-- Refill Requests Table
-- ============================================
CREATE TABLE IF NOT EXISTS refill_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  prescription_numbers TEXT NOT NULL,
  medication_names TEXT NOT NULL,
  preferred_service service_preference NOT NULL,
  notes TEXT,
  consent BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refill_requests_email ON refill_requests(email);
CREATE INDEX idx_refill_requests_patient_name ON refill_requests(patient_name);
CREATE INDEX idx_refill_requests_created_at ON refill_requests(created_at);

-- ============================================
-- Transfer Requests Table
-- ============================================
CREATE TABLE IF NOT EXISTS transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rx_number VARCHAR(50) NOT NULL,
  rx_fill_date DATE NOT NULL,
  
  transfer_to_pharmacy_name VARCHAR(255) NOT NULL,
  transfer_to_pharmacy_address1 VARCHAR(255) NOT NULL,
  transfer_to_pharmacy_address2 VARCHAR(255),
  transfer_to_pharmacy_city VARCHAR(100) NOT NULL,
  transfer_to_pharmacy_state VARCHAR(2) NOT NULL,
  transfer_to_pharmacy_zip VARCHAR(10) NOT NULL,
  transfer_to_pharmacy_phone VARCHAR(30) NOT NULL,
  transfer_to_pharmacy_ncdp VARCHAR(7),
  
  transfer_rx_remark TEXT,
  consent BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transfer_requests_rx_number ON transfer_requests(rx_number);
CREATE INDEX idx_transfer_requests_created_at ON transfer_requests(created_at);

-- ============================================
-- Splash Modal Submissions Table
-- ============================================
CREATE TABLE IF NOT EXISTS splash_modal_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_splash_modal_submissions_email ON splash_modal_submissions(email);
CREATE INDEX idx_splash_modal_submissions_created_at ON splash_modal_submissions(created_at);

-- ============================================
-- Enable RLS (Row Level Security)
-- ============================================
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE refill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE splash_modal_submissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (Allow all for now - adjust as needed)
-- ============================================
CREATE POLICY "Enable insert for all users" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all users" ON contact_messages FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON waitlist_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all users" ON waitlist_entries FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON waitlist_entries FOR UPDATE USING (true);

CREATE POLICY "Enable insert for all users" ON refill_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all users" ON refill_requests FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON transfer_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all users" ON transfer_requests FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON splash_modal_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read for all users" ON splash_modal_submissions FOR SELECT USING (true);
