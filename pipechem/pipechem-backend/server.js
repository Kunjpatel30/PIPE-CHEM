/* ============================================================
   PIPE CHEM — Main Server
   Express + SQLite Backend API
   Port: 5000 (configurable via PORT env variable)
   ============================================================ */

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');

/* ── Initialize DB (creates pipechem.db if not exists) ── */
const db = require('./db');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Middleware ── */
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',   /* Set to your frontend domain in production */
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

/* ── Request Logger ── */
app.use((req, _res, next) => {
  const now = new Date().toLocaleTimeString('en-IN');
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

/* ── API Routes ── */
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/inquiries',     require('./routes/inquiries'));
app.use('/api/appointments',  require('./routes/appointments'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports',       require('./routes/reports'));
app.use('/api/contact',       require('./routes/contact'));

/* ── Health Check ── */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status:  'PIPE CHEM API is running',
    version: '1.0.0',
    time:    new Date().toISOString()
  });
});

/* ── Root Info ── */
app.get('/', (req, res) => {
  res.json({
    name:    'PIPE CHEM Backend API',
    version: '1.0.0',
    docs:    'See API_REFERENCE.md for endpoint documentation',
    health:  '/api/health'
  });
});

/* ── 404 Handler ── */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

/* ── Error Handler ── */
app.use((err, req, res, _next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.', error: err.message });
});

/* ── Start Server ── */
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║    🧪  PIPE CHEM Backend Server       ║');
  console.log(`  ║    Running on http://localhost:${PORT}  ║`);
  console.log('  ║    Admin: username=admin              ║');
  console.log('  ║           password=pipechem@2024      ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});
