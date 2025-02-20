<template>
  <div class="emoji-maker">
    <div class="layers-panel">
      <h3>{{ t('app.layers') }}</h3>
      <ul class="layer-list">
        <li
          v-for="(element, index) in elements"
          :key="index"
          :data-index="index"
          class="layer-item"
          :class="{
            'selected': selectedIndex === index,
            'hidden': element.isVisible === false
          }"
          @click="selectElement(index)"
          draggable="true"
          @dragstart="startDrag"
          @dragover.prevent
          @drop="dropElement($event, index)"
          @dragend="stopDrag"
        >
          <div class="layer-item-content">
            <span class="layer-item-icon">
              <template v-if="element.type === 'text'">
                <span class="text-icon">T</span>
              </template>
              <template v-else>
                <span class="image-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </span>
              </template>
            </span>
            <span class="layer-item-text">
              {{ element.type === 'text' ? (element.content || t('editor.textPlaceholder')) : t('editor.image') }}
            </span>
          </div>
          <span
            class="layer-item-visibility"
            @click="toggleVisibility(index, $event)"
          >
            <svg v-if="element.isVisible !== false" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </span>
        </li>
      </ul>
    </div>

    <div class="main-content">
      <div class="canvas-area">
        <div class="canvas-container" ref="canvasContainer" @dragover.prevent>
          <div
            v-for="(element, index) in elements"
            :key="index"
            v-show="element.isVisible !== false"
            class="draggable-element"
            :class="{ 'selected': selectedIndex === index }"
            :style="{
              left: element.style.left,
              top: element.style.top,
              position: element.style.position,
              transform: element.style.transform,
              fontSize: element.style.fontSize,
              color: element.style.color,
              width: element.style.width,
              height: element.style.height,
              rotate: element.style.rotate
            }"
            @mousedown="startDrag($event, index)"
            @click.stop="selectElement(index)"
            @dblclick="editText(index)"
          >
            <template v-if="element.type === 'text'">
              <div
                class="text-element"
                :class="element.style.borderStyle"
                :contenteditable="element.isEditing"
                @blur="finishTextEdit(index)"
                @keydown.enter.prevent="finishTextEdit(index)"
                v-text="element.content"
                :style="{
                  fontSize: element.style.fontSize,
                  color: element.style.color
                }"
              ></div>
            </template>
            <template v-else>
              <img :src="element.content" :alt="'图片' + index">
            </template>
          </div>
        </div>
      </div>

      <div class="tools-panel">
        <div class="tools-container">
          <button @click="handleImageUpload">{{ t('app.upload') }}</button>
          <button @click="addText">{{ t('app.addText') }}</button>
          <button @click="exportImage">{{ t('app.download') }}</button>
          <input
            type="file"
            ref="fileInput"
            @change="onFileSelected"
            accept="image/*"
            style="display: none"
            multiple
          >
        </div>
      </div>

      <div class="control-panel" v-if="selectedElement">
        <div class="panel-header">
          <span>{{ selectedElement.type === 'text' ? t('editor.textSettings') : t('editor.imageSettings') }}</span>
          <button class="delete-btn" @click="deleteElement(selectedIndex!)">{{ t('editor.delete') }}</button>
        </div>
        <div class="panel-content">
          <template v-if="selectedElement.type === 'text'">
            <div class="control-item">
              <label>{{ t('editor.fontSize') }}</label>
              <input
                type="range"
                :value="parseInt(selectedElement.style.fontSize || '24')"
                min="12"
                max="72"
                @input="updateTextSize($event)"
              >
              <span class="size-value">{{ selectedElement.style.fontSize }}</span>
            </div>
            <div class="control-item">
              <label>{{ t('editor.fontColor') }}</label>
              <input
                type="color"
                :value="selectedElement.style.color || '#000000'"
                @input="updateTextColor($event)"
                class="color-picker"
              >
            </div>
            <div class="control-item">
              <label>边框样式</label>
              <select @change="updateBorderStyle($event)" :value="selectedElement.style.borderStyle || 'none'" class="border-style-select">
                <option value="none">无边框</option>
                <option value="chat-bubble-green">绿色聊天气泡</option>
                <option value="chat-bubble-blue">蓝色聊天气泡</option>
                <option value="chat-bubble-gray">灰色聊天气泡</option>
                <option value="chat-bubble-green-right">绿色聊天气泡(右)</option>
                <option value="chat-bubble-blue-right">蓝色聊天气泡(右)</option>
                <option value="chat-bubble-gray-right">灰色聊天气泡(右)</option>
                <option value="chat-bubble-outline">透明聊天气泡(左)</option>
                <option value="chat-bubble-outline-right">透明聊天气泡(右)</option>
                <option value="rounded">圆角边框</option>
                <option value="square">方形边框</option>
                <option value="shadow">阴影边框</option>
              </select>
            </div>
            <div class="control-item">
              <label>{{ t('editor.rotation') }}</label>
              <input
                type="range"
                :value="parseInt(selectedElement.style.rotate || '0')"
                min="0"
                max="360"
                @input="updateRotation($event)"
              >
              <span class="size-value">{{ selectedElement.style.rotate || '0' }}°</span>
            </div>
          </template>
          <template v-else>
            <div class="control-item">
              <label>{{ t('editor.size') }}</label>
              <input
                type="range"
                :value="parseInt(selectedElement.style.width || '200')"
                min="50"
                max="500"
                @input="updateImageSize($event)"
              >
              <span class="size-value">{{ selectedElement.style.width }}</span>
            </div>
            <div class="control-item">
              <label>{{ t('editor.rotation') }}</label>
              <input
                type="range"
                :value="parseInt(selectedElement.style.rotate || '0')"
                min="0"
                max="360"
                @input="updateRotation($event)"
              >
              <span class="size-value">{{ selectedElement.style.rotate || '0' }}°</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import html2canvas from 'html2canvas'
import { useLanguageStore } from '../stores/language'

const { t } = useLanguageStore()

interface Element {
  type: 'image' | 'text'
  content: string
  style: {
    left: string
    top: string
    position: 'absolute'
    transform?: string
    fontSize?: string
    color?: string
    width?: string
    height?: string
    rotate?: string
    borderStyle?: string
  }
  isEditing?: boolean
  isVisible?: boolean
}

const STORAGE_KEY = 'emoji-maker-elements'

const fileInput = ref<HTMLInputElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)
const elements = ref<Element[]>([])
const draggedElement = ref<{ index: number; startX: number; startY: number } | null>(null)
const selectedIndex = ref<number | null>(null)
const selectedElement = computed(() =>
  selectedIndex.value !== null ? elements.value[selectedIndex.value] : null
)

// 监听 elements 变化并保存到 localStorage
watch(elements, (newElements) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newElements))
}, { deep: true })

// 从 localStorage 恢复数据
const restoreData = () => {
  const savedData = localStorage.getItem(STORAGE_KEY)
  if (savedData) {
    try {
      elements.value = JSON.parse(savedData)
    } catch (error) {
      console.error('恢复数据失败:', error)
    }
  }
}

const handleImageUpload = () => {
  fileInput.value?.click()
}

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    Array.from(input.files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          elements.value.push({
            type: 'image',
            content: e.target.result as string,
            style: {
              left: '50%',
              top: '50%',
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: 'auto',
              rotate: '0deg'
            }
          })
        }
      }
      reader.readAsDataURL(file)
    })
  }
}

const addText = () => {
  elements.value.push({
    type: 'text',
    content: '双击编辑文字',
    style: {
      left: '50%',
      top: '50%',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      fontSize: '24px',
      color: '#000000',
      rotate: '0deg',
      borderStyle: 'none'
    },
    isEditing: false
  })
}

const startDrag = (event: MouseEvent | DragEvent, index?: number) => {
  if (index === undefined) {
    // 处理图层面板的拖拽
    const dragEvent = event as DragEvent
    const target = dragEvent.target as HTMLElement
    const dragIndex = parseInt(target.getAttribute('data-index') || '0')
    const element = elements.value[dragIndex]
    if (element.isEditing) return

    const data = {
      index: dragIndex
    }
    dragEvent.dataTransfer?.setData('text', JSON.stringify(data))
    target.classList.add('dragging')
  } else {
    // 处理画布中的拖拽
    const mouseEvent = event as MouseEvent
    const element = elements.value[index]
    if (element.isEditing) return

    const rect = (mouseEvent.target as HTMLElement).getBoundingClientRect()
    draggedElement.value = {
      index,
      startX: mouseEvent.clientX - rect.left,
      startY: mouseEvent.clientY - rect.top
    }
  }
}

const onDrag = (event: MouseEvent) => {
  if (!draggedElement.value) return

  const containerRect = canvasContainer.value?.getBoundingClientRect()
  if (!containerRect) return

  const index = draggedElement.value.index
  const element = elements.value[index]

  const x = event.clientX - containerRect.left - draggedElement.value.startX
  const y = event.clientY - containerRect.top - draggedElement.value.startY

  element.style.left = `${x}px`
  element.style.top = `${y}px`
  element.style.transform = 'none'
}

const stopDrag = () => {
  draggedElement.value = null
}

const editText = (index: number) => {
  const element = elements.value[index]
  if (element.type === 'text') {
    element.isEditing = true
  }
}

const finishTextEdit = (index: number) => {
  const element = elements.value[index]
  if (element.type === 'text') {
    element.isEditing = false
  }
}

const exportImage = async () => {
  if (!canvasContainer.value) return

  try {
    const canvas = await html2canvas(canvasContainer.value, {
      backgroundColor: 'white'
    })

    const link = document.createElement('a')
    link.download = 'emoji.png'
    link.href = canvas.toDataURL()
    link.click()
  } catch (error) {
    console.error('导出失败:', error)
  }
}

const updateTextSize = (event: Event) => {
  if (selectedIndex.value === null) return
  const input = event.target as HTMLInputElement
  const size = input.value
  elements.value[selectedIndex.value].style.fontSize = `${size}px`
}

const updateImageSize = (event: Event) => {
  if (selectedIndex.value === null) return
  const input = event.target as HTMLInputElement
  const width = input.value
  elements.value[selectedIndex.value].style.width = `${width}px`
  elements.value[selectedIndex.value].style.height = 'auto'
}

const updateRotation = (event: Event) => {
  if (selectedIndex.value === null) return
  const input = event.target as HTMLInputElement
  const angle = input.value
  elements.value[selectedIndex.value].style.rotate = `${angle}deg`
}

const deleteElement = (index: number) => {
  elements.value.splice(index, 1)
  selectedIndex.value = null
}

const selectElement = (index: number) => {
  selectedIndex.value = index
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.draggable-element') && !target.closest('.control-panel')) {
    selectedIndex.value = null
  }
}

const updateTextColor = (event: Event) => {
  if (selectedIndex.value === null) return
  const input = event.target as HTMLInputElement
  elements.value[selectedIndex.value].style.color = input.value
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (selectedIndex.value !== null && (event.key === 'Delete' || event.key === 'Backspace')) {
    deleteElement(selectedIndex.value)
  }
}

const updateBorderStyle = (event: Event) => {
  if (selectedIndex.value === null) return
  const select = event.target as HTMLSelectElement
  elements.value[selectedIndex.value].style.borderStyle = select.value
}

const dropElement = (event: DragEvent, index: number) => {
  event.preventDefault()
  const data = event.dataTransfer?.getData('text')
  if (data) {
    const draggedData = JSON.parse(data)
    const draggedIndex = draggedData.index
    const elementToMove = elements.value[draggedIndex]

    elements.value.splice(draggedIndex, 1)
    elements.value.splice(index, 0, elementToMove)

    selectedIndex.value = index
  }
}

const toggleVisibility = (index: number, event: Event) => {
  event.stopPropagation()
  const element = elements.value[index]
  element.isVisible = element.isVisible === undefined ? false : !element.isVisible
}

onMounted(() => {
  restoreData()
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.emoji-maker {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
  position: relative;
}

.layers-panel {
  width: 250px;
  background: white;
  padding: 15px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.layers-panel h3 {
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  color: #333;
}

.layer-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.layer-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 4px;
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: move;
  user-select: none;
  transition: all 0.2s;
}

.layer-item.selected {
  background: #e8f5e9;
  border-color: #4CAF50;
}

.layer-item:hover {
  background: #f0f0f0;
}

.layer-item.dragging {
  opacity: 0.5;
}

.layer-item.hidden {
  opacity: 0.5;
}

.layer-item-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.layer-item-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.layer-item-text {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-item-visibility {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  margin-right: 8px;
}

.layer-item-visibility:hover {
  color: #333;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.canvas-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: white;
  margin: 0;
  min-height: 0;
  overflow: auto;
}

.canvas-container {
  width: min(800px, 90vmin);
  height: min(800px, 90vmin);
  background-color: white;
  border: 2px dashed #ccc;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

@media (max-height: 1000px) {
  .canvas-container {
    width: min(800px, calc(100vh - 180px));
    height: min(800px, calc(100vh - 180px));
  }
}

.control-panel {
  position: fixed;
  right: 40px;
  top: 80px;
  width: 250px;
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.panel-header span {
  font-weight: bold;
  color: #333;
}

.panel-header .delete-btn {
  background: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.panel-header .delete-btn:hover {
  background: #ff0000;
}

.control-item {
  margin-bottom: 15px;
}

.control-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.control-item input[type="range"] {
  width: 100%;
  margin-bottom: 5px;
}

.size-value {
  display: block;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.draggable-element {
  position: absolute;
  cursor: move;
  user-select: none;
  border: 2px solid transparent;
  transform-origin: center center;
}

.draggable-element.selected {
  border-color: #4CAF50;
}

.draggable-element img {
  width: 100%;
  height: 100%;
  pointer-events: none;
  object-fit: contain;
  transform-origin: center center;
}

.text-element {
  padding: 5px;
  border: 1px solid transparent;
  white-space: nowrap;
  display: inline-block;
}

.text-element[contenteditable="true"] {
  border-color: #4CAF50;
  outline: none;
  cursor: text;
  min-width: 50px;
}

.tools-panel {
  flex-shrink: 0;
  background-color: white;
  padding: 15px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  margin: 0;
  width: 100%;
}

.tools-container {
  width: min(800px, 90vmin);
  margin: 0 auto;
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 0 20px;
}

.tools-container button {
  flex: 1;
  max-width: 200px;
  padding: 12px 20px;
  margin: 0;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  white-space: nowrap;
}

.tools-container button:hover {
  background-color: #45a049;
}

.control-item .color-picker {
  width: 100%;
  height: 40px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.border-style-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.text-element.chat-bubble-green {
  background: #e8f5e9;
  border-radius: 20px;
  padding: 10px 15px;
  position: relative;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-element.chat-bubble-green::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: #e8f5e9 transparent transparent;
}

.text-element.chat-bubble-blue {
  background: #e3f2fd;
  border-radius: 20px;
  padding: 10px 15px;
  position: relative;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-element.chat-bubble-blue::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: #e3f2fd transparent transparent;
}

.text-element.chat-bubble-gray {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 10px 15px;
  position: relative;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-element.chat-bubble-gray::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: #f5f5f5 transparent transparent;
}

.text-element.chat-bubble-green-right {
  background: #e8f5e9;
  border-radius: 20px;
  padding: 10px 15px;
  position: relative;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-element.chat-bubble-green-right::before {
  content: '';
  position: absolute;
  bottom: -10px;
  right: 20px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: #e8f5e9 transparent transparent;
}

.text-element.chat-bubble-blue-right {
  background: #e3f2fd;
  border-radius: 20px;
  padding: 10px 15px;
  position: relative;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-element.chat-bubble-blue-right::before {
  content: '';
  position: absolute;
  bottom: -10px;
  right: 20px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: #e3f2fd transparent transparent;
}

.text-element.chat-bubble-gray-right {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 10px 15px;
  position: relative;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-element.chat-bubble-gray-right::before {
  content: '';
  position: absolute;
  bottom: -10px;
  right: 20px;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: #f5f5f5 transparent transparent;
}

.text-element.chat-bubble-outline {
  background: transparent;
  border-radius: 20px;
  padding: 10px 15px;
  position: relative;
  border: 2px solid #4CAF50;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-element.chat-bubble-outline::before,
.text-element.chat-bubble-outline::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 20px;
}

.text-element.chat-bubble-outline::before {
  border-width: 12px 12px 0;
  border-style: solid;
  border-color: #4CAF50 transparent transparent;
  bottom: -12px;
}

.text-element.chat-bubble-outline::after {
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: white transparent transparent;
  bottom: -9px;
}

.text-element.chat-bubble-outline-right {
  background: transparent;
  border-radius: 20px;
  padding: 10px 15px;
  position: relative;
  border: 2px solid #4CAF50;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-element.chat-bubble-outline-right::before,
.text-element.chat-bubble-outline-right::after {
  content: '';
  position: absolute;
  bottom: -10px;
  right: 20px;
}

.text-element.chat-bubble-outline-right::before {
  border-width: 12px 12px 0;
  border-style: solid;
  border-color: #4CAF50 transparent transparent;
  bottom: -12px;
}

.text-element.chat-bubble-outline-right::after {
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: white transparent transparent;
  bottom: -9px;
}

.text-element.rounded {
  border: 2px solid #4CAF50;
  border-radius: 10px;
  padding: 8px 15px;
}

.text-element.square {
  border: 2px solid #4CAF50;
  padding: 8px 15px;
}

.text-element.shadow {
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  padding: 8px 15px;
  border-radius: 4px;
}

.text-icon {
  font-weight: bold;
  font-size: 16px;
}

.image-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-icon svg {
  width: 16px;
  height: 16px;
}
</style>
