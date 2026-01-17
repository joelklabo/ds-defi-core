-- DS DeFi Core - Database Initialization
-- This script runs when the PostgreSQL container first starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create custom types (enums)
DO $$ BEGIN
    CREATE TYPE agent_level AS ENUM (
        'L0_CANDIDATE',
        'L1_WORKER',
        'L2_EMERGENT',
        'L3_SOVEREIGN',
        'L4_MANAGER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE agent_type AS ENUM ('AI', 'HUMAN', 'HYBRID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'AVAILABLE',
        'CLAIMED',
        'IN_PROGRESS',
        'SUBMITTED',
        'UNDER_REVIEW',
        'COMPLETED',
        'DISPUTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE workflow_domain AS ENUM (
        'PUBLISHING',
        'PODCAST',
        'VIDEO',
        'MUSIC',
        'WEB',
        'VOICE',
        'SOCIAL',
        'ARCHITECTURE',
        'RESEARCH',
        'ART',
        'MODERATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE dsdefi TO dsdefi;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'DS DeFi database initialized successfully';
    RAISE NOTICE 'Sovereign by Design. Free by Nature.';
END $$;
