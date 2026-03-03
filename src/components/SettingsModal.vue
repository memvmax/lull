<script setup lang="ts">
defineProps<{
  isDark: boolean
  lang: 'zh' | 'en'
}>()

const emit = defineEmits<{
  close: []
  toggleTheme: []
  toggleLang: []
}>()
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
        
        <button class="settings-item" disabled>
          <span class="item-label">{{ lang === 'zh' ? '登录' : 'Login' }}</span>
          <span class="item-hint">{{ lang === 'zh' ? '即将推出' : 'Coming soon' }}</span>
        </button>
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
</style>
