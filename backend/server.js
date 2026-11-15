const express = require("express");
const cors = require("cors");
const path = require("path");
const QRCode = require("qrcode");
const { readDb, writeDb, hashPassword, uid, certId, publicUser } = require("./db");

const app = express();
const START_TIME = Date.now();

app.use(cors());
app.use(express.json());

// ---------- auth helpers ----------
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const db = readDb();
  const session = db.sessions.find(s => s.token === token);
  const user = session && db.users.find(u => u.id === session.userId);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  req.user = user;
  req.db = db;
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
const certView = (c) => ({
  id: c.id, studentName: c.studentName, studentEmail: c.studentEmail,
  tradeSkill: c.tradeSkill, level: c.level, grade: c.grade,
  issueDate: c.issueDate, instituteName: c.instituteName,
  status: c.status, qr: c.qr, verifyCount: c.verifyCount || 0
});

// ---------- auth routes ----------
app.post("/api/register", async (req, res) => {
  const { name, email, password, role, profile } = req.body || {};
  const r = role === 'institute' ? 'institute' : 'student';
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const db = readDb();
  if (db.users.find(u => u.email === email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  if (r === 'institute' && (!profile?.instituteName || !profile?.location)) {
    return res.status(400).json({ error: 'Institute name and location are required' });
  }

  const user = {
    id: uid('usr'), name, email: email.toLowerCase(),
    passwordHash: hashPassword(password), role: r,
    status: r === 'institute' ? 'pending' : 'active', // institutes need admin approval
    profile: profile || {}, createdAt: new Date().toISOString()
  };
  db.users.push(user);
  const token = uid('tok');
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  writeDb(db);
  res.json({ token, user: publicUser(user) });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  const db = readDb();
  const user = db.users.find(u => u.email === (email || '').toLowerCase() && u.passwordHash === hashPassword(password || ''));
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const token = uid('tok');
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  writeDb(db);
  res.json({ token, user: publicUser(user) });
});

app.get("/api/me", auth, (req, res) => res.json({ user: publicUser(req.user) }));

// ---------- institute management (admin) ----------
app.get("/api/institutes", auth, requireRole('admin'), (req, res) => {
  const list = req.db.users.filter(u => u.role === 'institute').map(publicUser);
  res.json({ institutes: list });
});

app.post("/api/institutes/:id/approve", auth, requireRole('admin'), (req, res) => {
  const u = req.db.users.find(x => x.id === req.params.id && x.role === 'institute');
  if (!u) return res.status(404).json({ error: 'Institute not found' });
  u.status = 'active';
  writeDb(req.db);
  res.json({ user: publicUser(u) });
});

app.post("/api/institutes/:id/reject", auth, requireRole('admin'), (req, res) => {
  const u = req.db.users.find(x => x.id === req.params.id && x.role === 'institute');
  if (!u) return res.status(404).json({ error: 'Institute not found' });
  u.status = 'rejected';
  writeDb(req.db);
  res.json({ user: publicUser(u) });
});

// ---------- certificates ----------
app.post("/api/certificates", auth, requireRole('institute'), async (req, res) => {
  if (req.user.status !== 'active') {
    return res.status(403).json({ error: 'Institute account pending approval' });
  }
  const { studentName, studentEmail, tradeSkill, level, grade } = req.body || {};
  if (!studentName || !studentEmail || !tradeSkill) {
    return res.status(400).json({ error: 'Student name, email and trade skill are required' });
  }
  const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
  const verifyUrl = `${appUrl}/#/verify/`;

  const cert = {
    id: certId(),
    studentName, studentEmail: studentEmail.toLowerCase(),
    tradeSkill, level: level || 'Certified', grade: grade || '',
    issueDate: new Date().toISOString(),
    instituteId: req.user.id,
    instituteName: req.user.profile.instituteName || req.user.name,
    instituteLocation: req.user.profile.location || '',
    status: 'valid',
    verifyCount: 0
  };
  // QR encodes the verification link (id appended client-side; store base)
  cert.qr = await QRCode.toDataURL(verifyUrl + cert.id, { margin: 1, width: 220 });
  req.db.certificates.push(cert);
  writeDb(req.db);
  res.json({ certificate: certView(cert) });
});

app.get("/api/certificates/mine", auth, (req, res) => {
  const db = req.db;
  let certs;
  if (req.user.role === 'student') {
    certs = db.certificates.filter(c => c.studentEmail === req.user.email);
  } else if (req.user.role === 'institute') {
    certs = db.certificates.filter(c => c.instituteId === req.user.id);
  } else {
    certs = db.certificates;
  }
  res.json({ certificates: certs.map(certView).reverse() });
});

app.post("/api/certificates/:id/revoke", auth, (req, res) => {
  const c = req.db.certificates.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Certificate not found' });
  const allowed = req.user.role === 'admin' || (req.user.role === 'institute' && c.instituteId === req.user.id);
  if (!allowed) return res.status(403).json({ error: 'Forbidden' });
  c.status = c.status === 'revoked' ? 'valid' : 'revoked';
  writeDb(req.db);
  res.json({ certificate: certView(c) });
});

// ---------- public verification ----------
app.get("/api/verify/:id", (req, res) => {
  const db = readDb();
  const c = db.certificates.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Certificate not found', valid: false });
  c.verifyCount = (c.verifyCount || 0) + 1;
  writeDb(db);
  const inst = db.users.find(u => u.id === c.instituteId);
  res.json({
    valid: c.status === 'valid',
    status: c.status,
    certificate: certView(c),
    institute: inst ? { name: inst.profile.instituteName || inst.name, location: inst.profile.location, email: inst.email } : null
  });
});

// ---------- admin ----------
app.get("/api/admin/overview", auth, requireRole('admin'), (req, res) => {
  const db = req.db;
  const certs = db.certificates;
  const users = db.users;
  res.json({
    uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
    totalStudents: users.filter(u => u.role === 'student').length,
    totalInstitutes: users.filter(u => u.role === 'institute').length,
    pendingInstitutes: users.filter(u => u.role === 'institute' && u.status === 'pending').length,
    totalCertificates: certs.length,
    validCertificates: certs.filter(c => c.status === 'valid').length,
    revokedCertificates: certs.filter(c => c.status === 'revoked').length,
    totalVerifications: certs.reduce((s, c) => s + (c.verifyCount || 0), 0),
    certificates: certs.map(certView).reverse(),
    institutes: users.filter(u => u.role === 'institute').map(publicUser),
    students: users.filter(u => u.role === 'student').map(publicUser)
  });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---------- static frontend ----------
const dist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(dist));
app.use((req, res) => {
  res.sendFile(path.join(dist, "index.html"), (err) => {
    if (err) res.status(404).send("Frontend not built. Run: npm run build --prefix frontend");
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TradeCert server running on http://localhost:${PORT}`));
