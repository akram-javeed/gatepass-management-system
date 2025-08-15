import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// ✅ Connect to PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // use .env.local to store this
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    const result = await pool.query(
      'SELECT id, username, full_name, email, role, password_hash FROM users WHERE username = $1 AND is_active = true',
      [username]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    const user = result.rows[0]
    const isValid = await bcrypt.compare(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.full_name || user.username,
      role: user.role,
      email: user.email,
      redirect: getRedirectPath(user.role),
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getRedirectPath(role: string): string {
  switch (role) {
    case 'sse':
      return '/sse-dashboard'
    case 'safety_officer':
      return '/safety-officer'
    case 'officer1':
    case 'officer2':
      return '/officer-dashboard'
    case 'chos_npb':
      return '/chos-dashboard'
    case 'contract_section':
      return '/contract-section'
    case 'admin':
      return '/admin-dashboard'
    default:
      return '/'
  }
}
