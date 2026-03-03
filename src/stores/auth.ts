import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase, type User } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
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
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  async function signInWithGithub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  async function signOut() {
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
