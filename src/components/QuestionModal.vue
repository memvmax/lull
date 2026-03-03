<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DailyQuestion } from '@/types'

const props = defineProps<{
  questions: DailyQuestion[]
}>()

const emit = defineEmits<{
  complete: [answers: Record<string, boolean>]
  close: []
}>()

const answers = ref<Record<string, boolean | null>>({})

const allAnswered = computed(() => {
  return props.questions.every(q => answers.value[q.id] !== undefined)
})

function setAnswer(questionId: string, value: boolean) {
  answers.value[questionId] = value
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
</script>

<template>
  <div class="modal-overlay">
    <button class="back-btn" @click="emit('close')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
    <div class="modal-content">
      <h2 class="modal-title">今日反思</h2>
      <div class="questions-list">
        <div v-for="question in questions" :key="question.id" class="question-item">
          <p class="question-text">{{ question.question }}</p>
          <div class="question-actions">
            <button
              class="answer-btn"
              :class="{ active: answers[question.id] === true }"
              @click="setAnswer(question.id, true)"
            >
              是
            </button>
            <button
              class="answer-btn"
              :class="{ active: answers[question.id] === false }"
              @click="setAnswer(question.id, false)"
            >
              否
            </button>
          </div>
        </div>
      </div>
      <button
        class="complete-btn"
        :disabled="!allAnswered"
        @click="handleComplete"
      >
        完成今日阅读
      </button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--spacing-md);
}

.back-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: var(--text-secondary);
}

.modal-content {
  width: 100%;
  max-width: 480px;
}

.modal-title {
  font-size: 24px;
  font-weight: 400;
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.questions-list {
  margin-bottom: var(--spacing-xl);
}

.question-item {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-color);
}

.question-item:last-child {
  border-bottom: none;
}

.question-text {
  font-size: 17px;
  line-height: var(--line-height-body);
  margin-bottom: var(--spacing-sm);
}

.question-actions {
  display: flex;
  gap: var(--spacing-md);
}

.answer-btn {
  font-size: 14px;
  color: var(--text-tertiary);
  padding: 4px 16px;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.answer-btn:hover {
  color: var(--text-secondary);
  border-color: var(--text-tertiary);
}

.answer-btn.active {
  color: var(--text-primary);
  border-color: var(--text-primary);
}

.complete-btn {
  width: 100%;
  font-size: 16px;
  color: var(--text-secondary);
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.complete-btn:hover:not(:disabled) {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.complete-btn:disabled {
  color: var(--text-tertiary);
  cursor: not-allowed;
}
</style>
