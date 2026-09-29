/* ============================================================
   PIPE CHEM — Auth Middleware
   Validates JWT tokens for user and admin routes
   ============================================================ */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'pipechem_secret_key_2024';

/* ── Require User Login ── */
function requireUser(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    if (decoded.role !== 'user') return res.status(403).json({ success: false, message: 'Access denied.' });
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
  }
}

/* ── Require Admin Login ── */
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin access required.' });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access only.' });
    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Admin session expired. Please login again.' });
  }
}

/* ── Optional User (attach if token present, don't fail if absent) ── */
function optionalUser(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    } catch(e) {}
  }
  next();
}

module.exports = { requireUser, requireAdmin, optionalUser, JWT_SECRET };
