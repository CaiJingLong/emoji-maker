<template>
  <div class="emoji-maker" @dragenter.prevent="handleDragEnter" @dragleave.prevent="handleDragLeave" @dragover.prevent @drop.prevent="handleExternalDrop">
    <!-- 添加遮罩层 -->
    <div v-if="isDraggingOver" class="drag-overlay">
      <div class="drag-hint">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span>{{ t('app.dropHint') }}</span>
      </div>
    </div>
    <div class="side-panel">
      <div class="accordion-item">
        <div class="accordion-header" @click="toggleLayers">
          <h3>{{ t('app.layers') }}</h3>
          <span class="accordion-icon" :class="{ 'is-expanded': isLayersExpanded }">▼</span>
        </div>
        <div class="accordion-content" :class="{ 'is-expanded': isLayersExpanded }">
          <ul class="layer-list"
            @dragover.prevent.stop
            @drop.prevent.stop
            @dragenter.prevent.stop
            @dragleave.prevent.stop
          >
            <li
              v-for="(element, index) in elements"
              :key="index"
              :data-index="index"
              class="layer-item"
              :class="{
                selected: selectedIndex === index,
                hidden: element.isVisible === false,
              }"
              @click.stop="selectElement(index)"
              @contextmenu.prevent.stop="showContextMenu($event, index)"
              draggable="true"
              @dragstart.stop="startDrag($event, undefined)"
              @dragend.stop="stopLayerDrag"
              @drop.stop="dropElement($event, index)"
            >
              <div class="layer-item-content">
                <span class="layer-item-icon">
                  <template v-if="element.type === 'text'">
                    <span class="text-icon">T</span>
                  </template>
                  <template v-else>
                    <span class="image-icon">
                      <img
                        :src="element.content"
                        class="thumbnail"
                        alt="thumbnail"
                      />
                    </span>
                  </template>
                </span>
                <span class="layer-item-text">
                  {{
                    element.type === 'text'
                      ? element.content || t('editor.textPlaceholder')
                      : t('editor.image') + ' ' + getImageNumber(index)
                  }}
                </span>
              </div>
              <span class="layer-item-visibility" @click="toggleVisibility(index, $event)">
                <svg
                  v-if="element.isVisible !== false"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  ></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div class="accordion-item">
        <div class="accordion-header" @click="toggleEditAssist">
          <h3>{{ t('app.editAssist') }}</h3>
          <span class="accordion-icon" :class="{ 'is-expanded': isEditAssistExpanded }">▼</span>
        </div>
        <div class="accordion-content" :class="{ 'is-expanded': isEditAssistExpanded }">
          <div class="assist-settings">
            <div class="setting-item" @click="assistStore.toggleGuidelines">
              <span class="setting-checkbox" :class="{ active: assistStore.showGuidelines }"></span>
              <span class="setting-label">{{
                assistStore.showGuidelines ? t('app.hideGuidelines') : t('app.showGuidelines')
              }}</span>
            </div>
            <div class="setting-item" @click="assistStore.toggleSnapping">
              <span
                class="setting-checkbox"
                :class="{
                  active: assistStore.enableSnapping,
                }"
              ></span>
              <span class="setting-label">{{
                assistStore.enableSnapping ? t('app.disableSnapping') : t('app.enableSnapping')
              }}</span>
            </div>
            <div class="setting-item" @click="assistStore.toggleOtherBoundaries">
              <span
                class="setting-checkbox"
                :class="{
                  active: assistStore.showOtherBoundaries,
                }"
              ></span>
              <span class="setting-label">{{
                assistStore.showOtherBoundaries ? t('app.hideOtherBoundaries') : t('app.showOtherBoundaries')
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="canvas-area">
        <div class="canvas-container" ref="canvasContainer" @dragover.prevent="handleDragOver" @drop.prevent="handleExternalDrop">
          <template v-for="(guideline, index) in assistStore.guidelines" :key="index">
            <div
              class="guideline"
              :class="guideline.type"
              :style="{
                [guideline.type === 'vertical' ? 'left' : 'top']: `${guideline.position}px`,
                borderColor: guideline.color,
              }"
            ></div>
          </template>
          <div
            v-for="(element, index) in elements"
            :key="index"
            v-show="element.isVisible !== false"
            class="draggable-element"
            :class="{
              selected: selectedIndex === index,
              'show-boundary': isDragging && (selectedIndex === index || assistStore.showOtherBoundaries),
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
              opacity: element.style.opacity || '1',
              '--element-color': ELEMENT_COLORS[element.id % ELEMENT_COLORS.length],
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
                  color: element.style.color,
                  backgroundColor: element.style.backgroundColor,
                  padding: element.style.padding,
                }"
              ></div>
            </template>
            <template v-else>
              <img :src="element.content" :alt="t('editor.image') + (index + 1)" />
            </template>
          </div>
        </div>
      </div>

      <div class="tools-panel">
        <div class="tools-container">
          <div class="tools-group">
            <button @click="handleImageUpload">{{ t('app.upload') }}</button>
            <button @click="addText">{{ t('app.addText') }}</button>
            <button class="clear-btn" @click="showConfirmDialog = true">{{ t('app.clear') }}</button>
            <input
              type="file"
              ref="fileInput"
              @change="onFileSelected"
              accept="image/*"
              style="display: none"
              multiple
            />
          </div>
          <div class="tools-group">
            <button @click="exportImage">{{ t('app.download') }}</button>
          </div>
        </div>
      </div>

      <div class="control-panel" v-if="selectedElement">
        <div class="panel-header">
          <span>{{
            selectedElement.type === 'text' ? t('editor.textSettings') : t('editor.imageSettings')
          }}</span>
          <button class="delete-btn" @click="deleteElement(selectedIndex!)">
            {{ t('editor.delete') }}
          </button>
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
              />
              <span class="size-value">{{ selectedElement.style.fontSize }}</span>
            </div>
            <div class="control-item">
              <label>{{ t('editor.fontColor') }}</label>
              <ColorPicker v-model="selectedElement.style.color" />
            </div>
            <div class="control-item">
              <label>{{ t('editor.backgroundColor') }}</label>
              <ColorPicker v-model="selectedElement.style.backgroundColor" />
            </div>
            <div class="control-item">
              <label>{{ t('editor.padding') }}</label>
              <input
                type="range"
                :value="parseInt(selectedElement.style.padding || '5')"
                min="0"
                max="50"
                @input="updatePadding($event)"
              />
              <span class="size-value">{{ selectedElement.style.padding || '5px' }}</span>
            </div>
            <div class="control-item">
              <label>{{ t('editor.borderStyle') }}</label>
              <select
                @change="updateBorderStyle($event)"
                :value="selectedElement.style.borderStyle || 'none'"
                class="border-style-select"
              >
                <option value="none">{{ t('editor.borderStyles.none') }}</option>
                <option value="chat-bubble-green">
                  {{ t('editor.borderStyles.chatBubbleGreen') }}
                </option>
                <option value="chat-bubble-blue">
                  {{ t('editor.borderStyles.chatBubbleBlue') }}
                </option>
                <option value="chat-bubble-gray">
                  {{ t('editor.borderStyles.chatBubbleGray') }}
                </option>
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
                :value="parseInt(selectedElement.style.rotate || '0')"
                min="0"
                max="360"
                @input="updateRotation($event)"
              />
              <span class="size-value">{{ selectedElement.style.rotate || '0' }}°</span>
            </div>
            <div class="control-item">
              <label>{{ t('editor.opacity') }}</label>
              <input
                type="range"
                :value="Math.round(parseFloat(selectedElement.style.opacity || '1') * 100)"
                min="0"
                max="100"
                @input="updateOpacity($event)"
              />
              <span class="size-value">{{ Math.round(parseFloat(selectedElement.style.opacity || '1') * 100) }}%</span>
            </div>
          </template>
          <template v-else>
            <div class="control-item">
              <label>{{ t('editor.size') }}</label>
              <input
                type="range"
                :value="parseInt(selectedElement.style.width || '200')"
                min="20"
                max="800"
                @input="updateImageSize($event)"
              />
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
              />
              <span class="size-value">{{ selectedElement.style.rotate || '0' }}°</span>
            </div>
            <div class="control-item">
              <label>{{ t('editor.opacity') }}</label>
              <input
                type="range"
                :value="Math.round(parseFloat(selectedElement.style.opacity || '1') * 100)"
                min="0"
                max="100"
                @input="updateOpacity($event)"
              />
              <span class="size-value">{{ Math.round(parseFloat(selectedElement.style.opacity || '1') * 100) }}%</span>
            </div>
          </template>
        </div>
      </div>

      <!-- 添加右键菜单 -->
      <div
        v-if="contextMenuVisible"
        class="context-menu"
        :style="{
          left: contextMenuPosition.x + 'px',
          top: contextMenuPosition.y + 'px',
        }"
        @click.stop
      >
        <div class="context-menu-item" @click="moveToTop">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 4l-8 8h6v8h4v-8h6l-8-8z"/>
          </svg>
          {{ t('app.moveToTop') }}
        </div>
        <div class="context-menu-item" @click="duplicateElement">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {{ t('app.duplicate') }}
        </div>
        <div class="context-menu-item" @click="moveToBottom">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/>
          </svg>
          {{ t('app.moveToBottom') }}
        </div>
        <div class="context-menu-item" @click="moveToCenter">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 3v3m0 12v3m-9-9h3m12 0h3"/>
          </svg>
          {{ t('app.moveToCenter') }}
        </div>
      </div>
    </div>
  </div>

  <!-- 将对话框移到最外层 -->
  <Teleport to="body">
    <ExportDialog
      v-if="showExportDialog"
      :container="canvasContainer"
      @close="showExportDialog = false"
    />

    <ConfirmDialog
      v-if="showConfirmDialog"
      :title="t('editor.clearConfirmTitle')"
      :message="t('editor.clearConfirmMessage')"
      :confirm-text="t('editor.clearConfirm')"
      @close="showConfirmDialog = false"
      @confirm="clearAllElements"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useLanguageStore } from '../stores/language'
import { useAssistStore } from '../stores/assistStore'
import { usePersistStore, type Element } from '../stores/persistStore'
import ExportDialog from './ExportDialog.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import ColorPicker from './ColorPicker.vue'
import { useKeyboardStore } from '../stores/keyboardStore'

const { t } = useLanguageStore()
const assistStore = useAssistStore()
const persistStore = usePersistStore()
const keyboardStore = useKeyboardStore()

// 添加颜色常量
const ELEMENT_COLORS = [
  '#00FF00', // 鲜绿色
  '#0000FF', // 纯蓝色
  '#FF00FF', // 洋红色
  '#00FFFF', // 青色
  '#FFA500', // 橙色
  '#9400D3', // 深紫色
  '#FFD700', // 金色
  '#32CD32', // 酸橙绿
  '#FF69B4', // 粉红色
  '#4169E1', // 皇家蓝
]

const fileInput = ref<HTMLInputElement | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)
const elements = ref<Element[]>([])
const draggedElement = ref<{ index: number; startX: number; startY: number } | null>(null)
const selectedIndex = ref<number | null>(null)
const selectedElement = computed(() =>
  selectedIndex.value !== null ? elements.value[selectedIndex.value] : null,
)
const showExportDialog = ref(false)
const isDragging = ref(false)

// 添加手风琴状态控制
const isLayersExpanded = ref(true)
const isEditAssistExpanded = ref(true)

const toggleLayers = () => {
  isLayersExpanded.value = !isLayersExpanded.value
}

const toggleEditAssist = () => {
  isEditAssistExpanded.value = !isEditAssistExpanded.value
}

// 监听 elements 变化并保存到 localStorage
watch(
  elements,
  (newElements) => {
    persistStore.saveElements(newElements)
    if (!isDragging.value) {
      persistStore.addHistory(newElements)
    }
  },
  { deep: true },
)

// 从 localStorage 恢复数据
const restoreData = () => {
  elements.value = persistStore.loadElements()
}

const handleImageUpload = () => {
  fileInput.value?.click()
}

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          const newId =
            elements.value.length > 0 ? Math.max(...elements.value.map((el) => el.id)) + 1 : 0
          const containerWidth = canvasContainer.value?.offsetWidth || 400
          const containerHeight = canvasContainer.value?.offsetHeight || 400
          const element: Element = {
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
              rotate: '0deg',
            },
            initialCenter: {
              x: Math.round(containerWidth / 2),
              y: Math.round(containerHeight / 2),
            },
          }
          elements.value.push(element)
        }
      }
      reader.readAsDataURL(file)
    })
  }
}

const addElementToCanvas = (element: Partial<Element>) => {
  const newId = elements.value.length > 0 ? Math.max(...elements.value.map((el) => el.id)) + 1 : 0
  const containerWidth = canvasContainer.value?.offsetWidth || 400
  const containerHeight = canvasContainer.value?.offsetHeight || 400
  const newElement = initializeElementStyle({
    ...element,
    id: newId,
    initialCenter: {
      x: Math.round(containerWidth / 2),
      y: Math.round(containerHeight / 2),
    },
  })
  elements.value.push(newElement)
  selectedIndex.value = elements.value.length - 1
}

const addText = () => {
  addElementToCanvas({
    type: 'text',
    content: t('editor.textPlaceholder'),
    style: {
      left: '50%',
      top: '50%',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      fontSize: '24px',
      color: '#000000',
      rotate: '0deg',
      borderStyle: 'none',
    },
    isEditing: false,
  })
}

const isDraggingOver = ref(false)
const isInternalDrag = ref(false)  // 添加内部拖拽标记

// 处理拖入事件
const handleDragEnter = (event: DragEvent) => {
  // 如果是内部拖拽，不显示拖入遮罩
  if (isInternalDrag.value) return
  // 如果有对话框打开，不显示拖入遮罩
  if (showExportDialog.value || showConfirmDialog.value) return
  event.preventDefault()
  isDraggingOver.value = true
  if (canvasContainer.value) {
    canvasContainer.value.classList.add('drag-active')
  }
}

// 处理拖离事件
const handleDragLeave = (event: DragEvent) => {
  if (isInternalDrag.value) return
  event.preventDefault()
  // 检查是否真的离开了容器
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY

  if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
    isDraggingOver.value = false
    if (canvasContainer.value) {
      canvasContainer.value.classList.remove('drag-active')
    }
  }
}

const startDrag = (event: MouseEvent | DragEvent, index?: number) => {
  if (index === undefined) {
    // 处理图层面板的拖拽
    const dragEvent = event as DragEvent
    const target = dragEvent.target as HTMLElement
    const dragIndex = parseInt(target.getAttribute('data-index') || '0')
    const element = elements.value[dragIndex]
    if (element.isEditing) return

    isInternalDrag.value = true  // 设置内部拖拽标记
    const data = {
      index: dragIndex,
      isInternal: true,  // 添加内部拖拽标识
      isLayerSort: true  // 添加图层排序标识
    }
    dragEvent.dataTransfer?.setData('text', JSON.stringify(data))
    target.classList.add('dragging')
  } else {
    // 处理画布中的拖拽
    const mouseEvent = event as MouseEvent
    const element = elements.value[index]
    if (element.isEditing) return

    isDragging.value = true
    // 获取外层的 draggable-element
    const draggableElement = document.querySelector(`.draggable-element:nth-child(${index + 1})`) as HTMLElement
    if (!draggableElement) return

    const rect = draggableElement.getBoundingClientRect()
    draggedElement.value = {
      index,
      startX: mouseEvent.clientX - rect.left,
      startY: mouseEvent.clientY - rect.top,
    }
  }
}

const onDrag = (event: MouseEvent) => {
  if (!draggedElement.value || !isDragging.value) return

  const containerRect = canvasContainer.value?.getBoundingClientRect()
  if (!containerRect) return

  const index = draggedElement.value.index
  const element = elements.value[index]

  // 如果没有初始中心点，计算并记录
  if (!element.initialCenter) {
    const elementNode = document.querySelector(
      `.draggable-element:nth-child(${index + 1})`
    ) as HTMLElement
    if (elementNode) {
      const rect = elementNode.getBoundingClientRect()
      element.initialCenter = {
        x: Math.round(rect.left - containerRect.left + rect.width / 2),
        y: Math.round(rect.top - containerRect.top + rect.height / 2),
      }
    }
  }

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
  const verticalSnap = snaps.find((s) => s.type === 'vertical')
  if (verticalSnap?.isSnapped) {
    const snapX = verticalSnap.position
    const diff = Math.abs(targetX - snapX)
    if (diff <= assistStore.SNAP_THRESHOLD) {
      finalX = snapX
    } else if (diff <= assistStore.SNAP_THRESHOLD * 2) {
      const t = Math.pow((diff - assistStore.SNAP_THRESHOLD) / assistStore.SNAP_THRESHOLD, 2)
      finalX = snapX + (targetX - snapX) * t
    }
  }

  // 处理水平方向的吸附
  const horizontalSnap = snaps.find((s) => s.type === 'horizontal')
  if (horizontalSnap?.isSnapped) {
    const snapY = horizontalSnap.position
    const diff = Math.abs(targetY - snapY)
    if (diff <= assistStore.SNAP_THRESHOLD) {
      finalY = snapY
    } else if (diff <= assistStore.SNAP_THRESHOLD * 2) {
      const t = Math.pow((diff - assistStore.SNAP_THRESHOLD) / assistStore.SNAP_THRESHOLD, 2)
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
    assistStore.clearGuidelines()

    // 更新被拖拽元素的中心点
    if (draggedElement.value !== null) {
      const index = draggedElement.value.index
      const element = elements.value[index]
      const containerRect = canvasContainer.value?.getBoundingClientRect()
      const elementNode = document.querySelector(
        `.draggable-element:nth-child(${index + 1})`
      ) as HTMLElement

      if (containerRect && elementNode) {
        const rect = elementNode.getBoundingClientRect()
        element.initialCenter = {
          x: Math.round(rect.left - containerRect.left + rect.width / 2),
          y: Math.round(rect.top - containerRect.top + rect.height / 2)
        }
      }
    }

    persistStore.addHistory(elements.value)
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
    const textElement = document.querySelector(
      `.draggable-element:nth-child(${index + 1}) .text-element`,
    ) as HTMLElement
    if (textElement) {
      element.content = textElement.innerText || t('editor.textPlaceholder')
    }
  }
}

const exportImage = () => {
  isDraggingOver.value = false
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
  const width = Math.min(parseInt(input.value), 800) // 限制最大宽度为800px
  const element = elements.value[selectedIndex.value]

  // 如果元素没有记录初始中心点，则计算并记录
  if (!element.initialCenter) {
    const currentWidth = parseInt(element.style.width || '200')
    const currentHeight = parseInt(element.style.height || '200')
    const currentLeft = parseInt(element.style.left || '0')
    const currentTop = parseInt(element.style.top || '0')

    element.initialCenter = {
      x: Math.round(currentLeft + currentWidth / 2),
      y: Math.round(currentTop + currentHeight / 2),
    }
  }

  // 获取图片元素以计算宽高比
  const elementNode = document.querySelector(
    `.draggable-element:nth-child(${selectedIndex.value + 1})`,
  ) as HTMLElement
  if (!elementNode) return
  const imgElement = elementNode.querySelector('img') as HTMLImageElement
  if (!imgElement) return
  const aspectRatio = imgElement.naturalHeight / imgElement.naturalWidth

  // 计算新的高度（使用 Math.round 确保整数）
  const newHeight = Math.round(width * aspectRatio)

  // 使用初始中心点计算新的位置
  const newLeft = Math.round(element.initialCenter.x - width / 2)
  const newTop = Math.round(element.initialCenter.y - newHeight / 2)

  // 一次性应用所有样式
  element.style.width = `${width}px`
  element.style.height = `${newHeight}px`
  element.style.left = `${newLeft}px`
  element.style.top = `${newTop}px`
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

const updateBackgroundColor = (event: Event) => {
  if (selectedIndex.value === null) return
  const input = event.target as HTMLInputElement
  elements.value[selectedIndex.value].style.backgroundColor = input.value
}

const updatePadding = (event: Event) => {
  if (selectedIndex.value === null) return
  const input = event.target as HTMLInputElement
  elements.value[selectedIndex.value].style.padding = `${input.value}px`
}

const updateBorderStyle = (event: Event) => {
  if (selectedIndex.value === null) return
  const select = event.target as HTMLSelectElement
  elements.value[selectedIndex.value].style.borderStyle = select.value
}

const handleKeyDown = async (event: KeyboardEvent) => {
  const result = await keyboardStore.handleKeyDown(event, {
    selectedElement: selectedElement.value,
    deleteElement,
    selectedIndex: selectedIndex.value,
    addElementToCanvas
  })
  
  if (result?.type === 'history') {
    elements.value = result.elements
  }
}

const updateOpacity = (event: Event) => {
  if (selectedIndex.value === null) return
  const input = event.target as HTMLInputElement
  const opacity = (parseFloat(input.value) / 100).toString()
  elements.value[selectedIndex.value].style.opacity = opacity
}

const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuIndex = ref<number | null>(null)

const showContextMenu = (event: MouseEvent, index: number) => {
  event.preventDefault()
  event.stopPropagation()

  // 先隐藏当前菜单（如果有的话）
  contextMenuVisible.value = false

  // 设置新的位置和索引
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }
  contextMenuIndex.value = index
  selectedIndex.value = index

  // 在下一个事件循环中显示菜单
  setTimeout(() => {
    contextMenuVisible.value = true
  }, 0)
}

const hideContextMenu = (event?: MouseEvent) => {
  // 如果点击的是菜单项，不要隐藏菜单
  if (event?.target instanceof Element && event.target.closest('.context-menu')) {
    return
  }
  contextMenuVisible.value = false
  contextMenuIndex.value = null
}

const moveToTop = () => {
  if (contextMenuIndex.value === null) return
  const element = elements.value[contextMenuIndex.value]
  elements.value.splice(contextMenuIndex.value, 1)
  elements.value.push(element)
  selectedIndex.value = elements.value.length - 1
  hideContextMenu()
}

const moveToBottom = () => {
  if (contextMenuIndex.value === null) return
  const element = elements.value[contextMenuIndex.value]
  elements.value.splice(contextMenuIndex.value, 1)
  elements.value.unshift(element)
  selectedIndex.value = 0
  hideContextMenu()
}

const moveToCenter = () => {
  if (contextMenuIndex.value === null) return
  const element = elements.value[contextMenuIndex.value]
  const container = canvasContainer.value
  if (!container) return

  // 获取容器的尺寸
  const containerWidth = container.offsetWidth
  const containerHeight = container.offsetHeight

  // 计算居中位置（使用百分比定位）
  element.style.left = '50%'
  element.style.top = '50%'
  element.style.transform = 'translate(-50%, -50%)'

  // 更新元素的初始中心点
  element.initialCenter = {
    x: Math.round(containerWidth / 2),
    y: Math.round(containerHeight / 2)
  }

  hideContextMenu()
}

const showConfirmDialog = ref(false)

const clearAllElements = () => {
  elements.value = []
  selectedIndex.value = null
  persistStore.addHistory(elements.value)
}

// 处理外部拖放的悬停效果
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  // 添加拖放提示样式
  const container = canvasContainer.value
  if (container) {
    container.style.borderColor = '#4caf50'
    container.style.borderStyle = 'solid'
  }
}

// 修改现有的 handleExternalDrop 函数
const handleExternalDrop = async (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  // 如果是从图层列表拖拽的，不处理
  const target = event.target as HTMLElement
  if (target.closest('.layer-list')) {
    return
  }

  // 重置拖放状态
  isDraggingOver.value = false
  if (canvasContainer.value) {
    canvasContainer.value.classList.remove('drag-active')
  }

  if (!event.dataTransfer || !canvasContainer.value) return

  // 计算相对于画布的位置
  const containerRect = canvasContainer.value.getBoundingClientRect()
  const dropX = event.clientX - containerRect.left
  const dropY = event.clientY - containerRect.top

  // 处理拖放的文件（图片）
  if (event.dataTransfer.files.length > 0) {
    Array.from(event.dataTransfer.files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            addElementToCanvas({
              type: 'image',
              content: e.target.result as string,
              style: {
                width: '200px',
                height: 'auto',
                left: `${dropX}px`,
                top: `${dropY}px`,
                transform: 'translate(-50%, -50%)',
                position: 'absolute'
              }
            })
          }
        }
        reader.readAsDataURL(file)
      }
    })
    return
  }

  // 处理拖放的文本
  const text = event.dataTransfer.getData('text')
  if (text.trim()) {
    addElementToCanvas({
      type: 'text',
      content: text,
      style: {
        fontSize: '24px',
        color: '#000000',
        left: `${dropX}px`,
        top: `${dropY}px`,
        transform: 'translate(-50%, -50%)',
        position: 'absolute'
      }
    })
  }
}

onMounted(() => {
  restoreData()
  if (elements.value.length > 0) {
    persistStore.initHistory(elements.value)
  }

  // 确保初始状态的一致性
  if (assistStore.enableSnapping && !assistStore.showGuidelines) {
    assistStore.showGuidelines = true
  }
  if (!assistStore.showGuidelines && assistStore.enableSnapping) {
    assistStore.enableSnapping = false
  }

  // 从 localStorage 恢复边界线显示状态
  assistStore.showOtherBoundaries = localStorage.getItem('emoji-maker-show-boundaries') === 'true'

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('click', hideContextMenu)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('click', hideContextMenu)
})

const stopLayerDrag = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  const target = event.target as HTMLElement
  target.classList.remove('dragging')
  isInternalDrag.value = false
}

const dropElement = (event: DragEvent, index: number) => {
  event.preventDefault()
  event.stopPropagation()
  
  // 如果不是从图层列表拖拽的，直接返回
  const target = event.target as HTMLElement
  if (!target.closest('.layer-list')) {
    return
  }

  const data = event.dataTransfer?.getData('text')
  if (data) {
    try {
      const draggedData = JSON.parse(data)
      // 只处理内部图层排序的拖拽
      if (draggedData.isInternal && draggedData.isLayerSort) {
        const draggedIndex = draggedData.index
        const elementToMove = elements.value[draggedIndex]

        // 移除原位置的元素
        elements.value.splice(draggedIndex, 1)
        // 插入到新位置
        elements.value.splice(index, 0, elementToMove)

        // 重新分配所有元素的 id
        elements.value.forEach((element, idx) => {
          element.id = idx
        })

        selectedIndex.value = index
        persistStore.addHistory(elements.value)
      }
    } catch (e) {
      console.error('Invalid drag data')
    }
  }
  isInternalDrag.value = false
}

const toggleVisibility = (index: number, event: Event) => {
  event.stopPropagation()
  const element = elements.value[index]
  element.isVisible = element.isVisible === undefined ? false : !element.isVisible
}

const initializeElementStyle = (element: any) => {
  if (!element || typeof element !== 'object') {
    throw new Error('无效的元素数据')
  }

  if (!element.style || typeof element.style !== 'object') {
    element.style = {}
  }

  // 确保基本样式属性都存在
  const defaultStyle = {
    left: '50%',
    top: '50%',
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    fontSize: '16px',
    color: '#000000',
    width: 'auto',
    height: 'auto',
    rotate: '0deg',
    opacity: '1',
    borderStyle: 'none',
    backgroundColor: 'transparent',
    padding: '0px'
  }

  // 合并默认样式和现有样式
  element.style = {
    ...defaultStyle,
    ...element.style
  }

  return element
}

// 定义元素类型
interface ElementType {
  style?: {
    [key: string]: string;
  };
  type?: string;
  content?: string;
  [key: string]: any;
}

const saveToLocalStorage = () => {
  localStorage.setItem('emojiMakerElements', JSON.stringify(elements.value));
};

const addElement = (element: ElementType) => {
  elements.value.push(initializeElementStyle(element));
  selectedIndex.value = elements.value.length - 1;
  saveToLocalStorage();
};

const loadElements = () => {
  const savedElements = localStorage.getItem('emojiMakerElements');
  if (savedElements) {
    elements.value = JSON.parse(savedElements).map((element: ElementType) => initializeElementStyle(element));
  }
};

const duplicateElement = () => {
  if (contextMenuIndex.value === null) return
  const originalElement = elements.value[contextMenuIndex.value]
  
  // 深拷贝原始元素
  const newElement = JSON.parse(JSON.stringify(originalElement))
  
  // 生成新的ID
  newElement.id = Math.max(...elements.value.map(el => el.id)) + 1
  
  // 计算新位置（相对偏移20px）
  const currentLeft = parseInt(newElement.style.left) || 0
  const currentTop = parseInt(newElement.style.top) || 0
  newElement.style.left = `${currentLeft + 20}px`
  newElement.style.top = `${currentTop + 20}px`
  
  // 如果有初始中心点，也要相应调整
  if (newElement.initialCenter) {
    newElement.initialCenter.x += 20
    newElement.initialCenter.y += 20
  }
  
  // 添加到元素列表中
  elements.value.splice(contextMenuIndex.value + 1, 0, newElement)
  selectedIndex.value = contextMenuIndex.value + 1
  hideContextMenu()
}

const getImageNumber = (index: number): string => {
  // 只计算图片类型的元素
  const imageElements = elements.value.filter(el => el.type === 'image');
  // 获取当前元素之前的所有图片元素
  const previousImages = elements.value.slice(0, index).filter(el => el.type === 'image');
  // 当前是第几个图片 + 1（因为要从1开始）
  return `#${previousImages.length + 1}`;
};

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
    elRect.height,
  )
}

// 检查并生成对齐辅助线
const checkAlignment = (currentIndex: number) => {
  if (!draggedElement.value) return []
  if (!assistStore.showGuidelines) return []

  assistStore.clearGuidelines()
  const currentElement = elements.value[currentIndex]
  const currentBounds = getElementBounds(currentElement, currentIndex)
  const container = canvasContainer.value
  if (!currentBounds || !container) return []

  const containerWidth = container.offsetWidth
  const containerHeight = container.offsetHeight
  const containerCenterX = containerWidth / 2
  const containerCenterY = containerHeight / 2

  const elementCenterX = currentBounds.left + currentBounds.width / 2
  const elementCenterY = currentBounds.top + currentBounds.height / 2

  // 检查水平中心对齐
  if (Math.abs(elementCenterX - containerCenterX) < assistStore.SNAP_THRESHOLD) {
    assistStore.guidelines.push({
      position: containerCenterX,
      type: 'vertical',
      color: assistStore.CONTAINER_GUIDELINE_COLOR,
      source: 'container',
    })
    if (assistStore.enableSnapping) {
      assistStore.snapState.push({
        isSnapped: true,
        position: containerCenterX - currentBounds.width / 2,
        type: 'vertical',
      })
    }
  }

  // 检查垂直中心对齐
  if (Math.abs(elementCenterY - containerCenterY) < assistStore.SNAP_THRESHOLD) {
    assistStore.guidelines.push({
      position: containerCenterY,
      type: 'horizontal',
      color: assistStore.CONTAINER_GUIDELINE_COLOR,
      source: 'container',
    })
    if (assistStore.enableSnapping) {
      assistStore.snapState.push({
        isSnapped: true,
        position: containerCenterY - currentBounds.height / 2,
        type: 'horizontal',
      })
    }
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
      {
        current: currentBounds.left + currentBounds.width / 2,
        target: bounds.left + bounds.width / 2,
      }, // 中心对齐
      { current: currentBounds.right, target: bounds.left }, // 右边缘对左边缘
      { current: currentBounds.left, target: bounds.right }, // 左边缘对右边缘
      { current: currentBounds.left, target: bounds.right + assistStore.SNAP_THRESHOLD }, // 水平等间距
      { current: currentBounds.right, target: bounds.left - assistStore.SNAP_THRESHOLD }, // 水平等间距
    ]

    verticalAlignments.forEach(({ current, target }) => {
      if (Math.abs(current - target) < assistStore.SNAP_THRESHOLD) {
        assistStore.guidelines.push({
          position: target,
          type: 'vertical',
          color: elementColor,
          source: element.id,
        })
        if (assistStore.enableSnapping) {
          assistStore.snapState.push({
            isSnapped: true,
            position: target - (current - parseInt(currentElement.style.left)),
            type: 'vertical',
          })
        }
      }
    })

    // 检查水平对齐
    const horizontalAlignments = [
      { current: currentBounds.top, target: bounds.top }, // 顶部对齐
      { current: currentBounds.bottom, target: bounds.bottom }, // 底部对齐
      {
        current: currentBounds.top + currentBounds.height / 2,
        target: bounds.top + bounds.height / 2,
      }, // 中心对齐
      { current: currentBounds.bottom, target: bounds.top }, // 底边缘对顶边缘
      { current: currentBounds.top, target: bounds.bottom }, // 顶边缘对底边缘
      { current: currentBounds.top, target: bounds.bottom + assistStore.SNAP_THRESHOLD }, // 垂直等间距
      { current: currentBounds.bottom, target: bounds.top - assistStore.SNAP_THRESHOLD }, // 垂直等间距
    ]

    horizontalAlignments.forEach(({ current, target }) => {
      if (Math.abs(current - target) < assistStore.SNAP_THRESHOLD) {
        assistStore.guidelines.push({
          position: target,
          type: 'horizontal',
          color: elementColor,
          source: element.id,
        })
        if (assistStore.enableSnapping) {
          assistStore.snapState.push({
            isSnapped: true,
            position: target - (current - parseInt(currentElement.style.top)),
            type: 'horizontal',
          })
        }
      }
    })
  })

  return assistStore.snapState
}
</script>

<style scoped>
@import '../styles/emojiMaker.css';
@import '../styles/layerPanel.css';
@import '../styles/controlPanel.css';
@import '../styles/textStyles.css';
@import '../styles/animations.css';
</style>
