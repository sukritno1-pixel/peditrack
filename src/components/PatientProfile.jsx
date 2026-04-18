import React, { useState, useEffect } from 'react'
import { getPatient, getVisits, getVisitImages, deletePatient } from '../lib/supabase'
import { calculateAge, formatDate, formatDateTime, getInitials, genderIcon, formatPhone, formatPatientId } from '../utils/formatters'
import VisitSummary from './VisitSummary'
import ImageGallery from './ImageGallery'
import { useToast } from '../App'

export default function PatientProfile({ patientId, navigate, goBack }) {
  const addToast = useToast()
  const [patient, setPatient] = useState(null)
  const [visits, setVisits] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('visits')
  const [expandedVisit, setExpandedVisit] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadData()
  }, [patientId])

  async function loadData() {
    try {
      const [p, v, img] = await Promise.all([
        getPatient(patientId),
        getVisits(patientId),
        getVisitImages(patientId),
      ])
      setPatient(p)
      setVisits(v)
      setImages(img)
    } catch (err) {
      addToast('Error loading patient', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      await deletePatient(patientId)
      addToast('Patient deleted', 'info')
      navigate('patients')
    } catch (err) {
      addToast('Error deleting patient', 'error')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div className="skeleton" style={{ height: '160px', borderRadius: '24px', marginBottom: '20px' }}></div>
        <div className="skeleton" style={{ height: '120px', borderRadius: '16px', marginBottom: '16px' }}></div>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '16px', marginBottom: '12px' }}></div>)}
      </div>
    )
  }

  if (!patient) return <div className="empty-state"><h3>Patient not found</h3></div>

  const tabs = [
    { id: 'visits', label: '📋 Visits', count: visits.length },
    { id: 'images', label: '📷 Images', count: images.length },
    { id: 'info', label: 'ℹ️ Info', count: null },
  ]

  return (
    <div className="animate-fade-in-up">
      {/* Patient Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFE66D 100%)',
        borderRadius: '24px',
        padding: '24px',
        color: 'white',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            flexShrink: 0,
            backdropFilter: 'blur(10px)',
          }}>
            {getInitials(patient.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
              {genderIcon(patient.gender)} {patient.name}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '2px' }}>
              {calculateAge(patient.date_of_birth)} • {formatPatientId(patient.id)}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '2px' }}>
              👨‍👩‍👧 {patient.guardian_name} • 📞 {formatPhone(patient.guardian_phone)}
            </div>
          </div>
        </div>

        {/* Quick badges */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          {patient.blood_group && (
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              🩸 {patient.blood_group}
            </span>
          )}
          {patient.allergies?.map((a, i) => (
            <span key={i} style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              ⚠️ {a}
            </span>
          ))}
        </div>
      </div>

      {/* Visit Summary Card */}
      {visits.length > 0 && (
        <VisitSummary visits={visits} patient={patient} />
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate('visit-form', { patientId: patient.id, patientName: patient.name })}
          style={{ flex: 1 }}
        >
          📝 Record Visit
        </button>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('patient-form', { id: patient.id })}
        >
          ✏️
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowDeleteConfirm(true)}
          style={{ color: 'var(--color-danger)' }}
        >
          🗑️
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'var(--color-bg-secondary)',
        padding: '4px',
        borderRadius: '14px',
        marginBottom: '20px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
              transition: 'all 200ms',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {tab.label} {tab.count !== null && <span style={{ opacity: 0.6 }}>({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'visits' && (
        <div>
          {visits.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon">📋</div>
              <h3>No visits recorded</h3>
              <p>Start by recording the first visit</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute',
                left: '18px',
                top: '0',
                bottom: '0',
                width: '2px',
                background: 'var(--color-border)',
              }}></div>

              {visits.map((v, i) => (
                <div
                  key={v.id}
                  className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
                  style={{
                    position: 'relative',
                    paddingLeft: '48px',
                    marginBottom: '16px',
                  }}
                >
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '10px',
                    top: '20px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: i === 0 ? 'var(--color-primary)' : 'var(--color-border)',
                    border: '3px solid var(--color-bg)',
                    zIndex: 1,
                  }}></div>

                  <div
                    className="card"
                    onClick={() => setExpandedVisit(expandedVisit === v.id ? null : v.id)}
                    style={{ cursor: 'pointer', padding: '16px 18px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                          📅 {formatDateTime(v.visit_date)}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                          {v.chief_complaint}
                        </div>
                        {v.diagnosis && (
                          <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                            🏥 {v.diagnosis}
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontSize: '18px',
                        transition: 'transform 200ms',
                        transform: expandedVisit === v.id ? 'rotate(180deg)' : 'none',
                      }}>
                        ▾
                      </span>
                    </div>

                    {/* Expanded details */}
                    {expandedVisit === v.id && (
                      <div style={{
                        marginTop: '14px',
                        paddingTop: '14px',
                        borderTop: '1px solid var(--color-border-light)',
                        animation: 'fadeInDown 200ms ease-out',
                      }}>
                        {v.vitals && (
                          <div style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                            marginBottom: '12px',
                          }}>
                            {v.vitals.weight_kg && (
                              <span className="badge badge-secondary">⚖️ {v.vitals.weight_kg} kg</span>
                            )}
                            {v.vitals.height_cm && (
                              <span className="badge badge-secondary">📏 {v.vitals.height_cm} cm</span>
                            )}
                            {v.vitals.temperature && (
                              <span className="badge badge-secondary">🌡️ {v.vitals.temperature}°F</span>
                            )}
                            {v.vitals.head_circumference_cm && (
                              <span className="badge badge-secondary">📐 HC: {v.vitals.head_circumference_cm} cm</span>
                            )}
                          </div>
                        )}

                        {v.prescription && (
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                              💊 Prescription
                            </div>
                            <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', background: 'var(--color-bg)', padding: '10px', borderRadius: '8px' }}>
                              {v.prescription}
                            </div>
                          </div>
                        )}

                        {v.remarks && (
                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                              📝 Doctor's Remarks
                            </div>
                            <div style={{
                              fontSize: '14px',
                              whiteSpace: 'pre-wrap',
                              background: 'linear-gradient(135deg, #FFF0F0, #E8FAF8)',
                              padding: '10px',
                              borderRadius: '8px',
                              borderLeft: '3px solid var(--color-primary)',
                            }}>
                              {v.remarks}
                            </div>
                          </div>
                        )}

                        {v.follow_up_date && (
                          <div style={{ fontSize: '13px', color: 'var(--color-info-dark)' }}>
                            📅 Follow-up: {formatDate(v.follow_up_date)}
                          </div>
                        )}

                        {/* Visit images */}
                        {v.visit_images && v.visit_images.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                              📷 {v.visit_images.length} image(s) attached
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'images' && (
        <ImageGallery images={images} />
      )}

      {activeTab === 'info' && (
        <div className="card animate-fade-in" style={{ padding: '20px' }}>
          <h4 style={{ marginBottom: '16px' }}>Patient Information</h4>
          <div style={{ display: 'grid', gap: '14px' }}>
            {[
              { label: 'Full Name', value: patient.name },
              { label: 'Date of Birth', value: formatDate(patient.date_of_birth) },
              { label: 'Age', value: calculateAge(patient.date_of_birth) },
              { label: 'Gender', value: `${genderIcon(patient.gender)} ${patient.gender}` },
              { label: 'Blood Group', value: patient.blood_group || 'Not recorded' },
              { label: 'Guardian', value: patient.guardian_name },
              { label: 'Phone', value: formatPhone(patient.guardian_phone) },
              { label: 'Address', value: patient.address || 'Not recorded' },
              { label: 'Allergies', value: patient.allergies?.join(', ') || 'None' },
              { label: 'Medical Notes', value: patient.medical_notes || 'None' },
              { label: 'Patient Since', value: formatDate(patient.created_at) },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '10px' }}>
                <div style={{ width: '120px', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500, flexShrink: 0 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="modal" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ marginBottom: '8px' }}>Delete Patient?</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              This will permanently delete {patient.name}'s records, visits, and images. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleDelete}
                style={{ flex: 1, background: 'var(--color-danger)', color: 'white' }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
