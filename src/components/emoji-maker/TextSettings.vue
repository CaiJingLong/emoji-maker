<template>
  <div class="settings-container">
    <div class="control-item">
      <label>{{ t('editor.fontSize') }}</label>
      <input
        type="range"
        :value="parseInt(element.style.fontSize || '24')"
        min="12"
        max="72"
        @input="handleFontSizeChange"
      />
      <span class="size-value">{{ element.style.fontSize }}</span>
    </div>
    <div class="control-item">
      <label>{{ t('editor.fontColor') }}</label>
      <ColorPicker :value="element.style.color" @update:modelValue="(value) => emit('update', 'color', value)" />
    </div>
    <div class="control-item">
      <label>{{ t('editor.backgroundColor') }}</label>
      <ColorPicker :value="element.style.backgroundColor" @update:modelValue="(value) => emit('update', 'backgroundColor', value)" />
    </div>
    <div class="control-item">
      <label>{{ t('editor.paddingHorizontal') }}</label>
      <input
        type="range"
        :value="parseInt(element.style.paddingLeft || '5')"
        min="0"
        max="50"
        @input="handlePaddingHorizontalChange"
      />
      <span class="size-value">{{ element.style.paddingLeft || '5px' }}</span>
    </div>
    <div class="control-item">
      <label>{{ t('editor.paddingVertical') }}</label>
      <input
        type="range"
        :value="parseInt(element.style.paddingTop || '5')"
        min="0"
        max="50"
        @input="handlePaddingVerticalChange"
      />
      <span class="size-value">{{ element.style.paddingTop || '5px' }}</span>
    </div>
    <div class="control-item">
      <label>{{ t('editor.borderStyle') }}</label>
      <select
        @change="handleBorderStyleChange"
        :value="element.style.borderStyle || 'none'"
        class="border-style-select"
      >
        <option value="none">{{ t('editor.borderStyles.none') }}</option>
        <option value="chat-bubble-green">{{ t('editor.borderStyles.chatBubbleGreen') }}</option>
        <option value="chat-bubble-blue">{{ t('editor.borderStyles.chatBubbleBlue') }}</option>
        <option value="chat-bubble-gray">{{ t('editor.borderStyles.chatBubbleGray') }}</option>
        <option value="chat-bubble-green-right">
          {{ t('editor.borderStyles.chatBubbleGreenRight') }}
        </option>
        <option value="chat-bubble-blue-right">
          {{ t('editor.borderStyles.chatBubbleBlueRight') }}
        </option>
        <option value="chat-bubble-gray-right">
          {{ t('editor.borderStyles.chatBubbleGrayRight') }}
        </option>
        <option value="chat-bubble-outline">
          {{ t('editor.borderStyles.chatBubbleOutline') }}
        </option>
        <option value="chat-bubble-outline-right">
          {{ t('editor.borderStyles.chatBubbleOutlineRight') }}
        </option>
        <option value="rounded">{{ t('editor.borderStyles.rounded') }}</option>
        <option value="square">{{ t('editor.borderStyles.square') }}</option>
        <option value="shadow">{{ t('editor.borderStyles.shadow') }}</option>
      </select>
    </div>
    <div class="control-item">
      <label>{{ t('editor.rotation') }}</label>
      <input
        type="range"
        :value="parseInt(element.style.rotate || '0')"
        min="0"
        max="360"
        @input="handleRotationChange"
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
        @input="handleOpacityChange"
      />
      <span class="size-value"
        >{{ Math.round(parseFloat(element.style.opacity || '1') * 100) }}%</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/stores/language'
import ColorPicker from '../ColorPicker.vue'
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

const handleFontSizeChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  emit('update', 'fontSize', `${input.value}px`)
}

const handlePaddingHorizontalChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = `${input.value}px`
  emit('update', 'paddingLeft', value)
  emit('update', 'paddingRight', value)
}

const handlePaddingVerticalChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const value = `${input.value}px`
  emit('update', 'paddingTop', value)
  emit('update', 'paddingBottom', value)
}

const handleBorderStyleChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  emit('update', 'borderStyle', select.value)
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
