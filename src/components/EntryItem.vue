<script setup lang="ts">
import type { Entry } from '@/types'
import { formatDate } from '@/utils/format'

const props = defineProps<{
  entry: Entry
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

function handleDelete() {
  emit('delete', props.entry.id)
}
</script>

<template>
  <article class="entry">
    <div class="entry-meta">
      <time class="entry-time">{{ formatDate(entry.createdAt) }}</time>
      <span class="entry-divider">·</span>
      <span class="entry-source">{{ entry.source }}</span>
    </div>
    <p class="entry-content">{{ entry.content }}</p>
    <button class="entry-delete" @click="handleDelete" title="删除">×</button>
  </article>
</template>

<style scoped>
.entry {
  position: relative;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-color);
}

.entry:hover .entry-delete {
  opacity: 1;
}

.entry-meta {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
  line-height: var(--line-height-meta);
}

.entry-divider {
  margin: 0 0.5em;
}

.entry-source {
  font-style: italic;
}

.entry-content {
  font-size: 17px;
  line-height: var(--line-height-body);
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.entry-delete {
  position: absolute;
  top: var(--spacing-sm);
  right: 0;
  font-size: 20px;
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 4px 8px;
}

.entry-delete:hover {
  color: var(--text-secondary);
}
</style>
