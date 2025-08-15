const express = require("express");
const router = express.Router();
const pool = require("../db/index");
const bcrypt = require("bcrypt");

// GET users by role (with support for single role or multiple roles)
router.get("/", async (req, res) => {
  try {
    const { role, roles } = req.query;
    
    let query = 'SELECT id, username, full_name, employee_id, role, is_active, created_at FROM users WHERE is_active = true';
    let params = [];
    
    if (role) {
      // Single role filter
      query += ' AND role = $1';
      params.push(role);
    } else if (roles) {
      // Multiple roles filter (comma-separated)
      const roleArray = roles.split(',').map(r => r.trim());
      const placeholders = roleArray.map((_, index) => `$${index + 1}`).join(',');
      query += ` AND role IN (${placeholders})`;
      params = roleArray;
    }
    
    query += ' ORDER BY full_name ASC';
    
    console.log('Users query:', query);
    console.log('Users params:', params);
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      users: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      details: error.message
    });
  }
});

// GET specific user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    
    const result = await pool.query(
      'SELECT id, username, full_name, employee_id, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,  
      error: 'Failed to fetch user',
      details: error.message
    });
  }
});

// Create new user
router.post("/", async (req, res) => {
  try {
    const { username, email, password, role, fullName, employeeId } = req.body;
    
    // Validation
    if (!username || !email || !password || !role || !fullName) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: username, email, password, role, fullName' 
      });
    }

    // Check if username or email already exists
    const checkQuery = 'SELECT id FROM users WHERE username = $1 OR email = $2';
    const checkResult = await pool.query(checkQuery, [username, email]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Username or email already exists' 
      });
    }

    const hash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, full_name, employee_id, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING id, username, full_name, employee_id, role, is_active, created_at`,
      [username, email, hash, role, fullName, employeeId || null]
    );
    
    res.status(201).json({ 
      success: true,
      message: "User created successfully",
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      details: error.message
    });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { username, email, password, role, fullName, employeeId } = req.body;
    const { id } = req.params;
    
    // Check if user exists
    const checkQuery = 'SELECT id FROM users WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET username=$1, email=$2, password_hash=$3, role=$4, full_name=$5, employee_id=$6, updated_at=NOW() WHERE id=$7`,
        [username, email, hash, role, fullName, employeeId, id]
      );
    } else {
      await pool.query(
        `UPDATE users SET username=$1, email=$2, role=$3, full_name=$4, employee_id=$5, updated_at=NOW() WHERE id=$6`,
        [username, email, role, fullName, employeeId, id]
      );
    }
    
    res.json({ 
      success: true,
      message: "User updated successfully" 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      details: error.message
    });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING id", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      details: error.message
    });
  }
});

// Toggle status
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      "UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE id=$1 RETURNING is_active", 
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: "User status updated successfully",
      is_active: result.rows[0].is_active
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status',
      details: error.message
    });
  }
});

// GET /api/users/officers - Get officers with detailed info for forms
router.get("/officers", async (req, res) => {
  try {
    // Fetch users with role 'officer1' or 'officer2'
    const result = await pool.query(`
      SELECT 
        id,
        full_name,
        employee_id,
        role,
        email
      FROM users 
      WHERE role IN ('officer1', 'officer2')
      AND is_active = true
      ORDER BY role, full_name
    `);
    
    console.log(`Found ${result.rows.length} officers`);
    
    const officers = result.rows.map(officer => ({
      id: officer.id,
      name: officer.full_name,
      employeeId: officer.employee_id,
      role: officer.role,
      email: officer.email,
      displayName: `${officer.full_name} (${officer.role === 'officer2' ? 'Factory Manager' : 'Officer 1'})${officer.employee_id ? ' - ' + officer.employee_id : ''}`
    }));
    
    return res.json({
      success: true,
      officers: officers
    });
    
  } catch (error) {
    console.error("Error fetching officers:", error);
    return res.json({
      success: false,
      error: "Failed to fetch officers",
      details: error.message
    });
  }
});

module.exports = router;