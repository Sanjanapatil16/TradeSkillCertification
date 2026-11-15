import { useState, useEffect, useCallback } from 'react'
import { api } from './api.js'

// Public verification page — /#/verify or /#/verify/<id>
export function Verify({ certId }) {
  const [id, setId] = useState(certId || '')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const doVerify = useCallback(async (target) => {
    setError(''); setResult(null)
    try { setResult(await api.verify(target)) }
    catch (e) { setError(e.message) }
  }, [])

  useEffect(() => { if (certId) doVerify(certId) }, [certId, doVerify])

  const c = result?.certificate
  return (
    <div className="center-page">
      <div className="card verify-card">
        <h2>🔍 Certificate Verification</h2>
        <p className="muted">Enter a certificate ID or scan the QR code on a digital badge.</p>
        <div className="row">
          <input placeholder="e.g. TC-1A2B3C-4D5E6F" value={id} onChange={e => setId(e.target.value.toUpperCase())} />
          <button className="cta" onClick={() => doVerify(id.trim())}>Verify</button>
        </div>
        {error && <p className="error">{error}</p>}
        {result && c && (
          <div className={`verdict ${result.valid ? 'valid' : 'invalid'}`}>
            <div className="verdict-icon">{result.valid ? '✅' : '❌'}</div>
            <h3>{result.valid ? 'AUTHENTIC CERTIFICATE' : 'INVALID / REVOKED'}</h3>
            <div className="cert-details">
              <p><strong>Trade Skill:</strong> {c.tradeSkill} ({c.level}{c.grade ? ', Grade ' + c.grade : ''})</p>
              <p><strong>Student:</strong> {c.studentName}</p>
              <p><strong>Issued:</strong> {new Date(c.issueDate).toLocaleDateString()}</p>
              <p><strong>Institute:</strong> {result.institute?.name} — {result.institute?.location}</p>
              <p><strong>Certificate ID:</strong> {c.id}</p>
              <p className="muted small">Times verified: {c.verifyCount}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Public digital badge page — /#/badge/<id>
export function Badge({ certId }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    api.verify(certId).then(setData).catch(e => setError(e.message))
  }, [certId])
  const c = data?.certificate
  return (
    <div className="center-page">
      <div className="card badge-card">
        {error && <p className="error">{error}</p>}
        {!data && !error && <p className="muted">Loading badge…</p>}
        {c && (
          <>
            <div className="badge-visual">
              <div className="badge-ribbon">{data.valid ? 'VERIFIED' : 'REVOKED'}</div>
              <div className="badge-icon-lg">🏅</div>
              <h2>{c.tradeSkill}</h2>
              <p>{c.level}{c.grade ? ' · Grade ' + c.grade : ''}</p>
              <p className="muted">Awarded to {c.studentName}</p>
            </div>
            <p className="muted small center">{c.instituteName} · {new Date(c.issueDate).toLocaleDateString()}</p>
            {c.qr && <img src={c.qr} alt="QR" className="qr-img" />}
            <p className="cert-id center">ID: {c.id}</p>
            <a className="btn-ghost btn-sm" href={`#/verify/${c.id}`}>Verify this certificate</a>
          </>
        )}
      </div>
    </div>
  )
}
