import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { supabase } from './lib/supabase'
import LoginPage from './components/LoginPage'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import PatientList from './components/PatientList'
import PatientForm from './components/PatientForm'
import PatientProfile from './components/PatientProfile'
import VisitForm from './components/VisitForm'

// ============================================
// Auth Context
// ============================================
const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// ============================================
// Toast Context
// ============================================
const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && '✓ '}
            {t.type === 'error' && '✕ '}
            {t.type === 'info' && 'ℹ '}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ============================================
// Simple Router
// ============================================
function useRouter() {
  const [route, setRoute] = useState({ page: 'dashboard', params: {} })

  const navigate = useCallback((page, params = {}) => {
    setRoute({ page, params })
    window.scrollTo(0, 0)
  }, [])

  const goBack = useCallback(() => {
    // Simple back logic
    if (route.page === 'visit-form') {
      navigate('patient', { id: route.params.patientId })
    } else if (route.page === 'patient' || route.page === 'patient-form') {
      navigate('patients')
    } else {
      navigate('dashboard')
    }
  }, [route, navigate])

  return { route, navigate, goBack }
}

// ============================================
// App Component
// ============================================
function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
            Loading PediTrack...
          </p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <ToastProvider>
        <AuthContext.Provider value={{ session, user: null }}>
          <LoginPage onLogin={setSession} />
        </AuthContext.Provider>
      </ToastProvider>
    )
  }

  // Render the current page
  function renderPage() {
    switch (router.route.page) {
      case 'dashboard':
        return <Dashboard navigate={router.navigate} />
      case 'patients':
        return <PatientList navigate={router.navigate} />
      case 'patient-form':
        return <PatientForm
          navigate={router.navigate}
          patientId={router.route.params.id}
          goBack={router.goBack}
        />
      case 'patient':
        return <PatientProfile
          patientId={router.route.params.id}
          navigate={router.navigate}
          goBack={router.goBack}
        />
      case 'visit-form':
        return <VisitForm
          patientId={router.route.params.patientId}
          patientName={router.route.params.patientName}
          navigate={router.navigate}
          goBack={router.goBack}
        />
      default:
        return <Dashboard navigate={router.navigate} />
    }
  }

  return (
    <ToastProvider>
      <AuthContext.Provider value={{ session, user: session?.user }}>
        <Layout navigate={router.navigate} currentPage={router.route.page} goBack={router.goBack}>
          {renderPage()}
        </Layout>
      </AuthContext.Provider>
    </ToastProvider>
  )
}

export default App
