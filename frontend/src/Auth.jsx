import { useState, useEffect } from 'react'
import { api, setToken } from './api.js'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('student')
  const [form, setForm] = useState({ name: '', email: '', password: '', instituteName: '', location: '', programs: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const body = { name: form.name, email: form.email, password: form.password, role }
      if (role === 'institute') {
        body.profile = {
          instituteName: form.instituteName,
          location: form.location,
          programs: form.programs.split(',').map(s => s.trim()).filter(Boolean)
        }
      }
      const res = mode === 'register' ? await api.register(body) : await api.login({ email: form.email, password: form.password })
      setToken(res.token)
      onAuth(res.user)
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="center-page">
      <div className="card form-card">
        <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <div className="tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>
        {mode === 'register' && (
          <div className="roles">
            <button className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>🎓 Student</button>
            <button className={role === 'institute' ? 'active' : ''} onClick={() => setRole('institute')}>🏛️ Institute</button>
          </div>
        )}
        <form onSubmit={submit}>
          {mode === 'register' && <input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />}
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Password (min 6 chars)" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          {mode === 'register' && role === 'institute' && (
            <>
              <input placeholder="Institute name" value={form.instituteName} onChange={e => setForm({ ...form, instituteName: e.target.value })} required />
              <input placeholder="Location (city, state)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
              <input placeholder="Programs offered (comma separated)" value={form.programs} onChange={e => setForm({ ...form, programs: e.target.value })} />
            </>
          )}
          {error && <p className="error">{error}</p>}
          <button className="cta btn-block" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}</button>
        </form>
        {mode === 'register' && role === 'institute' && (
          <p className="muted small center">Institute accounts require admin approval before issuing certificates.</p>
        )}
      </div>
    </div>
  )
}
