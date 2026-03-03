<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  lang: 'zh' | 'en'
  editingEtfName?: string
}>()

const emit = defineEmits<{
  close: []
  save: [data: { name: string; symbol: string; weight: number }]
}>()

const etfName = ref('')
const symbol = ref('')
const weight = ref(100)

watch(() => props.editingEtfName, (name) => {
  if (name) {
    etfName.value = name
  }
}, { immediate: true })

const isValid = computed(() => {
  return etfName.value.trim() && symbol.value.trim() && weight.value > 0 && weight.value <= 100
})

function handleSave() {
  if (isValid.value) {
    emit('save', {
      name: etfName.value.trim().toLowerCase(),
      symbol: symbol.value.trim().toUpperCase(),
      weight: weight.value
    })
    symbol.value = ''
    weight.value = 100
  }
}
</script>

<template>
  <div class="etf-setup-panel">
    <button class="close-btn" @click="emit('close')">×</button>
    <h3 class="panel-title">{{ lang === 'zh' ? '添加 ETF 成分' : 'Add ETF Component' }}</h3>
    
    <div class="form-field">
      <label>{{ lang === 'zh' ? 'ETF 名称' : 'ETF Name' }}</label>
      <input 
        v-model="etfName" 
        type="text" 
        :placeholder="lang === 'zh' ? '例如: tech' : 'e.g. tech'"
      />
    </div>
    
    <div class="form-field">
      <label>{{ lang === 'zh' ? '股票代码' : 'Symbol' }}</label>
      <input 
        v-model="symbol" 
        type="text" 
        :placeholder="lang === 'zh' ? '例如: AAPL' : 'e.g. AAPL'"
      />
    </div>
    
    <div class="form-field">
      <label>{{ lang === 'zh' ? '占比 (%)' : 'Weight (%)' }}</label>
      <input 
        v-model.number="weight" 
        type="number" 
        min="1" 
        max="100"
        placeholder="100"
      />
    </div>
    
    <button class="save-btn" @click="handleSave" :disabled="!isValid">
      {{ lang === 'zh' ? '保存' : 'Save' }}
    </button>
  </div>
</template>

<style scoped>
.etf-setup-panel {
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

.dark .etf-setup-panel {
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

.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-field input {
  width: 100%;
  font-size: 14px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
}

.dark .form-field input {
  background: rgba(255, 255, 255, 0.05);
}

.form-field input:focus {
  border-color: var(--text-secondary);
}

.form-field input::placeholder {
  color: var(--text-tertiary);
}

.save-btn {
  width: 100%;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #fff;
  background: #2196f3;
  border: none;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.save-btn:hover:not(:disabled) {
  background: #1976d2;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
