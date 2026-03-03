import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Entry, DailyQuestion, DayProgress } from '@/types'
import { supabase } from '@/lib/supabase'

const DATA_TYPES = {
  USER_DATA: 'user_data'
}

function getCode(): string {
  return localStorage.getItem('moran-my-code') || ''
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
  const entries = ref<Entry[]>([])
  const questions = ref<DailyQuestion[]>([])
  const progress = ref<DayProgress[]>([])
  const etfs = ref<any[]>([])
  const isLoading = ref(true)

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
    const code = getCode()
    if (code) {
      const data = await loadFromSupabase(code)
      entries.value = data.entries
      questions.value = data.questions
      progress.value = data.progress
      etfs.value = data.etfs || []
    }
    isLoading.value = false
  }

  function addEntry(content: string, source: string) {
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
    const index = entries.value.findIndex(e => e.id === id)
    if (index > -1) {
      entries.value.splice(index, 1)
      save()
    }
  }

  function setQuestions(newQuestions: string[]) {
    questions.value = newQuestions.map((q, i) => ({
      id: `q-${i}`,
      question: q
    }))
    save()
  }

  function completeDay(answers: Record<string, boolean>) {
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
    const todayStr = new Date().toISOString().split('T')[0] || ''
    const index = progress.value.findIndex(p => p.date === todayStr)
    if (index > -1) {
      progress.value.splice(index, 1)
      save()
    }
  }

  function setEtfs(newEtfs: any[]) {
    etfs.value = newEtfs
    save()
  }

  async function save() {
    const code = getCode()
    if (!code) return
    
    await Promise.all([
      saveToSupabase(code, 'entries', { entries: entries.value }),
      saveToSupabase(code, 'questions', { questions: questions.value }),
      saveToSupabase(code, 'progress', { progress: progress.value }),
      saveToSupabase(code, 'etfs', { etfs: etfs.value })
    ])
  }

  return {
    entries,
    questions,
    progress,
    etfs,
    isLoading,
    sortedEntries,
    sources,
    todayProgress,
    isTodayCompleted,
    init,
    addEntry,
    deleteEntry,
    setQuestions,
    completeDay,
    undoCompleteDay,
    setEtfs
  }
})
