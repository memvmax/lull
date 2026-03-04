<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores/moran'
import CountdownPage from '@/components/CountdownPage.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import CommandInput from '@/components/CommandInput.vue'
import EditEntryModal from '@/components/EditEntryModal.vue'
import EtfSetupPanel from '@/components/EtfSetupPanel.vue'
import EtfListPanel from '@/components/EtfListPanel.vue'
import QuestionsSetupPanel from '@/components/QuestionsSetupPanel.vue'
import LinkSetupPanel from '@/components/LinkSetupPanel.vue'

type Page = 'notes' | 'read'

interface StockData {
  symbol: string
  name: string
  price: number
  currency: string
  yearChange: number
}

interface EtfStock {
  symbol: string
  weight: number
}

interface ETF {
  name: string
  stocks: EtfStock[]
}

interface DisplayEntry {
  id: string
  content: string
  source: string
  time: string
  createdAt: Date
  type?: 'note' | 'link'
  link?: string
  category?: string
}

const store = useStore()
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
const savedEtfs = computed(() => store.etfs)
const helpVisible = ref(false)
const showEtfSetup = ref(false)
const showEtfList = ref(false)
const showLinkSetup = ref(false)
const linkSetupStep = ref<'link' | 'title' | 'author' | 'tags'>('link')
const currentLink = ref('')
const currentTitle = ref('')
const currentAuthor = ref('')
const editingEtfName = ref('')
const expandedEtf = ref<string | null>(null)
const etfStockPrices = ref<Record<string, { price: number; change: number }>>({})

const tagFilter = ref<string | null>(null)

const displayEntries = computed(() => {
  let entries = store.sortedEntries as DisplayEntry[]
  if (tagFilter.value) {
    entries = entries.filter(e => {
      const category = e.category || ''
      const tags = category.split(',').map(t => t.trim().toLowerCase())
      return tags.includes(tagFilter.value!.toLowerCase())
    })
  }
  
  const selectedDateStr = `${currentDate.value.getFullYear()}-${String(currentDate.value.getMonth() + 1).padStart(2, '0')}-${String(currentDate.value.getDate()).padStart(2, '0')}`
  entries = entries.filter(e => {
    const entryDate = e.createdAt
    const entryDateStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`
    return entryDateStr === selectedDateStr
  })
  
  return entries
})
const editingEntry = ref<DisplayEntry | null>(null)

const currentDate = ref(new Date())
const slideDirection = ref<'left' | 'right' | null>(null)

const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const currentMonth = computed(() => monthNames[currentDate.value.getMonth()])
const currentDay = computed(() => currentDate.value.getDate())

function getAdjacentDate(offset: number) {
  const date = new Date(currentDate.value)
  date.setDate(date.getDate() + offset)
  return date
}

function selectDate(offset: number) {
  slideDirection.value = offset > 0 ? 'left' : 'right'
  setTimeout(() => {
    currentDate.value = getAdjacentDate(offset)
    setTimeout(() => {
      slideDirection.value = null
    }, 50)
  }, 150)
}

let touchStartX = 0

function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0]?.clientX || 0
}

function handleTouchEnd(e: TouchEvent) {
  const touchEndX = e.changedTouches[0]?.clientX || 0
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      selectDate(1)
    } else {
      selectDate(-1)
    }
  }
}

const isGMMode = computed(() => {
  if (store.isReadOnly) return false
  return store.myCode === 'MM1024'
})

const pageLabelsZh: Record<Page, string> = {
  notes: '笔记',
  read: '阅读'
}

const pageLabelsEn: Record<Page, string> = {
  notes: 'Notes',
  read: 'Reads'
}

const pageLabels = computed(() => lang.value === 'zh' ? pageLabelsZh : pageLabelsEn)

const pages: Page[] = ['notes', 'read']

onMounted(async () => {
  await store.init()
  
  if (store.questions.length === 0) {
    store.setQuestions([
      lang.value === 'zh' ? '今天我学到了什么？' : 'What did I learn today?',
      lang.value === 'zh' ? '今天我是否保持了专注？' : 'Did I stay focused today?',
      lang.value === 'zh' ? '今天我是否对他人友善？' : 'Was I kind to others today?'
    ])
  }
  
  const savedTheme = localStorage.getItem('moran-theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }

  const savedLang = localStorage.getItem('moran-lang')
  if (savedLang === 'en') {
    lang.value = 'en'
  }

  const code = store.myCode
  const stocksKey = code ? `moran-stocks-${code}` : 'moran-stocks'
  const savedStocksData = localStorage.getItem(stocksKey)
  if (savedStocksData) {
    savedStocks.value = JSON.parse(savedStocksData)
  }

  const etfsKey = code ? `moran-etfs-${code}` : 'moran-etfs'
  const savedEtfsData = localStorage.getItem(etfsKey)
  if (savedEtfsData) {
    const parsed = JSON.parse(savedEtfsData)
    store.setEtfs(parsed.map((etf: any) => {
      if (etf.stocks) {
        return etf
      }
      if (etf.symbols) {
        return {
          name: etf.name,
          stocks: etf.symbols.map((s: string) => ({ symbol: s, weight: 100 / etf.symbols.length }))
        }
      }
      return etf
    }))
  }
})

function getStorageKey(base: string): string {
  const code = store.myCode
  return code ? `${base}-${code}` : base
}

function loadEntries() {
}

function formatTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function saveEntry(content: string, source: string) {
  store.addEntry(content, source)
}

function cyclePage() {
  const currentIndex = pages.indexOf(currentPage.value)
  const nextIndex = (currentIndex + 1) % pages.length
  currentPage.value = pages[nextIndex]!
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
  
  if (trimmed === '/link') {
    showLinkSetup.value = !showLinkSetup.value
    linkSetupStep.value = 'link'
    currentLink.value = ''
    currentTitle.value = ''
    return { type: 'link-toggle' }
  }
  
  if (trimmed === '/etfsetup') {
    showEtfSetup.value = !showEtfSetup.value
    return { type: 'etfsetup-toggle' }
  }
  
  if (trimmed === '/etf') {
    showEtfList.value = !showEtfList.value
    return { type: 'etf-toggle' }
  }
  
  const codeMatch = trimmed.match(/^\/code\s+(\S+)/i)
  if (codeMatch && codeMatch[1]) {
    return { type: 'code', symbol: codeMatch[1] }
  }
  
  const etfQueryMatch = trimmed.match(/^\/etf\s+(\S+)/i)
  if (etfQueryMatch && etfQueryMatch[1]) {
    return { type: 'etf-query', name: etfQueryMatch[1].toLowerCase() }
  }
  
  const tagMatch = trimmed.match(/^\/tag\s+(.+)$/i)
  if (tagMatch && tagMatch[1]) {
    return { type: 'tag-filter', tag: tagMatch[1].trim() }
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

async function fetchEtfStockPrices(etfName: string) {
  const etf = savedEtfs.value.find(e => e.name === etfName)
  if (!etf) return
  
  for (const stock of etf.stocks) {
    const data = await fetchStock(stock.symbol)
    if (data) {
      etfStockPrices.value[stock.symbol] = {
        price: data.price,
        change: data.yearChange
      }
    }
  }
}

function toggleEtfExpand(etfName: string) {
  if (expandedEtf.value === etfName) {
    expandedEtf.value = null
  } else {
    expandedEtf.value = etfName
    fetchEtfStockPrices(etfName)
  }
}

async function handleSubmit() {
  if (!inputValue.value.trim() || isLoading.value) return
  
  const parsed = parseInput(inputValue.value)
  
  if (parsed.type === 'ai-toggle' || parsed.type === 'help' || parsed.type === 'etfsetup-toggle' || parsed.type === 'etf-toggle' || parsed.type === 'link-toggle') {
    inputValue.value = ''
    return
  }
  
  if (parsed.type === 'tag-filter' && parsed.tag) {
    if (tagFilter.value === parsed.tag.toLowerCase()) {
      tagFilter.value = null
    } else {
      tagFilter.value = parsed.tag
      currentPage.value = 'read'
    }
    inputValue.value = ''
    return
  }
  
  if (parsed.type === 'code' && parsed.symbol) {
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
      localStorage.setItem(getStorageKey('moran-stocks'), JSON.stringify(savedStocks.value))
    }
    isLoading.value = false
    inputValue.value = ''
    return
  }
  
  if (parsed.type === 'etf-query' && parsed.name) {
    isLoading.value = true
    stockResult.value = null
    etfResults.value = []
    
    const etf = savedEtfs.value.find(e => e.name === parsed.name)
    if (etf) {
      const results: (StockData & { symbol: string })[] = []
      for (const stock of etf.stocks) {
        const data = await fetchStock(stock.symbol)
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
  
  if (parsed.type === 'content' && parsed.raw) {
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

function handleCompleteToday(answers: Record<string, boolean>) {
  store.completeDay(answers)
  closeSettings()
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
  localStorage.setItem(getStorageKey('moran-stocks'), JSON.stringify(savedStocks.value))
}

function removeEtf(name: string) {
  store.setEtfs(savedEtfs.value.filter(e => e.name !== name))
}

async function handleVisitCommunity(code: string) {
  await store.switchToCode(code.toUpperCase())
  closeSettings()
}

async function handleBackToMyCommunity() {
  await store.backToMyCode()
  closeSettings()
}

function openEditModal(entry: DisplayEntry) {
  editingEntry.value = entry
}

function closeEditModal() {
  editingEntry.value = null
}

function handleDeleteEntry(id: string) {
  store.deleteEntry(id)
  closeEditModal()
}

function handleSaveEntry(id: string, data: { source: string; time: string; content: string; link: string; category: string }) {
  if (store.isReadOnly) return
  const entry = store.entries.find(e => e.id === id)
  if (entry) {
    entry.content = data.content
    entry.source = data.source
    entry.link = data.link
    entry.category = data.category
    store.save()
  }
  closeEditModal()
}

function handleSaveEtf(data: { name: string; symbol: string; weight: number }) {
  const existing = savedEtfs.value.find(e => e.name === data.name)
  if (existing) {
    const existingStock = existing.stocks.find((s: any) => s.symbol === data.symbol)
    if (existingStock) {
      existingStock.weight = data.weight
    } else {
      existing.stocks.push({ symbol: data.symbol, weight: data.weight })
    }
    store.setEtfs([...savedEtfs.value])
  } else {
    store.setEtfs([...savedEtfs.value, {
      name: data.name,
      stocks: [{ symbol: data.symbol, weight: data.weight }]
    }])
  }
}

function handleDeleteEtf(name: string) {
  store.setEtfs(savedEtfs.value.filter(e => e.name !== name))
}

function handleEditEtf(name: string) {
  editingEtfName.value = name
  showEtfList.value = false
  showEtfSetup.value = true
}

function handleEditEtfStock(etfName: string, symbol: string) {
  editingEtfName.value = etfName
  showEtfList.value = false
  showEtfSetup.value = true
}

function handleDeleteEtfStock(etfName: string, symbol: string) {
  const etf = savedEtfs.value.find(e => e.name === etfName)
  if (etf) {
    etf.stocks = etf.stocks.filter((s: any) => s.symbol !== symbol)
    if (etf.stocks.length === 0) {
      store.setEtfs(savedEtfs.value.filter(e => e.name !== etfName))
    } else {
      store.setEtfs([...savedEtfs.value])
    }
  }
}

function handleSaveQuestions(questions: string[]) {
  store.setQuestions(questions)
}

function handleCalendarSelectDate(date: Date) {
  currentDate.value = date
  closeSettings()
  currentPage.value = 'notes'
}

function handleLinkSubmit(link: string) {
  currentLink.value = link
  linkSetupStep.value = 'title'
}

function handleTitleSubmit(title: string) {
  currentTitle.value = title
  linkSetupStep.value = 'author'
}

function handleAuthorSubmit(author: string) {
  currentAuthor.value = author
  linkSetupStep.value = 'tags'
}

function handleTagsSubmit(tags: string[]) {
  if (store.isReadOnly) return
  
  const entry = {
    id: crypto.randomUUID(),
    content: currentTitle.value,
    source: currentAuthor.value || 'Self',
    createdAt: new Date(),
    type: 'link' as const,
    link: currentLink.value,
    category: tags.join(',')
  }
  
  store.entries.push(entry)
  store.save()
  
  showLinkSetup.value = false
  currentLink.value = ''
  currentTitle.value = ''
  currentAuthor.value = ''
  linkSetupStep.value = 'link'
}
</script>

<template>
  <div class="app-container">
    <CountdownPage v-if="store.isTodayCompleted" @back="handleBackFromCountdown" />
      
    <SettingsModal
      v-if="showSettings"
      :is-dark="isDark"
      :lang="lang"
      :my-code="store.myCode"
      :viewing-code="store.viewingCode"
      :is-read-only="store.isReadOnly"
      :questions="store.questions"
      :progress="Object.fromEntries(store.progress.map(p => [p.date, p.completed]))"
      :is-today-completed="store.isTodayCompleted"
      @close="closeSettings"
      @toggle-theme="toggleTheme"
      @toggle-lang="toggleLang"
      @visit-community="handleVisitCommunity"
      @back-to-my-community="handleBackToMyCommunity"
      @save-questions="handleSaveQuestions"
      @select-date="handleCalendarSelectDate"
      @complete-today="handleCompleteToday"
    />
    
    <div v-if="showLinkSetup" class="link-setup-overlay">
      <button class="back-btn" @click="showLinkSetup = false">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="link-setup-content">
        <LinkSetupPanel
          :lang="lang"
          :step="linkSetupStep"
          :current-link="currentLink"
          :current-title="currentTitle"
          @close="showLinkSetup = false"
          @submit-link="handleLinkSubmit"
          @submit-title="handleTitleSubmit"
          @submit-author="handleAuthorSubmit"
          @submit-tags="handleTagsSubmit"
        />
      </div>
    </div>
    
    <header class="top-bar">
      <button class="page-btn" @click="cyclePage">
        {{ pageLabels[currentPage] }}
      </button>
      
      <div class="calendar-widget" :class="{ 'slide-left': slideDirection === 'left', 'slide-right': slideDirection === 'right' }" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
        <button class="calendar-day prev" @click="selectDate(-1)">
          <span class="day-month small">{{ monthNames[getAdjacentDate(-1).getMonth()] }}</span>
          <span class="day-num">{{ getAdjacentDate(-1).getDate() }}</span>
        </button>
        <div class="calendar-day current">
          <span class="day-month">{{ currentMonth }}</span>
          <span class="day-num">{{ currentDay }}</span>
        </div>
        <button class="calendar-day next" @click="selectDate(1)">
          <span class="day-month small">{{ monthNames[getAdjacentDate(1).getMonth()] }}</span>
          <span class="day-num">{{ getAdjacentDate(1).getDate() }}</span>
        </button>
      </div>
      
      <button class="settings-btn" @click="openSettings">
        SETTINGS
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
                <code class="help-code">/etfsetup</code>
                <span class="help-desc">{{ lang === 'zh' ? '创建/编辑组合' : 'Create/Edit portfolio' }}</span>
              </div>
              <div class="help-item">
                <code class="help-code">/etf</code>
                <span class="help-desc">{{ lang === 'zh' ? '查看所有组合' : 'View all portfolios' }}</span>
              </div>
              <div class="help-item">
                <code class="help-code">/etf 名称</code>
                <span class="help-desc">{{ lang === 'zh' ? '查询组合' : 'Query portfolio' }}</span>
              </div>
              <div class="help-item">
                <code class="help-code">/link</code>
                <span class="help-desc">{{ lang === 'zh' ? '添加文章链接' : 'Add article link' }}</span>
              </div>
              <div class="help-item">
                <code class="help-code">/help</code>
                <span class="help-desc">{{ lang === 'zh' ? '显示帮助' : 'Show help' }}</span>
              </div>
            </div>
          </div>

          <EtfSetupPanel 
            v-if="showEtfSetup" 
            :lang="lang"
            :editing-etf-name="editingEtfName"
            @close="showEtfSetup = false; editingEtfName = ''"
            @save="handleSaveEtf"
          />

          <EtfListPanel
            v-if="showEtfList"
            :etfs="savedEtfs"
            :lang="lang"
            @close="showEtfList = false"
            @edit="handleEditEtf"
            @delete="handleDeleteEtf"
            @delete-stock="handleDeleteEtfStock"
          />

          <div v-if="currentPage === 'notes'" class="entries-list">
            <template v-for="entry in displayEntries.filter(e => e.type !== 'link')" :key="entry.id">
              <article class="entry" :class="{ 'gm-mode': isGMMode, 'editing': editingEntry?.id === entry.id }">
                <div class="meta">
                  <span>{{ entry.time }} · {{ entry.source }}</span>
                  <button v-if="isGMMode" class="edit-btn" @click="openEditModal(entry)" title="编辑">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
                <div class="text">{{ entry.content }}</div>
              </article>
              <EditEntryModal
                v-if="editingEntry?.id === entry.id"
                :entry="editingEntry"
                :lang="lang"
                @close="closeEditModal"
                @delete="handleDeleteEntry"
                @save="handleSaveEntry"
              />
            </template>
          </div>
          
          <div v-else-if="currentPage === 'read'" class="read-page">
            <div v-if="tagFilter" class="tag-filter-bar">
              <span class="tag-filter-label">{{ lang === 'zh' ? '筛选' : 'Filter' }}</span>
              <span class="tag-filter-tag">{{ tagFilter }}</span>
              <button class="tag-filter-clear" @click="tagFilter = null">×</button>
            </div>
            <div v-if="displayEntries.filter(e => e.type === 'link').length === 0" class="empty-hint">
              {{ lang === 'zh' ? '暂无文章，使用 /link 添加' : 'No articles yet. Use /link to add' }}
            </div>
            <template v-for="entry in displayEntries.filter(e => e.type === 'link')" :key="entry.id">
              <article class="link-entry" :class="{ 'gm-mode': isGMMode, 'editing': editingEntry?.id === entry.id }">
                <div class="meta">
                  <span>{{ entry.time }} · {{ entry.source }}</span>
                  <button v-if="isGMMode" class="edit-btn" @click="openEditModal(entry)" title="编辑">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
                <a :href="entry.link" target="_blank" rel="noopener noreferrer" class="link-title">{{ entry.content }}</a>
              </article>
              <EditEntryModal
                v-if="editingEntry?.id === entry.id"
                :entry="editingEntry"
                :lang="lang"
                @close="closeEditModal"
                @delete="handleDeleteEntry"
                @save="handleSaveEntry"
              />
            </template>
          </div>
        </main>

        <div v-if="!store.isReadOnly" class="input-container" :class="{ 'ai-mode': aiMode }">
          <div class="input-wrapper">
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
        </div>
        
        <div v-else class="readonly-notice">
          {{ lang === 'zh' ? '只读模式 - 点击设置返回你的社区' : 'Read-only mode - Click settings to return to your community' }}
        </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  padding-bottom: 120px;
}

.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 50;
}

.page-btn {
  position: absolute;
  left: 20px;
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

.calendar-widget {
  display: flex;
  align-items: center;
  gap: 2px;
  user-select: none;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-widget.slide-left {
  transform: translateX(-8px);
}

.calendar-widget.slide-right {
  transform: translateX(8px);
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.calendar-day.prev,
.calendar-day.next {
  width: 36px;
  height: 48px;
  opacity: 0.35;
}

.calendar-day.prev:hover,
.calendar-day.next:hover {
  opacity: 0.65;
  transform: scale(1.05);
}

.calendar-day.prev:active,
.calendar-day.next:active {
  transform: scale(0.95);
}

.calendar-day.current {
  width: 44px;
  height: 48px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  cursor: default;
  position: relative;
}

.dark .calendar-day.current {
  background: rgba(255, 255, 255, 0.06);
}

.day-month {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: var(--text-tertiary);
  margin-bottom: 1px;
}

.day-month.small {
  font-size: 8px;
  letter-spacing: 1px;
}

.day-num {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--text-primary);
  line-height: 1;
}

.calendar-day.current .day-num {
  font-size: 11px;
  font-weight: 500;
}

.settings-btn {
  position: absolute;
  right: 20px;
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

.settings-btn:hover {
  color: var(--text-secondary);
}

.link-setup-overlay {
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

.link-setup-overlay .back-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
  z-index: 10;
}

.link-setup-overlay .back-btn:hover {
  color: var(--text-secondary);
}

.link-setup-content {
  max-width: 480px;
  margin: 80px auto 0;
}

.main-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 100px 20px 120px;
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

.entry.editing {
  margin-bottom: 0;
  border-bottom: none;
}

.entry.gm-mode:hover .edit-btn {
  opacity: 1;
}

.meta {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.edit-btn {
  opacity: 0;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  color: var(--text-secondary);
}

.text {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 400;
  line-height: 1.6;
  white-space: pre-wrap;
}

.read-page {
  display: flex;
  flex-direction: column;
}

.tag-filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
}

.tag-filter-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.tag-filter-tag {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #3b82f6;
}

.tag-filter-clear {
  margin-left: auto;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
}

.tag-filter-clear:hover {
  color: var(--text-primary);
}

.empty-hint {
  font-size: 14px;
  color: var(--text-tertiary);
  text-align: center;
  padding: 40px 20px;
}

.link-entry {
  margin-bottom: 32px;
  animation: fadeIn 0.6s ease-out;
}

.link-entry.gm-mode:hover .edit-btn {
  opacity: 1;
}

.link-title {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  display: inline-block;
  transition: color 0.2s ease;
  word-break: break-word;
}

.link-title:hover {
  color: #2196f3;
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

.read-page {
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

.etf-item-wrapper {
  border-bottom: 1px solid var(--border-color);
  line-height: 1;
}

.etf-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  transition: background 0.2s ease;
}

.etf-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.etf-item-right {
  display: flex;
  align-items: center;
  gap: 10px;
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

.etf-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px;
  transition: color 0.2s ease;
}

.etf-action-btn:hover {
  color: var(--text-secondary);
}

.etf-action-btn.delete:hover {
  color: #e53935;
}

.expand-icon {
  font-size: 10px;
  color: var(--text-tertiary);
}

.etf-stocks-list {
  padding: 8px 0 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  margin-bottom: 8px;
  line-height: 1;
}

.etf-stock-row {
  display: grid;
  grid-template-columns: 1fr 60px 24px 24px;
  align-items: center;
  padding: 8px 12px;
  font-size: 13px;
}

.stock-cell {
  text-align: right;
  font-family: var(--font-mono);
  font-size: 13px;
}

.stock-cell.stock-symbol {
  text-align: left;
}

.stock-cell.stock-weight {
  color: var(--text-secondary);
  font-size: 13px;
}

.remove-stock-btn {
  font-size: 13px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-stock-btn:hover {
  color: #e53935;
}

.stock-edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.2s ease;
}

.stock-edit-btn:hover {
  color: var(--text-secondary);
}

.input-container {
  position: fixed;
  bottom: 40px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 16px;
}

.input-wrapper {
  width: 100%;
  max-width: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.readonly-notice {
  position: fixed;
  bottom: 40px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: var(--text-tertiary);
  padding: 12px;
}

.send-btn {
  font-size: 13px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 14px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  color: var(--text-primary);
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
