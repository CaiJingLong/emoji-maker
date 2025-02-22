import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { Element } from './persistStore'

// 拖拽元素的信息接口
interface DraggedElementInfo {
  index: number
  startX: number
  startY: number
}

export const useDragStore = defineStore('drag', () => {
  // 拖拽状态
  const draggedElement = ref<DraggedElementInfo | null>(null)
  const isDragging = ref(false)
  const isDraggingOver = ref(false)
  const isInternalDrag = ref(false)

  // 开始拖拽
  const startDrag = (
    event: MouseEvent | DragEvent,
    index: number | undefined,
    elements: Ref<Element[]>,
    setSelectedIndex: (index: number | null) => void
  ) => {
    if (index === undefined) {
      // 处理图层面板的拖拽
      const dragEvent = event as DragEvent
      const target = dragEvent.target as HTMLElement
      const dragIndex = parseInt(target.getAttribute('data-index') || '0')
      const element = elements.value[dragIndex]
      if (element.isEditing) return

      isInternalDrag.value = true
      const data = {
        index: dragIndex,
        isInternal: true,
        isLayerSort: true
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
        startY: mouseEvent.clientY - rect.top
      }
      setSelectedIndex(index)
    }
  }

  // 停止拖拽
  const stopDrag = (
    elements: Ref<Element[]>,
    canvasContainer: Ref<HTMLDivElement | null>,
    clearGuidelines: () => void,
    addHistory: (elements: Element[]) => void
  ) => {
    if (isDragging.value) {
      isDragging.value = false
      clearGuidelines()

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

      addHistory(elements.value)
    }
    draggedElement.value = null
  }

  // 停止图层拖拽
  const stopLayerDrag = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    const target = event.target as HTMLElement
    target.classList.remove('dragging')
    isInternalDrag.value = false
  }

  // 处理拖入事件
  const handleDragEnter = (
    event: DragEvent,
    showExportDialog: boolean,
    showConfirmDialog: boolean,
    canvasContainer: Ref<HTMLDivElement | null>
  ) => {
    if (isInternalDrag.value) return
    if (showExportDialog || showConfirmDialog) return
    
    event.preventDefault()
    isDraggingOver.value = true
    canvasContainer.value?.classList.add('drag-active')
  }

  // 处理拖离事件
  const handleDragLeave = (event: DragEvent, canvasContainer: Ref<HTMLDivElement | null>) => {
    if (isInternalDrag.value) return
    
    event.preventDefault()
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      isDraggingOver.value = false
      canvasContainer.value?.classList.remove('drag-active')
    }
  }

  // 处理拖放的悬停效果
  const handleDragOver = (event: DragEvent, canvasContainer: Ref<HTMLDivElement | null>) => {
    event.preventDefault()
    const container = canvasContainer.value
    if (container) {
      container.style.borderColor = '#4caf50'
      container.style.borderStyle = 'solid'
    }
  }

  return {
    // 状态
    draggedElement,
    isDragging,
    isDraggingOver,
    isInternalDrag,

    // 方法
    startDrag,
    stopDrag,
    stopLayerDrag,
    handleDragEnter,
    handleDragLeave,
    handleDragOver
  }
}) 