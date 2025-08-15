const express = require('express')
const router = express.Router()
const pool = require('../db')

router.post('/', async (req, res) => {
  const { username, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2 AND role = $3',
      [username, password, 'contract_section']
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    const user = result.rows[0]
    return res.status(200).json({ message: 'Login successful', user })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router