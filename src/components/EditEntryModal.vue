<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  entry: {
    id: string
    content: string
    source: string
    time: string
  }
  lang: 'zh' | 'en'
}>()

const emit = defineEmits<{
  close: []
  delete: [id: string]
  save: [id: string, data: { source: string; time: string }]
}>()

const source = ref(props.entry.source)
const time = ref(props.entry.time)
const showConfirm = ref(false)

const timePattern = /^(\d{1,2}):(\d{2})$/
const isTimeValid = computed(() => timePattern.test(time.value))

function handleSave() {
  if (!isTimeValid.value) return
  emit('save', props.entry.id, { source: source.value, time: time.value })
}

function handleDeleteClick() {
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
  <Teleport to="body">
    <div class="edit-backdrop" @click.self="emit('close')">
      <Transition name="modal">
        <div v-if="!showConfirm" class="edit-modal">
          <div class="modal-header">
            <span class="modal-title">{{ lang === 'zh' ? '编辑记录' : 'Edit Entry' }}</span>
            <button class="modal-close" @click="emit('close')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="content-preview">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
              </svg>
              <span>{{ entry.content }}</span>
            </div>
            
            <div class="form-group">
              <label>{{ lang === 'zh' ? '发言人' : 'Source' }}</label>
              <input v-model="source" type="text" :placeholder="lang === 'zh' ? '输入发言人' : 'Enter source'" />
            </div>
            
            <div class="form-group">
              <label>{{ lang === 'zh' ? '时间' : 'Time' }}</label>
              <input v-model="time" type="text" placeholder="HH:MM" :class="{ invalid: !isTimeValid }" />
              <span v-if="!isTimeValid" class="error-text">{{ lang === 'zh' ? '格式: HH:MM' : 'Format: HH:MM' }}</span>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-delete" @click="handleDeleteClick">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              <span>{{ lang === 'zh' ? '删除' : 'Delete' }}</span>
            </button>
            <button class="btn-save" @click="handleSave" :disabled="!isTimeValid">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <path d="M17 21v-8H7v8M7 3v5h8"/>
              </svg>
              <span>{{ lang === 'zh' ? '保存' : 'Save' }}</span>
            </button>
          </div>
        </div>
      </Transition>
      
      <Transition name="confirm">
        <div v-if="showConfirm" class="confirm-modal" @click.self="handleCancelDelete">
          <div class="confirm-content">
            <div class="confirm-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <p class="confirm-title">{{ lang === 'zh' ? '确认删除' : 'Confirm Delete' }}</p>
            <p class="confirm-desc">{{ lang === 'zh' ? '此操作无法撤销，确定要删除这条记录吗？' : 'This action cannot be undone. Are you sure?' }}</p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="handleCancelDelete">
                {{ lang === 'zh' ? '取消' : 'Cancel' }}
              </button>
              <button class="btn-confirm" @click="handleConfirmDelete">
                {{ lang === 'zh' ? '删除' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.edit-backdrop {
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

.edit-modal {
  background: var(--bg-primary);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.modal-close {
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

.modal-close:hover {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.05);
}

.dark .modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 24px;
}

.content-preview {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  margin-bottom: 24px;
}

.dark .content-preview {
  background: rgba(255, 255, 255, 0.05);
}

.content-preview svg {
  flex-shrink: 0;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.content-preview span {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  font-size: 15px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid transparent;
  border-radius: 10px;
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.dark .form-group input {
  background: rgba(255, 255, 255, 0.05);
}

.form-group input:focus {
  border-color: var(--text-secondary);
  background: transparent;
}

.form-group input.invalid {
  border-color: #ef4444;
}

.form-group input.invalid:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-text {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.02);
}

.dark .modal-footer {
  background: rgba(255, 255, 255, 0.02);
}

.btn-delete, .btn-save {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete {
  color: #ef4444;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.btn-save {
  color: #fff;
  background: #3b82f6;
  border: none;
}

.btn-save:hover:not(:disabled) {
  background: #2563eb;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-content {
  background: var(--bg-primary);
  border-radius: 20px;
  padding: 32px;
  width: 340px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.confirm-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  color: #ef4444;
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.confirm-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 28px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.05);
  border: none;
}

.dark .btn-cancel {
  background: rgba(255, 255, 255, 0.1);
}

.btn-cancel:hover {
  background: rgba(0, 0, 0, 0.1);
}

.dark .btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-confirm {
  color: #fff;
  background: #ef4444;
  border: none;
}

.btn-confirm:hover {
  background: #dc2626;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.confirm-enter-active,
.confirm-leave-active {
  transition: all 0.2s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
