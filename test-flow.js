const B = 'http://localhost:5001';
const post = (u, b, h = {}) => fetch(B + u, { method: 'POST', headers: { 'Content-Type': 'application/json', ...h }, body: JSON.stringify(b) });
const get = (u, h = {}) => fetch(B + u, { headers: h });
const json = async (r) => { const t = await r.text(); try { return JSON.parse(t) } catch { return { _html: t.slice(0, 120), status: r.status } } };

(async () => {
  let r = await post('/api/register', { name: 'Test Student', email: 'stu@test.com', password: 'pass123', role: 'student' });
  let j = await json(r); console.log('student reg:', r.status, j.user?.role, j.user?.status || j.error || j._html);

  r = await post('/api/register', { name: 'ITI Pune', email: 'iti@test.com', password: 'pass123', role: 'institute', profile: { instituteName: 'ITI Pune', location: 'Pune', programs: ['Electrician', 'Welder'] } });
  j = await json(r); const instId = j.user.id; console.log('institute reg:', r.status, j.user?.status || j.error || j._html);

  r = await post('/api/login', { email: 'admin@tradecert.com', password: 'admin123' });
  j = await json(r); const AH = { Authorization: 'Bearer ' + j.token };
  console.log('admin login:', r.status, !!j.token);

  r = await post('/api/institutes/' + instId + '/approve', {}, AH);
  console.log('approve:', r.status);

  r = await post('/api/login', { email: 'iti@test.com', password: 'pass123' });
  j = await json(r); const IH = { Authorization: 'Bearer ' + j.token };

  r = await post('/api/certificates', { studentName: 'Test Student', studentEmail: 'stu@test.com', tradeSkill: 'Electrician', level: 'Certified', grade: 'A' }, IH);
  j = await json(r); const cert = j.certificate;
  console.log('cert:', r.status, cert?.id, cert?.status, 'qr:', !!cert?.qr, j.error || '');

  r = await get('/api/verify/' + cert.id); j = await json(r);
  console.log('verify:', r.status, j.valid, j.certificate?.studentName, '|', j.institute?.name);

  r = await get('/api/certificates/mine', { Authorization: 'Bearer ' + (await json(await post('/api/login', { email: 'stu@test.com', password: 'pass123' }))).token });
  j = await json(r); console.log('student certs:', r.status, j.certificates?.length);

  r = await get('/api/admin/overview', AH); j = await json(r);
  console.log('admin:', r.status, j.totalCertificates, 'certs,', j.totalVerifications, 'verifications,', j.pendingInstitutes, 'pending');

  r = await get('/'); console.log('frontend:', r.status);
})().catch(e => console.log('ERR', e.message));
