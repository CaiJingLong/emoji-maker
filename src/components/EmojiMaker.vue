<template>
  <div class="emoji-maker">
    <div class="canvas-area">
      <div class="canvas-container" ref="canvasContainer" @dragover.prevent>
        <div
          v-for="(element, index) in elements"
          :key="index"
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
        <button @click="handleImageUpload">上传图片</button>
        <button @click="addText">添加文字</button>
        <button @click="exportImage">导出表情</button>
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

    <div class="control-panel" v-if="selectedIndex !== null">
      <div class="panel-header">
        <span>{{ selectedElement.type === 'text' ? '文字设置' : '图片设置' }}</span>
        <button class="delete-btn" @click="deleteElement(selectedIndex)">删除</button>
      </div>
      <div class="panel-content">
        <template v-if="selectedElement.type === 'text'">
          <div class="control-item">
            <label>字号</label>
            <input
              type="range"
              :value="parseInt(selectedElement.style.fontSize)"
              min="12"
              max="72"
              @input="updateTextSize($event)"
            >
            <span class="size-value">{{ selectedElement.style.fontSize }}</span>
          </div>
          <div class="control-item">
            <label>颜色</label>
            <input
              type="color"
              :value="selectedElement.style.color"
              @input="updateTextColor($event)"
              class="color-picker"
            >
          </div>
          <div class="control-item">
            <label>旋转</label>
            <input
              type="range"
              :value="parseInt(selectedElement.style.rotate)"
              min="0"
              max="360"
              @input="updateRotation($event)"
            >
            <span class="size-value">{{ selectedElement.style.rotate }}</span>
          </div>
        </template>
        <template v-else>
          <div class="control-item">
            <label>大小</label>
            <input
              type="range"
              :value="parseInt(selectedElement.style.width)"
              min="50"
              max="500"
              @input="updateImageSize($event)"
            >
            <span class="size-value">{{ selectedElement.style.width }}</span>
          </div>
          <div class="control-item">
            <label>旋转</label>
            <input
              type="range"
              :value="parseInt(selectedElement.style.rotate)"
              min="0"
              max="360"
              @input="updateRotation($event)"
            >
            <span class="size-value">{{ selectedElement.style.rotate }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import html2canvas from 'html2canvas'

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
  }
  isEditing?: boolean
}

const fileInput = ref<HTMLInputElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)
const elements = ref<Element[]>([])
const draggedElement = ref<{ index: number; startX: number; startY: number } | null>(null)
const selectedIndex = ref<number | null>(null)
const selectedElement = computed(() =>
  selectedIndex.value !== null ? elements.value[selectedIndex.value] : null
)

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
      rotate: '0deg'
    },
    isEditing: false
  })
}

const startDrag = (event: MouseEvent, index: number) => {
  const element = elements.value[index]
  if (element.isEditing) return

  const rect = (event.target as HTMLElement).getBoundingClientRect()
  draggedElement.value = {
    index,
    startX: event.clientX - rect.left,
    startY: event.clientY - rect.top
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

onMounted(() => {
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.emoji-maker {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
  position: relative;
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
  width: 100%;
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
</style>
