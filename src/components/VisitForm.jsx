import React, { useState } from 'react'
import { createVisit, uploadImage, saveVisitImage, saveGrowthRecord } from '../lib/supabase'
import { extractText } from '../lib/ocr'
import { COMMON_COMPLAINTS } from '../utils/formatters'
import { useToast } from '../App'
import imageCompression from 'browser-image-compression'

export default function VisitForm({ patientId, patientName, navigate, goBack }) {
  const addToast = useToast()
  const [loading, setLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)

  const [form, setForm] = useState({
    chief_complaint: '',
    diagnosis: '',
    prescription: '',
    remarks: '',
    follow_up_date: '',
    weight_kg: '',
    height_cm: '',
    head_circumference_cm: '',
    temperature: '',
  })

  const [images, setImages] = useState([]) // { file, preview, ocrText, ocrDone }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function selectComplaint(complaint) {
    setForm(prev => ({
      ...prev,
      chief_complaint: prev.chief_complaint
        ? `${prev.chief_complaint}, ${complaint}`
        : complaint
    }))
  }

  async function handleImageSelect(e) {
    const files = Array.from(e.target.files)
    const newImages = []

    for (const file of files) {
      try {
        // Compress image before adding
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        })
        const preview = URL.createObjectURL(compressed)
        newImages.push({ file: compressed, preview, ocrText: '', ocrDone: false, originalName: file.name })
      } catch (err) {
        newImages.push({ file, preview: URL.createObjectURL(file), ocrText: '', ocrDone: false, originalName: file.name })
      }
    }

    setImages(prev => [...prev, ...newImages])
  }

  function removeImage(index) {
    setImages(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  async function runOCR(index) {
    setOcrLoading(true)
    try {
      const result = await extractText(images[index].file)
      setImages(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], ocrText: result.text, ocrDone: true }
        return updated
      })
      if (result.success && result.text) {
        addToast(`Text extracted (${result.confidence}% confidence)`, 'success')
      } else {
        addToast('No text found in image', 'info')
      }
    } catch (err) {
      addToast('OCR failed', 'error')
    } finally {
      setOcrLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.chief_complaint.trim()) {
      addToast('Please enter a chief complaint', 'error')
      return
    }

    setLoading(true)
    try {
      // Build vitals object
      const vitals = {}
      if (form.weight_kg) vitals.weight_kg = parseFloat(form.weight_kg)
      if (form.height_cm) vitals.height_cm = parseFloat(form.height_cm)
      if (form.head_circumference_cm) vitals.head_circumference_cm = parseFloat(form.head_circumference_cm)
      if (form.temperature) vitals.temperature = parseFloat(form.temperature)

      // Create visit
      const visit = await createVisit({
        patient_id: patientId,
        chief_complaint: form.chief_complaint.trim(),
        diagnosis: form.diagnosis.trim(),
        prescription: form.prescription.trim(),
        remarks: form.remarks.trim(),
        follow_up_date: form.follow_up_date || null,
        vitals: Object.keys(vitals).length > 0 ? vitals : null,
      })

      // Upload images
      for (const img of images) {
        const uploaded = await uploadImage(img.file, patientId, visit.id)
        await saveVisitImage({
          visit_id: visit.id,
          patient_id: patientId,
          storage_path: uploaded.path,
          file_name: img.originalName,
          file_size: img.file.size,
          mime_type: img.file.type,
          ocr_text: img.ocrText || null,
        })
      }

      // Save growth record if vitals provided
      if (vitals.weight_kg || vitals.height_cm || vitals.head_circumference_cm) {
        const bmi = (vitals.weight_kg && vitals.height_cm)
          ? parseFloat((vitals.weight_kg / ((vitals.height_cm / 100) ** 2)).toFixed(1))
          : null

        await saveGrowthRecord({
          patient_id: patientId,
          visit_id: visit.id,
          measurement_date: new Date().toISOString().split('T')[0],
          weight_kg: vitals.weight_kg || null,
          height_cm: vitals.height_cm || null,
          head_circumference_cm: vitals.head_circumference_cm || null,
          bmi,
        })
      }

      addToast('Visit recorded successfully! ✅', 'success')
      navigate('patient', { id: patientId })
    } catch (err) {
      console.error('Visit save error:', err)
      addToast(err.message || 'Error saving visit', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '4px' }}>📝 New Visit</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
        Recording visit for <strong>{patientName}</strong>
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Chief Complaint */}
        <div className="form-group">
          <label className="form-label">Chief Complaint *</label>
          <input
            id="visit-complaint"
            name="chief_complaint"
            className="form-input"
            placeholder="What brought the patient in?"
            value={form.chief_complaint}
            onChange={handleChange}
            required
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {COMMON_COMPLAINTS.slice(0, 12).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => selectComplaint(c)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid var(--color-border)',
                  background: form.chief_complaint.includes(c)
                    ? 'var(--color-primary-50)'
                    : 'var(--color-surface)',
                  color: form.chief_complaint.includes(c)
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 150ms',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Vitals */}
        <div style={{
          background: 'var(--color-secondary-50)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid rgba(78,205,196,0.2)',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-secondary-dark)' }}>
            📊 Vitals
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input name="weight_kg" type="number" step="0.1" className="form-input" placeholder="e.g., 12.5"
                value={form.weight_kg} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input name="height_cm" type="number" step="0.1" className="form-input" placeholder="e.g., 85"
                value={form.height_cm} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Head Circ. (cm)</label>
              <input name="head_circumference_cm" type="number" step="0.1" className="form-input" placeholder="e.g., 46"
                value={form.head_circumference_cm} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Temp (°F)</label>
              <input name="temperature" type="number" step="0.1" className="form-input" placeholder="e.g., 98.6"
                value={form.temperature} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="form-group">
          <label className="form-label">Diagnosis</label>
          <input name="diagnosis" className="form-input" placeholder="Clinical diagnosis"
            value={form.diagnosis} onChange={handleChange} />
        </div>

        {/* Prescription */}
        <div className="form-group">
          <label className="form-label">💊 Prescription</label>
          <textarea name="prescription" className="form-input" placeholder="Medicines, dosage, duration..."
            value={form.prescription} onChange={handleChange} rows={3} />
        </div>

        {/* Remarks */}
        <div className="form-group">
          <label className="form-label">📝 Doctor's Remarks / Progress Notes</label>
          <textarea name="remarks" className="form-input" placeholder="Observations, progress, notes for next visit..."
            value={form.remarks} onChange={handleChange} rows={3}
            style={{ borderLeft: '3px solid var(--color-primary)' }} />
        </div>

        {/* Follow-up Date */}
        <div className="form-group">
          <label className="form-label">📅 Follow-up Date</label>
          <input name="follow_up_date" type="date" className="form-input"
            value={form.follow_up_date} onChange={handleChange} />
        </div>

        {/* Image Upload */}
        <div style={{
          border: '2px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          textAlign: 'center',
          background: 'var(--color-bg)',
          transition: 'all 200ms',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            Upload prescriptions, lab reports, or photos
          </p>
          <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
            📎 Choose Files
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </label>

          {/* Image previews */}
          {images.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '10px',
              marginTop: '16px',
            }}>
              {images.map((img, i) => (
                <div key={i} style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid var(--color-border-light)',
                }}>
                  <img src={img.preview} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '4px',
                    background: 'var(--color-surface)',
                  }}>
                    <button
                      type="button"
                      onClick={() => runOCR(i)}
                      disabled={ocrLoading || img.ocrDone}
                      style={{
                        flex: 1,
                        padding: '4px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        background: img.ocrDone ? 'var(--color-success)' : 'var(--color-primary-50)',
                        color: img.ocrDone ? 'white' : 'var(--color-primary)',
                      }}
                    >
                      {img.ocrDone ? '✓ OCR' : '🔍 OCR'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        padding: '4px 8px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        background: '#FFE0E0',
                        color: 'var(--color-danger)',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  {img.ocrText && (
                    <div style={{
                      padding: '6px',
                      fontSize: '10px',
                      background: 'var(--color-bg)',
                      maxHeight: '60px',
                      overflow: 'auto',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {img.ocrText.slice(0, 100)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {ocrLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px',
            background: 'var(--color-primary-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            color: 'var(--color-primary)',
          }}>
            <div className="spinner"></div>
            Extracting text from image...
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button type="button" className="btn btn-ghost" onClick={goBack} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            id="visit-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: 2 }}
          >
            {loading ? '⏳ Saving...' : '✅ Save Visit'}
          </button>
        </div>
      </form>
    </div>
  )
}
