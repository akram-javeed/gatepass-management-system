-- Sample Queries for CWPER Gatepass Application

-- 1. LOA Search Query (for gate pass application form)
SELECT 
    loa_number,
    firm_name,
    contractor_name,
    pan,
    gst,
    address,
    email,
    phone,
    contract_period_from,
    contract_period_to
FROM v_contract_details 
WHERE loa_number ILIKE '%LOA/2024%'
ORDER BY loa_number;

-- 2. Get all pending applications for SSE dashboard
SELECT 
    application_id,
    loa_number,
    contract_supervisor_name,
    supervisor_phone,
    number_of_persons,
    number_of_supervisors,
    gate_pass_period_from,
    gate_pass_period_to,
    submitted_at,
    status
FROM gate_pass_applications 
WHERE status = 'pending'
ORDER BY submitted_at DESC;

-- 3. Get complete application details with contract info
SELECT 
    gpa.*,
    vcd.firm_name,
    vcd.contractor_name,
    vcd.work_description,
    vcd.contract_period_from,
    vcd.contract_period_to,
    vcd.pan,
    vcd.gst,
    vcd.address as contract_address,
    vcd.email as contract_email,
    vcd.phone as contract_phone
FROM gate_pass_applications gpa
JOIN v_contract_details vcd ON gpa.loa_number = vcd.loa_number
WHERE gpa.application_id = 1;

-- 4. Get all items for a specific application
SELECT 
    item_id,
    description,
    type,
    quantity
FROM gate_pass_items 
WHERE application_id = 1
ORDER BY type, description;

-- 5. Get approval workflow for an application
SELECT 
    workflow_id,
    step_name,
    approver_name,
    approver_designation,
    status,
    remarks,
    approved_at
FROM approval_workflow 
WHERE application_id = 1
ORDER BY workflow_id;

-- 6. Get applications by status for different dashboards
-- For SSE Dashboard
SELECT * FROM v_application_details WHERE status = 'pending';

-- For Safety Officer Dashboard  
SELECT * FROM v_application_details WHERE status = 'sse_approved';

-- For Officer 1 Dashboard
SELECT * FROM v_application_details WHERE status = 'safety_approved';

-- For Officer 2 Dashboard
SELECT * FROM v_application_details WHERE status = 'officer1_approved';

-- For Ch.OS/NPB Dashboard
SELECT * FROM v_application_details WHERE status = 'officer2_approved';

-- 7. Authentication query
SELECT 
    user_id,
    username,
    name,
    role,
    email,
    phone,
    is_active
FROM users 
WHERE username = 'admin' AND is_active = TRUE;

-- 8. Get dropdown data for forms
-- Get all shops
SELECT shop_id, name FROM shops ORDER BY name;

-- Get all firms
SELECT firm_id, firm_name FROM firm_master ORDER BY firm_name;

-- Get all SSE officers
SELECT sse_id, name FROM railway_sse ORDER BY name;

-- Get all officers
SELECT officer_id, name, designation FROM officers ORDER BY name;

-- 9. Statistics queries for dashboards
-- Total applications by status
SELECT 
    status,
    COUNT(*) as count
FROM gate_pass_applications 
GROUP BY status;

-- Applications submitted today
SELECT COUNT(*) as today_applications
FROM gate_pass_applications 
WHERE DATE(submitted_at) = CURRENT_DATE;

-- Applications by month
SELECT 
    DATE_TRUNC('month', submitted_at) as month,
    COUNT(*) as applications
FROM gate_pass_applications 
GROUP BY DATE_TRUNC('month', submitted_at)
ORDER BY month DESC;

-- 10. Search LOA numbers (for autocomplete)
SELECT DISTINCT loa_number 
FROM cmaster 
WHERE loa_number ILIKE '%' || $1 || '%'
ORDER BY loa_number
LIMIT 10;

-- 11. Insert new gate pass application
INSERT INTO gate_pass_applications (
    loa_number,
    contract_supervisor_name,
    supervisor_phone,
    number_of_persons,
    number_of_supervisors,
    gate_pass_period_from,
    gate_pass_period_to,
    insurance_coverage,
    esi_insurance_no,
    labour_license_no,
    migration_license_no,
    status
) VALUES (
    'LOA/2024/001',
    'Test Supervisor',
    '9876543210',
    10,
    2,
    '2024-08-01',
    '2024-08-31',
    '10 persons',
    'ESI123456',
    'LC789012',
    'ML345678',
    'pending'
) RETURNING application_id;

-- 12. Insert gate pass items
INSERT INTO gate_pass_items (application_id, description, type, quantity) VALUES
(1, 'Testing Equipment', 'Tools', '5 sets'),
(1, 'Safety Gear', 'Material', '10 pieces'),
(1, 'Lifting Machine', 'Machine', '1 unit');

-- 13. Update application status and add approval workflow
UPDATE gate_pass_applications 
SET status = 'sse_approved', updated_at = CURRENT_TIMESTAMP 
WHERE application_id = 1;

INSERT INTO approval_workflow (
    application_id,
    step_name,
    approver_name,
    approver_designation,
    status,
    approved_at
) VALUES (
    1,
    'sse',
    'Rajesh Kumar',
    'Senior Section Engineer',
    'approved',
    CURRENT_TIMESTAMP
);

-- 14. Get user dashboard data
-- For Contract Section
SELECT 
    COUNT(*) as total_contracts,
    COUNT(CASE WHEN DATE(date) = CURRENT_DATE THEN 1 END) as today_contracts
FROM cmaster;

-- For SSE
SELECT 
    COUNT(*) as pending_applications
FROM gate_pass_applications 
WHERE status = 'pending';

-- For Safety Officer
SELECT 
    COUNT(*) as pending_applications
FROM gate_pass_applications 
WHERE status = 'sse_approved';

-- 15. Advanced search with filters
SELECT 
    gpa.*,
    vcd.firm_name,
    vcd.contractor_name
FROM gate_pass_applications gpa
JOIN v_contract_details vcd ON gpa.loa_number = vcd.loa_number
WHERE 
    ($1 IS NULL OR gpa.loa_number ILIKE '%' || $1 || '%')
    AND ($2 IS NULL OR vcd.firm_name ILIKE '%' || $2 || '%')
    AND ($3 IS NULL OR gpa.status = $3)
    AND ($4 IS NULL OR gpa.submitted_at >= $4)
    AND ($5 IS NULL OR gpa.submitted_at <= $5)
ORDER BY gpa.submitted_at DESC;
