import React, { useState, useEffect } from 'react'
import { getDashboardStats, getPatients } from '../lib/supabase'
import { calculateAge, formatDate, formatRelativeTime, getInitials, genderIcon } from '../utils/formatters'
import { useAuth } from '../App'

const statCardStyles = [
  {
    bg: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    shadow: '0 8px 24px rgba(255,107,107,0.25)',
    icon: '👶'
  },
  {
    bg: 'linear-gradient(135deg, #4ECDC4, #44B09E)',
    shadow: '0 8px 24px rgba(78,205,196,0.25)',
    icon: '📋'
  },
  {
    bg: 'linear-gradient(135deg, #FFE66D, #F5D535)',
    shadow: '0 8px 24px rgba(245,213,53,0.25)',
    icon: '📅'
  },
]

export default function Dashboard({ navigate }) {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalPatients: 0, todayVisits: 0, upcomingCount: 0 })
  const [recentPatients, setRecentPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const [statsData, patients] = await Promise.all([
        getDashboardStats(),
        getPatients()
      ])
      setStats(statsData)
      setRecentPatients(patients.slice(0, 6))
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div className="skeleton" style={{ height: '40px', width: '280px', marginBottom: '24px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '20px' }}></div>)}
        </div>
        <div className="skeleton" style={{ height: '24px', width: '180px', marginBottom: '16px' }}></div>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '72px', borderRadius: '16px', marginBottom: '12px' }}></div>)}
      </div>
    )
  }

  const statCards = [
    { label: 'Total Patients', value: stats.totalPatients, ...statCardStyles[0] },
    { label: 'Visits Today', value: stats.todayVisits, ...statCardStyles[1] },
    { label: 'Follow-ups Due', value: stats.upcomingCount, ...statCardStyles[2] },
  ]

  return (
    <div className="animate-fade-in-up">
      {/* Greeting */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
          {greeting()}, Doctor! 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
          Here's your practice overview for today
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '36px',
      }}>
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`animate-fade-in-up stagger-${i + 1}`}
            style={{
              background: card.bg,
              borderRadius: '20px',
              padding: '20px',
              color: 'white',
              boxShadow: card.shadow,
              cursor: 'default',
              transition: 'transform 250ms',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px', fontWeight: 500 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '36px',
        flexWrap: 'wrap',
      }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('patient-form')}
          style={{ flex: '1', minWidth: '180px' }}
        >
          ➕ New Patient
        </button>
        <button
          className="btn btn-secondary btn-lg"
          onClick={() => navigate('patients')}
          style={{ flex: '1', minWidth: '180px' }}
        >
          🔍 Search Patients
        </button>
      </div>

      {/* Recent Patients */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '18px' }}>Recent Patients</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('patients')}
          >
            View All →
          </button>
        </div>

        {recentPatients.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon">👶</div>
            <h3>No patients yet</h3>
            <p>Start by adding your first patient record</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('patient-form')}
              style={{ marginTop: '16px' }}
            >
              ➕ Add First Patient
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentPatients.map((p, i) => (
              <div
                key={p.id}
                className={`card card-interactive animate-fade-in-up stagger-${i + 1}`}
                onClick={() => navigate('patient', { id: p.id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 18px',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: i % 2 === 0 ? 'var(--gradient-primary)' : 'var(--gradient-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '16px',
                  fontFamily: "'Outfit', sans-serif",
                  flexShrink: 0,
                }}>
                  {getInitials(p.name)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    {genderIcon(p.gender)} {p.name}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    gap: '8px',
                  }}>
                    <span>{calculateAge(p.date_of_birth)}</span>
                    <span>•</span>
                    <span>{p.guardian_name}</span>
                  </div>
                </div>

                {/* Timestamp */}
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {formatRelativeTime(p.updated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
