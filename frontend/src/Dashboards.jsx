import { useState, useEffect, useCallback } from 'react'
import { api } from './api.js'

function CertCard({ c, action }) {
  return (
    <div className="cert-card">
      <div className="cert-head">
        <span className="badge-icon">🏅</span>
        <div>
          <strong>{c.tradeSkill}</strong>
          <div className="muted small">{c.level}{c.grade ? ' · Grade ' + c.grade : ''}</div>
        </div>
        <span className={`pill ${c.status}`}>{c.status.toUpperCase()}</span>
      </div>
      <div className="muted small">{c.studentName} · {c.studentEmail}</div>
      <div className="muted small">Issued {new Date(c.issueDate).toLocaleDateString()} by {c.instituteName}</div>
      <div className="cert-id">ID: {c.id} · Verified {c.verifyCount || 0}×</div>
      <div className="row">
        <a className="btn-ghost btn-sm" href={`#/verify/${c.id}`}>Verify</a>
        <a className="btn-ghost btn-sm" href={`#/badge/${c.id}`}>Badge</a>
        {action}
      </div>
    </div>
  )
}

export function StudentDashboard({ user, onLogout }) {
  const [certs, setCerts] = useState([])
  const [skills, setSkills] = useState('')
  const load = useCallback(() => api.myCertificates().then(d => setCerts(d.certificates)).catch(() => {}), [])
  useEffect(() => { load() }, [load])
  const saveProfile = async () => {
    // specialization stored client-side for portfolio display
    localStorage.setItem('tradecert_skills_' + user.id, skills)
    alert('Skill profile saved!')
  }

  return (
    <div className="dash">
      <DashHeader user={user} onLogout={onLogout} title="My Certificates" />
      <div className="card">
        <h3>Skill profile</h3>
        <input placeholder="Your trade specializations (e.g. Electrician, Welder)" value={skills}
          onChange={e => setSkills(e.target.value)} />
        <button className="btn-ghost btn-sm" onClick={saveProfile}>Save profile</button>
      </div>
      <h3>Digital certificates & badges ({certs.length})</h3>
      {certs.length === 0 && <p className="muted">No certificates yet — an approved institute must issue one to your email.</p>}
      {certs.map(c => <CertCard key={c.id} c={c} />)}
    </div>
  )
}

export function InstitutePanel({ user, onLogout }) {
  const [certs, setCerts] = useState([])
  const [form, setForm] = useState({ studentName: '', studentEmail: '', tradeSkill: '', level: 'Certified', grade: '' })
  const [msg, setMsg] = useState('')
  const [issued, setIssued] = useState(null)
  const load = useCallback(() => api.myCertificates().then(d => setCerts(d.certificates)).catch(() => {}), [])
  useEffect(() => { load() }, [load])

  if (user.status !== 'active') {
    return (
      <div className="dash">
        <DashHeader user={user} onLogout={onLogout} title="Institute Panel" />
        <div className="card warn-card">
          <h3>⏳ Pending approval</h3>
          <p className="muted">Your institute registration is awaiting admin approval. You'll be able to issue certificates once approved.</p>
        </div>
      </div>
    )
  }

  const issue = async (e) => {
    e.preventDefault(); setMsg('')
    try {
      const d = await api.issueCertificate(form)
      setIssued(d.certificate); setMsg('Certificate issued!'); load()
      setForm({ studentName: '', studentEmail: '', tradeSkill: '', level: 'Certified', grade: '' })
    } catch (err) { setMsg('Error: ' + err.message) }
  }

  return (
    <div className="dash">
      <DashHeader user={user} onLogout={onLogout} title={`Institute Panel — ${user.profile.instituteName || user.name}`} />
      <div className="card">
        <h3>Issue digital certificate</h3>
        <form className="grid-form" onSubmit={issue}>
          <input placeholder="Student full name" value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} required />
          <input placeholder="Student email" type="email" value={form.studentEmail} onChange={e => setForm({ ...form, studentEmail: e.target.value })} required />
          <input placeholder="Trade skill (e.g. Electrician)" value={form.tradeSkill} onChange={e => setForm({ ...form, tradeSkill: e.target.value })} required />
          <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
            <option>Certified</option><option>Advanced</option><option>Diploma</option><option>Apprentice</option>
          </select>
          <input placeholder="Grade / score (optional)" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} />
          <button className="cta" type="submit">Issue Certificate + QR</button>
        </form>
        {msg && <p className="success">{msg}</p>}
        {issued && (
          <div className="issued">
            <p><strong>Certificate ID:</strong> {issued.id}</p>
            <p className="muted small">Verification link: <a href={`#/verify/${issued.id}`}>#/verify/{issued.id}</a></p>
            <img src={issued.qr} alt="QR" className="qr-img" />
          </div>
        )}
      </div>
      <h3>Certificates issued ({certs.length})</h3>
      {certs.map(c => (
        <CertCard key={c.id} c={c}
          action={<button className="btn-ghost btn-sm" onClick={() => api.revokeCertificate(c.id).then(load).catch(e => alert(e.message))}>
            {c.status === 'revoked' ? 'Restore' : 'Revoke'}
          </button>} />
      ))}
    </div>
  )
}

export function AdminPanel({ user, onLogout }) {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('institutes')
  const load = useCallback(() => api.adminOverview().then(setData).catch(e => alert(e.message)), [])
  useEffect(() => { load() }, [load])
  if (!data) return <div className="dash"><DashHeader user={user} onLogout={onLogout} title="Admin" /><p className="muted">Loading…</p></div>

  const act = (fn) => () => fn().then(load).catch(e => alert(e.message))

  return (
    <div className="dash">
      <DashHeader user={user} onLogout={onLogout} title="Admin Panel" />
      <div className="stat-grid">
        <div><label>Students</label><strong>{data.totalStudents}</strong></div>
        <div><label>Institutes</label><strong>{data.totalInstitutes}</strong></div>
        <div><label>Pending</label><strong className="warn">{data.pendingInstitutes}</strong></div>
        <div><label>Certificates</label><strong>{data.totalCertificates}</strong></div>
        <div><label>Valid</label><strong className="ok">{data.validCertificates}</strong></div>
        <div><label>Verifications</label><strong>{data.totalVerifications}</strong></div>
      </div>
      <div className="tabs">
        {['institutes', 'students', 'certificates'].map(t => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'institutes' && data.institutes.map(i => (
        <div className="row-card" key={i.id}>
          <div><strong>{i.profile.instituteName || i.name}</strong>
            <div className="muted small">{i.profile.location} · {i.email} · {i.profile.programs?.join(', ')}</div></div>
          <span className={`pill ${i.status}`}>{i.status.toUpperCase()}</span>
          {i.status === 'pending' && <button className="btn-ghost btn-sm" onClick={act(() => api.approveInstitute(i.id))}>Approve</button>}
          {i.status !== 'rejected' && <button className="btn-ghost btn-sm" onClick={act(() => api.rejectInstitute(i.id))}>Reject</button>}
        </div>
      ))}
      {tab === 'students' && data.students.map(s => (
        <div className="row-card" key={s.id}><strong>{s.name}</strong><span className="muted">{s.email}</span></div>
      ))}
      {tab === 'certificates' && data.certificates.map(c => (
        <CertCard key={c.id} c={c}
          action={<button className="btn-ghost btn-sm" onClick={act(() => api.revokeCertificate(c.id))}>
            {c.status === 'revoked' ? 'Restore' : 'Revoke'}
          </button>} />
      ))}
    </div>
  )
}

export function DashHeader({ user, onLogout, title }) {
  return (
    <header className="topbar">
      <div><strong>{title}</strong><div className="muted small">{user.name} · {user.role}</div></div>
      <button className="btn-ghost btn-sm" onClick={onLogout}>Logout</button>
    </header>
  )
}
