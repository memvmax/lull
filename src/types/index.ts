export interface Entry {
  id: string
  content: string
  source: string
  createdAt: Date
  type?: 'note' | 'link'
  link?: string
  category?: string
}

export interface DailyQuestion {
  id: string
  question: string
}

export interface DayProgress {
  date: string
  completed: boolean
  answers: Record<string, boolean>
}
