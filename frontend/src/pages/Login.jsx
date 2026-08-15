import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid credentials. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container auth-wrap">
      <div style={{ width: '100%' }}>
        <div className="auth-title">
          <span className="eyebrow">Welcome Back</span>
          <h1 className="display">Sign In</h1>
        </div>
        <form onSubmit={submit} className="form">
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label>Username</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-solid btn-block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-foot">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  )
}