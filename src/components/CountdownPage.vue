<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { formatTimeUntilTomorrow } from '@/utils/format'

const props = defineProps<{
  lang: 'zh' | 'en'
}>()

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
    <div class="countdown-content">
      <div class="countdown-time">
        <span class="countdown-number">{{ pad(time.hours) }}</span>
        <span class="countdown-separator">:</span>
        <span class="countdown-number">{{ pad(time.minutes) }}</span>
        <span class="countdown-separator">:</span>
        <span class="countdown-number">{{ pad(time.seconds) }}</span>
      </div>
      <p class="countdown-hint">{{ lang === 'zh' ? '晚安' : 'Good Night' }}</p>
    </div>
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
  top: 30.5px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 27px;
  padding: 0 8px;
  color: rgba(232, 230, 225, 0.3);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: rgba(232, 230, 225, 0.6);
}

.countdown-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.countdown-time {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.countdown-number {
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 72px;
  font-weight: 400;
  color: #E8E6E1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
}

.countdown-separator {
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 72px;
  color: rgba(232, 230, 225, 0.4);
  margin: 0 8px;
}

.countdown-hint {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(232, 230, 225, 0.4);
  margin-top: 8px;
}
</style>
