import React from 'react'
import { formatDate } from '../utils/formatters'

export default function VisitSummary({ visits, patient }) {
  if (!visits || visits.length === 0) return null

  // Analyze visits to create summary
  const totalVisits = visits.length
  const firstVisit = visits[visits.length - 1]
  const lastVisit = visits[0]
  
  // Collect all unique diagnoses
  const diagnosesMap = {}
  visits.forEach(v => {
    if (v.diagnosis) {
      const diag = v.diagnosis.toLowerCase().trim()
      diagnosesMap[diag] = (diagnosesMap[diag] || 0) + 1
    }
  })
  const topDiagnoses = Object.entries(diagnosesMap)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])

  // Track weight changes
  let weightChange = null
  let latestWeight = null
  let previousWeight = null

  if (visits.length >= 2) {
    const vitalsWithWeight = visits.filter(v => v.vitals && v.vitals.weight_kg)
    if (vitalsWithWeight.length >= 2) {
      latestWeight = vitalsWithWeight[0].vitals.weight_kg
      previousWeight = vitalsWithWeight[1].vitals.weight_kg
      weightChange = (latestWeight - previousWeight).toFixed(1)
    }
  }

  return (
    <div className="card" style={{ 
      marginBottom: '20px', 
      background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFFFF 100%)',
      borderLeft: '4px solid var(--color-primary)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>📊</span>
        <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--color-text)' }}>Patient Summary</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--color-bg)', padding: '10px', borderRadius: '10px' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Visits</div>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>{totalVisits}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Since {formatDate(firstVisit.visit_date)}
          </div>
        </div>

        {topDiagnoses.length > 0 && (
          <div style={{ background: 'var(--color-bg)', padding: '10px', borderRadius: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Common Diagnoses</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {topDiagnoses.slice(0, 3).map((d, i) => (
                <span key={i} className="badge badge-secondary" style={{ fontSize: '10px', textTransform: 'capitalize' }}>{d}</span>
              ))}
            </div>
          </div>
        )}

        {weightChange !== null && (
          <div style={{ background: 'var(--color-bg)', padding: '10px', borderRadius: '10px' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Weight Trend</div>
            <div style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {latestWeight} kg
              <span style={{ 
                fontSize: '12px', 
                color: weightChange > 0 ? 'var(--color-success-dark)' : (weightChange < 0 ? 'var(--color-danger-dark)' : 'var(--color-text-muted)'),
                background: weightChange > 0 ? '#E8F8F0' : (weightChange < 0 ? '#FFF0F0' : 'var(--color-border-light)'),
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {weightChange > 0 ? '↑' : (weightChange < 0 ? '↓' : '-')} {Math.abs(weightChange)}
              </span>
            </div>
          </div>
        )}
      </div>

      {lastVisit.remarks && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Last Visit Notes ({formatDate(lastVisit.visit_date)})
          </div>
          <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', padding: '8px 12px', borderRadius: '8px' }}>
            "{lastVisit.remarks}"
          </div>
        </div>
      )}
    </div>
  )
}
