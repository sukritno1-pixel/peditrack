import { createClient } from '@supabase/supabase-js'

// These will be replaced with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// ============================================
// Auth Helpers
// ============================================
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// ============================================
// Patient CRUD
// ============================================
export async function getPatients(searchTerm = '') {
  let query = supabase
    .from('patients')
    .select('*')
    .order('updated_at', { ascending: false })

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,guardian_phone.ilike.%${searchTerm}%,guardian_name.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getPatient(id) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createPatient(patient) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('patients')
    .insert({ ...patient, doctor_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePatient(id, updates) {
  const { data, error } = await supabase
    .from('patients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePatient(id) {
  const { error } = await supabase.from('patients').delete().eq('id', id)
  if (error) throw error
}

// ============================================
// Visit CRUD
// ============================================
export async function getVisits(patientId) {
  const { data, error } = await supabase
    .from('visits')
    .select('*, visit_images(*)')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createVisit(visit) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('visits')
    .insert({ ...visit, doctor_id: user.id })
    .select()
    .single()
  if (error) throw error

  // Update patient's updated_at
  await supabase.from('patients')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', visit.patient_id)

  return data
}

export async function updateVisit(id, updates) {
  const { data, error } = await supabase
    .from('visits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================
// Image Storage
// ============================================
export async function uploadImage(file, patientId, visitId) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `${patientId}/${visitId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('patient-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error
  return { path: data.path, fullPath: data.fullPath }
}

export function getImageUrl(path) {
  const { data } = supabase.storage.from('patient-images').getPublicUrl(path)
  return data.publicUrl
}

export async function saveVisitImage(imageData) {
  const { data, error } = await supabase
    .from('visit_images')
    .insert(imageData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getVisitImages(patientId) {
  const { data, error } = await supabase
    .from('visit_images')
    .select('*, visits(visit_date)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ============================================
// Growth Records
// ============================================
export async function getGrowthRecords(patientId) {
  const { data, error } = await supabase
    .from('growth_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('measurement_date', { ascending: true })
  if (error) throw error
  return data
}

export async function saveGrowthRecord(record) {
  const { data, error } = await supabase
    .from('growth_records')
    .insert(record)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================
// Dashboard Stats
// ============================================
export async function getDashboardStats() {
  const { data: { user } } = await supabase.auth.getUser()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const [patientsRes, todayVisitsRes, upcomingRes] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }),
    supabase.from('visits').select('id', { count: 'exact', head: true })
      .gte('visit_date', todayISO),
    supabase.from('visits').select('id, patient_id, patients(name)', { count: 'exact' })
      .gte('follow_up_date', todayISO)
      .order('follow_up_date', { ascending: true })
      .limit(5)
  ])

  return {
    totalPatients: patientsRes.count || 0,
    todayVisits: todayVisitsRes.count || 0,
    upcomingFollowUps: upcomingRes.data || [],
    upcomingCount: upcomingRes.count || 0,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE.JS ADDITIONS — Phase 2
// ─────────────────────────────────────────────────────────────────────────────
// Copy these functions into your existing src/lib/supabase.js file.
// Do NOT replace the entire file — just append these exports.
// ─────────────────────────────────────────────────────────────────────────────



// ── Vaccinations ──────────────────────────────────────────────────────────────

/**
 * Fetch all vaccination records for a patient.
 */
export async function getVaccinations(patientId) {
  const { data, error } = await supabase
    .from('vaccinations')
    .select('*')
    .eq('patient_id', patientId)
    .order('scheduled_age_weeks', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Upsert (insert or update) a single vaccination record.
 * Uses vaccine_name + dose_number + patient_id as the conflict key.
 * Pass id: undefined for new records, or id: <uuid> to update.
 */
export async function upsertVaccination(record) {
  // Strip undefined id so Supabase uses the conflict columns for upsert
  const payload = { ...record };
  if (!payload.id) delete payload.id;

  const { data, error } = await supabase
    .from('vaccinations')
    .upsert(payload, {
      onConflict: 'patient_id,vaccine_name,dose_number',
      ignoreDuplicates: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}


