import React, { useState, useEffect } from 'react'
import { createPatient, updatePatient, getPatient } from '../lib/supabase'
import { BLOOD_GROUPS } from '../utils/formatters'
import { useToast } from '../App'

export default function PatientForm({ navigate, patientId, goBack }) {
  const addToast = useToast()
  const isEdit = !!patientId
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)

  const [form, setForm] = useState({
    name: '',
    date_of_birth: '',
    gender: 'male',
    guardian_name: '',
    guardian_phone: '',
    address: '',
    blood_group: '',
    allergies: '',
    medical_notes: '',
  })

  useEffect(() => {
    if (isEdit) {
      loadPatient()
    }
  }, [patientId])

  async function loadPatient() {
    try {
      const p = await getPatient(patientId)
      setForm({
        name: p.name || '',
        date_of_birth: p.date_of_birth || '',
        gender: p.gender || 'male',
        guardian_name: p.guardian_name || '',
        guardian_phone: p.guardian_phone || '',
        address: p.address || '',
        blood_group: p.blood_group || '',
        allergies: (p.allergies || []).join(', '),
        medical_notes: p.medical_notes || '',
      })
    } catch (err) {
      addToast('Error loading patient', 'error')
    } finally {
      setLoadingData(false)
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const patientData = {
        name: form.name.trim(),
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        guardian_name: form.guardian_name.trim(),
        guardian_phone: form.guardian_phone.trim(),
        address: form.address.trim(),
        blood_group: form.blood_group,
        allergies: form.allergies ? form.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
        medical_notes: form.medical_notes.trim(),
      }

      if (isEdit) {
        await updatePatient(patientId, patientData)
        addToast('Patient updated successfully! ✅', 'success')
        navigate('patient', { id: patientId })
      } else {
        const newPatient = await createPatient(patientData)
        addToast('Patient added successfully! 🎉', 'success')
        navigate('patient', { id: newPatient.id })
      }
    } catch (err) {
      addToast(err.message || 'Error saving patient', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div style={{ padding: '20px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="skeleton" style={{ height: '48px', borderRadius: '12px', marginBottom: '16px' }}></div>
        ))}
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '4px' }}>
        {isEdit ? '✏️ Edit Patient' : '👶 New Patient'}
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        {isEdit ? 'Update patient information' : 'Register a new patient'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Child's Name */}
        <div className="form-group">
          <label className="form-label">Child's Full Name *</label>
          <input
            id="patient-name"
            name="name"
            className="form-input"
            placeholder="e.g., Aarav Sharma"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* DOB & Gender */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Date of Birth *</label>
            <input
              id="patient-dob"
              name="date_of_birth"
              type="date"
              className="form-input"
              value={form.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <select
              id="patient-gender"
              name="gender"
              className="form-input"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="male">👦 Male</option>
              <option value="female">👧 Female</option>
              <option value="other">🧒 Other</option>
            </select>
          </div>
        </div>

        {/* Guardian Info */}
        <div style={{
          background: 'var(--color-secondary-50)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid rgba(78,205,196,0.2)',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-secondary-dark)' }}>
            👨‍👩‍👧 Parent / Guardian
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Guardian Name *</label>
              <input
                id="patient-guardian"
                name="guardian_name"
                className="form-input"
                placeholder="Parent's name"
                value={form.guardian_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                id="patient-phone"
                name="guardian_phone"
                type="tel"
                className="form-input"
                placeholder="9876543210"
                value={form.guardian_phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            name="address"
            className="form-input"
            placeholder="City, Area"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        {/* Blood Group & Allergies */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select
              name="blood_group"
              className="form-input"
              value={form.blood_group}
              onChange={handleChange}
            >
              <option value="">Select</option>
              {BLOOD_GROUPS.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Allergies</label>
            <input
              name="allergies"
              className="form-input"
              placeholder="Comma separated"
              value={form.allergies}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Medical Notes */}
        <div className="form-group">
          <label className="form-label">Medical Notes</label>
          <textarea
            name="medical_notes"
            className="form-input"
            placeholder="Any existing conditions, birth history, etc."
            value={form.medical_notes}
            onChange={handleChange}
            rows={3}
          />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={goBack}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            id="patient-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: 2 }}
          >
            {loading ? '⏳ Saving...' : (isEdit ? '✅ Update Patient' : '🎉 Add Patient')}
          </button>
        </div>
      </form>
    </div>
  )
}
