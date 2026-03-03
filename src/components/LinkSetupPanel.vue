<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  lang: 'zh' | 'en'
  step: 'link' | 'title' | 'author'
  currentLink: string
  currentTitle: string
}>()

const emit = defineEmits<{
  close: []
  submitLink: [link: string]
  submitTitle: [title: string]
  submitAuthor: [author: string]
}>()

const inputValue = ref('')

watch(() => props.step, () => {
  inputValue.value = ''
})

function handleSubmit() {
  if (!inputValue.value.trim()) return
  
  if (props.step === 'link') {
    emit('submitLink', inputValue.value.trim())
  } else if (props.step === 'title') {
    emit('submitTitle', inputValue.value.trim())
  } else if (props.step === 'author') {
    emit('submitAuthor', inputValue.value.trim())
  }
  inputValue.value = ''
}
</script>

<template>
  <div class="link-panel">
    <button class="close-btn" @click="emit('close')">×</button>
    <h3 class="panel-title">{{ lang === 'zh' ? '添加文章' : 'Add Article' }}</h3>
    
    <div class="progress-steps">
      <div class="step" :class="{ active: step === 'link', done: currentLink }">
        <span class="step-num">1</span>
        <span class="step-label">{{ lang === 'zh' ? '链接' : 'Link' }}</span>
      </div>
      <div class="step-line" :class="{ done: currentLink }"></div>
      <div class="step" :class="{ active: step === 'title', done: currentTitle }">
        <span class="step-num">2</span>
        <span class="step-label">{{ lang === 'zh' ? '标题' : 'Title' }}</span>
      </div>
      <div class="step-line" :class="{ done: currentTitle }"></div>
      <div class="step" :class="{ active: step === 'author' }">
        <span class="step-num">3</span>
        <span class="step-label">{{ lang === 'zh' ? '作者' : 'Author' }}</span>
      </div>
    </div>
    
    <div v-if="currentLink" class="preview-section">
      <span class="preview-label">{{ lang === 'zh' ? '链接' : 'Link' }}:</span>
      <span class="preview-value">{{ currentLink }}</span>
    </div>
    <div v-if="currentTitle" class="preview-section">
      <span class="preview-label">{{ lang === 'zh' ? '标题' : 'Title' }}:</span>
      <span class="preview-value">{{ currentTitle }}</span>
    </div>
    
    <div class="input-section">
      <input
        v-model="inputValue"
        type="text"
        class="link-input"
        :placeholder="step === 'link' 
          ? (lang === 'zh' ? '粘贴文章链接' : 'Paste article link')
          : step === 'title'
            ? (lang === 'zh' ? '输入文章标题' : 'Enter article title')
            : (lang === 'zh' ? '@作者或来源' : '@Author or source')"
        @keyup.enter="handleSubmit"
      />
      <button class="submit-btn" @click="handleSubmit" :disabled="!inputValue.trim()">
        {{ lang === 'zh' ? '下一步' : 'Next' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.link-panel {
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

.dark .link-panel {
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

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-num {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  transition: all 0.2s ease;
}

.dark .step-num {
  background: rgba(255, 255, 255, 0.1);
}

.step.active .step-num {
  color: #fff;
  background: #2196f3;
}

.step.done .step-num {
  color: #fff;
  background: #4caf50;
}

.step-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.step.active .step-label {
  color: var(--text-secondary);
}

.step-line {
  width: 40px;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  margin: 0 8px;
  margin-bottom: 20px;
  transition: background 0.2s ease;
}

.dark .step-line {
  background: rgba(255, 255, 255, 0.1);
}

.step-line.done {
  background: #4caf50;
}

.preview-section {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  margin-bottom: 12px;
}

.dark .preview-section {
  background: rgba(255, 255, 255, 0.05);
}

.preview-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.preview-value {
  font-size: 13px;
  color: var(--text-secondary);
  word-break: break-all;
}

.input-section {
  display: flex;
  gap: 12px;
}

.link-input {
  flex: 1;
  font-size: 14px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: var(--text-primary);
  outline: none;
}

.dark .link-input {
  background: rgba(255, 255, 255, 0.05);
}

.link-input:focus {
  border-color: var(--text-secondary);
}

.link-input::placeholder {
  color: var(--text-tertiary);
}

.submit-btn {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #fff;
  background: #2196f3;
  border: none;
  border-radius: 8px;
  padding: 0 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.submit-btn:hover:not(:disabled) {
  background: #1976d2;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
