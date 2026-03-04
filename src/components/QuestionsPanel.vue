<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { DailyQuestion } from '@/types'

const props = defineProps<{
  questions: DailyQuestion[]
  lang: 'zh' | 'en'
}>()

const emit = defineEmits<{
  complete: [answers: Record<string, boolean>]
  close: []
}>()

const answers = ref<Record<string, boolean | null>>({})
const isHolding = ref(false)
const progress = ref(0)
const isCompleting = ref(false)
const buttonRect = ref<DOMRect | null>(null)

let holdTimer: ReturnType<typeof setInterval> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null

const allAnswered = computed(() => {
  return props.questions.every(q => answers.value[q.id] !== undefined)
})

function setAnswer(questionId: string, value: boolean) {
  answers.value[questionId] = value
}

function startHold(event: MouseEvent | TouchEvent) {
  if (!allAnswered.value || isCompleting.value) return
  
  const target = event.target as HTMLElement
  buttonRect.value = target.getBoundingClientRect()
  
  isHolding.value = true
  progress.value = 0
  
  const duration = 1500
  const interval = 16
  const step = (interval / duration) * 100
  
  progressTimer = setInterval(() => {
    progress.value = Math.min(progress.value + step, 100)
  }, interval)
  
  holdTimer = setTimeout(() => {
    if (progressTimer) clearInterval(progressTimer)
    isHolding.value = false
    isCompleting.value = true
    progress.value = 100
    
    setTimeout(() => {
      handleComplete()
    }, 800)
  }, duration)
}

function cancelHold() {
  if (holdTimer) clearTimeout(holdTimer)
  if (progressTimer) clearInterval(progressTimer)
  isHolding.value = false
  progress.value = 0
}

function handleComplete() {
  const finalAnswers: Record<string, boolean> = {}
  for (const [key, value] of Object.entries(answers.value)) {
    if (value !== null && value !== undefined) {
      finalAnswers[key] = value
    }
  }
  emit('complete', finalAnswers)
}

onUnmounted(() => {
  if (holdTimer) clearTimeout(holdTimer)
  if (progressTimer) clearInterval(progressTimer)
})
</script>

<template>
  <div class="questions-panel" :class="{ 'completing': isCompleting }">
    <div class="panel-header">
      <span class="panel-label">{{ lang === 'zh' ? '今日反思' : 'Daily Reflection' }}</span>
    </div>
    
    <div class="questions-list">
      <div v-for="question in questions" :key="question.id" class="question-row">
        <span class="question-text">{{ question.question }}</span>
        <div class="question-actions">
          <button 
            class="answer-btn" 
            :class="{ active: answers[question.id] === true }"
            @click="setAnswer(question.id, true)"
          >
            {{ lang === 'zh' ? '是' : 'Yes' }}
          </button>
          <button 
            class="answer-btn" 
            :class="{ active: answers[question.id] === false }"
            @click="setAnswer(question.id, false)"
          >
            {{ lang === 'zh' ? '否' : 'No' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="panel-footer">
      <button class="btn-cancel" @click="emit('close')">{{ lang === 'zh' ? '取消' : 'Cancel' }}</button>
      <div class="btn-save-wrapper">
        <button 
          class="btn-save" 
          :class="{ 'holding': isHolding, 'completing': isCompleting }"
          :disabled="!allAnswered || isCompleting"
          @mousedown="startHold"
          @mouseup="cancelHold"
          @mouseleave="cancelHold"
          @touchstart.prevent="startHold"
          @touchend="cancelHold"
          @touchcancel="cancelHold"
        >
          {{ lang === 'zh' ? '完成' : 'Done' }}
        </button>
      </div>
    </div>
    
    <Teleport to="body">
      <div 
        v-if="isHolding || isCompleting" 
        class="void-overlay"
        :class="{ 'completing': isCompleting }"
        :style="{
          '--start-size': '150vmax',
          '--end-size': '0px',
          '--center-x': buttonRect ? (buttonRect.left + buttonRect.width / 2) + 'px' : '50%',
          '--center-y': buttonRect ? (buttonRect.top + buttonRect.height / 2) + 'px' : '100%',
          '--progress': progress / 100
        }"
      ></div>
    </Teleport>
  </div>
</template>

<style scoped>
.questions-panel {
  display: flex;
  flex-direction: column;
  transition: opacity 0.5s ease;
}

.questions-panel.completing {
  opacity: 0;
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

.questions-list {
  display: flex;
  flex-direction: column;
}

.question-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 56px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.question-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
  padding-right: 16px;
}

.question-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.answer-btn {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-tertiary);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.answer-btn:hover {
  color: var(--text-secondary);
  border-color: var(--text-tertiary);
}

.answer-btn.active {
  color: var(--text-primary);
  border-color: var(--text-primary);
  background: rgba(0, 0, 0, 0.03);
}

.dark .answer-btn.active {
  background: rgba(255, 255, 255, 0.05);
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
}

.btn-cancel {
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

.btn-save-wrapper {
  position: relative;
  display: inline-block;
}

.btn-save {
  position: relative;
  z-index: 2;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #3b82f6;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.btn-save:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-save.holding {
  color: #fff;
}

.btn-save.completing {
  opacity: 0;
}

.void-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
  background: radial-gradient(
    circle at var(--center-x) var(--center-y),
    transparent calc((1 - var(--progress)) * 70%),
    #0A0A0A calc((1 - var(--progress)) * 70% + 1px)
  );
}

.void-overlay.completing {
  background: #0A0A0A;
}
</style>
