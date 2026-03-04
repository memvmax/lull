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
    
    <div class="edit-footer">
      <button class="btn-delete" @click="handleDelete">{{ lang === 'zh' ? '删除' : 'Delete' }}</button>
      <button class="btn-save" @click="handleSave" :disabled="!isTimeValid">{{ lang === 'zh' ? '保存' : 'Save' }}</button>
    </div>
    
    <Teleport to="body">
      <Transition name="confirm">
        <div v-if="showConfirm" class="confirm-backdrop" @click.self="handleCancelDelete">
          <div class="confirm-modal">
            <div class="confirm-content">
              <span class="confirm-label">{{ lang === 'zh' ? '确认删除' : 'Confirm Delete' }}</span>
              <p class="confirm-text">{{ lang === 'zh' ? '此操作无法撤销' : 'This action cannot be undone' }}</p>
            </div>
            <div class="confirm-footer">
              <button class="confirm-btn cancel" @click="handleCancelDelete">{{ lang === 'zh' ? '取消' : 'Cancel' }}</button>
              <button class="confirm-btn confirm" @click="handleConfirmDelete">{{ lang === 'zh' ? '删除' : 'Delete' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.edit-panel {
  background: var(--bg-primary);
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
  margin-left: 16px;
}

.edit-input::placeholder {
  color: var(--text-tertiary);
  font-size: 11px;
}

.edit-input.invalid {
  color: #ef4444;
}

.edit-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
}

.btn-delete {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #ef4444;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 60px;
  text-align: left;
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
  text-align: right;
}

.btn-save:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.confirm-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.confirm-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 320px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.confirm-content {
  padding: 24px;
  text-align: center;
}

.confirm-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.confirm-text {
  font-size: 15px;
  color: var(--text-primary);
  margin: 0;
}

.confirm-footer {
  display: flex;
  border-top: 1px solid var(--border-color);
}

.confirm-btn {
  flex: 1;
  height: 56px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn.cancel {
  color: var(--text-secondary);
  border-right: 1px solid var(--border-color);
}

.confirm-btn.cancel:hover {
  background: rgba(0, 0, 0, 0.03);
}

.dark .confirm-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.05);
}

.confirm-btn.confirm {
  color: #ef4444;
}

.confirm-btn.confirm:hover {
  background: rgba(239, 68, 68, 0.05);
}

.confirm-enter-active,
.confirm-leave-active {
  transition: all 0.25s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
}

.confirm-enter-from .confirm-modal,
.confirm-leave-to .confirm-modal {
  transform: scale(0.95);
}
</style>
