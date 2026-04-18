import React from 'react'
import { signOut } from '../lib/supabase'
import { useAuth, useToast } from '../App'

export default function Layout({ children, navigate, currentPage, goBack }) {
  const { user } = useAuth()
  const addToast = useToast()

  async function handleLogout() {
    try {
      await signOut()
      addToast('Logged out successfully', 'info')
    } catch (err) {
      addToast('Error logging out', 'error')
    }
  }

  const showBack = !['dashboard'].includes(currentPage)

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {showBack && (
              <button
                onClick={goBack}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px 10px', fontSize: '18px' }}
                aria-label="Go back"
              >
                ←
              </button>
            )}
            <div
              className="app-logo"
              onClick={() => navigate('dashboard')}
              style={{ cursor: 'pointer' }}
            >
              <div className="app-logo-icon">🩺</div>
              <span>PediTrack</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              display: 'none',
            }}
            className="desktop-only"
            >
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main animate-fade-in">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('dashboard')}
        >
          <span className="bottom-nav-icon">🏠</span>
          Home
        </button>
        <button
          className={`bottom-nav-item ${currentPage === 'patients' ? 'active' : ''}`}
          onClick={() => navigate('patients')}
        >
          <span className="bottom-nav-icon">👶</span>
          Patients
        </button>
        <button
          className="bottom-nav-item"
          onClick={() => navigate('patient-form')}
          style={{
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
            borderRadius: '16px',
            color: 'white',
            padding: '8px 16px',
            marginTop: '-16px',
            boxShadow: '0 4px 16px rgba(255,107,107,0.3)',
          }}
        >
          <span className="bottom-nav-icon">➕</span>
          Add
        </button>
        <button
          className={`bottom-nav-item ${currentPage === 'search' ? 'active' : ''}`}
          onClick={() => navigate('patients')}
        >
          <span className="bottom-nav-icon">🔍</span>
          Search
        </button>
      </nav>
    </div>
  )
}
