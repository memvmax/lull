<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DailyQuestion } from '@/types'

const props = defineProps<{
  questions: DailyQuestion[]
  lang: 'zh' | 'en'
}>()

const emit = defineEmits<{
  close: []
  save: [questions: string[]]
}>()

const localQuestions = ref<string[]>(props.questions.map(q => q.question))
const newQuestion = ref('')

watch(() => props.questions, (qs) => {
  localQuestions.value = qs.map(q => q.question)
}, { immediate: true })

function addQuestion() {
  if (newQuestion.value.trim()) {
    localQuestions.value.push(newQuestion.value.trim())
    newQuestion.value = ''
  }
}

function removeQuestion(index: number) {
  localQuestions.value.splice(index, 1)
}

function updateQuestion(index: number, value: string) {
  localQuestions.value[index] = value
}

function handleSave() {
  emit('save', localQuestions.value.filter(q => q.trim()))
}
</script>

<template>
  <Teleport to="body">
    <div class="questions-backdrop" @click.self="emit('close')">
      <div class="questions-modal">
        <div class="modal-header">
          <span class="modal-label">{{ lang === 'zh' ? '每日问题' : 'Daily Questions' }}</span>
          <button class="close-btn" @click="emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="questions-list">
          <div v-for="(q, i) in localQuestions" :key="i" class="question-row">
            <span class="question-label">{{ lang === 'zh' ? '问题' : 'Question' }} {{ i + 1 }}</span>
            <input 
              :value="q" 
              @input="updateQuestion(i, ($event.target as HTMLInputElement).value)"
              class="question-input"
              :placeholder="lang === 'zh' ? '输入问题' : 'Enter question'"
            />
            <button class="remove-btn" @click="removeQuestion(i)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="add-row">
          <span class="question-label">{{ lang === 'zh' ? '新问题' : 'New' }}</span>
          <input 
            v-model="newQuestion"
            class="question-input"
            :placeholder="lang === 'zh' ? '输入问题后回车' : 'Enter question'"
            @keyup.enter="addQuestion"
          />
        </div>
        
        <div class="modal-footer">
          <span></span>
          <button class="save-btn" @click="handleSave">{{ lang === 'zh' ? '保存' : 'Save' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.questions-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.questions-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
}

.modal-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.close-btn {
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

.close-btn:hover {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.05);
}

.dark .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.questions-list {
  display: flex;
  flex-direction: column;
  padding: 0 16px;
}

.question-row {
  display: flex;
  align-items: center;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
}

.question-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 80px;
}

.question-input {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-align: right;
  background: transparent;
  border: none;
  color: var(--text-primary);
  outline: none;
  padding: 0;
  margin-right: 12px;
}

.question-input::placeholder {
  color: var(--text-tertiary);
}

.remove-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.add-row {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
}

.save-btn {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #3b82f6;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: right;
}

.save-btn:hover {
  opacity: 0.85;
}
</style>
