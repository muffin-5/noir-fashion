import { useState, useEffect } from 'react'

export function showToast(message) {
  window.dispatchEvent(new CustomEvent('toast', { detail: message }))
}

export default function Toast() {
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail)
      setTimeout(() => setMessage(null), 2600)
    }
    window.addEventListener('toast', handler)
    return () => window.removeEventListener('toast', handler)
  }, [])

  return <div className={`toast ${message ? 'show' : ''}`}>{message}</div>
}