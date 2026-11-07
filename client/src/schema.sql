-- -------------------------------------------------------------
-- LOCAL CONNECT: Database Schema Specification
-- Target DBMS: PostgreSQL / MySQL
-- -------------------------------------------------------------

-- 1. Users Table (Handles Students, Employers, and Admins)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'employer', 'admin')) DEFAULT 'student',
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Companies / Employers Profile Table
CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    location VARCHAR(150) NOT NULL,
    website_url VARCHAR(255),
    description TEXT
);

-- 3. Job & OJT Listings Table
CREATE TABLE job_listings (
    job_id SERIAL PRIMARY KEY,
    employer_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('OJT / Internship', 'Full-time Job', 'Part-time Job')),
    work_mode VARCHAR(20) CHECK (work_mode IN ('On-site', 'Hybrid', 'Remote')),
    location VARCHAR(150) NOT NULL,
    stipend_amount VARCHAR(50),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, closed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Applications Table (Links Students to Job Listings)
CREATE TABLE applications (
    application_id SERIAL PRIMARY KEY,
    job_id INT REFERENCES job_listings(job_id) ON DELETE CASCADE,
    student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    resume_url VARCHAR(255),
    status VARCHAR(20) CHECK (status IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')) DEFAULT 'Pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);