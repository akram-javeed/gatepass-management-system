const express = require("express");
const router = express.Router();
const db = require("../db"); // Your PostgreSQL pool
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  res.send("Auth route is live");
});


// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    // Fetch user by username
    const result = await db.query(
      "SELECT id, username, full_name, email, role, password_hash FROM users WHERE username = $1 AND is_active = true",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = result.rows[0];

    // Compare password with bcrypt hash
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Respond with user session data
    return res.json({
      id: user.id,
      name: user.full_name || user.username,
      role: user.role,
      email: user.email,
      redirect: getDefaultRedirect(user.role),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Default route mapping based on role
function getDefaultRedirect(role) {
  switch (role) {
    case "sse": return "/sse-dashboard";
    case "safety_officer": return "/safety-officer";
    case "officer1":
    case "officer2": return "/officer-dashboard";
    case "chos_npb": return "/chos-dashboard";
    case "contract_section": return "/contract-section";
    case "admin": return "/admin-dashboard";
    default: return "/";
  }
}

module.exports = router;
