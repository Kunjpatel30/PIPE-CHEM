/* ============================================================
   PIPE CHEM — Contact Route
   POST /api/contact  (public: send a contact message)
   GET  /api/contact  (admin: view all contact messages)
   PUT  /api/contact/:id/read (admin: mark as read)
   ============================================================ */

const router = require('express').Router();
const db     = require('../db');
const { requireAdmin } = require('../middleware/auth');

function generateId() {
  return 'PC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

/* ─── POST /api/contact ─── (public) */
router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }
  const id = generateId();
  db.prepare(`INSERT INTO contact_messages (id, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(id, name, email, phone || '', subject || '', message);

  /* Admin notification */
  db.prepare(`INSERT INTO admin_notifications (id, type, title, body, ref_id) VALUES (?, 'contact', ?, ?, ?)`)
    .run(generateId(), `Contact from ${name}`, subject || message.slice(0, 80), id);

  return res.status(201).json({ success: true, message: 'Message sent successfully! We will respond within 24 hours.' });
});

/* ─── GET /api/contact ─── (admin) */
router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  return res.json({ success: true, total: rows.length, messages: rows });
});

/* ─── PUT /api/contact/:id/read ─── (admin) */
router.put('/:id/read', requireAdmin, (req, res) => {
  db.prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?').run(req.params.id);
  return res.json({ success: true });
});

module.exports = router;
