-- Description: Initial database schema for Field Operations Tracking System

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: field_agents
-- =====================================================
CREATE TABLE IF NOT EXISTS field_agents (
    agent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    village VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    agent_type VARCHAR(50) CHECK (agent_type IN ('full_time', 'part_time', 'contractor')),
    registration_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending_verification', 'active', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_field_agents_phone ON field_agents(phone);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_field_agents_status ON field_agents(status);

-- Create index on agent_type for filtering
CREATE INDEX IF NOT EXISTS idx_field_agents_type ON field_agents(agent_type);

-- =====================================================
-- Table: data_submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS data_submissions (
    submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES field_agents(agent_id) ON DELETE CASCADE,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(50) NOT NULL CHECK (category IN ('survey', 'inspection', 'collection', 'delivery')),
    location_gps_lat DECIMAL(10, 8),
    location_gps_long DECIMAL(11, 8),
    photo_url TEXT,
    quantity_reported DECIMAL(10, 2) NOT NULL,
    quantity_verified DECIMAL(10, 2),
    quality_metrics JSONB DEFAULT '{}',
    notes TEXT,
    calculated_score DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'verified', 'rejected', 'flagged')),
    fraud_flags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    verified_at TIMESTAMP
);

-- Create index on agent_id for faster joins and filtering
CREATE INDEX IF NOT EXISTS idx_data_submissions_agent_id ON data_submissions(agent_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_data_submissions_status ON data_submissions(status);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_data_submissions_category ON data_submissions(category);

-- Create index on submission_date for date range queries
CREATE INDEX IF NOT EXISTS idx_data_submissions_date ON data_submissions(submission_date);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_data_submissions_created_at ON data_submissions(created_at DESC);

-- =====================================================
-- Triggers for updated_at timestamp
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for field_agents table
CREATE TRIGGER update_field_agents_updated_at
    BEFORE UPDATE ON field_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE field_agents IS 'Stores information about field agents who submit data';
COMMENT ON COLUMN field_agents.agent_id IS 'Unique identifier for the agent (UUID)';
COMMENT ON COLUMN field_agents.phone IS 'Unique phone number for agent identification';
COMMENT ON COLUMN field_agents.agent_type IS 'Employment type: full_time, part_time, or contractor';
COMMENT ON COLUMN field_agents.status IS 'Agent verification status: pending_verification, active, or suspended';
COMMENT ON COLUMN field_agents.registration_date IS 'Date when the agent registered';

COMMENT ON TABLE data_submissions IS 'Stores data submissions from field agents';
COMMENT ON COLUMN data_submissions.submission_id IS 'Unique identifier for the submission (UUID)';
COMMENT ON COLUMN data_submissions.agent_id IS 'Foreign key reference to field_agents';
COMMENT ON COLUMN data_submissions.category IS 'Type of submission: survey, inspection, collection, or delivery';
COMMENT ON COLUMN data_submissions.quality_metrics IS 'JSONB object containing completeness_score (0-100) and accuracy_flag (boolean)';
COMMENT ON COLUMN data_submissions.calculated_score IS 'Auto-calculated quality score (computed field)';
COMMENT ON COLUMN data_submissions.status IS 'Submission status: draft, submitted, verified, rejected, or flagged';
COMMENT ON COLUMN data_submissions.fraud_flags IS 'JSONB array of fraud detection flags';
COMMENT ON COLUMN data_submissions.quantity_verified IS 'Verified quantity (nullable - filled after verification)';
COMMENT ON COLUMN data_submissions.verified_at IS 'Timestamp when submission was verified';
