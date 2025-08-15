-- CWPER Gatepass Database Schema

-- Create database tables for the CWPER Gatepass application

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Firm master table
CREATE TABLE IF NOT EXISTS firm_master (
    id SERIAL PRIMARY KEY,
    firm_name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_person VARCHAR(255),
    phone VARCHAR(15),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Railway SSE table
CREATE TABLE IF NOT EXISTS railway_sse (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(255),
    phone VARCHAR(15),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Officers table
CREATE TABLE IF NOT EXISTS officers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    employee_id VARCHAR(50),
    phone VARCHAR(15),
    email VARCHAR(255),
    role VARCHAR(50), -- officer1, officer2, chos_npb
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contract master table
CREATE TABLE IF NOT EXISTS cmaster (
    id SERIAL PRIMARY KEY,
    loa_number VARCHAR(255) UNIQUE NOT NULL,
    date DATE NOT NULL,
    work_description TEXT,
    shop_id INTEGER REFERENCES shops(id),
    firm_id INTEGER REFERENCES firm_master(id),
    contractor_name VARCHAR(255),
    pan VARCHAR(20),
    gst VARCHAR(25),
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(15),
    contract_period_from DATE,
    contract_period_to DATE,
    executing_sse_id INTEGER REFERENCES railway_sse(id),
    approved_officer_id INTEGER REFERENCES officers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gate pass applications table
CREATE TABLE IF NOT EXISTS gate_pass_applications (
    id SERIAL PRIMARY KEY,
    loa_number VARCHAR(255) REFERENCES cmaster(loa_number),
    contract_supervisor_name VARCHAR(255),
    supervisor_phone VARCHAR(15),
    gate_pass_period_from DATE,
    gate_pass_period_to DATE,
    insurance_coverage VARCHAR(100),
    esi_insurance_no VARCHAR(100),
    labour_license_no VARCHAR(100),
    migration_license_no VARCHAR(100),
    uploaded_file_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'submitted', -- submitted, sse_approved, safety_approved, officer1_approved, officer2_approved, final_approved, rejected
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    final_status TEXT,
    pdf_generated BOOLEAN DEFAULT false,
    sent_date DATE
);

-- Tools/Materials/Machinery table
CREATE TABLE IF NOT EXISTS gate_pass_items (
    id SERIAL PRIMARY KEY,
    gate_pass_id INTEGER REFERENCES gate_pass_applications(id),
    description TEXT,
    item_type VARCHAR(50), -- Tools, Material, Machine
    quantity VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approval workflow table
CREATE TABLE IF NOT EXISTS approval_workflow (
    id SERIAL PRIMARY KEY,
    gate_pass_id INTEGER REFERENCES gate_pass_applications(id),
    approver_role VARCHAR(50), -- sse, safety_officer, officer1, officer2, chos_npb
    approver_id INTEGER,
    action VARCHAR(50), -- approved, rejected, modified
    remarks TEXT,
    approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    digital_signature_used BOOLEAN DEFAULT FALSE
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- contract_section, sse, safety_officer, officer1, officer2, chos_npb
    full_name VARCHAR(255),
    employee_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO shops (name, location) VALUES 
('Workshop A', 'North Section'),
('Workshop B', 'South Section'),
('Electrical Shop', 'Central Section'),
('Mechanical Shop', 'East Section');

INSERT INTO firm_master (firm_name, address, contact_person, phone, email) VALUES 
('ABC Construction Ltd', '123 Business Street, City, State - 123456', 'John Manager', '9876543210', 'contact@abc.com'),
('XYZ Engineering', '456 Industrial Area, City, State - 654321', 'Jane Director', '9876543211', 'info@xyz.com'),
('PQR Contractors', '789 Commercial Zone, City, State - 987654', 'Bob Owner', '9876543212', 'admin@pqr.com'),
('LMN Infrastructure', '321 Tech Park, City, State - 456789', 'Alice CEO', '9876543213', 'hello@lmn.com');

INSERT INTO railway_sse (name, employee_id, department, phone, email) VALUES 
('SSE John Doe', 'SSE001', 'Engineering', '9876543220', 'john.sse@railway.gov'),
('SSE Jane Smith', 'SSE002', 'Mechanical', '9876543221', 'jane.sse@railway.gov'),
('SSE Mike Johnson', 'SSE003', 'Electrical', '9876543222', 'mike.sse@railway.gov');

INSERT INTO officers (name, designation, employee_id, phone, email, role) VALUES 
('Officer A Kumar', 'Assistant Engineer', 'OFF001', '9876543230', 'a.kumar@railway.gov', 'officer1'),
('Officer B Singh', 'Factory Manager', 'OFF002', '9876543231', 'b.singh@railway.gov', 'officer2'),
('Officer C Sharma', 'Ch.OS/NPB', 'OFF003', '9876543232', 'c.sharma@railway.gov', 'chos_npb');

-- Insert demo users with proper credentials
INSERT INTO users (username, email, password_hash, role, full_name, employee_id) VALUES 
('contract_user', 'contract@railway.gov', '$2b$10$example_hash', 'contract_section', 'Contract Section User', 'CON001'),
('sse_user', 'sse@railway.gov', '$2b$10$example_hash', 'sse', 'SSE John Doe', 'SSE001'),
('safety_user', 'safety@railway.gov', '$2b$10$example_hash', 'safety_officer', 'Safety Officer Kumar', 'SAF001'),
('officer1_user', 'officer1@railway.gov', '$2b$10$example_hash', 'officer1', 'Officer A Kumar', 'OFF001'),
('officer2_user', 'officer2@railway.gov', '$2b$10$example_hash', 'officer2', 'Officer B Singh (Factory Manager)', 'OFF002'),
('chos_user', 'chos@railway.gov', '$2b$10$example_hash', 'chos_npb', 'Ch.OS/NPB Officer C Sharma', 'OFF003');

-- Add admin user to the existing users table
INSERT INTO users (username, email, password_hash, role, full_name, employee_id) VALUES 
('admin', 'admin@railway.gov', '$2b$10$example_hash', 'admin', 'System Administrator', 'ADM001');

-- Update existing demo users with proper credentials
UPDATE users SET password_hash = '$2b$10$example_hash' WHERE username = 'contract_user';
UPDATE users SET password_hash = '$2b$10$example_hash' WHERE username = 'sse_user';
UPDATE users SET password_hash = '$2b$10$example_hash' WHERE username = 'safety_user';
UPDATE users SET password_hash = '$2b$10$example_hash' WHERE username = 'officer1_user';
UPDATE users SET password_hash = '$2b$10$example_hash' WHERE username = 'officer2_user';
UPDATE users SET password_hash = '$2b$10$example_hash' WHERE username = 'chos_user';

-- Add session management table
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
