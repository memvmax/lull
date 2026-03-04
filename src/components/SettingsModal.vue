<script setup lang="ts">
import { ref, computed } from 'vue'
import QuestionsSetupPanel from './QuestionsSetupPanel.vue'
import CalendarPanel from './CalendarPanel.vue'
import QuestionsPanel from './QuestionsPanel.vue'
import type { DailyQuestion } from '@/types'

const props = defineProps<{
  isDark?: boolean
  lang: 'zh' | 'en'
  myCode: string
  viewingCode: string
  isReadOnly: boolean
  questions: DailyQuestion[]
  progress: Record<string, boolean>
  isTodayCompleted?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'toggleTheme'): void
  (e: 'toggleLang'): void
  (e: 'visitCommunity', code: string): void
  (e: 'backToMyCommunity'): void
  (e: 'saveQuestions', questions: string[]): void
  (e: 'selectDate', date: Date): void
  (e: 'completeToday', answers: Record<string, boolean>): void
}>()

const visitCode = ref('')
const showVisitInput = ref(false)
const showQuestionsPanel = ref(false)
const showCalendarPanel = ref(false)
const showQuestionsAnswerPanel = ref(false)

function copyMyCode() {
  navigator.clipboard.writeText(props.myCode)
}

function handleVisit() {
  const code = visitCode.value.toUpperCase().trim()
  if (code.length === 6) {
    emit('visitCommunity', code)
    visitCode.value = ''
    showVisitInput.value = false
  }
}

function handleBack() {
  emit('backToMyCommunity')
}

function openQuestionsPanel() {
  showQuestionsPanel.value = true
}

function closeQuestionsPanel() {
  showQuestionsPanel.value = false
}

function handleSaveQuestions(questions: string[]) {
  emit('saveQuestions', questions)
  closeQuestionsPanel()
}

function openCalendarPanel() {
  showCalendarPanel.value = true
}

function closeCalendarPanel() {
  showCalendarPanel.value = false
}

function handleSelectDate(date: Date) {
  emit('selectDate', date)
  closeCalendarPanel()
}

function openQuestionsAnswerPanel() {
  showQuestionsAnswerPanel.value = true
}

function closeQuestionsAnswerPanel() {
  showQuestionsAnswerPanel.value = false
}

function handleCompleteToday(answers: Record<string, boolean>) {
  emit('completeToday', answers)
  closeQuestionsAnswerPanel()
}

const currentPanel = computed(() => {
  if (showQuestionsAnswerPanel.value) return 'questions-answer'
  if (showCalendarPanel.value) return 'calendar'
  if (showQuestionsPanel.value) return 'questions'
  return 'settings'
})
</script>

<template>
  <div class="settings-overlay">
    <button class="back-btn" @click="currentPanel !== 'settings' ? (showQuestionsAnswerPanel ? closeQuestionsAnswerPanel() : showCalendarPanel ? closeCalendarPanel() : closeQuestionsPanel()) : emit('close')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
    
    <div class="settings-wrapper">
      <Transition name="slide" mode="out-in">
        <div v-if="currentPanel === 'settings'" class="settings-content" key="settings">
          <div class="settings-list">
            <button class="settings-item" @click="openCalendarPanel">
              <span class="item-label">{{ lang === 'zh' ? '日历' : 'Calendar' }}</span>
              <span class="item-value">{{ lang === 'zh' ? '查看' : 'View' }}</span>
            </button>
            
            <button class="settings-item" @click="emit('toggleTheme')">
              <span class="item-label">{{ lang === 'zh' ? '外观' : 'Theme' }}</span>
              <span class="item-value">{{ isDark ? (lang === 'zh' ? '深色' : 'Dark') : (lang === 'zh' ? '浅色' : 'Light') }}</span>
            </button>
            
            <button class="settings-item" @click="emit('toggleLang')">
              <span class="item-label">{{ lang === 'zh' ? '语言' : 'Language' }}</span>
              <span class="item-value">{{ lang === 'zh' ? '中文' : 'English' }}</span>
            </button>
            
            <button class="settings-item" @click="openQuestionsPanel">
              <span class="item-label">{{ lang === 'zh' ? '每日问题' : 'Daily Questions' }}</span>
              <span class="item-value">{{ lang === 'zh' ? '设置' : 'Setup' }}</span>
            </button>
            
            <div class="settings-item cheat-code-section">
              <span class="item-label">{{ lang === 'zh' ? '我的代码' : 'My Code' }}</span>
              <div class="cheat-code-display">
                <code class="cheat-code">{{ myCode }}</code>
                <button class="copy-btn" @click="copyMyCode" :title="lang === 'zh' ? '复制' : 'Copy'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div v-if="isReadOnly" class="settings-item viewing-section">
              <span class="item-label">{{ lang === 'zh' ? '当前查看' : 'Viewing' }}</span>
              <div class="viewing-display">
                <code class="cheat-code viewing-code">{{ viewingCode }}</code>
                <span class="readonly-badge">{{ lang === 'zh' ? '只读' : 'Read-only' }}</span>
              </div>
            </div>
            
            <div v-if="isReadOnly" class="settings-item">
              <span class="item-label"></span>
              <button class="back-to-my-btn" @click="handleBack">
                {{ lang === 'zh' ? '返回我的社区' : 'Back to My Community' }}
              </button>
            </div>
            
            <div v-if="!isReadOnly" class="settings-item">
              <span class="item-label">{{ lang === 'zh' ? '访问社区' : 'Visit Community' }}</span>
              <button class="switch-btn" @click="showVisitInput = !showVisitInput">
                {{ showVisitInput ? (lang === 'zh' ? '取消' : 'Cancel') : (lang === 'zh' ? '输入代码' : 'Enter Code') }}
              </button>
            </div>
            
            <div v-if="showVisitInput && !isReadOnly" class="code-input-section">
              <input
                v-model="visitCode"
                type="text"
                maxlength="6"
                :placeholder="lang === 'zh' ? '输入6位代码' : 'Enter 6-digit code'"
                class="code-input"
                @keyup.enter="handleVisit"
              />
              <button class="confirm-btn" @click="handleVisit" :disabled="visitCode.length !== 6">
                {{ lang === 'zh' ? '访问' : 'Visit' }}
              </button>
            </div>
            
            <div class="settings-item">
              <span class="item-label">{{ lang === 'zh' ? '账户' : 'Account' }}</span>
              <span class="item-value login-hint">{{ lang === 'zh' ? '登录' : 'Login' }}</span>
            </div>
            
            <button v-if="!isReadOnly && questions.length > 0" class="settings-item" @click="openQuestionsAnswerPanel">
              <span class="item-label">{{ lang === 'zh' ? '完成今日' : 'Complete Today' }}</span>
              <span class="item-value" :class="{ completed: isTodayCompleted }">
                {{ isTodayCompleted 
                  ? (lang === 'zh' ? '已完成' : 'Completed') 
                  : (lang === 'zh' ? '待完成' : 'Pending') }}
              </span>
            </button>
          </div>
        </div>
        
        <div v-else-if="currentPanel === 'questions'" class="settings-content" key="questions">
          <QuestionsSetupPanel
            :questions="questions"
            :lang="lang"
            @close="closeQuestionsPanel"
            @save="handleSaveQuestions"
          />
        </div>
        
        <div v-else-if="currentPanel === 'questions-answer'" class="settings-content" key="questions-answer">
          <QuestionsPanel
            :questions="questions"
            :lang="lang"
            @close="closeQuestionsAnswerPanel"
            @complete="handleCompleteToday"
          />
        </div>
        
        <div v-else class="settings-content" key="calendar">
          <CalendarPanel
            :lang="lang"
            :progress="progress"
            @close="closeCalendarPanel"
            @select-date="handleSelectDate"
          />
        </div>
      </Transition>
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
  overflow-y: auto;
}

.back-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 27px;
  padding: 0 8px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
  z-index: 10;
}

.back-btn:hover {
  color: var(--text-secondary);
}

.settings-wrapper {
  max-width: 480px;
  margin: 80px auto 0;
  overflow: hidden;
}

.settings-content {
  width: 100%;
}

.settings-list {
  display: flex;
  flex-direction: column;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
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

.item-value.completed {
  color: #10b981;
}

.login-hint {
  color: var(--text-tertiary);
}

.item-hint {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.cheat-code-section,
.viewing-section {
  cursor: default;
}

.cheat-code-display,
.viewing-display {
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

.viewing-code {
  background: rgba(33, 150, 243, 0.15);
}

.readonly-badge {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #2196f3;
  background: rgba(33, 150, 243, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
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

.back-to-my-btn {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #fff;
  background: #2196f3;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.back-to-my-btn:hover {
  background: #1976d2;
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

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
