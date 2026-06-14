import { useState } from 'react'
import './App.css'
import logo from './assets/logo.svg'
import RiskMeter from './RiskMeter'

function App() {
  const [mode, setMode] = useState('text') // 'text' or 'qr'
  const [qrFile, setQrFile] = useState(null)
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: 'Failed to analyze. Is the backend running?' })
    }
    setLoading(false)
  }

  const handleQrAnalyze = async () => {
  if (!qrFile) return
  setLoading(true)
  setResult(null)
  try {
    const formData = new FormData()
    formData.append('file', qrFile)
    const response = await fetch('http://127.0.0.1:8000/decode-qr', {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    setResult(data)
  } catch (error) {
    console.error('Error:', error)
    setResult({ error: 'Failed to analyze QR code. Is the backend running?' })
  }
  setLoading(false)
}

  const getRiskColor = (score) => {
    if (score >= 70) return '#ef4444'
    if (score >= 40) return '#f59e0b'
    if (score >= 15) return '#eab308'
    return '#22c55e'
  }

  return (
    <div className="app">
      <header className="header">
        <img src={logo} alt="PhishPhishGo logo" className="logo" />
        <h1>PhishPhishGo</h1>
        <p>Paste a suspicious message to check if it's a scam</p>
      </header>

      <div className="mode-toggle">
        <button 
          className={mode === 'text' ? 'tab active' : 'tab'} 
          onClick={() => setMode('text')}
        >
          Paste Message
        </button>
        <button 
          className={mode === 'qr' ? 'tab active' : 'tab'} 
          onClick={() => setMode('qr')}
        >
          Upload QR Code
        </button>
      </div>

<div className="input-section">
  {mode === 'text' ? (
    <>
      <textarea
        placeholder="Paste the message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </>
  ) : (
    <>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setQrFile(e.target.files[0])}
        className="file-input"
      />
      <button onClick={handleQrAnalyze} disabled={loading || !qrFile}>
        {loading ? 'Analyzing...' : 'Analyze QR Code'}
      </button>
    </>
  )}
</div>

      {result && !result.error && (
        <div className="result-section">
          <div className="risk-meter">
            <RiskMeter score={result.risk_score} color={getRiskColor(result.risk_score)} />
            <div className="risk-verdict" style={{ color: getRiskColor(result.risk_score) }}>
              {result.verdict}
          </div>
        </div>

          <div className="details-section">
            <h3>Why this verdict?</h3>
            <ul>
              {result.explanations.map((exp, i) => (
                <li key={i}>{exp}</li>
              ))}
            </ul>
          </div>

          {result.urls_found.length > 0 && (
            <div className="details-section">
              <h3>URLs Found</h3>
              <ul>
                {result.urls_found.map((url, i) => (
                  <li key={i}>{url}</li>
                ))}
              </ul>
            </div>
          )}

          {result.domain_reputation.length > 0 && (
            <div className="details-section">
              <h3>Domain Reputation</h3>
              <ul>
                {result.domain_reputation.map((d, i) => (
                  <li key={i}>
                    {d.domain} - {d.malicious_votes} malicious reports
                    {d.is_flagged && ' (FLAGGED)'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.ml_prediction && (
            <div className="ml-info">
              ML Model: {result.ml_prediction} ({result.ml_confidence}% confidence)
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="empty-state">
          <p>Paste a message or upload a QR code to check if it's a scam</p>
        </div>
      )}

      {result && result.error && (
        <div className="error-section">{result.error}</div>
      )}
    </div>
  )
}
export default App