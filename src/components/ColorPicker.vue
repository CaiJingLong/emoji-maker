<template>
  <div class="color-picker-container">
    <div
      class="color-preview"
      :style="{ backgroundColor: modelValue }"
      @click="openColorPicker"
    ></div>
    <input
      type="range"
      v-model="alpha"
      min="0"
      max="100"
      class="alpha-slider"
    />
    <span class="alpha-value">{{ alpha }}%</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const alpha = ref(100)

// 初始化时从当前颜色中提取透明度
watch(() => props.modelValue, (newColor) => {
  if (!newColor) {
    alpha.value = 100
    return
  }
  if (newColor.startsWith('rgba')) {
    const match = newColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
    if (match) {
      alpha.value = Math.round(parseFloat(match[4]) * 100)
    }
  }
}, { immediate: true })

const openColorPicker = () => {
  const input = document.createElement('input')
  input.type = 'color'
  input.value = getRGBColor(props.modelValue)
  
  input.addEventListener('input', (e) => {
    const newAlpha = alpha.value / 100
    const newColor = addAlphaToColor((e.target as HTMLInputElement).value, newAlpha)
    emit('update:modelValue', newColor)
  })
  
  input.click()
}

const getRGBColor = (color: string | undefined | null): string => {
  if (!color) return '#000000'
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) {
      const r = parseInt(match[1])
      const g = parseInt(match[2])
      const b = parseInt(match[3])
      return rgbToHex(r, g, b)
    }
  }
  return color
}

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

const addAlphaToColor = (color: string, alpha: number): string => {
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Watch alpha changes
watch(alpha, (newValue) => {
  const currentColor = getRGBColor(props.modelValue)
  const newColor = addAlphaToColor(currentColor, newValue / 100)
  emit('update:modelValue', newColor)
})
</script>

<style scoped>
.color-picker-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 6px;
  transition: all 0.3s ease;
  width: 100%;
}

.color-picker-container:hover {
  background-color: #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.color-preview {
  width: 34px;
  height: 34px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
  transition: all 0.3s ease;
  position: relative;
}

.color-preview::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 4px;
  box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  transition: box-shadow 0.3s ease;
}

.color-preview:hover {
  transform: scale(1.1);
}

.color-preview:hover::after {
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
}

.alpha-slider {
  flex: 1;
  min-width: 80px;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, transparent, #666);
  border-radius: 3px;
  outline: none;
  transition: height 0.2s ease;
}

.alpha-slider:hover {
  height: 8px;
}

.alpha-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #4caf50;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.alpha-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.alpha-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #4caf50;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.alpha-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.alpha-value {
  min-width: 48px;
  text-align: right;
  color: #666;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  transition: color 0.3s ease;
  flex-shrink: 0;
}

.color-picker-container:hover .alpha-value {
  color: #333;
}
</style> 