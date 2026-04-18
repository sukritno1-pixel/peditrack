import React, { useState, useEffect, useCallback } from 'react'
import { getPatients } from '../lib/supabase'
import { calculateAge, getInitials, genderIcon, formatRelativeTime, formatPhone } from '../utils/formatters'

export default function PatientList({ navigate }) {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadPatients = useCallback(async (term = '') => {
    try {
      setLoading(true)
      const data = await getPatients(term)
      setPatients(data)
    } catch (err) {
      console.error('Error loading patients:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, loadPatients])

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '4px' }}>Patients</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          {patients.length} patient{patients.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <span style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '18px',
          opacity: 0.5,
        }}>🔍</span>
        <input
          id="patient-search"
          type="text"
          className="form-input"
          placeholder="Search by name, phone, or guardian..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            paddingLeft: '48px',
            borderRadius: '16px',
            fontSize: '15px',
            padding: '14px 16px 14px 48px',
          }}
        />
      </div>

      {/* Add Patient Button */}
      <button
        className="btn btn-primary"
        onClick={() => navigate('patient-form')}
        style={{ width: '100%', marginBottom: '20px' }}
      >
        ➕ Add New Patient
      </button>

      {/* Patient List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton" style={{ height: '76px', borderRadius: '16px' }}></div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>{search ? 'No matches found' : 'No patients yet'}</h3>
          <p>{search ? `No patients matching "${search}"` : 'Start by adding your first patient'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {patients.map((p, i) => (
            <div
              key={p.id}
              className={`card card-interactive animate-slide-in-right stagger-${Math.min(i + 1, 5)}`}
              onClick={() => navigate('patient', { id: p.id })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: ['var(--gradient-primary)', 'var(--gradient-secondary)', 'var(--gradient-cool)', 'var(--gradient-warm)'][i % 4],
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

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {genderIcon(p.gender)} {p.name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span>{calculateAge(p.date_of_birth)}</span>
                  <span>•</span>
                  <span>📞 {formatPhone(p.guardian_phone)}</span>
                </div>
                {p.allergies && p.allergies.length > 0 && (
                  <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {p.allergies.slice(0, 3).map((a, j) => (
                      <span key={j} className="badge badge-warning" style={{ fontSize: '10px' }}>
                        ⚠️ {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ fontSize: '20px', color: 'var(--color-text-muted)' }}>›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
