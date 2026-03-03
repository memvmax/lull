import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Entry, DailyQuestion, DayProgress } from '@/types'

const STORAGE_KEY = 'moran-data'

interface StorageData {
  entries: Entry[]
  questions: DailyQuestion[]
  progress: DayProgress[]
}

function loadFromStorage(): StorageData {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const data = JSON.parse(stored)
    return {
      entries: data.entries?.map((e: Entry) => ({ ...e, createdAt: new Date(e.createdAt) })) || [],
      questions: data.questions || [],
      progress: data.progress || []
    }
  }
  return { entries: [], questions: [], progress: [] }
}

function saveToStorage(data: StorageData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function formatTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export const useStore = defineStore('moran', () => {
  const entries = ref<Entry[]>(loadFromStorage().entries)
  const questions = ref<DailyQuestion[]>(loadFromStorage().questions)
  const progress = ref<DayProgress[]>(loadFromStorage().progress)

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
    const todayStr = new Date().toISOString().split('T')[0]
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
    const todayStr = new Date().toISOString().split('T')[0]
    const index = progress.value.findIndex(p => p.date === todayStr)
    if (index > -1) {
      progress.value.splice(index, 1)
      save()
    }
  }

  function save() {
    saveToStorage({
      entries: entries.value,
      questions: questions.value,
      progress: progress.value
    })
  }

  return {
    entries,
    questions,
    progress,
    sortedEntries,
    sources,
    todayProgress,
    isTodayCompleted,
    addEntry,
    deleteEntry,
    setQuestions,
    completeDay,
    undoCompleteDay
  }
})
