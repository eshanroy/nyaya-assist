import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scale, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'
import api from '../api/client'
import './Auth.css'

export default function Auth({ mode = 'signin' }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (isSignup && !name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      if (isSignup) {
        await api.post('/api/auth/register', {
          name: name.trim(),
          email: email.trim(),
          password,
        })

        setSuccess('Account created! You can now sign in.')
        setTimeout(() => navigate('/signin'), 900)
      } else {
        const form = new URLSearchParams()
        form.append('username', email.trim())
        form.append('password', password)

        const response = await api.post('/api/auth/login', form, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })

        localStorage.setItem('access_token', response.data.access_token)
        navigate('/dashboard')
      }
    } catch (err) {
      const detail = err.response?.data?.detail

      setError(
        typeof detail === 'string'
          ? detail
          : 'Unable to connect. Check that the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon"><Scale size={25} /></span>
          <span>NyayaAssist <strong>AI</strong></span>
        </Link>

        <div className="auth-brand-content">
          <span className="auth-eyebrow">YOUR LEGAL DOCUMENT ASSISTANT</span>
          <h1>Clarity for complex legal documents.</h1>
          <p>
            Organise legal information, explore case summaries and keep your
            document analysis in one secure workspace.
          </p>

          <div className="auth-trust">
            <ShieldCheck size={19} />
            <span>Authentication-protected personal workspace</span>
          </div>
        </div>

        <p className="auth-panel-footer">
          AI-generated information should be reviewed carefully.
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-back-link">← Back to home</Link>

          <span className="auth-form-kicker">
            {isSignup ? 'JOIN NYAYAASSIST AI' : 'WELCOME BACK'}
          </span>

          <h2>{isSignup ? 'Create your account' : 'Sign in to your account'}</h2>

          <p className="auth-subtitle">
            {isSignup
              ? 'Set up your personal legal document workspace.'
              : 'Continue to your legal document workspace.'}
          </p>

          {error && <div className="auth-message auth-error" role="alert">{error}</div>}
          {success && <div className="auth-message auth-success" role="status">{success}</div>}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <label className="auth-field">
                Full name
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label className="auth-field">
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              Password
              <span className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {isSignup && (
              <label className="auth-field">
                Confirm password
                <input
                  type="password"
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? 'Please wait...'
                : isSignup
                  ? 'Create account'
                  : 'Sign in'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link to={isSignup ? '/signin' : '/signup'}>
              {isSignup ? 'Sign in' : 'Sign up'}
            </Link>
          </p>

          <p className="auth-security-note">
            <ShieldCheck size={15} />
            Your password is sent to the backend over the API connection and
            is hashed before storage.
          </p>
        </div>
      </section>
    </main>
  )
}
