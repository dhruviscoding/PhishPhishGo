import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!message.trim()) return
    setLoading(true)
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

  return (
    <div className="app">
      <header className="header">
        <h1>PhishPhishGo</h1>
        <p>Paste a suspicious message to check if it's a scam</p>
      </header>

      <div className="input-section">
        <textarea
          placeholder="Paste the message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />
        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {result && (
        <div className="result-section">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App