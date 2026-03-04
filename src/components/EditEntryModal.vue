<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  entry: {
    id: string
    content: string
    source: string
    time: string
    link?: string
    category?: string
  }
  lang: 'zh' | 'en'
}>()

const emit = defineEmits<{
  close: []
  delete: [id: string]
  save: [id: string, data: { source: string; time: string; content: string; link: string; category: string }]
}>()

const content = ref(props.entry.content)
const link = ref(props.entry.link || '')
const source = ref(props.entry.source)
const time = ref(props.entry.time)
const category = ref(props.entry.category || '')
const showConfirm = ref(false)

const timePattern = /^(\d{1,2}):(\d{2})$/
const isTimeValid = computed(() => timePattern.test(time.value))

function handleSave() {
  if (!isTimeValid.value) return
  emit('save', props.entry.id, { 
    source: source.value, 
    time: time.value,
    content: content.value,
    link: link.value,
    category: category.value
  })
}

function handleDelete() {
  showConfirm.value = true
}

function handleConfirmDelete() {
  emit('delete', props.entry.id)
}

function handleCancelDelete() {
  showConfirm.value = false
}
</script>

<template>
  <div class="edit-panel">
    <div class="edit-row">
      <span class="edit-label">{{ lang === 'zh' ? '标题' : 'Title' }}</span>
      <input v-model="content" type="text" class="edit-input" />
    </div>
    
    <div class="edit-row">
      <span class="edit-label">{{ lang === 'zh' ? '链接' : 'Link' }}</span>
      <input v-model="link" type="url" class="edit-input" :placeholder="lang === 'zh' ? '可选' : 'Optional'" />
    </div>
    
    <div class="edit-row">
      <span class="edit-label">{{ lang === 'zh' ? '来源' : 'Source' }}</span>
      <input v-model="source" type="text" class="edit-input" />
    </div>
    
    <div class="edit-row">
      <span class="edit-label">{{ lang === 'zh' ? '时间' : 'Time' }}</span>
      <input v-model="time" type="text" class="edit-input" :class="{ invalid: !isTimeValid }" placeholder="HH:MM" />
    </div>
    
    <div class="edit-row">
      <span class="edit-label">{{ lang === 'zh' ? '关键词' : 'Tags' }}</span>
      <input v-model="category" type="text" class="edit-input" :placeholder="lang === 'zh' ? '可选' : 'Optional'" />
    </div>
    
    <div class="edit-actions">
      <button class="action-btn delete" @click="handleDelete">
        {{ lang === 'zh' ? '删除' : 'Delete' }}
      </button>
      <button class="action-btn cancel" @click="emit('close')">
        {{ lang === 'zh' ? '取消' : 'Cancel' }}
      </button>
      <button class="action-btn save" @click="handleSave" :disabled="!isTimeValid">
        {{ lang === 'zh' ? '保存' : 'Save' }}
      </button>
    </div>
    
    <Transition name="confirm">
      <div v-if="showConfirm" class="confirm-overlay" @click.self="handleCancelDelete">
        <div class="confirm-card">
          <p class="confirm-text">{{ lang === 'zh' ? '确定删除？' : 'Delete?' }}</p>
          <div class="confirm-actions">
            <button class="confirm-btn cancel" @click="handleCancelDelete">{{ lang === 'zh' ? '取消' : 'No' }}</button>
            <button class="confirm-btn confirm" @click="handleConfirmDelete">{{ lang === 'zh' ? '删除' : 'Yes' }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.edit-panel {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 0 16px;
}

.edit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  border-bottom: 1px solid var(--border-color);
}

.edit-row:last-of-type {
  border-bottom: none;
}

.edit-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  flex-shrink: 0;
  width: 60px;
}

.edit-input {
  flex: 1;
  font-size: 14px;
  text-align: right;
  background: transparent;
  border: none;
  color: var(--text-primary);
  outline: none;
  padding: 0;
  margin-left: 16px;
}

.edit-input::placeholder {
  color: var(--text-tertiary);
}

.edit-input.invalid {
  color: #ef4444;
}

.edit-actions {
  display: flex;
  gap: 8px;
  padding: 16px 0;
}

.action-btn {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.delete {
  color: #ef4444;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.action-btn.cancel {
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-color);
}

.action-btn.cancel:hover {
  border-color: var(--text-secondary);
}

.action-btn.save {
  color: #fff;
  background: var(--text-primary);
  border: none;
}

.action-btn.save:hover:not(:disabled) {
  opacity: 0.85;
}

.action-btn.save:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.confirm-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  width: 280px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.confirm-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 20px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.confirm-btn {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn.cancel {
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.05);
  border: none;
}

.dark .confirm-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
}

.confirm-btn.confirm {
  color: #fff;
  background: #ef4444;
  border: none;
}

.confirm-btn.confirm:hover {
  background: #dc2626;
}

.confirm-enter-active,
.confirm-leave-active {
  transition: all 0.2s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}
</style>
