import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured, type User } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    if (!isSupabaseConfigured || !supabase) {
      user.value = { id: 'local', email: 'local@user', created_at: new Date().toISOString() }
      loading.value = false
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        user.value = {
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at
        }
      }
      loading.value = false

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          user.value = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at
          }
        } else {
          user.value = null
        }
      })
    } catch (error) {
      console.error('Auth init error:', error)
      user.value = { id: 'local', email: 'local@user', created_at: new Date().toISOString() }
      loading.value = false
    }
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured || !supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  async function signInWithGithub() {
    if (!isSupabaseConfigured || !supabase) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  async function signOut() {
    if (!isSupabaseConfigured || !supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  return {
    user,
    loading,
    isAuthenticated,
    init,
    signInWithGoogle,
    signInWithGithub,
    signOut
  }
})
