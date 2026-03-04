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
  if (props.step === 'author') {
    emit('submitAuthor', inputValue.value.trim() || 'Self')
  } else {
    if (!inputValue.value.trim()) return
    if (props.step === 'link') {
      emit('submitLink', inputValue.value.trim())
    } else if (props.step === 'title') {
      emit('submitTitle', inputValue.value.trim())
    }
  }
  inputValue.value = ''
}
</script>

<template>
  <Teleport to="body">
    <div class="link-backdrop" @click.self="emit('close')">
      <div class="link-panel">
        <div class="panel-header">
          <span class="panel-label">{{ lang === 'zh' ? '添加文章' : 'Add Article' }}</span>
          <button class="close-btn" @click="emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div v-if="currentLink" class="preview-row">
          <span class="preview-label">{{ lang === 'zh' ? '链接' : 'Link' }}</span>
          <span class="preview-value">{{ currentLink }}</span>
        </div>
        
        <div v-if="currentTitle" class="preview-row">
          <span class="preview-label">{{ lang === 'zh' ? '标题' : 'Title' }}</span>
          <span class="preview-value">{{ currentTitle }}</span>
        </div>
        
        <div class="input-row">
          <span class="input-label">
            {{ step === 'link' 
              ? (lang === 'zh' ? '链接' : 'Link')
              : step === 'title'
                ? (lang === 'zh' ? '标题' : 'Title')
                : (lang === 'zh' ? '来源' : 'Source') }}
          </span>
          <input
            v-model="inputValue"
            type="text"
            class="input-field"
            :placeholder="step === 'link' 
              ? (lang === 'zh' ? '粘贴链接' : 'Paste link')
              : step === 'title'
                ? (lang === 'zh' ? '输入标题' : 'Enter title')
                : (lang === 'zh' ? '可选' : 'Optional')"
            @keyup.enter="handleSubmit"
          />
        </div>
        
        <div class="panel-footer">
          <button class="btn-cancel" @click="emit('close')">{{ lang === 'zh' ? '取消' : 'Cancel' }}</button>
          <button class="btn-save" @click="handleSubmit" :disabled="!inputValue.trim() && step !== 'author'">
            {{ step === 'author' ? (lang === 'zh' ? '保存' : 'Save') : (lang === 'zh' ? '下一步' : 'Next') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.link-backdrop {
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

.link-panel {
  background: var(--bg-primary);
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
}

.panel-label {
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

.preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
}

.preview-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 60px;
}

.preview-value {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-align: right;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
}

.input-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 60px;
}

.input-field {
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
}

.input-field::placeholder {
  color: var(--text-tertiary);
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 16px;
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

.btn-save:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-save:hover:not(:disabled) {
  opacity: 0.85;
}
</style>
