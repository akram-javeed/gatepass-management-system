-- CWPER Gatepass Database Setup
-- Complete database schema with sample data

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS approval_workflow;
DROP TABLE IF EXISTS gate_pass_items;
DROP TABLE IF EXISTS gate_pass_applications;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS cmaster;
DROP TABLE IF EXISTS officers;
DROP TABLE IF EXISTS railway_sse;
DROP TABLE IF EXISTS firm_master;
DROP TABLE IF EXISTS shops;

-- Create shops table
CREATE TABLE shops (
    shop_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create firm_master table
CREATE TABLE firm_master (
    firm_id SERIAL PRIMARY KEY,
    firm_name VARCHAR(200) NOT NULL,
    address TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(15),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create railway_sse table
CREATE TABLE railway_sse (
    sse_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    phone VARCHAR(15),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create officers table
CREATE TABLE officers (
    officer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    role VARCHAR(50), -- 'officer1', 'officer2', 'chos_npb', 'safety_officer'
    phone VARCHAR(15),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cmaster (Contract Master) table
CREATE TABLE cmaster (
    contract_id SERIAL PRIMARY KEY,
    loa_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    work_description TEXT,
    shop_id INTEGER REFERENCES shops(shop_id),
    firm_id INTEGER REFERENCES firm_master(firm_id),
    contractor_name VARCHAR(100),
    pan VARCHAR(20),
    gst VARCHAR(20),
    address TEXT,
    email VARCHAR(100),
    phone VARCHAR(15),
    contract_period_from DATE,
    contract_period_to DATE,
    executing_sse_id INTEGER REFERENCES railway_sse(sse_id),
    approved_officer_id INTEGER REFERENCES officers(officer_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for authentication
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin', 'contract_section', 'sse', 'safety_officer', 'officer1', 'officer2', 'chos_npb'
    email VARCHAR(100),
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table
CREATE TABLE user_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    session_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gate_pass_applications table
CREATE TABLE gate_pass_applications (
    application_id SERIAL PRIMARY KEY,
    loa_number VARCHAR(50) REFERENCES cmaster(loa_number),
    contract_supervisor_name VARCHAR(100) NOT NULL,
    supervisor_phone VARCHAR(15) NOT NULL,
    number_of_persons INTEGER NOT NULL,
    number_of_supervisors INTEGER NOT NULL,
    gate_pass_period_from DATE NOT NULL,
    gate_pass_period_to DATE NOT NULL,
    insurance_coverage VARCHAR(100),
    esi_insurance_no VARCHAR(100),
    labour_license_no VARCHAR(100),
    migration_license_no VARCHAR(100),
    uploaded_file_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sse_approved', 'safety_approved', 'officer1_approved', 'officer2_approved', 'final_approved', 'rejected'
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gate_pass_items table (Tools/Materials/Machinery)
CREATE TABLE gate_pass_items (
    item_id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES gate_pass_applications(application_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'Tools', 'Material', 'Machine'
    quantity VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create approval_workflow table
CREATE TABLE approval_workflow (
    workflow_id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES gate_pass_applications(application_id) ON DELETE CASCADE,
    step_name VARCHAR(50) NOT NULL, -- 'sse', 'safety_officer', 'officer1', 'officer2', 'chos_npb'
    approver_name VARCHAR(100) NOT NULL,
    approver_designation VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'approved', 'rejected', 'pending'
    remarks TEXT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data

-- Insert shops
INSERT INTO shops (name, location) VALUES
('Workshop A', 'Main Building, Ground Floor'),
('Workshop B', 'Main Building, First Floor'),
('Electrical Workshop', 'Electrical Building'),
('Mechanical Workshop', 'Mechanical Building'),
('Signal & Telecom Workshop', 'S&T Building'),
('Carriage & Wagon Workshop', 'C&W Building');

-- Insert firm_master
INSERT INTO firm_master (firm_name, address, contact_person, phone, email) VALUES
('ABC Construction Ltd', '123 Business Street, City, State - 123456', 'John Manager', '9876543210', 'contact@abc.com'),
('XYZ Engineering Pvt Ltd', '456 Tech Park, Metro City, State - 654321', 'Jane Director', '8765432109', 'info@xyz.com'),
('Railway Maintenance Corp', '789 Industrial Area, Railway Town, State - 987654', 'Robert CEO', '7654321098', 'admin@railmaint.com'),
('Network Solutions Inc', '321 Network Plaza, Tech City, State - 456789', 'Sarah Manager', '6543210987', 'contact@netsol.com'),
('Infrastructure Builders', '654 Construction Ave, Build City, State - 789123', 'Mike Supervisor', '5432109876', 'info@infrabuild.com'),
('Tech Services Ltd', '987 Service Road, Service Town, State - 321654', 'Lisa Coordinator', '4321098765', 'support@techserv.com');

-- Insert railway_sse
INSERT INTO railway_sse (name, designation, department, phone, email) VALUES
('Rajesh Kumar', 'Senior Section Engineer', 'Electrical', '9876543211', 'rajesh.sse@railway.gov.in'),
('Priya Sharma', 'Senior Section Engineer', 'Mechanical', '8765432110', 'priya.sse@railway.gov.in'),
('Amit Singh', 'Senior Section Engineer', 'Civil', '7654321099', 'amit.sse@railway.gov.in'),
('Sunita Patel', 'Senior Section Engineer', 'Signal & Telecom', '6543210988', 'sunita.sse@railway.gov.in'),
('Vikram Gupta', 'Senior Section Engineer', 'Carriage & Wagon', '5432109877', 'vikram.sse@railway.gov.in');

-- Insert officers
INSERT INTO officers (name, designation, role, phone, email) VALUES
('Dr. Anil Verma', 'Assistant Engineer', 'officer1', '9876543212', 'anil.officer@railway.gov.in'),
('Mrs. Kavita Joshi', 'Factory Manager', 'officer2', '8765432111', 'kavita.fm@railway.gov.in'),
('Mr. Suresh Reddy', 'Chief Operating Superintendent', 'chos_npb', '7654321100', 'suresh.chos@railway.gov.in'),
('Ms. Deepa Nair', 'Safety Officer', 'safety_officer', '6543210989', 'deepa.safety@railway.gov.in'),
('Mr. Ravi Mehta', 'Assistant Safety Officer', 'safety_officer', '5432109878', 'ravi.safety@railway.gov.in'),
('Dr. Sanjay Gupta', 'Chief Safety Officer', 'chos_npb', '4321098766', 'sanjay.chief@railway.gov.in');

-- Insert cmaster (contracts)
INSERT INTO cmaster (loa_number, date, work_description, shop_id, firm_id, contractor_name, pan, gst, address, email, phone, contract_period_from, contract_period_to, executing_sse_id, approved_officer_id) VALUES
('LOA/2024/001', '2024-01-15', 'Network AMC and Maintenance', 1, 1, 'John Contractor', 'ABCDE1234F', '12ABCDE1234F1Z5', '123 Business Street, City, State - 123456', 'contractor@abc.com', '9876543210', '2024-01-01', '2024-12-31', 1, 1),
('LOA/2024/002', '2024-02-10', 'Electrical System Upgrade', 3, 2, 'Jane Engineer', 'FGHIJ5678K', '34FGHIJ5678K2A3', '456 Tech Park, Metro City, State - 654321', 'jane@xyz.com', '8765432109', '2024-02-01', '2024-11-30', 1, 2),
('LOA/2024/003', '2024-03-05', 'Railway Track Maintenance', 2, 3, 'Robert Smith', 'KLMNO9012P', '56KLMNO9012P4B5', '789 Industrial Area, Railway Town, State - 987654', 'robert@railmaint.com', '7654321098', '2024-03-15', '2025-03-14', 3, 1),
('LOA/2024/004', '2024-04-20', 'Signal & Telecom Installation', 5, 4, 'Sarah Wilson', 'QRSTU3456V', '78QRSTU3456V6C7', '321 Network Plaza, Tech City, State - 456789', 'sarah@netsol.com', '6543210987', '2024-04-01', '2024-10-31', 4, 2),
('LOA/2024/005', '2024-05-12', 'Building Construction Work', 6, 5, 'Mike Builder', 'WXYZ7890A', '90WXYZ7890A8D9', '654 Construction Ave, Build City, State - 789123', 'mike@infrabuild.com', '5432109876', '2024-05-01', '2024-12-31', 5, 3),
('LOA/2024/006', '2024-06-08', 'IT Infrastructure Setup', 4, 6, 'Lisa Tech', 'BCDEF2345G', '23BCDEF2345G5E6', '987 Service Road, Service Town, State - 321654', 'lisa@techserv.com', '4321098765', '2024-06-01', '2024-09-30', 2, 1);

-- Insert users (passwords are hashed versions of the demo passwords)
INSERT INTO users (username, password_hash, name, role, email, phone) VALUES
('admin', '$2b$10$hash_admin123', 'System Administrator', 'admin', 'admin@railway.gov.in', '9999999999'),
('contract_user', '$2b$10$hash_contract123', 'Contract Section User', 'contract_section', 'contract@railway.gov.in', '9999999998'),
('sse_user', '$2b$10$hash_sse123', 'SSE User', 'sse', 'sse@railway.gov.in', '9999999997'),
('safety_user', '$2b$10$hash_safety123', 'Safety Officer', 'safety_officer', 'safety@railway.gov.in', '9999999996'),
('officer1_user', '$2b$10$hash_officer123', 'Officer 1', 'officer1', 'officer1@railway.gov.in', '9999999995'),
('officer2_user', '$2b$10$hash_officer123', 'Officer 2', 'officer2', 'officer2@railway.gov.in', '9999999994'),
('chos_user', '$2b$10$hash_chos123', 'Ch.OS/NPB User', 'chos_npb', 'chos@railway.gov.in', '9999999993');

-- Insert sample gate pass applications
INSERT INTO gate_pass_applications (loa_number, contract_supervisor_name, supervisor_phone, number_of_persons, number_of_supervisors, gate_pass_period_from, gate_pass_period_to, insurance_coverage, esi_insurance_no, labour_license_no, migration_license_no, status) VALUES
('LOA/2024/001', 'Supervisor A', '9876543201', 10, 2, '2024-07-01', '2024-07-31', '10', 'ESI123456', 'LC789012', 'ML345678', 'pending'),
('LOA/2024/002', 'Supervisor B', '8765432102', 15, 3, '2024-07-15', '2024-08-15', '15', 'ESI234567', 'LC890123', 'ML456789', 'sse_approved'),
('LOA/2024/003', 'Supervisor C', '7654321103', 8, 1, '2024-08-01', '2024-08-30', '8', 'ESI345678', 'LC901234', 'ML567890', 'safety_approved'),
('LOA/2024/004', 'Supervisor D', '6543210104', 12, 2, '2024-08-15', '2024-09-15', '12', 'ESI456789', 'LC012345', 'ML678901', 'officer1_approved');

-- Insert sample gate pass items
INSERT INTO gate_pass_items (application_id, description, type, quantity) VALUES
(1, 'Electrical Testing Equipment', 'Tools', '5 sets'),
(1, 'Safety Helmets', 'Material', '10 pieces'),
(1, 'Cable Laying Machine', 'Machine', '1 unit'),
(2, 'Welding Equipment', 'Tools', '3 sets'),
(2, 'Steel Rods', 'Material', '100 pieces'),
(2, 'Crane', 'Machine', '1 unit'),
(3, 'Track Maintenance Tools', 'Tools', '8 sets'),
(3, 'Railway Sleepers', 'Material', '50 pieces'),
(3, 'Ballast Cleaning Machine', 'Machine', '1 unit'),
(4, 'Signal Testing Kit', 'Tools', '2 sets'),
(4, 'Optical Fiber Cables', 'Material', '1000 meters'),
(4, 'Signal Installation Crane', 'Machine', '1 unit');

-- Insert sample approval workflow
INSERT INTO approval_workflow (application_id, step_name, approver_name, approver_designation, status, approved_at) VALUES
(2, 'sse', 'Rajesh Kumar', 'Senior Section Engineer', 'approved', '2024-07-16 10:30:00'),
(3, 'sse', 'Amit Singh', 'Senior Section Engineer', 'approved', '2024-08-02 09:15:00'),
(3, 'safety_officer', 'Ms. Deepa Nair', 'Safety Officer', 'approved', '2024-08-02 14:20:00'),
(4, 'sse', 'Sunita Patel', 'Senior Section Engineer', 'approved', '2024-08-16 11:45:00'),
(4, 'safety_officer', 'Ms. Deepa Nair', 'Safety Officer', 'approved', '2024-08-16 15:30:00'),
(4, 'officer1', 'Dr. Anil Verma', 'Assistant Engineer', 'approved', '2024-08-17 10:00:00');

-- Create indexes for better performance
CREATE INDEX idx_cmaster_loa_number ON cmaster(loa_number);
CREATE INDEX idx_gate_pass_applications_loa ON gate_pass_applications(loa_number);
CREATE INDEX idx_gate_pass_applications_status ON gate_pass_applications(status);
CREATE INDEX idx_approval_workflow_application ON approval_workflow(application_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- Create views for common queries
CREATE VIEW v_contract_details AS
SELECT 
    c.loa_number,
    c.date,
    c.work_description,
    s.name as shop_name,
    f.firm_name,
    c.contractor_name,
    c.pan,
    c.gst,
    c.address,
    c.email,
    c.phone,
    c.contract_period_from,
    c.contract_period_to,
    sse.name as sse_name,
    o.name as approved_officer_name
FROM cmaster c
LEFT JOIN shops s ON c.shop_id = s.shop_id
LEFT JOIN firm_master f ON c.firm_id = f.firm_id
LEFT JOIN railway_sse sse ON c.executing_sse_id = sse.sse_id
LEFT JOIN officers o ON c.approved_officer_id = o.officer_id;

CREATE VIEW v_application_details AS
SELECT 
    gpa.*,
    c.firm_name,
    c.contractor_name,
    c.work_description,
    c.contract_period_from,
    c.contract_period_to
FROM gate_pass_applications gpa
JOIN v_contract_details c ON gpa.loa_number = c.loa_number;

COMMIT;
