import { useState } from 'react'
import './App.css'

const FEATURES = [
  { icon: '🎓', title: 'Skill Verification', desc: 'Verified trade skill certifications for workers across industries.' },
  { icon: '🪪', title: 'Digital Certificates', desc: 'Issue and verify tamper-proof digital trade certificates online.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Track apprentice progress, assessments and certification status.' },
  { icon: '🏢', title: 'For Employers', desc: 'Hire verified skilled tradespeople with confidence.' },
]

const ROLES = ['Apprentice', 'Skilled Worker', 'Certified Professional', 'Employer / Trainer']

export default function App() {
  const [role, setRole] = useState('Apprentice')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')

  const submit = (e) => {
    e.preventDefault()
    setMsg(`Welcome, ${form.name || 'User'}! (${role} registration — backend integration coming soon)`)
  }

  return (
    <div className="page">
      <nav className="nav">
        <div className="brand">⚙️ TradeCert</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#register">Register</a>
          <a href="#about">About</a>
        </div>
      </nav>

      <header className="hero">
        <h1>Trade Skill Certification Platform</h1>
        <p>Get certified. Get hired. Get ahead.</p>
        <p className="sub">
          A unified platform to learn trades, appear for assessments,
          earn verifiable digital certificates and connect with employers.
        </p>
        <a href="#register" className="cta">Get Certified — It's Free</a>
      </header>

      <section id="features" className="features">
        {FEATURES.map(f => (
          <div className="card" key={f.title}>
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <section id="register" className="register">
        <div className="card form-card">
          <h2>Create your account</h2>
          <div className="roles">
            {ROLES.map(r => (
              <button key={r} className={role === r ? 'active' : ''} onClick={() => setRole(r)}>{r}</button>
            ))}
          </div>
          <form onSubmit={submit}>
            <input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <button className="cta" type="submit">Register as {role}</button>
          </form>
          {msg && <p className="success">{msg}</p>}
        </div>
      </section>

      <footer id="about" className="footer">
        <p><strong>TradeCert</strong> — Trade Skill Certification Platform</p>
        <p className="muted">Unified Mentor · Project 1 · React + Node.js/Express</p>
      </footer>
    </div>
  )
}
