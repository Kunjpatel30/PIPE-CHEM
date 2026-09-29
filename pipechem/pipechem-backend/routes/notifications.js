/* ============================================================
   PIPE CHEM — Notification Routes
   GET  /api/notifications/user         (user: own notifications)
   PUT  /api/notifications/user/:id/read (user: mark one read)
   PUT  /api/notifications/user/read-all (user: mark all read)
   GET  /api/notifications/admin        (admin: all notifications)
   PUT  /api/notifications/admin/read-all (admin: mark all read)
   ============================================================ */

const router = require('express').Router();
const db     = require('../db');
const { requireUser, requireAdmin } = require('../middleware/auth');

function generateId() {
  return 'PC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

/* ── USER: Get own notifications ── */
router.get('/user', requireUser, (req, res) => {
  const rows = db.prepare('SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  const unread = rows.filter(r => !r.is_read).length;
  return res.json({ success: true, unread, notifications: rows });
});

/* ── USER: Mark one notification read ── */
router.put('/user/:id/read', requireUser, (req, res) => {
  db.prepare('UPDATE user_notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  return res.json({ success: true, message: 'Notification marked as read.' });
});

/* ── USER: Mark all read ── */
router.put('/user/read-all', requireUser, (req, res) => {
  db.prepare('UPDATE user_notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  return res.json({ success: true, message: 'All notifications marked as read.' });
});

/* ── ADMIN: Get admin notifications ── */
router.get('/admin', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 100').all();
  const unread = rows.filter(r => !r.is_read).length;
  return res.json({ success: true, unread, notifications: rows });
});

/* ── ADMIN: Mark all admin notifications read ── */
router.put('/admin/read-all', requireAdmin, (req, res) => {
  db.prepare('UPDATE admin_notifications SET is_read = 1').run();
  return res.json({ success: true, message: 'All admin notifications marked as read.' });
});

/* ── ADMIN: Send manual notification to a user ── */
router.post('/admin/send', requireAdmin, (req, res) => {
  const { userId, type, title, body, refId } = req.body;
  if (!userId || !title || !body) {
    return res.status(400).json({ success: false, message: 'userId, title, and body are required.' });
  }
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const id = generateId();
  db.prepare(`
    INSERT INTO user_notifications (id, user_id, type, title, body, ref_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, type || 'general', title, body, refId || null);
  return res.json({ success: true, message: 'Notification sent to user.' });
});

module.exports = router;
