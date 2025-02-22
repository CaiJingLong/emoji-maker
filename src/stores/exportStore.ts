import { defineStore } from 'pinia'
import { ref } from 'vue'
import html2canvas from 'html2canvas'

// 导出格式类型
type ExportFormat = 'png' | 'jpeg' | 'webp'
type BackgroundType = 'transparent' | 'color'
type ExportSize = '0.5' | '1' | '1.5' | '2' | '3' | '4' | '6' | '8'

// 导出设置接口
interface ExportSettings {
  format: ExportFormat
  bgType: BackgroundType
  bgColor: string
  exportSize: ExportSize
}

// 预览信息接口
interface PreviewInfo {
  size: string
  dimensions: string
  thumbnailUrl: string
}

export const useExportStore = defineStore('export', () => {
  // 状态
  const settings = ref<ExportSettings>({
    format: 'png',
    bgType: 'transparent',
    bgColor: 'rgba(255, 255, 255, 1)',
    exportSize: '2'
  })
  const previewInfo = ref<PreviewInfo>({
    size: '',
    dimensions: '',
    thumbnailUrl: ''
  })
  const isDialogVisible = ref(false)

  // 防抖函数
  const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
    let timer: number | null = null
    return (...args: Parameters<T>) => {
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        fn(...args)
        timer = null
      }, delay)
    }
  }

  // 计算预览信息
  const calculatePreview = async (container: HTMLElement) => {
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: settings.value.bgType === 'transparent' ? null : settings.value.bgColor,
        scale: Number(settings.value.exportSize)
      })

      // 更新尺寸信息
      const width = canvas.width
      const height = canvas.height
      previewInfo.value.dimensions = `${width} × ${height}px`

      // 创建缩略图
      const thumbnailCanvas = document.createElement('canvas')
      const ctx = thumbnailCanvas.getContext('2d')
      if (ctx) {
        const thumbSize = 40
        const ratio = Math.min(thumbSize / width, thumbSize / height)
        thumbnailCanvas.width = width * ratio
        thumbnailCanvas.height = height * ratio

        ctx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height)
        previewInfo.value.thumbnailUrl = thumbnailCanvas.toDataURL()
      }

      // 计算文件大小
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, `image/${settings.value.format}`)
      })

      // 格式化文件大小
      const size = blob.size
      if (size < 1024) {
        previewInfo.value.size = `${size} B`
      } else if (size < 1024 * 1024) {
        previewInfo.value.size = `${(size / 1024).toFixed(1)} KB`
      } else {
        previewInfo.value.size = `${(size / (1024 * 1024)).toFixed(1)} MB`
      }
    } catch (error) {
      console.error('预览计算失败:', error)
      previewInfo.value = {
        size: '',
        dimensions: '',
        thumbnailUrl: ''
      }
    }
  }

  // 创建防抖版本的预览计算函数
  const debouncedCalculatePreview = debounce(calculatePreview, 300)

  // 导出图片
  const exportImage = async (container: HTMLElement) => {
    try {
      // 临时移除所有辅助性元素的类名
      const elements = container.querySelectorAll('.draggable-element')
      elements.forEach(el => {
        el.classList.remove('show-boundary', 'selected')
      })

      // 隐藏所有辅助线
      const guidelines = container.querySelectorAll('.guideline')
      guidelines.forEach(el => {
        ;(el as HTMLElement).style.display = 'none'
      })

      // 导出图片
      const canvas = await html2canvas(container, {
        backgroundColor: settings.value.bgType === 'transparent' ? null : settings.value.bgColor,
        scale: Number(settings.value.exportSize)
      })

      // 恢复辅助性元素
      elements.forEach(el => {
        if (el.getAttribute('data-selected') === 'true') {
          el.classList.add('selected')
        }
      })
      guidelines.forEach(el => {
        ;(el as HTMLElement).style.display = ''
      })

      // 处理导出
      const dataUrl = canvas.toDataURL(`image/${settings.value.format}`, Number(settings.value.exportSize))
      const link = document.createElement('a')
      link.download = `emoji-${Date.now()}.${settings.value.format}`
      link.href = dataUrl
      link.click()

      isDialogVisible.value = false
    } catch (error) {
      console.error('导出失败:', error)
    }
  }

  // 更新设置
  const updateSettings = (newSettings: Partial<ExportSettings>) => {
    settings.value = {
      ...settings.value,
      ...newSettings
    }
  }

  // 显示/隐藏对话框
  const showDialog = () => {
    isDialogVisible.value = true
  }

  const hideDialog = () => {
    isDialogVisible.value = false
  }

  return {
    settings,
    previewInfo,
    isDialogVisible,
    calculatePreview,
    debouncedCalculatePreview,
    exportImage,
    updateSettings,
    showDialog,
    hideDialog
  }
}) 