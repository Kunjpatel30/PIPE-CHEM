/* ============================================================
   PIPE CHEM — Database Initializer
   Uses better-sqlite3 (synchronous, no external DB needed)
   File: pipechem.db (auto-created on first run)
   ============================================================ */

const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');

const DB_PATH = path.join(__dirname, 'pipechem.db');
const db      = new Database(DB_PATH);

/* Enable WAL mode for better performance */
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ── Create Tables ── */
db.exec(`
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    phone       TEXT NOT NULL,
    company     TEXT,
    password    TEXT NOT NULL,
    status      TEXT DEFAULT 'Active',
    blocked     INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  -- Admin table (single row)
  CREATE TABLE IF NOT EXISTS admins (
    id          INTEGER PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  -- Inquiries table
  CREATE TABLE IF NOT EXISTS inquiries (
    id              TEXT PRIMARY KEY,
    user_id         TEXT,
    name            TEXT NOT NULL,
    phone           TEXT NOT NULL,
    email           TEXT NOT NULL,
    company         TEXT NOT NULL,
    chemical        TEXT NOT NULL,
    quantity        TEXT NOT NULL,
    expected_price  TEXT NOT NULL,
    delivery_type   TEXT NOT NULL,
    location        TEXT,
    remarks         TEXT,
    status          TEXT DEFAULT 'Pending',
    admin_note      TEXT DEFAULT '',
    created_at      TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  -- Appointments table
  CREATE TABLE IF NOT EXISTS appointments (
    id          TEXT PRIMARY KEY,
    customer    TEXT NOT NULL,
    phone       TEXT,
    datetime    TEXT NOT NULL,
    purpose     TEXT NOT NULL,
    note        TEXT,
    status      TEXT DEFAULT 'Scheduled',
    user_id     TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  -- User Notifications table
  CREATE TABLE IF NOT EXISTS user_notifications (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    ref_id      TEXT,
    is_read     INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Admin Notifications table
  CREATE TABLE IF NOT EXISTS admin_notifications (
    id          TEXT PRIMARY KEY,
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    ref_id      TEXT,
    is_read     INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  -- Contact Messages table
  CREATE TABLE IF NOT EXISTS contact_messages (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    subject     TEXT,
    message     TEXT NOT NULL,
    is_read     INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

/* ── Seed default admin ── */
const existingAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
if (!existingAdmin) {
  const hashed = bcrypt.hashSync('pipechem@2024', 10);
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', hashed);
  console.log('✅ Default admin created: username=admin, password=pipechem@2024');
}

module.exports = db;
