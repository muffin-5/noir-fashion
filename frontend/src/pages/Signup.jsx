import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api/client'
import { showToast } from '../components/Toast'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await signup({
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
      })
      showToast('Account created – please sign in')
      navigate('/login')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create your account.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container auth-wrap">
      <div style={{ width: '100%' }}>
        <div className="auth-title">
          <span className="eyebrow">Join the Atelier</span>
          <h1 className="display">Create Account</h1>
        </div>
        <form onSubmit={submit} className="form">
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label>Username</label>
            <input value={form.username} onChange={set('username')} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="field-grid">
            <div className="field">
              <label>First name</label>
              <input value={form.first_name} onChange={set('first_name')} />
            </div>
            <div className="field">
              <label>Last name</label>
              <input value={form.last_name} onChange={set('last_name')} />
            </div>
          </div>
          <div className="field-grid">
            <div className="field">
              <label>Password</label>
              <input type="password" value={form.password} onChange={set('password')} minLength={8} required />
            </div>
            <div className="field">
              <label>Confirm</label>
              <input type="password" value={form.confirm} onChange={set('confirm')} minLength={8} required />
            </div>
          </div>
          <button className="btn btn-solid btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}