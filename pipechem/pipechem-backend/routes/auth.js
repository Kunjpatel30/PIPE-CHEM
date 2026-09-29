/* ============================================================
   PIPE CHEM — Auth Routes
   POST /api/auth/register
   POST /api/auth/login
   POST /api/auth/admin/login
   GET  /api/auth/me
   ============================================================ */

const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const { requireUser, JWT_SECRET } = require('../middleware/auth');

/* ── Generate unique ID ── */
function generateId() {
  return 'PC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

/* ─────────────────────────────────────────
   POST /api/auth/register
   Body: { name, email, phone, company, password }
───────────────────────────────────────── */
router.post('/register', (req, res) => {
  const { name, email, phone, company, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, phone, and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const id     = generateId();

  db.prepare(`
    INSERT INTO users (id, name, email, phone, company, password)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), email.toLowerCase().trim(), phone.trim(), company || '', hashed);

  /* Admin notification: new registration */
  db.prepare(`
    INSERT INTO admin_notifications (id, type, title, body, ref_id)
    VALUES (?, 'registration', ?, ?, ?)
  `).run(generateId(), `New User Registered: ${name}`, `${email} | ${phone}${company ? ' | ' + company : ''}`, id);

  const user = db.prepare('SELECT id, name, email, phone, company, status, created_at FROM users WHERE id = ?').get(id);
  const token = jwt.sign({ id, role: 'user', email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({ success: true, message: 'Account created successfully!', token, user });
});

/* ─────────────────────────────────────────
   POST /api/auth/login
   Body: { email, password }
───────────────────────────────────────── */
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  if (user.blocked) {
    return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact PIPE CHEM.' });
  }

  const token = jwt.sign({ id: user.id, role: 'user', email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  return res.json({ success: true, message: 'Login successful!', token, user: safeUser });
});

/* ─────────────────────────────────────────
   POST /api/auth/admin/login
   Body: { username, password }
───────────────────────────────────────── */
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
  }

  const token = jwt.sign({ id: admin.id, role: 'admin', username: admin.username }, JWT_SECRET, { expiresIn: '12h' });
  return res.json({ success: true, message: 'Admin login successful!', token });
});

/* ─────────────────────────────────────────
   GET /api/auth/me
   Returns current user info from JWT
───────────────────────────────────────── */
router.get('/me', requireUser, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, company, status, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, user });
});

module.exports = router;
