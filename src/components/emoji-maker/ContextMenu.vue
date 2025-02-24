<template>
  <div
    v-if="visible"
    class="context-menu"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
    }"
    @click.stop
  >
    <div class="context-menu-item" @click="handleAction('moveToTop')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 4l-8 8h6v8h4v-8h6l-8-8z"/>
      </svg>
      {{ t('app.moveToTop') }}
    </div>
    <div class="context-menu-item" @click="handleAction('duplicate')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      {{ t('app.duplicate') }}
    </div>
    <div class="context-menu-item" @click="handleAction('moveToBottom')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/>
      </svg>
      {{ t('app.moveToBottom') }}
    </div>
    <div class="context-menu-item" @click="handleAction('moveToCenter')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 3v3m0 12v3m-9-9h3m12 0h3"/>
      </svg>
      {{ t('app.moveToCenter') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/stores/language'

const { t } = useLanguageStore()

interface Position {
  x: number
  y: number
}

interface Props {
  visible: boolean
  position: Position
}

interface Emits {
  (e: 'action', action: string): void
  (e: 'update:visible', visible: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleAction = (action: string) => {
  emit('action', action)
  emit('update:visible', false)
}
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 160px;
  z-index: 1000;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
  color: #333;
  font-size: 14px;
}

.context-menu-item:hover {
  background-color: #f5f5f5;
}

.context-menu-item svg {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}
</style>
