<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  isDark?: boolean
  lang: 'zh' | 'en'
  currentCode?: string
  showQuestionsSetup?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggleTheme'): void
  (e: 'toggleLang'): void
  (e: 'switchUser', code: string): void
  (e: 'setupQuestions'): void
}>()

const myCheatCode = ref('')
const inputCheatCode = ref('')
const showInput = ref(false)

function generateCheatCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

onMounted(() => {
  myCheatCode.value = generateCheatCode()
})

function copyCode() {
  navigator.clipboard.writeText(myCheatCode.value)
  alert(props.lang === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard')
}

function handleSwitchUser() {
  const code = inputCheatCode.value.trim().toUpperCase()
  if (code) {
    emit('switchUser', code)
  }
  showInput.value = false
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="settings-modal">
      <div class="modal-header">
        <span class="modal-title">{{ lang === 'zh' ? '设置' : 'Settings' }}</span>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div v-if="!showInput" class="settings-list">
        <button class="settings-item" @click="emit('toggleTheme')">
          {{ lang === 'zh' ? '切换主题' : 'Toggle Theme' }}
        </button>
        <button class="settings-item" @click="emit('toggleLang')">
          {{ lang === 'zh' ? '切换语言' : 'Toggle Language' }}
        </button>
        <button class="settings-item" @click="showInput = true">
          {{ lang === 'zh' ? '切换用户' : 'Switch User' }}
        </button>
        <button class="settings-item" @click="emit('setupQuestions')">
          {{ lang === 'zh' ? '设置问题' : 'Setup Questions' }}
        </button>
        
        <div class="share-code">
          <div class="share-label">{{ lang === 'zh' ? '分享码' : 'Share Code' }}</div>
          <div class="code-display" @click="copyCode">
            {{ myCheatCode }}
          </div>
          <div class="share-hint">{{ lang === 'zh' ? '点击复制' : 'Click to copy' }}</div>
        </div>
      </div>

      <div v-else class="input-section">
        <button class="back-btn" @click="showInput = false">
          ← {{ lang === 'zh' ? '返回' : 'Back' }}
        </button>
        <div class="input-group">
          <input
            v-model="inputCheatCode"
            type="text"
            :placeholder="lang === 'zh' ? '输入6位用户码' : 'Enter 6-digit code'"
            maxlength="6"
            @keyup.enter="handleSwitchUser"
          />
          <button class="confirm-btn" @click="handleSwitchUser">
            {{ lang === 'zh' ? '确认' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 90%;
  max-width: 320px;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  font-size: 24px;
  color: var(--text-tertiary);
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-item {
  padding: 12px;
  text-align: left;
  border-radius: 8px;
  transition: background 0.2s;
}

.settings-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.share-code {
  margin-top: 24px;
  text-align: center;
}

.share-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.code-display {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 4px;
  cursor: pointer;
  padding: 12px;
}

.share-hint {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 4px;
}

.input-section {
  padding: 12px 0;
}

.back-btn {
  margin-bottom: 16px;
  color: var(--text-secondary);
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.confirm-btn {
  padding: 10px 16px;
  background: var(--text-primary);
  color: var(--bg-primary);
  border-radius: 8px;
}
</style>
