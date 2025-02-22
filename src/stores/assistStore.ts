import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { usePersistStore } from './persistStore'

// 常量定义
const GUIDELINES_STORAGE_KEY = 'emoji-maker-guidelines'
const SNAPPING_STORAGE_KEY = 'emoji-maker-snapping'
const BOUNDARIES_STORAGE_KEY = 'emoji-maker-show-boundaries'
const SNAP_THRESHOLD = 10 // 吸附阈值（像素）
const CONTAINER_GUIDELINE_COLOR = '#FF0000' // 容器辅助线颜色

// 类型定义
export interface GuidelineInfo {
  position: number
  type: 'horizontal' | 'vertical'
  color: string
  source: 'container' | number
}

export interface SnapInfo {
  isSnapped: boolean
  position: number
  type: 'horizontal' | 'vertical'
}

export const useAssistStore = defineStore('assist', () => {
  const persistStore = usePersistStore()
  
  // 状态
  const showGuidelines = ref(persistStore.loadGuidelinesState())
  const enableSnapping = ref(persistStore.loadSnappingState())
  const showOtherBoundaries = ref(persistStore.loadBoundariesState())
  const guidelines = ref<GuidelineInfo[]>([])
  const snapState = ref<SnapInfo[]>([])

  // 方法
  const toggleGuidelines = () => {
    showGuidelines.value = !showGuidelines.value
    // 如果关闭辅助线，同时关闭吸附功能
    if (!showGuidelines.value) {
      enableSnapping.value = false
    }
  }

  const toggleSnapping = () => {
    enableSnapping.value = !enableSnapping.value
    // 如果开启吸附功能，同时开启辅助线
    if (enableSnapping.value) {
      showGuidelines.value = true
    }
  }

  const toggleOtherBoundaries = () => {
    showOtherBoundaries.value = !showOtherBoundaries.value
    persistStore.saveBoundariesState(showOtherBoundaries.value)
  }

  const clearGuidelines = () => {
    guidelines.value = []
  }

  // 监听器
  watch(showGuidelines, (newValue) => {
    if (!newValue) {
      clearGuidelines()
    }
    persistStore.saveGuidelinesState(newValue)
  })

  watch(enableSnapping, (newValue) => {
    persistStore.saveSnappingState(newValue)
  })

  // 导出常量
  return {
    // 状态
    showGuidelines,
    enableSnapping,
    showOtherBoundaries,
    guidelines,
    snapState,
    // 常量
    SNAP_THRESHOLD,
    CONTAINER_GUIDELINE_COLOR,
    // 方法
    toggleGuidelines,
    toggleSnapping,
    toggleOtherBoundaries,
    clearGuidelines,
  }
}) 