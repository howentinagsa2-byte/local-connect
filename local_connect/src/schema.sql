-- =============================================================
-- LOCAL CONNECT: PostgreSQL Database Schema Specification
-- Target DBMS: PostgreSQL 13+
-- Project: Local Job & OJT Placement Portal
-- =============================================================

-- Enable UUID extension for secure, unique primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. USERS TABLE
-- Handles identity for Students, Employers, and Admins
-- -------------------------------------------------------------
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'employer', 'admin')),
    phone_number VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 2. EMPLOYER PROFILES TABLE
-- Extended company details linked to employer user accounts
-- -------------------------------------------------------------
DROP TABLE IF EXISTS employer_profiles CASCADE;
CREATE TABLE employer_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    location VARCHAR(150) NOT NULL,
    website_url TEXT,
    company_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 3. JOB & OJT LISTINGS TABLE
-- Stores OJT / Internship and Full-time postings
-- -------------------------------------------------------------
DROP TABLE IF EXISTS job_listings CASCADE;
CREATE TABLE job_listings (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('OJT / Internship', 'Full-time Job', 'Part-time Job')),
    work_mode VARCHAR(20) NOT NULL CHECK (work_mode IN ('On-site', 'Hybrid', 'Remote')),
    location VARCHAR(150) NOT NULL,
    stipend_amount VARCHAR(50),
    description TEXT NOT NULL,
    requirements TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 4. APPLICATIONS TABLE
-- Links Student users to Job Listings (Includes Resume upload paths)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS applications CASCADE;
CREATE TABLE applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_listings(job_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    cover_letter TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_job_application UNIQUE (job_id, student_id)
);

-- -------------------------------------------------------------
-- INDEXES FOR OPTIMIZED QUERY PERFORMANCE
-- -------------------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_job_listings_category ON job_listings(category);
CREATE INDEX idx_job_listings_status ON job_listings(status);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_job ON applications(job_id);

-- -------------------------------------------------------------
-- AUTOMATIC TIMESTAMP TRIGGER SETUP
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

CREATE TRIGGER update_job_listings_timestamp BEFORE UPDATE ON job_listings
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();