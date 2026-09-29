/* ============================================================
   PIPE CHEM — Appointment Routes
   POST /api/appointments           (admin: create & notify user)
   GET  /api/appointments           (admin: get all)
   GET  /api/appointments/mine      (user: get own appointments)
   PUT  /api/appointments/:id/status (admin: update status)
   DELETE /api/appointments/:id     (admin: delete)
   ============================================================ */

const router = require('express').Router();
const db     = require('../db');
const { requireAdmin, requireUser } = require('../middleware/auth');

function generateId() {
  return 'PC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { weekday:'long', day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

/* ─────────────────────────────────────────
   POST /api/appointments
   Admin creates an appointment and notifies the user (if found)
───────────────────────────────────────── */
router.post('/', requireAdmin, (req, res) => {
  const { customer, phone, datetime, purpose, note, userId } = req.body;
  if (!customer || !datetime || !purpose) {
    return res.status(400).json({ success: false, message: 'Customer, datetime, and purpose are required.' });
  }

  const id = generateId();

  /* Try to find user by explicit userId, phone, or name */
  let matchedUserId = userId || null;
  if (!matchedUserId && phone) {
    const u = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (u) matchedUserId = u.id;
  }
  if (!matchedUserId) {
    const u = db.prepare('SELECT id FROM users WHERE LOWER(name) = ?').get(customer.toLowerCase());
    if (u) matchedUserId = u.id;
  }

  db.prepare(`
    INSERT INTO appointments (id, customer, phone, datetime, purpose, note, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, customer, phone || '', datetime, purpose, note || '', matchedUserId);

  /* Notify the matched user */
  if (matchedUserId) {
    db.prepare(`
      INSERT INTO user_notifications (id, user_id, type, title, body, ref_id)
      VALUES (?, ?, 'appointment', '📅 Appointment Scheduled', ?, ?)
    `).run(generateId(), matchedUserId,
      `PIPE CHEM has scheduled an appointment for you on ${fmtDateTime(datetime)}. Purpose: ${purpose}${note ? ' | Note: ' + note : ''}`,
      id
    );
  }

  /* Admin log */
  db.prepare(`
    INSERT INTO admin_notifications (id, type, title, body, ref_id)
    VALUES (?, 'appointment', ?, ?, ?)
  `).run(generateId(), `Appointment Scheduled: ${customer}`, `${purpose} — ${new Date(datetime).toLocaleDateString('en-IN')}`, id);

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
  return res.status(201).json({ success: true, message: 'Appointment scheduled and user notified!', appointment: appt });
});

/* ─────────────────────────────────────────
   GET /api/appointments
   Admin: get all appointments
───────────────────────────────────────── */
router.get('/', requireAdmin, (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM appointments WHERE 1=1';
  const args = [];
  if (status) { sql += ' AND status = ?'; args.push(status); }
  sql += ' ORDER BY datetime DESC';
  const rows = db.prepare(sql).all(...args);
  return res.json({ success: true, total: rows.length, appointments: rows });
});

/* ─────────────────────────────────────────
   GET /api/appointments/mine
   User: get appointments linked to their account
───────────────────────────────────────── */
router.get('/mine', requireUser, (req, res) => {
  const rows = db.prepare('SELECT * FROM appointments WHERE user_id = ? ORDER BY datetime DESC').all(req.user.id);
  return res.json({ success: true, total: rows.length, appointments: rows });
});

/* ─────────────────────────────────────────
   PUT /api/appointments/:id/status
   Admin: update status (Completed / Cancelled / Scheduled)
───────────────────────────────────────── */
router.put('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });

  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found.' });

  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);

  /* Notify user of cancellation or completion */
  if (appt.user_id && (status === 'Cancelled' || status === 'Completed')) {
    const msg = status === 'Cancelled'
      ? `Your appointment on ${fmtDateTime(appt.datetime)} has been cancelled. Please contact us to reschedule.`
      : `Your appointment on ${fmtDateTime(appt.datetime)} has been marked as completed. Thank you!`;
    db.prepare(`
      INSERT INTO user_notifications (id, user_id, type, title, body, ref_id)
      VALUES (?, ?, 'appointment', ?, ?, ?)
    `).run(generateId(), appt.user_id, status === 'Cancelled' ? '❌ Appointment Cancelled' : '✅ Appointment Completed', msg, appt.id);
  }

  const updated = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  return res.json({ success: true, message: 'Appointment updated.', appointment: updated });
});

/* ─────────────────────────────────────────
   DELETE /api/appointments/:id
   Admin: delete an appointment
───────────────────────────────────────── */
router.delete('/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ success: false, message: 'Appointment not found.' });
  return res.json({ success: true, message: 'Appointment deleted.' });
});

module.exports = router;
