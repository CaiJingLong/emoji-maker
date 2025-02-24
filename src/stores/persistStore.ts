import { defineStore } from 'pinia'
import { ref } from 'vue'

// 存储键名常量
const STORAGE_KEYS = {
  ELEMENTS: 'emoji-maker-elements',
  GUIDELINES: 'emoji-maker-guidelines',
  SNAPPING: 'emoji-maker-snapping',
  BOUNDARIES: 'emoji-maker-show-boundaries',
  LANGUAGE: 'emoji-maker-language'
} as const

// 类型定义
export interface ElementStyle {
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
  opacity?: string
  backgroundColor?: string
  padding?: string
  paddingLeft?: string
  paddingRight?: string
  paddingTop?: string
  paddingBottom?: string
}

export interface Element {
  type: 'image' | 'text'
  content: string
  id: number
  style: ElementStyle
  isEditing?: boolean
  isVisible?: boolean
  initialCenter?: { x: number; y: number }
}

// 默认样式
const defaultStyle: ElementStyle = {
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

export const usePersistStore = defineStore('persist', () => {
  // 状态
  const elements = ref<Element[]>([])
  const history = ref<Element[][]>([])
  const currentHistoryIndex = ref(-1)
  const isHistoryAction = ref(false)
  const lastSavedState = ref('')
  const MAX_HISTORY = 50

  // 元素管理方法
  const saveElements = (newElements: Element[]) => {
    localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(newElements))
  }

  const loadElements = (): Element[] => {
    const savedData = localStorage.getItem(STORAGE_KEYS.ELEMENTS)
    if (!savedData) return []

    try {
      const loadedElements = JSON.parse(savedData)
      if (!Array.isArray(loadedElements)) {
        console.error('恢复数据失败: 数据格式不正确')
        return []
      }

      return loadedElements.map(element => {
        if (typeof element !== 'object' || !element) {
          console.error('跳过无效元素:', element)
          return null
        }

        return {
          type: element.type || 'text',
          content: element.content || '',
          id: element.id || 0,
          style: {
            ...defaultStyle,
            ...element.style
          },
          isEditing: false,
          initialCenter: element.initialCenter || {
            x: 200,
            y: 200
          }
        }
      }).filter(Boolean) as Element[]
    } catch (error) {
      console.error('恢复数据失败:', error)
      localStorage.removeItem(STORAGE_KEYS.ELEMENTS)
      return []
    }
  }

  // 历史记录管理方法
  const addHistory = (currentElements: Element[]) => {
    if (isHistoryAction.value) return

    const currentState = JSON.stringify(currentElements)
    if (currentState === lastSavedState.value) return

    if (currentHistoryIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentHistoryIndex.value + 1)
    }

    history.value.push(JSON.parse(JSON.stringify(currentElements)))
    currentHistoryIndex.value = history.value.length - 1
    lastSavedState.value = currentState

    if (history.value.length > MAX_HISTORY) {
      history.value.shift()
      currentHistoryIndex.value--
    }
  }

  const undo = (): Element[] | null => {
    if (currentHistoryIndex.value > 0) {
      isHistoryAction.value = true
      currentHistoryIndex.value--
      const elements = JSON.parse(JSON.stringify(history.value[currentHistoryIndex.value]))
      lastSavedState.value = JSON.stringify(elements)
      isHistoryAction.value = false
      return elements
    }
    return null
  }

  const redo = (): Element[] | null => {
    if (currentHistoryIndex.value < history.value.length - 1) {
      isHistoryAction.value = true
      currentHistoryIndex.value++
      const elements = JSON.parse(JSON.stringify(history.value[currentHistoryIndex.value]))
      lastSavedState.value = JSON.stringify(elements)
      isHistoryAction.value = false
      return elements
    }
    return null
  }

  // 初始化历史记录
  const initHistory = (initialElements: Element[]) => {
    const initialState = JSON.stringify(initialElements)
    history.value = [JSON.parse(initialState)]
    currentHistoryIndex.value = 0
    lastSavedState.value = initialState
  }

  // 辅助功能状态管理方法
  const loadGuidelinesState = (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.GUIDELINES) === 'true'
  }

  const saveGuidelinesState = (state: boolean) => {
    localStorage.setItem(STORAGE_KEYS.GUIDELINES, state.toString())
  }

  const loadSnappingState = (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.SNAPPING) === 'true'
  }

  const saveSnappingState = (state: boolean) => {
    localStorage.setItem(STORAGE_KEYS.SNAPPING, state.toString())
  }

  const loadBoundariesState = (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.BOUNDARIES) === 'true'
  }

  const saveBoundariesState = (state: boolean) => {
    localStorage.setItem(STORAGE_KEYS.BOUNDARIES, state.toString())
  }

  // 语言设置管理方法
  const loadLanguage = (): string => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE)
    return saved === 'en' || saved === 'zh' ? saved : 'zh'
  }

  const saveLanguage = (lang: string) => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang)
  }

  return {
    // 状态
    elements,
    history,
    currentHistoryIndex,
    isHistoryAction,
    lastSavedState,
    MAX_HISTORY,

    // 方法
    saveElements,
    loadElements,
    addHistory,
    undo,
    redo,
    initHistory,
    loadGuidelinesState,
    saveGuidelinesState,
    loadSnappingState,
    saveSnappingState,
    loadBoundariesState,
    saveBoundariesState,
    loadLanguage,
    saveLanguage,
  }
})
