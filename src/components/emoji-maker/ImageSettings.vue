<template>
  <div class="settings-container">
    <div class="control-item">
      <label>{{ t('editor.size') }}</label>
      <input
        type="range"
        :value="parseInt(element.style.width || '200')"
        min="20"
        max="800"
        @input="handleSizeChange($event)"
      />
      <span class="size-value">{{ element.style.width }}</span>
    </div>
    <div class="control-item">
      <label>{{ t('editor.rotation') }}</label>
      <input
        type="range"
        :value="parseInt(element.style.rotate || '0')"
        min="0"
        max="360"
        @input="handleRotationChange($event)"
      />
      <span class="size-value">{{ element.style.rotate || '0' }}°</span>
    </div>
    <div class="control-item">
      <label>{{ t('editor.opacity') }}</label>
      <input
        type="range"
        :value="Math.round(parseFloat(element.style.opacity || '1') * 100)"
        min="0"
        max="100"
        @input="handleOpacityChange($event)"
      />
      <span class="size-value">{{ Math.round(parseFloat(element.style.opacity || '1') * 100) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/stores/language'
import type { Element } from '@/stores/persistStore'

const { t } = useLanguageStore()

interface Props {
  element: Element
}

interface Emits {
  (e: 'update', property: string, value: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSizeChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const width = Math.min(parseInt(input.value), 800)
  emit('update', 'width', `${width}px`)
}

const handleRotationChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  emit('update', 'rotate', `${input.value}deg`)
}

const handleOpacityChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const opacity = (parseInt(input.value) / 100).toString()
  emit('update', 'opacity', opacity)
}
</script>

<style scoped>
@import '@/styles/commonSettings.css';
</style>
