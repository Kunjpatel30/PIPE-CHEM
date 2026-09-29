/* ============================================================
   PIPE CHEM — Inquiry Routes
   POST /api/inquiries            (user: submit inquiry)
   GET  /api/inquiries            (admin: get all)
   GET  /api/inquiries/mine       (user: get own inquiries)
   GET  /api/inquiries/:id        (admin: get one)
   PUT  /api/inquiries/:id/status (admin: update status + notify)
   DELETE /api/inquiries/:id      (admin: delete)
   ============================================================ */

const router = require('express').Router();
const db     = require('../db');
const { requireUser, requireAdmin, optionalUser } = require('../middleware/auth');

function generateId() {
  return 'PC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

/* ─────────────────────────────────────────
   POST /api/inquiries
   User submits a new inquiry (must be logged in)
───────────────────────────────────────── */
router.post('/', requireUser, (req, res) => {
  const { chemical, quantity, expectedPrice, deliveryType, location, remarks } = req.body;

  if (!chemical || !quantity || !expectedPrice || !deliveryType) {
    return res.status(400).json({ success: false, message: 'Chemical, quantity, price, and delivery type are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const id = generateId();
  db.prepare(`
    INSERT INTO inquiries (id, user_id, name, phone, email, company, chemical, quantity, expected_price, delivery_type, location, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, user.id, user.name, user.phone, user.email, user.company || '', chemical, quantity, expectedPrice, deliveryType, location || 'Ex-Plant (Self Arranged)', remarks || '');

  /* Admin notification */
  db.prepare(`
    INSERT INTO admin_notifications (id, type, title, body, ref_id)
    VALUES (?, 'inquiry', ?, ?, ?)
  `).run(generateId(), `New Inquiry from ${user.name}`, `${chemical} — ${quantity} (${deliveryType})`, id);

  /* User confirmation notification */
  db.prepare(`
    INSERT INTO user_notifications (id, user_id, type, title, body, ref_id)
    VALUES (?, ?, 'inquiry_received', ?, ?, ?)
  `).run(generateId(), user.id, 'Inquiry Submitted ✅', `Your inquiry for ${chemical} (${quantity}) has been received. Our team will respond within 24 hours.`, id);

  const inq = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
  return res.status(201).json({ success: true, message: 'Inquiry submitted successfully!', inquiry: inq });
});

/* ─────────────────────────────────────────
   GET /api/inquiries
   Admin: get all inquiries (with optional filter)
───────────────────────────────────────── */
router.get('/', requireAdmin, (req, res) => {
  const { status, chemical, search } = req.query;
  let sql    = 'SELECT * FROM inquiries WHERE 1=1';
  const args = [];

  if (status)   { sql += ' AND status = ?';                  args.push(status); }
  if (chemical) { sql += ' AND chemical LIKE ?';             args.push('%' + chemical + '%'); }
  if (search)   { sql += ' AND (name LIKE ? OR email LIKE ? OR chemical LIKE ? OR company LIKE ?)';
                   args.push('%'+search+'%', '%'+search+'%', '%'+search+'%', '%'+search+'%'); }

  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...args);
  return res.json({ success: true, total: rows.length, inquiries: rows });
});

/* ─────────────────────────────────────────
   GET /api/inquiries/mine
   User: get own inquiries
───────────────────────────────────────── */
router.get('/mine', requireUser, (req, res) => {
  const rows = db.prepare('SELECT * FROM inquiries WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  return res.json({ success: true, total: rows.length, inquiries: rows });
});

/* ─────────────────────────────────────────
   GET /api/inquiries/:id
   Admin: get single inquiry
───────────────────────────────────────── */
router.get('/:id', requireAdmin, (req, res) => {
  const inq = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id);
  if (!inq) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  return res.json({ success: true, inquiry: inq });
});

/* ─────────────────────────────────────────
   PUT /api/inquiries/:id/status
   Admin: update status and optionally send a message to user
   Body: { status, adminNote, notifType }
───────────────────────────────────────── */
router.put('/:id/status', requireAdmin, (req, res) => {
  const { status, adminNote, notifType } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

  const inq = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id);
  if (!inq) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

  db.prepare('UPDATE inquiries SET status = ?, admin_note = ? WHERE id = ?')
    .run(status, adminNote || inq.admin_note || '', req.params.id);

  /* Notify user if their account exists */
  if (inq.user_id) {
    const statusLabel = {
      'Resolved':    '✅ Inquiry Resolved',
      'In Progress': '🔄 Inquiry In Progress',
      'Pending':     '📋 Inquiry Pending'
    }[status] || ('📋 Inquiry Updated: ' + status);

    const defaultMsg = {
      'Resolved':    `Your inquiry for ${inq.chemical} has been resolved.`,
      'In Progress': `Your inquiry for ${inq.chemical} is now being processed.`
    }[status] || `Your inquiry status has been updated to: ${status}`;

    db.prepare(`
      INSERT INTO user_notifications (id, user_id, type, title, body, ref_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(generateId(), inq.user_id, notifType || 'inquiry_update', statusLabel, adminNote || defaultMsg, inq.id);
  }

  /* Admin log */
  db.prepare(`
    INSERT INTO admin_notifications (id, type, title, body, ref_id)
    VALUES (?, 'inquiry_update', ?, ?, ?)
  `).run(generateId(), `Inquiry ${status}: ${inq.chemical}`, adminNote ? `Message sent: ${adminNote}` : 'Status updated — no message.', inq.id);

  const updated = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id);
  return res.json({ success: true, message: 'Inquiry updated and user notified.', inquiry: updated });
});

/* ─────────────────────────────────────────
   DELETE /api/inquiries/:id
   Admin: delete inquiry
───────────────────────────────────────── */
router.delete('/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM inquiries WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  return res.json({ success: true, message: 'Inquiry deleted.' });
});

module.exports = router;
