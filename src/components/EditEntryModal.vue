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
  <div class="edit-overlay">
    <div class="edit-card">
      <div class="edit-header">
        <h3>{{ lang === 'zh' ? '编辑记录' : 'Edit Entry' }}</h3>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>
      
      <div class="edit-content">
        <p class="content-preview">{{ entry.content }}</p>
      </div>
      
      <div class="edit-field">
        <label>{{ lang === 'zh' ? '发言人' : 'Source' }}</label>
        <input v-model="source" type="text" :placeholder="lang === 'zh' ? '输入发言人' : 'Enter source'" />
      </div>
      
      <div class="edit-field">
        <label>{{ lang === 'zh' ? '时间' : 'Time' }}</label>
        <input v-model="time" type="text" placeholder="HH:MM" :class="{ invalid: !isTimeValid }" />
        <span v-if="!isTimeValid" class="error-hint">{{ lang === 'zh' ? '格式: HH:MM' : 'Format: HH:MM' }}</span>
      </div>
      
      <div class="edit-actions">
        <button class="delete-btn" @click="handleDeleteClick">
          {{ lang === 'zh' ? '删除' : 'Delete' }}
        </button>
        <button class="save-btn" @click="handleSave" :disabled="!isTimeValid">
          {{ lang === 'zh' ? '保存' : 'Save' }}
        </button>
      </div>
    </div>
    
    <div v-if="showConfirm" class="confirm-overlay" @click.self="handleCancelDelete">
      <div class="confirm-card">
        <p class="confirm-text">{{ lang === 'zh' ? '确定删除这条记录吗？' : 'Delete this entry?' }}</p>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="handleCancelDelete">
            {{ lang === 'zh' ? '取消' : 'Cancel' }}
          </button>
          <button class="confirm-btn" @click="handleConfirmDelete">
            {{ lang === 'zh' ? '删除' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.edit-card {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  padding: 24px;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.edit-header h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  font-size: 24px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: var(--text-secondary);
}

.edit-content {
  margin-bottom: 20px;
}

.content-preview {
  font-size: 14px;
  color: var(--text-secondary);
  background: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 8px;
  margin: 0;
  max-height: 100px;
  overflow-y: auto;
}

.dark .content-preview {
  background: rgba(255, 255, 255, 0.05);
}

.edit-field {
  margin-bottom: 16px;
}

.edit-field label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.edit-field input {
  width: 100%;
  font-size: 14px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
}

.dark .edit-field input {
  background: rgba(255, 255, 255, 0.05);
}

.edit-field input:focus {
  border-color: var(--text-secondary);
}

.edit-field input.invalid {
  border-color: #e53935;
}

.error-hint {
  font-size: 11px;
  color: #e53935;
  margin-top: 4px;
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.delete-btn {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #e53935;
  background: transparent;
  border: 1px solid #e53935;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #e53935;
  color: #fff;
}

.save-btn {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: #2196f3;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background: #1976d2;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.confirm-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 24px;
  width: 280px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.confirm-text {
  font-size: 15px;
  color: var(--text-primary);
  text-align: center;
  margin: 0 0 20px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.confirm-btn {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: #e53935;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  background: #c62828;
}
</style>
