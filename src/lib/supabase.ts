import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://syuctkukwisgcfiybsfy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dWN0a3Vrd2lzZ2NmaXlic2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjY5MDAsImV4cCI6MjA4ODEwMjkwMH0.yGPk0WQri-Oa8KjveEPj2AFZkcmPcR-np9GuZfbO6EM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = true

export interface User {
  id: string
  email: string
  created_at: string
}
