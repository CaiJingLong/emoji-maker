<template>
  <div class="export-dialog-overlay" @click="$emit('close')">
    <div class="export-dialog" @click.stop>
      <div class="dialog-header">
        <h3>{{ t('editor.exportSettings') }}</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="dialog-content">
        <div class="setting-item">
          <label>{{ t('editor.exportFormat') }}</label>
          <select v-model="format">
            <option value="png">PNG ({{ t('editor.withTransparency') }})</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <div class="setting-item">
          <label>{{ t('editor.backgroundColor') }}</label>
          <div class="color-setting">
            <select v-model="bgType">
              <option value="transparent">{{ t('editor.transparent') }}</option>
              <option value="color">{{ t('editor.solidColor') }}</option>
            </select>
            <input
              v-if="bgType === 'color'"
              type="color"
              v-model="bgColor"
              class="color-picker"
            >
          </div>
        </div>

        <div class="setting-item">
          <label>{{ t('editor.quality') }}</label>
          <div class="quality-setting">
            <select v-model="quality">
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
              <option value="3">3x</option>
              <option value="4">4x</option>
              <option value="6">6x</option>
              <option value="8">8x</option>
            </select>
          </div>
        </div>

        <div class="preview-info">
          <div class="preview-thumbnail" v-if="thumbnailUrl">
            <img :src="thumbnailUrl" alt="预览" />
          </div>
          <div class="preview-details">
            <div v-if="previewSize">{{ t('editor.estimatedSize') }}: {{ previewSize }}</div>
            <div v-if="dimensions">{{ t('editor.dimensions') }}: {{ dimensions }}</div>
            <div v-if="!previewSize && !dimensions" class="preview-loading">{{ t('editor.calculating') }}...</div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="cancel-btn" @click="$emit('close')">{{ t('editor.cancel') }}</button>
        <button class="export-btn" @click="handleExport">{{ t('editor.export') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useLanguageStore } from '../stores/language'
import html2canvas from 'html2canvas'

const { t } = useLanguageStore()

const props = defineProps<{
  container: HTMLElement | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const format = ref('png')
const bgType = ref('transparent')
const bgColor = ref('#ffffff')
const quality = ref('2')
const previewSize = ref('')
const thumbnailUrl = ref('')
const dimensions = ref('')

// 防抖函数
const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(fn: T, delay: number) => {
  let timer: number | null = null
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

// 预览导出大小
const previewExportSize = async () => {
  if (!props.container) return

  try {
    const canvas = await html2canvas(props.container, {
      backgroundColor: bgType.value === 'transparent' ? null : bgColor.value,
      scale: Number(quality.value)
    })

    // 更新尺寸信息
    const width = canvas.width
    const height = canvas.height
    dimensions.value = `${width} × ${height}px`

    // 创建缩略图
    const thumbnailCanvas = document.createElement('canvas')
    const ctx = thumbnailCanvas.getContext('2d')
    if (ctx) {
      // 设置缩略图大小为 40x40，保持比例
      const thumbSize = 40
      const ratio = Math.min(thumbSize / width, thumbSize / height)
      thumbnailCanvas.width = width * ratio
      thumbnailCanvas.height = height * ratio

      // 绘制缩略图
      ctx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height)
      thumbnailUrl.value = thumbnailCanvas.toDataURL()
    }

    // 转换为 blob 以获取大小
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, `image/${format.value}`)
    })

    // 格式化文件大小
    const size = blob.size
    if (size < 1024) {
      previewSize.value = `${size} B`
    } else if (size < 1024 * 1024) {
      previewSize.value = `${(size / 1024).toFixed(1)} KB`
    } else {
      previewSize.value = `${(size / (1024 * 1024)).toFixed(1)} MB`
    }
  } catch (error) {
    console.error('预览大小计算失败:', error)
    previewSize.value = ''
    dimensions.value = ''
    thumbnailUrl.value = ''
  }
}

// 创建防抖版本的预览函数
const debouncedPreview = debounce(previewExportSize, 300)

// 监听设置变化，更新预览大小
watch([format, quality], () => {
  // 格式和质量变化立即更新
  previewExportSize()
})

// 背景类型和颜色使用防抖
watch([bgType, bgColor], () => {
  debouncedPreview()
})

// 导出图片
const handleExport = async () => {
  if (!props.container) return

  try {
    // 临时移除所有辅助性元素的类名
    const elements = props.container.querySelectorAll('.draggable-element')
    elements.forEach(el => {
      el.classList.remove('show-boundary', 'selected')
    })

    // 隐藏所有辅助线
    const guidelines = props.container.querySelectorAll('.guideline')
    guidelines.forEach(el => {
      ;(el as HTMLElement).style.display = 'none'
    })

    // 导出图片
    const canvas = await html2canvas(props.container, {
      backgroundColor: bgType.value === 'transparent' ? null : bgColor.value,
      scale: Number(quality.value)
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
    const dataUrl = canvas.toDataURL(format.value, quality.value)
    const link = document.createElement('a')
    link.download = `emoji-${Date.now()}.${format.value.split('/')[1]}`
    link.href = dataUrl
    link.click()

    emit('close')
  } catch (error) {
    console.error('导出失败:', error)
  }
}

// 在 script setup 中添加
onMounted(() => {
  // 弹窗打开时立即计算预览
  previewExportSize()
})
</script>

<style scoped>
.export-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9000;
}

.export-dialog {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90vw;
  position: relative;
  z-index: 9001;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.setting-item select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.color-setting {
  display: flex;
  gap: 10px;
}

.color-setting select {
  flex: 1;
}

.color-picker {
  width: 40px;
  height: 34px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.preview-info {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 15px;
}

.preview-thumbnail {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #ddd;
}

.preview-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dialog-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-footer button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #eee;
}

.export-btn {
  background: #4CAF50;
  color: white;
}

.export-btn:hover {
  background: #45a049;
}
</style>
