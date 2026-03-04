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
          <div class="modal-row">
            <input v-model="content" type="text" class="input-title" :placeholder="lang === 'zh' ? '标题' : 'Title'" />
          </div>
          
          <div class="modal-row">
            <input v-model="link" type="url" class="input-link" :placeholder="lang === 'zh' ? '链接' : 'Link'" />
          </div>
          
          <div class="modal-row inline">
            <input v-model="source" type="text" :placeholder="lang === 'zh' ? '作者' : 'Author'" />
            <input v-model="time" type="text" placeholder="HH:MM" :class="{ invalid: !isTimeValid }" />
          </div>
          
          <div class="modal-row">
            <input v-model="category" type="text" :placeholder="lang === 'zh' ? '分类' : 'Category'" />
          </div>
          
          <div class="modal-actions">
            <button class="action-btn delete" @click="handleDeleteClick">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
            <button class="action-btn save" @click="handleSave" :disabled="!isTimeValid">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </button>
          </div>
        </div>
      </Transition>
      
      <Transition name="confirm">
        <div v-if="showConfirm" class="confirm-overlay" @click.self="handleCancelDelete">
          <div class="confirm-card">
            <div class="confirm-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <p class="confirm-text">{{ lang === 'zh' ? '确定删除？' : 'Delete?' }}</p>
            <div class="confirm-actions">
              <button class="confirm-btn cancel" @click="handleCancelDelete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <button class="confirm-btn confirm" @click="handleConfirmDelete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
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
  backdrop-filter: blur(8px);
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
  max-width: 380px;
  padding: 8px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-row {
  padding: 12px 16px;
}

.modal-row.inline {
  display: flex;
  gap: 12px;
}

.modal-row.inline input {
  flex: 1;
}

.modal-row:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

input {
  width: 100%;
  font-size: 15px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
  outline: none;
}

input::placeholder {
  color: var(--text-tertiary);
}

.input-title {
  font-size: 18px;
  font-weight: 600;
}

.input-link {
  color: var(--text-secondary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

input.invalid {
  color: #ef4444;
}

.modal-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
}

.action-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.delete {
  color: var(--text-tertiary);
  background: transparent;
  border: 1px solid var(--border-color);
}

.action-btn.delete:hover {
  color: #ef4444;
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 24px;
  width: 200px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.confirm-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  color: #ef4444;
}

.confirm-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 20px;
}

.confirm-actions {
  display: flex;
  gap: 8px;
}

.confirm-btn {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn.cancel {
  color: var(--text-tertiary);
  background: rgba(0, 0, 0, 0.05);
  border: none;
}

.dark .confirm-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
}

.confirm-btn.cancel:hover {
  background: rgba(0, 0, 0, 0.1);
}

.confirm-btn.confirm {
  color: #fff;
  background: #ef4444;
  border: none;
}

.confirm-btn.confirm:hover {
  background: #dc2626;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
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
