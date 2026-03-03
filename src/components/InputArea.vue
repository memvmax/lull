<script setup lang="ts">
import { ref } from 'vue'

const content = ref('')
const source = ref('')
const isExpanded = ref(false)

const emit = defineEmits<{
  submit: [content: string, source: string]
}>()

function handleSubmit() {
  if (content.value.trim()) {
    emit('submit', content.value.trim(), source.value.trim() || '未知')
    content.value = ''
    source.value = ''
    isExpanded.value = false
  }
}

function expand() {
  isExpanded.value = true
}

function collapse() {
  if (!content.value.trim()) {
    isExpanded.value = false
  }
}
</script>

<template>
  <div class="input-area" :class="{ expanded: isExpanded }">
    <div class="input-wrapper">
      <textarea
        v-model="content"
        class="input-content"
        placeholder="记录一段文字..."
        rows="1"
        @focus="expand"
        @blur="collapse"
        @keydown.enter.ctrl="handleSubmit"
      ></textarea>
      <input
        v-if="isExpanded"
        v-model="source"
        type="text"
        class="input-source"
        placeholder="来源（作者/人物）"
      />
      <div v-if="isExpanded" class="input-actions">
        <span class="input-hint">Ctrl + Enter 保存</span>
        <button class="input-submit" @click="handleSubmit" :disabled="!content.trim()">
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-area {
  padding: var(--spacing-md) 0;
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.input-wrapper {
  width: 100%;
}

.input-content {
  width: 100%;
  font-size: 17px;
  line-height: var(--line-height-body);
  min-height: 32px;
  padding: 0;
}

.input-content::placeholder {
  color: var(--text-tertiary);
}

.input-source {
  width: 100%;
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
  padding: 0;
}

.input-source::placeholder {
  color: var(--text-tertiary);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
}

.input-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

.input-submit {
  font-size: 14px;
  color: var(--text-secondary);
  padding: 4px 12px;
  transition: color 0.2s ease;
}

.input-submit:hover:not(:disabled) {
  color: var(--text-primary);
}

.input-submit:disabled {
  color: var(--text-tertiary);
  cursor: not-allowed;
}
</style>
