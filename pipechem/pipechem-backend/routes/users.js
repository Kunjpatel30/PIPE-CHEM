/* ============================================================
   PIPE CHEM — User Routes (Admin management of users)
   GET  /api/users           (admin: list all users)
   GET  /api/users/:id       (admin: get one user)
   PUT  /api/users/:id/block  (admin: block/unblock)
   DELETE /api/users/:id     (admin: delete)
   ============================================================ */

const router = require('express').Router();
const db     = require('../db');
const { requireAdmin } = require('../middleware/auth');

/* ─── GET all users ─── */
router.get('/', requireAdmin, (req, res) => {
  const { search, status } = req.query;
  let sql  = 'SELECT id, name, email, phone, company, status, blocked, created_at FROM users WHERE 1=1';
  const args = [];
  if (search) { sql += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)'; args.push('%'+search+'%','%'+search+'%','%'+search+'%'); }
  if (status) { sql += ' AND status = ?'; args.push(status); }
  sql += ' ORDER BY created_at DESC';
  const rows = db.prepare(sql).all(...args);
  return res.json({ success: true, total: rows.length, users: rows });
});

/* ─── GET single user ─── */
router.get('/:id', requireAdmin, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, company, status, blocked, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const inquiries = db.prepare('SELECT id, chemical, quantity, status, created_at FROM inquiries WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id);
  const appointments = db.prepare('SELECT id, purpose, datetime, status FROM appointments WHERE user_id = ? ORDER BY datetime DESC').all(req.params.id);
  return res.json({ success: true, user, inquiries, appointments });
});

/* ─── PUT block/unblock user ─── */
router.put('/:id/block', requireAdmin, (req, res) => {
  const { blocked } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  db.prepare('UPDATE users SET blocked = ? WHERE id = ?').run(blocked ? 1 : 0, req.params.id);
  return res.json({ success: true, message: blocked ? 'User blocked.' : 'User unblocked.' });
});

/* ─── DELETE user ─── */
router.delete('/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ success: false, message: 'User not found.' });
  return res.json({ success: true, message: 'User deleted.' });
});

module.exports = router;
