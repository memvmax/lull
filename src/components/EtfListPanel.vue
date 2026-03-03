<script setup lang="ts">
import { ref, computed } from 'vue'

interface EtfStock {
  symbol: string
  weight: number
}

interface Etf {
  name: string
  stocks: EtfStock[]
}

const props = defineProps<{
  etfs: Etf[]
  lang: 'zh' | 'en'
}>()

const emit = defineEmits<{
  close: []
  edit: [name: string]
  delete: [name: string]
  deleteStock: [etfName: string, symbol: string]
}>()

const expandedEtf = ref<string | null>(null)

function toggleEtf(name: string) {
  expandedEtf.value = expandedEtf.value === name ? null : name
}

function handleEdit(name: string) {
  emit('edit', name)
}

function handleDelete(name: string) {
  if (confirm(props.lang === 'zh' ? `确定删除 ETF "${name}" 吗？` : `Delete ETF "${name}"?`)) {
    emit('delete', name)
  }
}

function handleDeleteStock(etfName: string, symbol: string) {
  emit('deleteStock', etfName, symbol)
}
</script>

<template>
  <div class="etf-list-panel">
    <button class="close-btn" @click="emit('close')">×</button>
    <h3 class="panel-title">{{ lang === 'zh' ? 'ETF 列表' : 'ETF List' }}</h3>
    
    <div v-if="etfs.length === 0" class="empty-hint">
      {{ lang === 'zh' ? '暂无 ETF，使用 /etfsetup 创建' : 'No ETFs yet. Use /etfsetup to create' }}
    </div>
    
    <div class="etf-items">
      <div 
        v-for="etf in etfs" 
        :key="etf.name" 
        class="etf-item"
        :class="{ expanded: expandedEtf === etf.name }"
      >
        <div class="etf-header" @click="toggleEtf(etf.name)">
          <span class="etf-name">{{ etf.name }}</span>
          <div class="etf-actions">
            <span class="etf-count">{{ etf.stocks.length }} {{ lang === 'zh' ? '只' : 'stocks' }}</span>
            <button class="edit-btn" @click.stop="handleEdit(etf.name)" :title="lang === 'zh' ? '编辑' : 'Edit'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="delete-btn" @click.stop="handleDelete(etf.name)" :title="lang === 'zh' ? '删除' : 'Delete'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
            <span class="expand-icon">{{ expandedEtf === etf.name ? '▼' : '▶' }}</span>
          </div>
        </div>
        
        <div v-if="expandedEtf === etf.name" class="etf-stocks">
          <div v-for="stock in etf.stocks" :key="stock.symbol" class="stock-row">
            <span class="stock-symbol">{{ stock.symbol }}</span>
            <span class="stock-weight">{{ stock.weight }}%</span>
            <button class="remove-stock-btn" @click="handleDeleteStock(etf.name, stock.symbol)" :title="lang === 'zh' ? '移除' : 'Remove'">
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.etf-list-panel {
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

.dark .etf-list-panel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.close-btn {
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

.close-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.2);
}

.panel-title {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.empty-hint {
  font-size: 13px;
  color: var(--text-tertiary);
  text-align: center;
  padding: 20px;
}

.etf-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.etf-item {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.etf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.etf-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.etf-name {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.etf-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.etf-count {
  font-size: 12px;
  color: var(--text-tertiary);
}

.edit-btn,
.delete-btn {
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.edit-btn:hover {
  color: #2196f3;
}

.delete-btn:hover {
  color: #e53935;
}

.expand-icon {
  font-size: 10px;
  color: var(--text-tertiary);
}

.etf-stocks {
  padding: 8px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.03);
}

.dark .etf-stocks {
  background: rgba(255, 255, 255, 0.03);
}

.stock-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stock-row:last-child {
  border-bottom: none;
}

.stock-symbol {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
}

.stock-weight {
  font-size: 12px;
  color: var(--text-secondary);
  margin-right: 12px;
}

.remove-stock-btn {
  font-size: 16px;
  color: var(--text-tertiary);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.2s ease;
}

.remove-stock-btn:hover {
  color: #e53935;
}
</style>
