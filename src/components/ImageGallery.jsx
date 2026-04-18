import React, { useState } from 'react'
import { getImageUrl } from '../lib/supabase'
import { formatDate } from '../utils/formatters'

export default function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null)

  if (!images || images.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '40px 20px' }}>
        <div className="empty-state-icon">🖼️</div>
        <h3>No images found</h3>
        <p>Images uploaded during visits will appear here</p>
      </div>
    )
  }

  // Group images by visit date
  const groupedImages = images.reduce((acc, img) => {
    const date = img.visits?.visit_date ? formatDate(img.visits.visit_date) : 'Unknown Date'
    if (!acc[date]) acc[date] = []
    acc[date].push(img)
    return acc
  }, {})

  return (
    <div className="animate-fade-in">
      {Object.entries(groupedImages).map(([date, imgs]) => (
        <div key={date} style={{ marginBottom: '24px' }}>
          <h4 style={{ 
            fontSize: '14px', 
            color: 'var(--color-text-secondary)', 
            marginBottom: '12px',
            borderBottom: '1px solid var(--color-border-light)',
            paddingBottom: '4px'
          }}>
            {date}
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
            gap: '12px' 
          }}>
            {imgs.map(img => (
              <div 
                key={img.id} 
                onClick={() => setSelectedImage(img)}
                style={{ 
                  aspectRatio: '1', 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <img 
                  src={getImageUrl(img.storage_path)} 
                  alt={img.file_name} 
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {img.ocr_text && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontWeight: 600
                  }}>
                    OCR
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <>
          <div className="modal-backdrop" onClick={() => setSelectedImage(null)} style={{ zIndex: 1000 }}></div>
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
            width: '95vw',
            maxWidth: '800px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedImage(null)}
                style={{ 
                  background: 'white', 
                  border: 'none', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '18px',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            <img 
              src={getImageUrl(selectedImage.storage_path)} 
              alt={selectedImage.file_name}
              style={{ 
                width: '100%', 
                maxHeight: 'calc(90vh - 100px)', 
                objectFit: 'contain',
                background: 'rgba(0,0,0,0.8)',
                borderRadius: '12px'
              }}
            />
            
            {selectedImage.ocr_text && (
              <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '12px',
                maxHeight: '200px',
                overflow: 'auto',
                fontSize: '14px'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-primary)' }}>
                  Extracted Text
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)' }}>
                  {selectedImage.ocr_text}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
