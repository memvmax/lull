<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder: string
  disabled: boolean
  aiMode: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': []
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const displayHtml = computed(() => {
  const val = props.modelValue
  if (!val) return ''
  
  const trimmed = val.trim()
  
  if (trimmed.startsWith('/')) {
    const spaceIdx = val.indexOf(' ')
    if (spaceIdx !== -1) {
      const cmdPart = val.slice(0, spaceIdx)
      const rest = val.slice(spaceIdx)
      const isValidCmd = ['/ai', '/code', '/etf', '/help'].some(c => 
        cmdPart.toLowerCase() === c.toLowerCase() ||
        cmdPart.toLowerCase().startsWith(c.toLowerCase())
      )
      if (isValidCmd) {
        return `<span class="cmd-valid">${escapeHtml(cmdPart)}</span>${escapeHtml(rest)}`
      }
      return `<span class="cmd-invalid">${escapeHtml(cmdPart)}</span>${escapeHtml(rest)}`
    }
    
    const isValidCmd = ['/ai on', '/ai off', '/help', '/code', '/etf'].some(c => 
      trimmed.toLowerCase() === c.toLowerCase() ||
      trimmed.toLowerCase().startsWith(c.toLowerCase())
    )
    if (isValidCmd) {
      return `<span class="cmd-valid">${escapeHtml(val)}</span>`
    }
    return `<span class="cmd-invalid">${escapeHtml(val)}</span>`
  }
  
  const atIdx = val.indexOf('@')
  if (atIdx !== -1) {
    const beforeAt = val.slice(0, atIdx)
    const afterAt = val.slice(atIdx + 1)
    const spaceIdx = afterAt.indexOf(' ')
    
    if (spaceIdx !== -1) {
      const author = afterAt.slice(0, spaceIdx)
      const rest = afterAt.slice(spaceIdx)
      return `${escapeHtml(beforeAt)}<span class="cmd-valid">@${escapeHtml(author)}</span>${escapeHtml(rest)}`
    }
    
    return `${escapeHtml(beforeAt)}<span class="cmd-valid">@${escapeHtml(afterAt)}</span>`
  }
  
  return escapeHtml(val)
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  autoResize()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('submit')
  }
}

function autoResize() {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
  }
}

watch(() => props.modelValue, () => {
  nextTick(() => autoResize())
})

onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
})
</script>

<template>
  <div class="cmd-input-wrapper" :class="{ 'ai-mode': aiMode }">
    <div class="input-inner">
      <div class="display-layer" v-html="displayHtml"></div>
      <textarea
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        rows="1"
        @input="handleInput"
        @keydown="handleKeydown"
        autocomplete="off"
        spellcheck="false"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.cmd-input-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

.input-inner {
  position: relative;
  width: 100%;
}

.display-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: 15px;
  line-height: 1.4;
  padding: 8px 0;
  pointer-events: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  color: var(--text-primary);
}

.display-layer :deep(.cmd-valid) {
  color: #2196f3;
}

.display-layer :deep(.cmd-invalid) {
  color: #e53935;
}

textarea {
  width: 100%;
  min-height: 36px;
  max-height: 120px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-color);
  font-size: 15px;
  line-height: 1.4;
  padding: 8px 0;
  outline: none;
  color: transparent;
  caret-color: var(--text-primary);
  resize: none;
  overflow-y: hidden;
}

.ai-mode textarea {
  border-bottom-color: transparent;
}

textarea::placeholder {
  color: var(--text-tertiary);
}

textarea:disabled {
  opacity: 0.5;
}
</style>
