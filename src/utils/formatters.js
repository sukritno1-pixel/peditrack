// Calculate age from date of birth
export function calculateAge(dob) {
  if (!dob) return ''
  const birth = new Date(dob)
  const now = new Date()
  
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()
  
  if (days < 0) {
    months--
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }

  if (years === 0 && months === 0) return `${days} days`
  if (years === 0) return months === 1 ? `${months} month` : `${months} months`
  if (months === 0) return years === 1 ? `${years} year` : `${years} years`
  return `${years}y ${months}m`
}

// Format date for display
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Format date with time
export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

// Get initials from name
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Format phone number
export function formatPhone(phone) {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
  }
  return phone
}

// Generate patient ID display
export function formatPatientId(id) {
  if (!id) return ''
  return `PT-${id.slice(0, 8).toUpperCase()}`
}

// Gender icon
export function genderIcon(gender) {
  switch(gender) {
    case 'male': return '👦'
    case 'female': return '👧'
    default: return '🧒'
  }
}

// Common pediatric complaints for quick select
export const COMMON_COMPLAINTS = [
  'Fever', 'Cough', 'Cold', 'Diarrhea', 'Vomiting',
  'Rash', 'Ear Pain', 'Sore Throat', 'Stomach Pain',
  'Difficulty Breathing', 'Vaccination', 'Well-child Visit',
  'Growth Check', 'Follow-up', 'Injury', 'Allergy',
  'Skin Issue', 'Eye Problem', 'Weight Concern'
]

// Blood group options
export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'
]
