import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in your environment.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export async function getDoctorProfile(doctorId) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', doctorId)
    .single()

  if (error) {
    throw error
  }
  return data
}
