import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || ''
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== ''

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type User = {
  id: string
  email: string
  created_at: string
}

export type Entry = {
  id: string
  user_id: string
  content: string
  source: string
  created_at: string
}

export type DailyProgress = {
  id: string
  user_id: string
  date: string
  completed: boolean
  answers: Record<string, boolean>
  created_at: string
}
