<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  isDark: boolean
  lang: 'zh' | 'en'
}>()

const emit = defineEmits<{
  close: []
  toggleTheme: []
  toggleLang: []
  switchUser: [code: string]
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
  const stored = localStorage.getItem('moran-my-code')
  if (stored) {
    myCheatCode.value = stored
  } else {
    myCheatCode.value = generateCheatCode()
    localStorage.setItem('moran-my-code', myCheatCode.value)
  }
})

function handleSwitchUser() {
  const code = inputCheatCode.value.toUpperCase().trim()
  if (code.length === 6) {
    emit('switchUser', code)
    inputCheatCode.value = ''
    showInput.value = false
  }
}

function copyCode() {
  navigator.clipboard.writeText(myCheatCode.value)
}
</script>

<template>
  <div class="settings-overlay">
    <button class="back-btn" @click="emit('close')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
    
    <div class="settings-content">
      <div class="settings-list">
        <button class="settings-item" disabled>
          <span class="item-label">{{ lang === 'zh' ? '日历' : 'Calendar' }}</span>
          <span class="item-hint">{{ lang === 'zh' ? '即将推出' : 'Coming soon' }}</span>
        </button>
        
        <button class="settings-item" @click="emit('toggleTheme')">
          <span class="item-label">{{ lang === 'zh' ? '外观' : 'Theme' }}</span>
          <span class="item-value">{{ isDark ? (lang === 'zh' ? '深色' : 'Dark') : (lang === 'zh' ? '浅色' : 'Light') }}</span>
        </button>
        
        <button class="settings-item" @click="emit('toggleLang')">
          <span class="item-label">{{ lang === 'zh' ? '语言' : 'Language' }}</span>
          <span class="item-value">{{ lang === 'zh' ? '中文' : 'English' }}</span>
        </button>
        
        <div class="settings-item cheat-code-section">
          <span class="item-label">{{ lang === 'zh' ? '我的代码' : 'My Code' }}</span>
          <div class="cheat-code-display">
            <code class="cheat-code">{{ myCheatCode }}</code>
            <button class="copy-btn" @click="copyCode" :title="lang === 'zh' ? '复制' : 'Copy'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="settings-item">
          <span class="item-label">{{ lang === 'zh' ? '切换用户' : 'Switch User' }}</span>
          <button class="switch-btn" @click="showInput = !showInput">
            {{ showInput ? (lang === 'zh' ? '取消' : 'Cancel') : (lang === 'zh' ? '输入代码' : 'Enter Code') }}
          </button>
        </div>
        
        <div v-if="showInput" class="code-input-section">
          <input
            v-model="inputCheatCode"
            type="text"
            maxlength="6"
            :placeholder="lang === 'zh' ? '输入6位代码' : 'Enter 6-digit code'"
            class="code-input"
            @keyup.enter="handleSwitchUser"
          />
          <button class="confirm-btn" @click="handleSwitchUser" :disabled="inputCheatCode.length !== 6">
            {{ lang === 'zh' ? '确认' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-primary);
  z-index: 100;
  padding: 20px;
}

.back-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: var(--text-secondary);
}

.settings-content {
  max-width: 480px;
  margin: 80px auto 0;
}

.settings-list {
  display: flex;
  flex-direction: column;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  background: transparent;
  border-left: none;
  border-right: none;
  border-top: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
  text-align: left;
  width: 100%;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.settings-item:not(:disabled):hover .item-label {
  color: var(--text-primary);
}

.item-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.item-value {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-primary);
}

.item-hint {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.cheat-code-section {
  cursor: default;
}

.cheat-code-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cheat-code {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.08);
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 2px;
}

.dark .cheat-code {
  background: rgba(255, 255, 255, 0.1);
}

.copy-btn {
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.copy-btn:hover {
  color: var(--text-secondary);
}

.switch-btn {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  padding: 6px 12px;
  transition: all 0.2s ease;
}

.switch-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.code-input-section {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.code-input {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  text-transform: uppercase;
  text-align: center;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-primary);
  outline: none;
}

.dark .code-input {
  background: rgba(255, 255, 255, 0.05);
}

.code-input:focus {
  border-color: var(--text-secondary);
}

.code-input::placeholder {
  font-size: 12px;
  letter-spacing: 1px;
  color: var(--text-tertiary);
}

.confirm-btn {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #fff;
  background: #2196f3;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0 16px;
  transition: all 0.2s ease;
}

.confirm-btn:hover:not(:disabled) {
  background: #1976d2;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
