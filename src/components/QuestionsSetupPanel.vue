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
    <button class="close-btn" @click="emit('close')">×</button>
    <h3 class="panel-title">{{ lang === 'zh' ? '每日问题' : 'Daily Questions' }}</h3>
    
    <div class="questions-list">
      <div v-for="(q, i) in localQuestions" :key="i" class="question-row">
        <span class="question-num">{{ i + 1 }}</span>
        <input 
          :value="q" 
          @input="updateQuestion(i, ($event.target as HTMLInputElement).value)"
          class="question-input"
          :placeholder="lang === 'zh' ? '输入问题' : 'Enter question'"
        />
        <button class="remove-btn" @click="removeQuestion(i)">×</button>
      </div>
    </div>
    
    <div class="add-row">
      <input 
        v-model="newQuestion"
        class="question-input"
        :placeholder="lang === 'zh' ? '添加新问题' : 'Add new question'"
        @keyup.enter="addQuestion"
      />
      <button class="add-btn" @click="addQuestion" :disabled="!newQuestion.trim()">
        {{ lang === 'zh' ? '添加' : 'Add' }}
      </button>
    </div>
    
    <button class="save-btn" @click="handleSave">
      {{ lang === 'zh' ? '保存' : 'Save' }}
    </button>
  </div>
</template>

<style scoped>
.questions-panel {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.dark .questions-panel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-tertiary);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.2);
}

.panel-title {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.question-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.question-num {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-tertiary);
  width: 20px;
  flex-shrink: 0;
}

.question-input {
  flex: 1;
  font-size: 14px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: var(--text-primary);
  outline: none;
}

.dark .question-input {
  background: rgba(255, 255, 255, 0.05);
}

.question-input:focus {
  border-color: var(--text-secondary);
}

.question-input::placeholder {
  color: var(--text-tertiary);
}

.remove-btn {
  font-size: 18px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s ease;
}

.remove-btn:hover {
  color: #e53935;
}

.add-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.add-btn {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #2196f3;
  background: transparent;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 0 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.add-btn:hover:not(:disabled) {
  background: #2196f3;
  color: #fff;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn {
  width: 100%;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #fff;
  background: #2196f3;
  border: none;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.save-btn:hover {
  background: #1976d2;
}
</style>
