const pool = require('../db/index');
const bcrypt = require('bcrypt');

exports.getUsers = async (req, res) => {
  const result = await pool.query('SELECT * FROM users ORDER BY id');
  res.json(result.rows);
};

exports.createUser = async (req, res) => {
  const { username, email, password, role, fullName, employeeId } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (username, email, password_hash, role, full_name, employee_id) VALUES ($1, $2, $3, $4, $5, $6)',
    [username, email, hash, role, fullName, employeeId]
  );
  res.status(201).json({ message: 'User created' });
};

exports.updateUser = async (req, res) => {
  const { username, email, role, fullName, employeeId, password } = req.body;
  const { id } = req.params;
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET username=$1, email=$2, password_hash=$3, role=$4, full_name=$5, employee_id=$6 WHERE id=$7',
      [username, email, hash, role, fullName, employeeId, id]
    );
  } else {
    await pool.query(
      'UPDATE users SET username=$1, email=$2, role=$3, full_name=$4, employee_id=$5 WHERE id=$6',
      [username, email, role, fullName, employeeId, id]
    );
  }
  res.json({ message: 'User updated' });
};

exports.deleteUser = async (req, res) => {
  await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
  res.json({ message: 'User deleted' });
};

exports.toggleStatus = async (req, res) => {
  await pool.query('UPDATE users SET is_active = NOT is_active WHERE id=$1', [req.params.id]);
  res.json({ message: 'User status toggled' });
};
