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
  <div class="link-panel">
    <div class="panel-title">
      <span class="title-label">{{ lang === 'zh' ? '添加文章' : 'Add Article' }}</span>
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
</template>

<style scoped>
.link-panel {
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

.preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
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
