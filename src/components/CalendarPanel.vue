<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  lang: 'zh' | 'en'
  progress: Record<string, boolean>
}>()

const emit = defineEmits<{
  close: []
  selectDate: [date: Date]
}>()

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDay = firstDay.getDay()
  
  const days: { date: Date; isCurrentMonth: boolean; key: string }[] = []
  
  for (let i = 0; i < startDay; i++) {
    const prevDate = new Date(currentYear.value, currentMonth.value, -startDay + i + 1)
    days.push({
      date: prevDate,
      isCurrentMonth: false,
      key: `prev-${prevDate.toISOString()}`
    })
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    days.push({
      date,
      isCurrentMonth: true,
      key: `curr-${date.toISOString()}`
    })
  }
  
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({
      date: nextDate,
      isCurrentMonth: false,
      key: `next-${nextDate.toISOString()}`
    })
  }
  
  return days
})

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isCompleted(date: Date): boolean {
  const key = getDateKey(date)
  return props.progress[key] === true
}

function isToday(date: Date): boolean {
  return date.toDateString() === today.toDateString()
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function goToToday() {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
}

function handleDayClick(date: Date) {
  emit('selectDate', date)
}
</script>

<template>
  <div class="calendar-panel">
    <div class="panel-header">
      <span class="panel-label">{{ lang === 'zh' ? '日历' : 'Calendar' }}</span>
    </div>
    
    <div class="month-nav">
      <button class="nav-btn" @click="prevMonth">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="month-info">
        <span class="month-name">{{ monthNames[currentMonth] }}</span>
        <span class="year-num">{{ currentYear }}</span>
      </div>
      <button class="nav-btn" @click="nextMonth">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
    
    <div class="weekdays">
      <span v-for="(day, i) in weekDays" :key="i" class="weekday">{{ day }}</span>
    </div>
    
    <div class="calendar-grid">
      <div 
        v-for="day in calendarDays" 
        :key="day.key" 
        class="calendar-day"
        :class="{ 
          'other-month': !day.isCurrentMonth,
          'is-today': isToday(day.date),
          'completed': isCompleted(day.date)
        }"
        @click="handleDayClick(day.date)"
      >
        <span class="day-number">{{ day.date.getDate() }}</span>
        <div class="day-ring" :class="{ closed: isCompleted(day.date) }"></div>
      </div>
    </div>
    
    <div class="panel-footer">
      <button class="btn-today" @click="goToToday">{{ lang === 'zh' ? '今天' : 'Today' }}</button>
      <button class="btn-back" @click="emit('close')">{{ lang === 'zh' ? '返回' : 'Back' }}</button>
    </div>
  </div>
</template>

<style scoped>
.calendar-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
}

.panel-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.month-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  padding: 0 16px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.05);
}

.dark .nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.month-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-name {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-primary);
}

.year-num {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--text-tertiary);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 16px;
}

.weekday {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-tertiary);
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 0 12px 12px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.calendar-day:hover {
  background: rgba(0, 0, 0, 0.03);
}

.dark .calendar-day:hover {
  background: rgba(255, 255, 255, 0.05);
}

.calendar-day.other-month {
  opacity: 0.25;
}

.calendar-day.is-today {
  background: rgba(59, 130, 246, 0.1);
}

.day-number {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  z-index: 1;
}

.day-ring {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 1.5px solid transparent;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.calendar-day.is-today .day-ring {
  border-color: rgba(59, 130, 246, 0.3);
}

.day-ring.closed {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}

.calendar-day.completed .day-number {
  color: #10b981;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.btn-today {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #3b82f6;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.btn-back {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #ef4444;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}
</style>
