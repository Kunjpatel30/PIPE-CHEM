/* ============================================================
   PIPE CHEM — Reports Route (Admin Only)
   GET /api/reports/summary
   GET /api/reports/export/csv
   ============================================================ */

const router = require('express').Router();
const db     = require('../db');
const { requireAdmin } = require('../middleware/auth');

/* ─── GET /api/reports/summary ─── */
router.get('/summary', requireAdmin, (req, res) => {
  const totalUsers     = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const totalInquiries = db.prepare('SELECT COUNT(*) AS c FROM inquiries').get().c;
  const pending        = db.prepare("SELECT COUNT(*) AS c FROM inquiries WHERE status='Pending'").get().c;
  const inProgress     = db.prepare("SELECT COUNT(*) AS c FROM inquiries WHERE status='In Progress'").get().c;
  const resolved       = db.prepare("SELECT COUNT(*) AS c FROM inquiries WHERE status='Resolved'").get().c;
  const totalAppts     = db.prepare('SELECT COUNT(*) AS c FROM appointments').get().c;
  const upcoming       = db.prepare("SELECT COUNT(*) AS c FROM appointments WHERE datetime > datetime('now') AND status != 'Cancelled'").get().c;
  const completed      = db.prepare("SELECT COUNT(*) AS c FROM appointments WHERE status='Completed'").get().c;
  const exPlant        = db.prepare("SELECT COUNT(*) AS c FROM inquiries WHERE delivery_type='Ex-Plant'").get().c;
  const delivered      = db.prepare("SELECT COUNT(*) AS c FROM inquiries WHERE delivery_type='Delivered'").get().c;

  /* Top chemicals */
  const chemDemand = db.prepare(`
    SELECT chemical, COUNT(*) AS count
    FROM inquiries GROUP BY chemical ORDER BY count DESC LIMIT 6
  `).all();

  /* Top customers */
  const topCustomers = db.prepare(`
    SELECT name, company, COUNT(*) AS count
    FROM inquiries GROUP BY name ORDER BY count DESC LIMIT 5
  `).all();

  return res.json({
    success: true,
    summary: {
      users:        { total: totalUsers },
      inquiries:    { total: totalInquiries, pending, inProgress, resolved },
      appointments: { total: totalAppts, upcoming, completed },
      delivery:     { exPlant, delivered },
      chemDemand,
      topCustomers
    }
  });
});

/* ─── GET /api/reports/export/csv ─── */
router.get('/export/csv', requireAdmin, (req, res) => {
  const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();

  const headers = ['#','Date','Customer','Company','Email','Phone','Chemical','Quantity','Expected Price','Delivery Type','Location','Remarks','Status','Admin Note'];
  const rows = inquiries.map((i, idx) => [
    idx+1,
    i.created_at,
    i.name,
    i.company,
    i.email,
    i.phone,
    i.chemical,
    i.quantity,
    i.expected_price,
    i.delivery_type,
    i.location,
    i.remarks,
    i.status,
    i.admin_note
  ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));

  const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="pipechem_inquiries.csv"');
  return res.send(csv);
});

module.exports = router;
