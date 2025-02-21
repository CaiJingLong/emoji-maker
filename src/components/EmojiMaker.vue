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
          @click.stop="selectElement(index)"
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
          <template v-for="(guideline, index) in guidelines" :key="index">
            <div
              class="guideline"
              :class="guideline.type"
              :style="{
                [guideline.type === 'vertical' ? 'left' : 'top']: `${guideline.position}px`,
                borderColor: guideline.color
              }"
            ></div>
          </template>
          <div
            v-for="(element, index) in elements"
            :key="index"
            v-show="element.isVisible !== false"
            class="draggable-element"
            :class="{
              'selected': selectedIndex === index,
              'show-boundary': isDragging
            }"
            :style="{
              left: element.style.left,
              top: element.style.top,
              position: element.style.position,
              transform: element.style.transform,
              fontSize: element.style.fontSize,
              color: element.style.color,
              width: element.style.width,
              height: element.style.height,
              rotate: element.style.rotate,
              '--element-color': ELEMENT_COLORS[element.id % ELEMENT_COLORS.length]
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
              <img :src="element.content" :alt="t('editor.image') + (index + 1)">
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
              <label>{{ t('editor.borderStyle') }}</label>
              <select @change="updateBorderStyle($event)" :value="selectedElement.style.borderStyle || 'none'" class="border-style-select">
                <option value="none">{{ t('editor.borderStyles.none') }}</option>
                <option value="chat-bubble-green">{{ t('editor.borderStyles.chatBubbleGreen') }}</option>
                <option value="chat-bubble-blue">{{ t('editor.borderStyles.chatBubbleBlue') }}</option>
                <option value="chat-bubble-gray">{{ t('editor.borderStyles.chatBubbleGray') }}</option>
                <option value="chat-bubble-green-right">{{ t('editor.borderStyles.chatBubbleGreenRight') }}</option>
                <option value="chat-bubble-blue-right">{{ t('editor.borderStyles.chatBubbleBlueRight') }}</option>
                <option value="chat-bubble-gray-right">{{ t('editor.borderStyles.chatBubbleGrayRight') }}</option>
                <option value="chat-bubble-outline">{{ t('editor.borderStyles.chatBubbleOutline') }}</option>
                <option value="chat-bubble-outline-right">{{ t('editor.borderStyles.chatBubbleOutlineRight') }}</option>
                <option value="rounded">{{ t('editor.borderStyles.rounded') }}</option>
                <option value="square">{{ t('editor.borderStyles.square') }}</option>
                <option value="shadow">{{ t('editor.borderStyles.shadow') }}</option>
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

    <ExportDialog
      v-if="showExportDialog"
      :container="canvasContainer"
      @close="showExportDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import html2canvas from 'html2canvas'
import { useLanguageStore } from '../stores/language'
import ExportDialog from './ExportDialog.vue'

const { t } = useLanguageStore()

interface Element {
  type: 'image' | 'text'
  content: string
  id: number
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

// 对齐辅助线接口
interface GuidelineInfo {
  position: number
  type: 'horizontal' | 'vertical'
  color: string
  source: 'container' | number
}

// 添加吸附状态接口
interface SnapInfo {
  isSnapped: boolean
  position: number
  type: 'horizontal' | 'vertical'
}

const STORAGE_KEY = 'emoji-maker-elements'
const SNAP_THRESHOLD = 10 // 吸附阈值（像素）

const fileInput = ref<HTMLInputElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)
const elements = ref<Element[]>([])
const draggedElement = ref<{ index: number; startX: number; startY: number } | null>(null)
const selectedIndex = ref<number | null>(null)
const selectedElement = computed(() =>
  selectedIndex.value !== null ? elements.value[selectedIndex.value] : null
)
const showExportDialog = ref(false)
const isDragging = ref(false)

// 历史记录相关的状态
const MAX_HISTORY = 50 // 最大历史记录数
const history = ref<Element[][]>([]) // 历史记录栈
const currentHistoryIndex = ref(-1) // 当前历史记录索引
const isHistoryAction = ref(false) // 是否是历史记录操作（用于防止历史记录操作触发 watch）
const lastSavedState = ref<string>('') // 用于比较状态是否真的改变

const guidelines = ref<GuidelineInfo[]>([])
const snapState = ref<SnapInfo[]>([])

// 添加颜色常量
const CONTAINER_GUIDELINE_COLOR = '#FF6B6B' // 容器辅助线颜色
const ELEMENT_COLORS = [
  '#4ECDC4', // 青色
  '#45B7D1', // 蓝色
  '#96CEB4', // 绿色
  '#FFEEAD', // 黄色
  '#D4A5A5', // 粉色
  '#9B59B6', // 紫色
  '#3498DB', // 深蓝色
  '#2ECC71', // 深绿色
  '#F1C40F', // 金色
  '#E74C3C'  // 红色
]

// 计算元素的边界框
const getElementBounds = (element: Element, index: number): DOMRect | null => {
  const el = document.querySelector(`.draggable-element:nth-child(${index + 1})`) as HTMLElement
  const container = canvasContainer.value
  if (!el || !container) return null

  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const computedStyle = window.getComputedStyle(el)
  const borderWidth = parseInt(computedStyle.borderWidth) || 0

  // 计算相对于容器的位置，修正边框宽度的补偿方向
  return new DOMRect(
    elRect.left - containerRect.left - borderWidth,
    elRect.top - containerRect.top - borderWidth,
    elRect.width,
    elRect.height
  )
}

// 检查并生成对齐辅助线
const checkAlignment = (currentIndex: number) => {
  if (!draggedElement.value) return []

  guidelines.value = []
  snapState.value = []
  const currentElement = elements.value[currentIndex]
  const currentBounds = getElementBounds(currentElement, currentIndex)
  const container = canvasContainer.value
  if (!currentBounds || !container) return []

  const containerWidth = container.offsetWidth
  const containerHeight = container.offsetHeight
  const containerCenterX = containerWidth / 2
  const containerCenterY = containerHeight / 2

  // 检查与容器中心的对齐
  const elementCenterX = currentBounds.left + currentBounds.width / 2
  const elementCenterY = currentBounds.top + currentBounds.height / 2

  // 检查水平中心对齐
  if (Math.abs(elementCenterX - containerCenterX) < SNAP_THRESHOLD) {
    guidelines.value.push({
      position: containerCenterX,
      type: 'vertical',
      color: CONTAINER_GUIDELINE_COLOR,
      source: 'container'
    })
    snapState.value.push({
      isSnapped: true,
      position: containerCenterX - currentBounds.width / 2,
      type: 'vertical'
    })
  }

  // 检查垂直中心对齐
  if (Math.abs(elementCenterY - containerCenterY) < SNAP_THRESHOLD) {
    guidelines.value.push({
      position: containerCenterY,
      type: 'horizontal',
      color: CONTAINER_GUIDELINE_COLOR,
      source: 'container'
    })
    snapState.value.push({
      isSnapped: true,
      position: containerCenterY - currentBounds.height / 2,
      type: 'horizontal'
    })
  }

  elements.value.forEach((element, index) => {
    if (index === currentIndex || element.isVisible === false) return

    const bounds = getElementBounds(element, index)
    if (!bounds) return

    const elementColor = ELEMENT_COLORS[element.id % ELEMENT_COLORS.length]

    // 检查垂直对齐
    const verticalAlignments = [
      { current: currentBounds.left, target: bounds.left }, // 左对齐
      { current: currentBounds.right, target: bounds.right }, // 右对齐
      { current: currentBounds.left + currentBounds.width / 2, target: bounds.left + bounds.width / 2 }, // 中心对齐
      { current: currentBounds.right, target: bounds.left }, // 右边缘对左边缘
      { current: currentBounds.left, target: bounds.right }, // 左边缘对右边缘
      { current: currentBounds.left, target: bounds.right + SNAP_THRESHOLD }, // 水平等间距
      { current: currentBounds.right, target: bounds.left - SNAP_THRESHOLD }  // 水平等间距
    ]

    verticalAlignments.forEach(({current, target}) => {
      if (Math.abs(current - target) < SNAP_THRESHOLD) {
        guidelines.value.push({
          position: target,
          type: 'vertical',
          color: elementColor,
          source: element.id
        })
        snapState.value.push({
          isSnapped: true,
          position: target - (current - parseInt(currentElement.style.left)),
          type: 'vertical'
        })
      }
    })

    // 检查水平对齐
    const horizontalAlignments = [
      { current: currentBounds.top, target: bounds.top }, // 顶部对齐
      { current: currentBounds.bottom, target: bounds.bottom }, // 底部对齐
      { current: currentBounds.top + currentBounds.height / 2, target: bounds.top + bounds.height / 2 }, // 中心对齐
      { current: currentBounds.bottom, target: bounds.top }, // 底边缘对顶边缘
      { current: currentBounds.top, target: bounds.bottom }, // 顶边缘对底边缘
      { current: currentBounds.top, target: bounds.bottom + SNAP_THRESHOLD }, // 垂直等间距
      { current: currentBounds.bottom, target: bounds.top - SNAP_THRESHOLD }  // 垂直等间距
    ]

    horizontalAlignments.forEach(({current, target}) => {
      if (Math.abs(current - target) < SNAP_THRESHOLD) {
        guidelines.value.push({
          position: target,
          type: 'horizontal',
          color: elementColor,
          source: element.id
        })
        snapState.value.push({
          isSnapped: true,
          position: target - (current - parseInt(currentElement.style.top)),
          type: 'horizontal'
        })
      }
    })
  })

  return snapState.value
}

// 添加历史记录
const addHistory = () => {
  if (isHistoryAction.value || isDragging.value) return

  const currentState = JSON.stringify(elements.value)
  if (currentState === lastSavedState.value) return // 如果状态没有真正改变，不添加历史记录

  // 如果当前不在最新状态，删除当前位置之后的历史记录
  if (currentHistoryIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, currentHistoryIndex.value + 1)
  }

  // 添加新的历史记录
  history.value.push(JSON.parse(JSON.stringify(elements.value)))
  currentHistoryIndex.value = history.value.length - 1
  lastSavedState.value = currentState

  // 如果历史记录超过最大数量，删除最早的记录
  if (history.value.length > MAX_HISTORY) {
    history.value.shift()
    currentHistoryIndex.value--
  }
}

// 撤销
const undo = () => {
  if (currentHistoryIndex.value > 0) {
    isHistoryAction.value = true
    currentHistoryIndex.value--
    elements.value = JSON.parse(JSON.stringify(history.value[currentHistoryIndex.value]))
    lastSavedState.value = JSON.stringify(elements.value)
    isHistoryAction.value = false
  }
}

// 重做
const redo = () => {
  if (currentHistoryIndex.value < history.value.length - 1) {
    isHistoryAction.value = true
    currentHistoryIndex.value++
    elements.value = JSON.parse(JSON.stringify(history.value[currentHistoryIndex.value]))
    lastSavedState.value = JSON.stringify(elements.value)
    isHistoryAction.value = false
  }
}

// 监听 elements 变化并保存到 localStorage
watch(elements, (newElements) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newElements))
}, { deep: true })

// 监听 elements 变化，自动添加历史记录
watch(elements, () => {
  if (!isHistoryAction.value) {
    addHistory()
  }
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
          const newId = elements.value.length > 0
            ? Math.max(...elements.value.map(el => el.id)) + 1
            : 0
          elements.value.push({
            type: 'image',
            content: e.target.result as string,
            id: newId,
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
  const newId = elements.value.length > 0
    ? Math.max(...elements.value.map(el => el.id)) + 1
    : 0
  elements.value.push({
    type: 'text',
    content: t('editor.textPlaceholder'),
    id: newId,
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

    isDragging.value = true
    const rect = (mouseEvent.target as HTMLElement).getBoundingClientRect()
    draggedElement.value = {
      index,
      startX: mouseEvent.clientX - rect.left,
      startY: mouseEvent.clientY - rect.top
    }
  }
}

const onDrag = (event: MouseEvent) => {
  if (!draggedElement.value || !isDragging.value) return

  const containerRect = canvasContainer.value?.getBoundingClientRect()
  if (!containerRect) return

  const index = draggedElement.value.index
  const element = elements.value[index]

  // 计算鼠标相对于容器的位置
  const mouseX = event.clientX - containerRect.left
  const mouseY = event.clientY - containerRect.top

  // 计算元素的目标位置（考虑鼠标在元素内的偏移）
  const targetX = mouseX - draggedElement.value.startX
  const targetY = mouseY - draggedElement.value.startY

  // 先临时更新元素位置以获取准确的边界框
  const prevLeft = element.style.left
  const prevTop = element.style.top
  element.style.left = `${targetX}px`
  element.style.top = `${targetY}px`

  // 检查对齐和吸附
  const snaps = checkAlignment(index) || []

  // 恢复原位置
  element.style.left = prevLeft
  element.style.top = prevTop

  // 计算最终位置（考虑吸附效果）
  let finalX = targetX
  let finalY = targetY

  // 处理垂直方向的吸附
  const verticalSnap = snaps.find(s => s.type === 'vertical')
  if (verticalSnap?.isSnapped) {
    const snapX = verticalSnap.position
    const diff = Math.abs(targetX - snapX)
    if (diff <= SNAP_THRESHOLD) {
      finalX = snapX
    } else if (diff <= SNAP_THRESHOLD * 2) {
      const t = Math.pow((diff - SNAP_THRESHOLD) / SNAP_THRESHOLD, 2)
      finalX = snapX + (targetX - snapX) * t
    }
  }

  // 处理水平方向的吸附
  const horizontalSnap = snaps.find(s => s.type === 'horizontal')
  if (horizontalSnap?.isSnapped) {
    const snapY = horizontalSnap.position
    const diff = Math.abs(targetY - snapY)
    if (diff <= SNAP_THRESHOLD) {
      finalY = snapY
    } else if (diff <= SNAP_THRESHOLD * 2) {
      const t = Math.pow((diff - SNAP_THRESHOLD) / SNAP_THRESHOLD, 2)
      finalY = snapY + (targetY - snapY) * t
    }
  }

  // 一次性应用最终位置
  element.style.left = `${finalX}px`
  element.style.top = `${finalY}px`
  element.style.transform = 'none'
}

const stopDrag = () => {
  if (isDragging.value) {
    isDragging.value = false
    guidelines.value = []
    addHistory()
  }
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
    // 获取编辑后的文本内容
    const textElement = document.querySelector(`.draggable-element:nth-child(${index + 1}) .text-element`) as HTMLElement
    if (textElement) {
      element.content = textElement.innerText || t('editor.textPlaceholder')
    }
  }
}

const exportImage = () => {
  showExportDialog.value = true
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
  // 检查是否有正在编辑的文字元素
  const hasEditingText = elements.value.some(element => element.type === 'text' && element.isEditing)

  // 如果正在编辑文字，不处理快捷键
  if (hasEditingText) return

  // 处理删除键
  if (selectedIndex.value !== null && (event.key === 'Delete' || event.key === 'Backspace')) {
    deleteElement(selectedIndex.value)
  }

  // 处理撤销快捷键 (Ctrl+Z / Command+Z)
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
    event.preventDefault()
    undo()
  }

  // 处理重做快捷键 (Ctrl+Y / Command+Y 或 Ctrl+Shift+Z / Command+Shift+Z)
  if ((event.ctrlKey || event.metaKey) &&
      ((event.key.toLowerCase() === 'y' && !event.shiftKey) ||
       (event.key.toLowerCase() === 'z' && event.shiftKey))) {
    event.preventDefault()
    redo()
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
  if (elements.value.length > 0) {
    const initialState = JSON.stringify(elements.value)
    history.value = [JSON.parse(initialState)]
    currentHistoryIndex.value = 0
    lastSavedState.value = initialState
  }
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
  background-color: transparent;
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

/* 修改辅助线样式 */
.guideline {
  position: absolute;
  pointer-events: none;
  z-index: 1000;
}

.guideline.horizontal {
  width: 100%;
  height: 0;
  border-top: 1px dashed; /* 改为虚线 */
  left: 0;
}

.guideline.vertical {
  width: 0;
  height: 100%;
  border-left: 1px dashed; /* 改为虚线 */
  top: 0;
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
  box-sizing: border-box;
  border: 2px solid transparent;
  transform-origin: center center;
  transition: border-color 0.2s;
}

.draggable-element.show-boundary {
  border-color: var(--element-color);
}

.draggable-element.selected {
  border-color: var(--element-color);
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
