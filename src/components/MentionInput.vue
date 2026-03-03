<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from '@/stores/moran'

const props = defineProps<{
  modelValue: string
  placeholder: string
  disabled: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'submit': []
}>()

const store = useStore()
const inputRef = ref<HTMLTextAreaElement | null>(null)
const showDropdown = ref(false)
const selectedIndex = ref(0)
const cursorPos = ref(0)

const atPosition = computed(() => {
  const val = props.modelValue
  const pos = cursorPos.value
  let atIdx = -1
  
  for (let i = pos - 1; i >= 0; i--) {
    if (val[i] === '@') {
      atIdx = i
      break
    }
    if (val[i] === ' ' || val[i] === '\n') break
  }
  
  return atIdx
})

const searchText = computed(() => {
  if (atPosition.value === -1) return ''
  return props.modelValue.slice(atPosition.value + 1, cursorPos.value).toLowerCase()
})

const filteredSources = computed(() => {
  if (atPosition.value === -1) return []
  const search = searchText.value
  return store.sources.filter(s => {
    if (search === '') return true
    return s.toLowerCase().includes(search) && s.toLowerCase() !== search
  }).slice(0, 5)
})

const displayHtml = computed(() => {
  const val = props.modelValue
  if (!val) return ''
  
  const atIdx = val.indexOf('@')
  if (atIdx === -1) return escapeHtml(val)
  
  const before = escapeHtml(val.slice(0, atIdx))
  const after = val.slice(atIdx + 1)
  const spaceIdx = after.search(/[\s]/)
  
  let mention: string
  let rest: string
  
  if (spaceIdx === -1) {
    mention = after
    rest = ''
  } else {
    mention = after.slice(0, spaceIdx)
    rest = after.slice(spaceIdx)
  }
  
  return `${before}<span class="mention">@${escapeHtml(mention)}</span>${escapeHtml(rest)}`
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
  cursorPos.value = target.selectionStart || 0
  emit('update:modelValue', target.value)
  autoResize()
}

function autoResize() {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (showDropdown.value && filteredSources.value.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % filteredSources.value.length
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex.value = (selectedIndex.value - 1 + filteredSources.value.length) % filteredSources.value.length
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const selected = filteredSources.value[selectedIndex.value]
      if (selected) selectSource(selected)
    } else if (e.key === 'Escape') {
      showDropdown.value = false
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const selected = filteredSources.value[selectedIndex.value]
      if (selected) selectSource(selected)
    }
  } else if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    emit('submit')
  }
}

function handleKeyup(e: KeyboardEvent) {
  const target = e.target as HTMLTextAreaElement
  cursorPos.value = target.selectionStart || 0
}

function handleClick(e: Event) {
  const target = e.target as HTMLTextAreaElement
  cursorPos.value = target.selectionStart || 0
}

function selectSource(source: string) {
  const val = props.modelValue
  const atIdx = atPosition.value
  if (atIdx === -1) return
  
  const before = val.slice(0, atIdx)
  const afterAt = val.slice(atIdx + 1)
  const spaceIdx = afterAt.search(/[\s]/)
  const after = spaceIdx === -1 ? '' : afterAt.slice(spaceIdx)
  
  const newValue = `${before}@${source}${after}`
  emit('update:modelValue', newValue)
  showDropdown.value = false
  
  nextTick(() => {
    if (inputRef.value) {
      const newPos = before.length + 1 + source.length + (spaceIdx === -1 ? 0 : spaceIdx)
      inputRef.value.focus()
      inputRef.value.setSelectionRange(newPos, newPos)
      autoResize()
    }
  })
}

watch(filteredSources, (sources) => {
  showDropdown.value = sources.length > 0
  selectedIndex.value = 0
})

watch(() => props.modelValue, () => {
  nextTick(autoResize)
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  autoResize()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(e: MouseEvent) {
  if (inputRef.value && !inputRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}
</script>

<template>
  <div class="mention-input-wrapper">
    <div class="display-layer" v-html="displayHtml"></div>
    <textarea
      ref="inputRef"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      rows="1"
      @input="handleInput"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @click="handleClick"
      autocomplete="off"
    ></textarea>
    <div v-if="showDropdown" class="dropdown">
      <button
        v-for="(source, idx) in filteredSources"
        :key="source"
        class="dropdown-item"
        :class="{ selected: idx === selectedIndex }"
        @click.prevent="selectSource(source)"
      >
        @{{ source }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.mention-input-wrapper {
  position: relative;
  flex: 1;
}

.display-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-family: var(--font-sans);
  font-size: 1.1rem;
  padding: 10px 0;
  pointer-events: none;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  color: var(--text-primary);
  visibility: hidden;
}

.display-layer :deep(.mention) {
  visibility: visible;
  color: #8B7355;
}

textarea {
  width: 100%;
  min-height: 42px;
  max-height: 200px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-color);
  font-family: var(--font-sans);
  font-size: 1.1rem;
  line-height: 1.5;
  padding: 10px 0;
  outline: none;
  color: var(--text-primary);
  resize: none;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

textarea::-webkit-scrollbar {
  display: none;
}

textarea::placeholder {
  color: var(--text-tertiary);
}

textarea:disabled {
  opacity: 0.5;
}

.dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  margin-bottom: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  color: var(--text-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.dropdown-item:hover,
.dropdown-item.selected {
  background: var(--border-color);
}
</style>
