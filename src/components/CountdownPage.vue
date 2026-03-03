<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { formatTimeUntilTomorrow } from '@/utils/format'

const emit = defineEmits<{
  back: []
}>()

const time = ref(formatTimeUntilTomorrow())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    time.value = formatTimeUntilTomorrow()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function pad(num: number): string {
  return String(num).padStart(2, '0')
}
</script>

<template>
  <div class="countdown-page">
    <button class="back-btn" @click="emit('back')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
    <p class="countdown-label">今日阅读已完成</p>
    <div class="countdown-time">
      <span class="countdown-number">{{ pad(time.hours) }}</span>
      <span class="countdown-separator">:</span>
      <span class="countdown-number">{{ pad(time.minutes) }}</span>
      <span class="countdown-separator">:</span>
      <span class="countdown-number">{{ pad(time.seconds) }}</span>
    </div>
    <p class="countdown-hint">距离明天</p>
  </div>
</template>

<style scoped>
.countdown-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #0A0A0A;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.back-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  color: rgba(232, 230, 225, 0.3);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: rgba(232, 230, 225, 0.6);
}

.countdown-label {
  font-size: 14px;
  color: rgba(232, 230, 225, 0.5);
  margin-bottom: var(--spacing-md);
}

.countdown-time {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.countdown-number {
  font-size: 48px;
  font-weight: 400;
  color: #E8E6E1;
  font-variant-numeric: tabular-nums;
}

.countdown-separator {
  font-size: 48px;
  color: rgba(232, 230, 225, 0.3);
  margin: 0 4px;
}

.countdown-hint {
  font-size: 12px;
  color: rgba(232, 230, 225, 0.3);
}
</style>
