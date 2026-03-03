import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Entry, DailyQuestion, DayProgress } from '@/types'
import { supabase } from '@/lib/supabase'

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function getMyCode(): string {
  let code = localStorage.getItem('moran-my-code')
  if (!code) {
    code = generateCode()
    localStorage.setItem('moran-my-code', code)
  }
  return code
}

function getViewingCode(): string {
  const viewingCode = localStorage.getItem('moran-viewing-code')
  const myCode = getMyCode()
  if (!viewingCode || viewingCode === myCode) {
    localStorage.removeItem('moran-viewing-code')
    return myCode
  }
  return viewingCode
}

function setViewingCode(code: string) {
  localStorage.setItem('moran-viewing-code', code)
}

function formatTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

async function loadFromSupabase(code: string) {
  if (!code) {
    return { entries: [], questions: [], progress: [], etfs: [] }
  }
  
  const { data, error } = await supabase
    .from('user_data')
    .select('data_type, data')
    .eq('code', code)
  
  if (error) {
    console.error('Failed to load from Supabase:', error)
    return { entries: [], questions: [], progress: [], etfs: [] }
  }
  
  const result: StorageData = { entries: [], questions: [], progress: [], etfs: [] }
  
  if (data) {
    for (const item of data) {
      if (item.data_type === 'entries') {
        result.entries = item.data?.entries?.map((e: any) => ({ ...e, createdAt: new Date(e.createdAt) })) || []
      } else if (item.data_type === 'questions') {
        result.questions = item.data?.questions || []
      } else if (item.data_type === 'progress') {
        result.progress = item.data?.progress || []
      } else if (item.data_type === 'etfs') {
        result.etfs = item.data?.etfs || []
      }
    }
  }
  
  return result
}

async function saveToSupabase(code: string, dataType: string, data: any) {
  if (!code) return
  
  const { error } = await supabase
    .from('user_data')
    .upsert({
      code,
      data_type: dataType,
      data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'code,data_type'
    })
  
  if (error) {
    console.error('Failed to save to Supabase:', error)
  }
}

interface StorageData {
  entries: Entry[]
  questions: DailyQuestion[]
  progress: DayProgress[]
  etfs: any[]
}

export const useStore = defineStore('moran', () => {
  const myCode = ref(getMyCode())
  const viewingCode = ref(getViewingCode())
  const entries = ref<Entry[]>([])
  const questions = ref<DailyQuestion[]>([])
  const progress = ref<DayProgress[]>([])
  const etfs = ref<any[]>([])
  const isLoading = ref(true)

  const isReadOnly = computed(() => viewingCode.value !== myCode.value)

  const sortedEntries = computed(() => {
    return [...entries.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(e => ({
        ...e,
        time: formatTime(new Date(e.createdAt))
      }))
  })

  const sources = computed(() => {
    const uniqueSources = new Set(entries.value.map(e => e.source))
    return Array.from(uniqueSources).sort()
  })

  const todayProgress = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return progress.value.find(p => p.date === todayStr)
  })

  const isTodayCompleted = computed(() => {
    return todayProgress.value?.completed || false
  })

  async function init() {
    isLoading.value = true
    const code = viewingCode.value
    if (code) {
      const data = await loadFromSupabase(code)
      entries.value = data.entries
      questions.value = data.questions
      progress.value = data.progress
      etfs.value = data.etfs || []
    }
    isLoading.value = false
  }

  async function switchToCode(code: string) {
    viewingCode.value = code
    setViewingCode(code)
    await init()
  }

  async function backToMyCode() {
    viewingCode.value = myCode.value
    localStorage.removeItem('moran-viewing-code')
    await init()
  }

  function addEntry(content: string, source: string) {
    if (isReadOnly.value) return
    const entry: Entry = {
      id: crypto.randomUUID(),
      content,
      source,
      createdAt: new Date()
    }
    entries.value.push(entry)
    save()
  }

  function deleteEntry(id: string) {
    if (isReadOnly.value) return
    const index = entries.value.findIndex(e => e.id === id)
    if (index > -1) {
      entries.value.splice(index, 1)
      save()
    }
  }

  function setQuestions(newQuestions: string[]) {
    if (isReadOnly.value) return
    questions.value = newQuestions.map((q, i) => ({
      id: `q-${i}`,
      question: q
    }))
    save()
  }

  function completeDay(answers: Record<string, boolean>) {
    if (isReadOnly.value) return
    const todayStr = new Date().toISOString().split('T')[0] || ''
    const existingIndex = progress.value.findIndex(p => p.date === todayStr)
    const dayProgress: DayProgress = {
      date: todayStr,
      completed: true,
      answers
    }
    if (existingIndex > -1) {
      progress.value[existingIndex] = dayProgress
    } else {
      progress.value.push(dayProgress)
    }
    save()
  }

  function undoCompleteDay() {
    if (isReadOnly.value) return
    const todayStr = new Date().toISOString().split('T')[0] || ''
    const index = progress.value.findIndex(p => p.date === todayStr)
    if (index > -1) {
      progress.value.splice(index, 1)
      save()
    }
  }

  function setEtfs(newEtfs: any[]) {
    if (isReadOnly.value) return
    etfs.value = newEtfs
    save()
  }

  async function save() {
    if (isReadOnly.value) return
    const code = myCode.value
    if (!code) return
    
    await Promise.all([
      saveToSupabase(code, 'entries', { entries: entries.value }),
      saveToSupabase(code, 'questions', { questions: questions.value }),
      saveToSupabase(code, 'progress', { progress: progress.value }),
      saveToSupabase(code, 'etfs', { etfs: etfs.value })
    ])
  }

  return {
    myCode,
    viewingCode,
    entries,
    questions,
    progress,
    etfs,
    isLoading,
    isReadOnly,
    sortedEntries,
    sources,
    todayProgress,
    isTodayCompleted,
    init,
    switchToCode,
    backToMyCode,
    addEntry,
    deleteEntry,
    setQuestions,
    completeDay,
    undoCompleteDay,
    setEtfs
  }
})
