<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  lang: 'zh' | 'en'
  step: 'link' | 'title' | 'author' | 'tags'
  currentLink: string
  currentTitle: string
}>()

const emit = defineEmits<{
  close: []
  submitLink: [link: string]
  submitTitle: [title: string]
  submitAuthor: [author: string]
  submitTags: [tags: string[]]
}>()

const inputValue = ref('')
const tags = ref<string[]>([])

watch(() => props.step, () => {
  inputValue.value = ''
  if (props.step !== 'tags') {
    tags.value = []
  }
})

const stepLabel = computed(() => {
  if (props.step === 'link') return props.lang === 'zh' ? '链接' : 'Link'
  if (props.step === 'title') return props.lang === 'zh' ? '标题' : 'Title'
  if (props.step === 'author') return props.lang === 'zh' ? '来源' : 'Source'
  return props.lang === 'zh' ? '标签' : 'Tags'
})

const stepPlaceholder = computed(() => {
  if (props.step === 'link') return props.lang === 'zh' ? '粘贴链接' : 'Paste link'
  if (props.step === 'title') return props.lang === 'zh' ? '输入标题' : 'Enter title'
  if (props.step === 'author') return props.lang === 'zh' ? '可选' : 'Optional'
  return props.lang === 'zh' ? '逗号分隔' : 'Comma separated'
})

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const value = target.value
  
  if (props.step === 'tags' && value.includes(',')) {
    const parts = value.split(',')
    const newTag = (parts[0] || '').trim()
    if (newTag) {
      tags.value.push(newTag)
    }
    inputValue.value = parts.slice(1).join(',') || ''
  } else {
    inputValue.value = value
  }
}

function removeTag(index: number) {
  tags.value.splice(index, 1)
}

function handleSubmit() {
  if (props.step === 'tags') {
    const finalTags = [...tags.value]
    if (inputValue.value.trim()) {
      finalTags.push(inputValue.value.trim())
    }
    emit('submitTags', finalTags)
  } else if (props.step === 'author') {
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

const isLastStep = computed(() => props.step === 'tags')
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
    
    <div v-if="step === 'tags' && tags.length > 0" class="tags-row">
      <span class="tags-label">{{ lang === 'zh' ? '已添加' : 'Added' }}</span>
      <div class="tags-list">
        <span v-for="(tag, i) in tags" :key="i" class="tag-item">
          {{ tag }}
          <button class="tag-remove" @click="removeTag(i)">×</button>
        </span>
      </div>
    </div>
    
    <div class="input-row">
      <span class="input-label">{{ stepLabel }}</span>
      <input
        :value="inputValue"
        type="text"
        class="input-field"
        :placeholder="stepPlaceholder"
        @input="handleInput"
        @keyup.enter="handleSubmit"
      />
    </div>
    
    <div class="panel-footer">
      <button class="btn-cancel" @click="emit('close')">{{ lang === 'zh' ? '取消' : 'Cancel' }}</button>
      <button class="btn-save" @click="handleSubmit" :disabled="!inputValue.trim() && step !== 'author' && step !== 'tags'">
        {{ isLastStep ? (lang === 'zh' ? '保存' : 'Save') : (lang === 'zh' ? '下一步' : 'Next') }}
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

.tags-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 56px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.tags-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 60px;
}

.tags-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 10px;
  border-radius: 4px;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 12px;
  color: #3b82f6;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.tag-remove:hover {
  color: #ef4444;
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
