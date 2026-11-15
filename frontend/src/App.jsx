import { useState, useEffect } from 'react'
import { api, getToken, setToken } from './api.js'
import Auth from './Auth.jsx'
import { StudentDashboard, InstitutePanel, AdminPanel } from './Dashboards.jsx'
import { Verify, Badge } from './Verify.jsx'
import './App.css'

const FEATURES = [
  { icon: '🎓', title: 'Verified Certificates', desc: 'Institutes issue tamper-proof digital trade certificates online.' },
  { icon: '�', title: 'Instant Verification', desc: 'Employers verify any certificate by ID or QR code in seconds.' },
  { icon: '�', title: 'Digital Badges', desc: 'Students showcase shareable badges and build a credential portfolio.' },
  { icon: '🛡️', title: 'Fraud Prevention', desc: 'Unique IDs, revocation support and verification logs stop fake certificates.' },
]

function Landing({ onLogin }) {
  return (
    <div className="page">
      <nav className="nav">
        <div className="brand">⚙️ TradeCert</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#/verify">Verify Certificate</a>
          <a href="#/login" onClick={onLogin}>Login</a>
        </div>
      </nav>
      <header className="hero">
        <h1>Trade Skill Certification Verification</h1>
        <p>& Digital Badge Platform</p>
        <p className="sub">
          Verified digital certificates and badges for vocational trades — electricians, welders,
          machinists and more. Institutes issue, students showcase, employers verify.
        </p>
        <div className="hero-btns">
          <a href="#/register" className="cta">Get Started</a>
          <a href="#/verify" className="cta ghost">Verify a Certificate</a>
        </div>
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
      <section className="how">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step"><b>1</b><p>Institute issues a digital certificate with a unique ID and QR code</p></div>
          <div className="step"><b>2</b><p>Student adds it to their digital portfolio and shares the badge</p></div>
          <div className="step"><b>3</b><p>Employer verifies authenticity instantly — valid or revoked</p></div>
        </div>
      </section>
      <footer className="footer">
        <p><strong>TradeCert</strong> — Trade Skill Certification Verification & Digital Badge Platform</p>
        <p className="muted">Unified Mentor · National Skill Development Corporation · Skill India · Credly</p>
      </footer>
    </div>
  )
}

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const fn = () => { setHash(window.location.hash); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])
  return hash
}

export default function App() {
  const hash = useHashRoute()
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(!!getToken())

  useEffect(() => {
    if (!getToken()) { setChecking(false); return }
    api.me().then(d => setUser(d.user)).catch(() => setToken(null)).finally(() => setChecking(false))
  }, [])

  const logout = () => { setToken(null); setUser(null); window.location.hash = '#/' }
  const route = hash.replace(/^#\/?/, '') || ''

  // Public routes
  if (route.startsWith('verify')) {
    const id = route.split('/')[1] || ''
    return <Verify certId={id} />
  }
  if (route.startsWith('badge/')) {
    return <Badge certId={route.split('/')[1]} />
  }

  // Auth-required routes
  if (route === 'login' || route === 'register' || (!user && route !== '')) {
    if (!user && (route === 'dashboard' || route === 'institute' || route === 'admin')) {
      window.location.hash = '#/login'
      return null
    }
    return <Auth onAuth={(u) => { setUser(u); window.location.hash = u.role === 'admin' ? '#/admin' : u.role === 'institute' ? '#/institute' : '#/dashboard' }} />
  }

  if (checking) return <div className="center-page"><p className="muted">Loading…</p></div>
  if (!user) return <Landing onLogin={() => {}} />

  if (route === 'admin' && user.role === 'admin') return <AdminPanel user={user} onLogout={logout} />
  if (route === 'institute' && user.role === 'institute') return <InstitutePanel user={user} onLogout={logout} />
  if (route === 'dashboard' || user.role === 'student') return <StudentDashboard user={user} onLogout={logout} />
  // institute/admin landing defaults
  if (user.role === 'institute') return <InstitutePanel user={user} onLogout={logout} />
  return <AdminPanel user={user} onLogout={logout} />
}
