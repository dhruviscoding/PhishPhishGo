import { useState, useEffect } from 'react'

function RiskMeter({ score, color }) {
  const [displayScore, setDisplayScore] = useState(0)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayScore / 100) * circumference

  useEffect(() => {
    setDisplayScore(0)
    const duration = 1000
    const steps = 30
    const increment = score / steps
    let current = 0
    let step = 0

    const interval = setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        setDisplayScore(score)
        clearInterval(interval)
      } else {
        setDisplayScore(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [score])

  return (
    <div className="risk-meter-circle">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#2f333d"
          strokeWidth="12"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{ 
            transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
            filter: score >= 70 ? `drop-shadow(0 0 8px ${color})` : 'none'
          }}
        />
        <text
          x="90"
          y="85"
          textAnchor="middle"
          fontSize="42"
          fontWeight="800"
          fill={color}
        >
          {displayScore}
        </text>
        <text
          x="90"
          y="110"
          textAnchor="middle"
          fontSize="12"
          fill="#8e8ea0"
          letterSpacing="1"
        >
          RISK SCORE
        </text>
      </svg>
    </div>
  )
}

export default RiskMeter