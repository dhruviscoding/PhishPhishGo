import { useState } from 'react'
import fishIdle from './assets/fish-idle.svg'
import fishThinking from './assets/fish-thinking.svg'

function Chatbot({ analysisResult }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_result: analysisResult || {},
          user_message: text,
          conversation_history: newMessages
        })
      })
      const data = await response.json()
      setMessages([...newMessages, { role: 'assistant', content: data.response || data.error }])
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Try again.' }])
    }
    setLoading(false)
  }

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        <img src={loading ? fishThinking : fishIdle} alt="chatbot" />
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>Ask PhishPhishGo</span>
          </div>
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-message assistant">
                Hi! I can help explain this result or tell you what to do next. What would you like to know?
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {loading && <div className="chatbot-message assistant">Thinking...</div>}
          </div>
          <div className="chatbot-input-row">
            <input
              type="text"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            />
            <button onClick={() => sendMessage(input)}>Send</button>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot