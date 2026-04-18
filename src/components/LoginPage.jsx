import React, { useState } from 'react'
import { signIn, signUp } from '../lib/supabase'
import { useToast } from '../App'

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 30%, #FFE66D 60%, #4ECDC4 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  floatingShape: (top, left, size, delay) => ({
    position: 'absolute',
    top, left,
    width: size, height: size,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    animation: `float 6s ease-in-out ${delay}s infinite`,
  }),
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '32px',
    padding: '48px 36px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
    position: 'relative',
    zIndex: 1,
    animation: 'scaleIn 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    marginBottom: '16px',
    boxShadow: '0 8px 24px rgba(255,107,107,0.3)',
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '28px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '4px',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    color: '#636E72',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 500,
    color: '#636E72',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #F0E6DA',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 150ms',
    fontFamily: "'Inter', sans-serif",
    background: '#FFFAF5',
  },
  button: {
    marginTop: '8px',
    padding: '16px',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: "'Outfit', sans-serif",
    cursor: 'pointer',
    transition: 'all 250ms',
    background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    color: 'white',
    boxShadow: '0 4px 24px rgba(255,107,107,0.3)',
  },
  toggleText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#636E72',
  },
  toggleLink: {
    color: '#FF6B6B',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
  },
  tagline: {
    textAlign: 'center',
    marginTop: '24px',
    padding: '16px',
    background: 'linear-gradient(135deg, #FFF0F0, #E8FAF8)',
    borderRadius: '12px',
    fontSize: '13px',
    color: '#636E72',
    lineHeight: 1.5,
  }
}

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const addToast = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
        addToast('Account created! Check your email for verification.', 'success')
        setIsSignUp(false)
      } else {
        const data = await signIn(email, password)
        onLogin(data.session)
        addToast('Welcome back, Doctor! 👋', 'success')
      }
    } catch (error) {
      addToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Floating decorative shapes */}
      <div style={styles.floatingShape('10%', '10%', '120px', 0)}></div>
      <div style={styles.floatingShape('60%', '80%', '80px', 1)}></div>
      <div style={styles.floatingShape('80%', '20%', '60px', 2)}></div>
      <div style={styles.floatingShape('20%', '75%', '100px', 0.5)}></div>

      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>🩺</div>
          <h1 style={styles.title}>PediTrack</h1>
          <p style={styles.subtitle}>Pediatric Patient Records</p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              id="login-email"
              type="email"
              style={styles.input}
              placeholder="doctor@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={e => {
                e.target.style.borderColor = '#FF6B6B'
                e.target.style.boxShadow = '0 0 0 4px rgba(255,107,107,0.1)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#F0E6DA'
                e.target.style.boxShadow = 'none'
              }}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              id="login-password"
              type="password"
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={e => {
                e.target.style.borderColor = '#FF6B6B'
                e.target.style.boxShadow = '0 0 0 4px rgba(255,107,107,0.1)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#F0E6DA'
                e.target.style.boxShadow = 'none'
              }}
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={6}
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              transform: loading ? 'none' : undefined,
            }}
            onMouseEnter={e => {
              if (!loading) e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'none'
            }}
            disabled={loading}
          >
            {loading ? '⏳ Please wait...' : (isSignUp ? '🚀 Create Account' : '🔑 Sign In')}
          </button>
        </form>

        <div style={styles.toggleText}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            style={styles.toggleLink}
            onClick={() => setIsSignUp(!isSignUp)}
            type="button"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <div style={styles.tagline}>
          🏥 Built with ❤️ for pediatricians<br/>
          Track patients • Store records • Never miss a detail
        </div>
      </div>
    </div>
  )
}
