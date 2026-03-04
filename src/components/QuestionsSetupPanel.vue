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
  <div class="questions-panel">
    <div class="panel-title">
      <span class="title-label">{{ lang === 'zh' ? '每日问题' : 'Daily Questions' }}</span>
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
    
    <div class="panel-footer">
      <button class="btn-cancel" @click="emit('close')">{{ lang === 'zh' ? '取消' : 'Cancel' }}</button>
      <button class="btn-save" @click="handleSave">{{ lang === 'zh' ? '保存' : 'Save' }}</button>
    </div>
  </div>
</template>

<style scoped>
.questions-panel {
  display: flex;
  flex-direction: column;
}

.panel-title {
  display: flex;
  align-items: center;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
}

.title-label {
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
  border-bottom: 1px solid var(--border-color);
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

.btn-save {
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

.btn-save:hover {
  opacity: 0.85;
}
</style>
