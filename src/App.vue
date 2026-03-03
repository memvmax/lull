<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores/moran'
import QuestionModal from '@/components/QuestionModal.vue'
import CountdownPage from '@/components/CountdownPage.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import CommandInput from '@/components/CommandInput.vue'

type Page = 'notes' | 'stats' | 'read'

interface StockData {
  symbol: string
  name: string
  price: number
  currency: string
  yearChange: number
}

interface ETF {
  name: string
  symbols: string[]
}

interface DisplayEntry {
  id: string
  content: string
  source: string
  time: string
}

const store = useStore()
const showQuestions = ref(false)
const isDark = ref(false)
const inputValue = ref('')
const isLoading = ref(false)
const currentPage = ref<Page>('notes')
const showSettings = ref(false)
const aiMode = ref(false)
const etfSetupMode = ref(false)
const currentEtfName = ref('')
const lang = ref<'zh' | 'en'>('zh')

const stockResult = ref<StockData | null>(null)
const etfResults = ref<(StockData & { symbol: string })[]>([])
const savedStocks = ref<StockData[]>([])
const savedEtfs = ref<ETF[]>([])
const helpVisible = ref(false)

const displayEntries = ref<DisplayEntry[]>([])

const pageLabelsZh: Record<Page, string> = {
  notes: '笔记',
  stats: '统计',
  read: '阅读'
}

const pageLabelsEn: Record<Page, string> = {
  notes: 'Notes',
  stats: 'Stats',
  read: 'Read'
}

const pageLabels = computed(() => lang.value === 'zh' ? pageLabelsZh : pageLabelsEn)

const pages: Page[] = ['notes', 'stats', 'read']

onMounted(() => {
  loadEntries()
  
  const savedTheme = localStorage.getItem('moran-theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  const savedLang = localStorage.getItem('moran-lang')
  if (savedLang === 'en') {
    lang.value = 'en'
  }

  const savedStocksData = localStorage.getItem('moran-stocks')
  if (savedStocksData) {
    savedStocks.value = JSON.parse(savedStocksData)
  }

  const savedEtfsData = localStorage.getItem('moran-etfs')
  if (savedEtfsData) {
    savedEtfs.value = JSON.parse(savedEtfsData)
  }
})

function loadEntries() {
  const stored = localStorage.getItem('moran-data')
  if (stored) {
    const data = JSON.parse(stored)
    if (data.entries && Array.isArray(data.entries)) {
      displayEntries.value = data.entries.map((e: any) => ({
        id: e.id,
        content: e.content,
        source: e.source,
        time: formatTime(new Date(e.createdAt))
      })).reverse()
    }
  }
}

function formatTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function saveEntry(content: string, source: string) {
  const entry = {
    id: crypto.randomUUID(),
    content,
    source,
    createdAt: new Date().toISOString()
  }
  
  const stored = localStorage.getItem('moran-data')
  let data: any = { entries: [], questions: [], progress: [] }
  if (stored) {
    data = JSON.parse(stored)
  }
  data.entries.push(entry)
  localStorage.setItem('moran-data', JSON.stringify(data))
  
  displayEntries.value.unshift({
    id: entry.id,
    content: entry.content,
    source: entry.source,
    time: formatTime(new Date(entry.createdAt))
  })
}

function cyclePage() {
  const currentIndex = pages.indexOf(currentPage.value)
  currentPage.value = pages[(currentIndex + 1) % pages.length]
  stockResult.value = null
  etfResults.value = []
}

function parseInput(raw: string) {
  const trimmed = raw.trim()
  
  if (trimmed === '/ai on') {
    aiMode.value = true
    return { type: 'ai-toggle' }
  }
  if (trimmed === '/ai off') {
    aiMode.value = false
    return { type: 'ai-toggle' }
  }
  
  if (trimmed === '/help') {
    helpVisible.value = !helpVisible.value
    return { type: 'help' }
  }
  
  const codeMatch = trimmed.match(/^\/code\s+(\S+)/i)
  if (codeMatch) {
    return { type: 'code', symbol: codeMatch[1] }
  }
  
  const etfSetupMatch = trimmed.match(/^\/etf\s+(\S+)\s+setup/i)
  if (etfSetupMatch) {
    etfSetupMode.value = true
    currentEtfName.value = etfSetupMatch[1].toLowerCase()
    return { type: 'etf-setup', name: currentEtfName.value }
  }
  
  if (trimmed === '/etf end') {
    etfSetupMode.value = false
    currentEtfName.value = ''
    return { type: 'etf-end' }
  }
  
  const etfQueryMatch = trimmed.match(/^\/etf\s+(\S+)/i)
  if (etfQueryMatch) {
    return { type: 'etf-query', name: etfQueryMatch[1].toLowerCase() }
  }
  
  return { type: 'content', raw }
}

function normalizeSymbol(symbol: string): string {
  let s = symbol.toUpperCase()
  if (/^\d{6}$/.test(s)) {
    s = s.startsWith('6') ? s + '.SS' : s + '.SZ'
  } else if (/^\d{4,5}$/.test(s)) {
    s = s + '.HK'
  }
  return s
}

async function fetchStock(symbol: string): Promise<StockData | null> {
  try {
    const normalizedSymbol = normalizeSymbol(symbol)
    const response = await fetch(`/api/stock?symbol=${normalizedSymbol}`)
    const data = await response.json()
    if (data.error) return null
    return data
  } catch {
    return null
  }
}

async function handleSubmit() {
  if (!inputValue.value.trim() || isLoading.value) return
  
  const parsed = parseInput(inputValue.value)
  
  if (parsed.type === 'ai-toggle') {
    inputValue.value = ''
    return
  }
  
  if (parsed.type === 'help') {
    inputValue.value = ''
    return
  }
  
  if (parsed.type === 'code') {
    if (etfSetupMode.value) {
      const existing = savedEtfs.value.find(e => e.name === currentEtfName.value)
      if (existing) {
        if (!existing.symbols.includes(parsed.symbol)) {
          existing.symbols.push(parsed.symbol)
        }
      } else {
        savedEtfs.value.push({ name: currentEtfName.value, symbols: [parsed.symbol] })
      }
      localStorage.setItem('moran-etfs', JSON.stringify(savedEtfs.value))
      inputValue.value = ''
      return
    }
    
    isLoading.value = true
    const data = await fetchStock(parsed.symbol)
    if (data) {
      stockResult.value = data
      etfResults.value = []
      const existingIndex = savedStocks.value.findIndex(s => s.symbol === data.symbol)
      if (existingIndex > -1) {
        savedStocks.value[existingIndex] = data
      } else {
        savedStocks.value.unshift(data)
      }
      localStorage.setItem('moran-stocks', JSON.stringify(savedStocks.value))
    }
    isLoading.value = false
    inputValue.value = ''
    return
  }
  
  if (parsed.type === 'etf-setup') {
    inputValue.value = ''
    return
  }
  
  if (parsed.type === 'etf-end') {
    inputValue.value = ''
    return
  }
  
  if (parsed.type === 'etf-query') {
    isLoading.value = true
    stockResult.value = null
    etfResults.value = []
    
    const etf = savedEtfs.value.find(e => e.name === parsed.name)
    if (etf) {
      const results: (StockData & { symbol: string })[] = []
      for (const symbol of etf.symbols) {
        const data = await fetchStock(symbol)
        if (data) {
          results.push({ ...data, symbol: data.symbol })
        }
      }
      etfResults.value = results
    }
    isLoading.value = false
    inputValue.value = ''
    return
  }
  
  if (parsed.type === 'content') {
    const raw = parsed.raw
    const atIdx = raw.indexOf('@')
    let content = raw
    let author = 'Self'
    
    if (atIdx !== -1) {
      const beforeAt = raw.slice(0, atIdx).trim()
      const afterAt = raw.slice(atIdx + 1)
      const spaceIdx = afterAt.indexOf(' ')
      
      if (spaceIdx !== -1) {
        author = afterAt.slice(0, spaceIdx).trim()
        const afterAuthor = afterAt.slice(spaceIdx + 1).trim()
        content = beforeAt ? `${beforeAt} ${afterAuthor}` : afterAuthor
      } else {
        author = afterAt.trim()
        content = beforeAt
      }
    }
    
    if (content) {
      if (aiMode.value) {
        await processWithAI(content, author || 'Self')
      } else {
        saveEntry(content, author || 'Self')
      }
    }
    inputValue.value = ''
  }
}

async function processWithAI(content: string, author: string) {
  isLoading.value = true
  try {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: content,
        action: 'refine'
      })
    })
    
    const data = await response.json()
    
    if (data.error) {
      alert(data.error)
      return
    }
    
    saveEntry(`【AI】${data.result}`, author)
  } catch (error) {
    alert('AI 处理失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

function handleCompleteReading() {
  if (displayEntries.value.length > 0) {
    showQuestions.value = true
  }
}

function handleQuestionsComplete(answers: Record<string, boolean>) {
  store.completeDay(answers)
  showQuestions.value = false
}

function handleBackFromQuestions() {
  showQuestions.value = false
}

function handleBackFromCountdown() {
  store.undoCompleteDay()
}

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('moran-theme', isDark.value ? 'dark' : 'light')
}

function toggleLang() {
  lang.value = lang.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('moran-lang', lang.value)
}

function openSettings() {
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

function removeStock(symbol: string) {
  savedStocks.value = savedStocks.value.filter(s => s.symbol !== symbol)
  localStorage.setItem('moran-stocks', JSON.stringify(savedStocks.value))
}

function removeEtf(name: string) {
  savedEtfs.value = savedEtfs.value.filter(e => e.name !== name)
  localStorage.setItem('moran-etfs', JSON.stringify(savedEtfs.value))
}
</script>

<template>
  <div class="app-container">
    <CountdownPage v-if="store.isTodayCompleted" @back="handleBackFromCountdown" />
    
    <QuestionModal
      v-else-if="showQuestions"
      :questions="store.questions"
      @complete="handleQuestionsComplete"
      @close="handleBackFromQuestions"
    />
    
    <SettingsModal
      v-else-if="showSettings"
      :is-dark="isDark"
      :lang="lang"
      @close="closeSettings"
      @toggle-theme="toggleTheme"
      @toggle-lang="toggleLang"
    />
    
    <template v-else>
      <header class="top-bar">
        <button class="page-btn" @click="cyclePage">
          {{ pageLabels[currentPage] }}
        </button>
        <button class="settings-btn" @click="openSettings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </header>

      <main class="main-content">
        <div v-if="helpVisible" class="help-panel">
          <button class="help-close" @click="helpVisible = false">×</button>
          <h3 class="help-title">{{ lang === 'zh' ? '指令说明' : 'COMMANDS' }}</h3>
          <div class="help-list">
            <div class="help-item">
              <code class="help-code">/ai on</code>
              <span class="help-desc">{{ lang === 'zh' ? '开启 AI 模式' : 'Enable AI mode' }}</span>
            </div>
            <div class="help-item">
              <code class="help-code">/ai off</code>
              <span class="help-desc">{{ lang === 'zh' ? '关闭 AI 模式' : 'Disable AI mode' }}</span>
            </div>
            <div class="help-item">
              <code class="help-code">@来源</code>
              <span class="help-desc">{{ lang === 'zh' ? '设置内容来源' : 'Set content source' }}</span>
            </div>
            <div class="help-item">
              <code class="help-code">/code 股票代码</code>
              <span class="help-desc">{{ lang === 'zh' ? '查询股票' : 'Query stock' }}</span>
            </div>
            <div class="help-item">
              <code class="help-code">/etf 名称 setup</code>
              <span class="help-desc">{{ lang === 'zh' ? '创建组合' : 'Create portfolio' }}</span>
            </div>
            <div class="help-item">
              <code class="help-code">/etf 名称</code>
              <span class="help-desc">{{ lang === 'zh' ? '查询组合' : 'Query portfolio' }}</span>
            </div>
            <div class="help-item">
              <code class="help-code">/etf end</code>
              <span class="help-desc">{{ lang === 'zh' ? '结束组合创建' : 'End portfolio creation' }}</span>
            </div>
            <div class="help-item">
              <code class="help-code">/help</code>
              <span class="help-desc">{{ lang === 'zh' ? '显示帮助' : 'Show help' }}</span>
            </div>
          </div>
        </div>

        <div v-if="etfSetupMode" class="etf-setup-hint">
          {{ lang === 'zh' ? '正在创建组合' : 'Creating portfolio' }}: <strong>{{ currentEtfName }}</strong> · {{ lang === 'zh' ? '输入 /code 添加股票' : 'Enter /code to add stocks' }} · /etf end
        </div>

        <div v-if="currentPage === 'notes'" class="entries-list">
          <article v-for="entry in displayEntries" :key="entry.id" class="entry">
            <div class="meta">{{ entry.time }} · {{ entry.source }}</div>
            <div class="text">{{ entry.content }}</div>
          </article>
          
          <div v-if="displayEntries.length > 0" class="complete-section">
            <button class="complete-btn" @click="handleCompleteReading">
              {{ lang === 'zh' ? '完成今日阅读' : 'Complete today' }}
            </button>
          </div>
        </div>
        
        <div v-else-if="currentPage === 'stats'" class="stats-page">
          <div v-if="stockResult" class="stock-result">
            <div class="stock-header">
              <span class="stock-symbol">{{ stockResult.symbol }}</span>
              <span class="stock-name">{{ stockResult.name }}</span>
            </div>
            <div class="stock-price">{{ stockResult.price.toFixed(2) }} {{ stockResult.currency }}</div>
            <div class="stock-change" :class="{ positive: stockResult.yearChange >= 0, negative: stockResult.yearChange < 0 }">
              {{ lang === 'zh' ? '今年' : 'YTD' }} {{ formatChange(stockResult.yearChange) }}
            </div>
          </div>

          <div v-if="etfResults.length > 0" class="etf-results">
            <div v-for="stock in etfResults" :key="stock.symbol" class="stock-item">
              <span class="stock-item-symbol">{{ stock.symbol }}</span>
              <span class="stock-item-price">{{ stock.price.toFixed(2) }}</span>
              <span class="stock-item-change" :class="{ positive: stock.yearChange >= 0, negative: stock.yearChange < 0 }">
                {{ formatChange(stock.yearChange) }}
              </span>
            </div>
          </div>

          <div v-if="savedStocks.length > 0" class="saved-stocks">
            <h3 class="saved-stocks-title">{{ lang === 'zh' ? '已保存股票' : 'SAVED STOCKS' }}</h3>
            <div v-for="stock in savedStocks" :key="stock.symbol" class="stock-item">
              <div class="stock-item-info">
                <span class="stock-item-symbol">{{ stock.symbol }}</span>
                <span class="stock-item-price">{{ stock.price.toFixed(2) }}</span>
                <span class="stock-item-change" :class="{ positive: stock.yearChange >= 0, negative: stock.yearChange < 0 }">
                  {{ formatChange(stock.yearChange) }}
                </span>
              </div>
              <button class="stock-remove-btn" @click="removeStock(stock.symbol)">×</button>
            </div>
          </div>

          <div v-if="savedEtfs.length > 0" class="saved-etfs">
            <h3 class="saved-stocks-title">{{ lang === 'zh' ? '已保存组合' : 'SAVED PORTFOLIOS' }}</h3>
            <div v-for="etf in savedEtfs" :key="etf.name" class="etf-item">
              <span class="etf-name">{{ etf.name }}</span>
              <span class="etf-count">{{ etf.symbols.length }} {{ lang === 'zh' ? '只' : 'stocks' }}</span>
              <button class="stock-remove-btn" @click="removeEtf(etf.name)">×</button>
            </div>
          </div>
        </div>
        
        <div v-else-if="currentPage === 'read'" class="placeholder-page">
        </div>
      </main>

      <div class="input-container" :class="{ 'ai-mode': aiMode }">
        <CommandInput
          v-model="inputValue"
          :placeholder="isLoading ? (lang === 'zh' ? '处理中...' : 'Processing...') : (lang === 'zh' ? '输入内容，或 /help 获取指令协助' : 'Enter content, or /help for commands')"
          :disabled="isLoading"
          :ai-mode="aiMode"
          @submit="handleSubmit"
        />
        <button 
          class="send-btn" 
          @click="handleSubmit"
          :disabled="isLoading || !inputValue.trim()"
        >
          {{ lang === 'zh' ? '发送' : 'Send' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  padding-bottom: 120px;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  z-index: 50;
}

.page-btn {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s ease;
}

.page-btn:hover {
  color: var(--text-secondary);
}

.settings-btn {
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.settings-btn:hover {
  color: var(--text-secondary);
}

.main-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 60px 20px 40px;
}

.help-panel {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.dark .help-panel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.help-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--text-tertiary);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.help-close:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.2);
}

.help-title {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.help-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.dark .help-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.dark .help-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.help-code {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.08);
  padding: 4px 10px;
  border-radius: 6px;
  min-width: 120px;
}

.dark .help-code {
  background: rgba(255, 255, 255, 0.1);
}

.help-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.etf-setup-hint {
  background: #e3f2fd;
  color: #1565c0;
  padding: 12px 16px;
  margin-bottom: 24px;
  font-size: 14px;
}

.dark .etf-setup-hint {
  background: #1a3a5c;
  color: #90caf9;
}

.entries-list {
  display: flex;
  flex-direction: column;
}

.entry {
  margin-bottom: 48px;
  animation: fadeIn 0.6s ease-out;
}

.meta {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.text {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 400;
  line-height: 1.6;
  white-space: pre-wrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.complete-section {
  text-align: center;
  margin-top: 48px;
}

.complete-btn {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-secondary);
  padding: 8px 24px;
  border: 1px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.complete-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-secondary);
}

.stats-page {
  padding-top: 20px;
}

.stock-result {
  padding: 24px 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.stock-header {
  margin-bottom: 12px;
}

.stock-symbol {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin-right: 12px;
}

.stock-name {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-secondary);
}

.stock-price {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 400;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.stock-change {
  font-family: var(--font-mono);
  font-size: 14px;
}

.stock-change.positive {
  color: #27ae60;
}

.stock-change.negative {
  color: #c0392b;
}

.etf-results {
  margin-bottom: 32px;
}

.saved-stocks,
.saved-etfs {
  margin-top: 32px;
}

.saved-stocks-title {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.stock-item-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stock-item-symbol {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 80px;
}

.stock-item-price {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--text-primary);
}

.stock-item-change {
  font-family: var(--font-mono);
  font-size: 12px;
}

.stock-item-change.positive {
  color: #27ae60;
}

.stock-item-change.negative {
  color: #c0392b;
}

.stock-remove-btn {
  font-size: 18px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s ease;
}

.stock-remove-btn:hover {
  color: var(--text-secondary);
}

.etf-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.etf-name {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.etf-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.input-container {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 560px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.send-btn {
  font-size: 13px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  padding: 6px 14px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.dark .send-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.send-btn:hover:not(:disabled) {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.25);
}

.dark .send-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.15);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
