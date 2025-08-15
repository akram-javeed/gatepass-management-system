// backend/scripts/fix-all-data.js
const pool = require('../db');

async function fixAllData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Starting data fixes...');
    
    // 1. Fix firm_ids
    const firmIdFix = await client.query(`
      UPDATE gate_pass_applications gpa
      SET 
        firm_id = c.firm_id::VARCHAR,
        firm_name = COALESCE(gpa.firm_name, f.firm_name),
        contractor_name = COALESCE(gpa.contractor_name, f.contractor_name),
        contractor_email = COALESCE(gpa.contractor_email, f.email),
        contractor_phone = COALESCE(gpa.contractor_phone, f.phone),
        contractor_address = COALESCE(gpa.contractor_address, f.address),
        firm_pan = COALESCE(gpa.firm_pan, f.pan),
        firm_gst = COALESCE(gpa.firm_gst, f.gst)
      FROM contracts c
      LEFT JOIN firms f ON c.firm_id = f.id
      WHERE gpa.loa_number = c.loa_number
      AND (gpa.firm_id = c.id::VARCHAR OR gpa.firm_name IS NULL)
      RETURNING gpa.id
    `);
    
    console.log(`Fixed firm_id for ${firmIdFix.rows.length} applications`);
    
    // 2. Migrate supervisors to JSON if not already done
    const supervisorMigration = await client.query(`
      UPDATE gate_pass_applications 
      SET supervisors = jsonb_build_array(
        jsonb_build_object(
          'id', '1',
          'name', contract_supervisor_name,
          'phone', supervisor_phone
        )
      )
      WHERE contract_supervisor_name IS NOT NULL 
      AND supervisors IS NULL
      RETURNING id
    `);
    
    console.log(`Migrated ${supervisorMigration.rows.length} supervisors to JSON format`);
    
    await client.query('COMMIT');
    console.log('All fixes completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during fixes:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the fixes
fixAllData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Failed:', error);
    process.exit(1);
  });