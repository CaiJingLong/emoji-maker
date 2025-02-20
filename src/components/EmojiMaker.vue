<template>
  <div class="emoji-maker">
    <div class="canvas-area">
      <div class="canvas-container" ref="canvasContainer" @dragover.prevent>
        <div
          v-for="(element, index) in elements"
          :key="index"
          class="draggable-element"
          :style="{
            left: element.style.left,
            top: element.style.top,
            position: element.style.position,
            transform: element.style.transform,
            fontSize: element.style.fontSize,
            color: element.style.color
          }"
          @mousedown="startDrag($event, index)"
          @dblclick="editText(index)"
        >
          <template v-if="element.type === 'text'">
            <div
              class="text-element"
              :contenteditable="element.isEditing"
              @blur="finishTextEdit(index)"
              @keydown.enter.prevent="finishTextEdit(index)"
              v-text="element.content"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
  }
  isEditing?: boolean
}

const fileInput = ref<HTMLInputElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)
const elements = ref<Element[]>([])
const draggedElement = ref<{ index: number; startX: number; startY: number } | null>(null)

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
              transform: 'translate(-50%, -50%)'
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
      color: '#000000'
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

onMounted(() => {
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
})
</script>

<style scoped>
.emoji-maker {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px); /* 减去header的高度 */
  background-color: #f5f5f5;
}

.canvas-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 0; /* 防止flex子元素溢出 */
  background-color: white;
}

.canvas-container {
  width: min(800px, 80vw);
  aspect-ratio: 1;
  background-color: white;
  border: 2px dashed #ccc;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.tools-panel {
  flex-shrink: 0;
  background-color: white;
  padding: 20px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.tools-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
  justify-content: center;
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
}

.tools-container button:hover {
  background-color: #45a049;
}

.draggable-element {
  position: absolute;
  cursor: move;
  user-select: none;
}

.draggable-element img {
  max-width: 300px;
  max-height: 300px;
  pointer-events: none;
}

.text-element {
  padding: 5px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.text-element[contenteditable="true"] {
  border-color: #4CAF50;
  outline: none;
  cursor: text;
}
</style>
