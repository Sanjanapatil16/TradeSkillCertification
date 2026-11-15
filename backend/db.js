// JSON document store — MongoDB-compatible schema (swap for Mongoose later).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_DB = {
  users: [],        // { id, name, email, passwordHash, role: 'student'|'institute'|'admin', status, profile, createdAt }
  sessions: [],     // { token, userId, createdAt }
  certificates: [], // { id, studentName, studentEmail, tradeSkill, level, grade, issueDate, instituteId, instituteName, status, qr, verifyCount }
};

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
    seedAdmin();
  }
}

function readDb() {
  ensureDb();
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return JSON.parse(JSON.stringify(DEFAULT_DB)); }
}

function writeDb(db) {
  ensureDb();
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

function hashPassword(pw) {
  return crypto.createHash('sha256').update('tradecert-salt:' + pw).digest('hex');
}

function uid(prefix) {
  return prefix + '_' + crypto.randomBytes(6).toString('hex');
}

function certId() {
  const seg = () => crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TC-${seg()}-${seg()}`;
}

function seedAdmin() {
  const db = readDb();
  db.users.push({
    id: uid('usr'), name: 'Platform Admin', email: 'admin@tradecert.com',
    passwordHash: hashPassword('admin123'), role: 'admin', status: 'active',
    profile: {}, createdAt: new Date().toISOString()
  });
  writeDb(db);
}

function publicUser(u) {
  return {
    id: u.id, name: u.name, email: u.email, role: u.role,
    status: u.status, profile: u.profile || {}, createdAt: u.createdAt
  };
}

module.exports = { readDb, writeDb, hashPassword, uid, certId, publicUser };
