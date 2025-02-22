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
          <select v-model="exportStore.settings.format">
            <option value="png">PNG ({{ t('editor.withTransparency') }})</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <div class="setting-item">
          <label>{{ t('editor.backgroundColor') }}</label>
          <div class="color-setting">
            <select v-model="exportStore.settings.bgType">
              <option value="transparent">{{ t('editor.transparent') }}</option>
              <option value="color">{{ t('editor.solidColor') }}</option>
            </select>
            <ColorPicker 
              v-if="exportStore.settings.bgType === 'color'" 
              v-model="exportStore.settings.bgColor" 
            />
          </div>
        </div>

        <div class="setting-item">
          <label>{{ t('editor.quality') }}</label>
          <div class="quality-setting">
            <select v-model="exportStore.settings.quality">
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
          <div class="preview-thumbnail" v-if="exportStore.previewInfo.thumbnailUrl">
            <img :src="exportStore.previewInfo.thumbnailUrl" alt="预览" />
          </div>
          <div class="preview-details">
            <div v-if="exportStore.previewInfo.size">{{ t('editor.estimatedSize') }}: {{ exportStore.previewInfo.size }}</div>
            <div v-if="exportStore.previewInfo.dimensions">{{ t('editor.dimensions') }}: {{ exportStore.previewInfo.dimensions }}</div>
            <div v-if="!exportStore.previewInfo.size && !exportStore.previewInfo.dimensions" class="preview-loading">{{ t('editor.calculating') }}...</div>
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
import { onMounted, watch } from 'vue'
import { useLanguageStore } from '../stores/language'
import { useExportStore } from '../stores/exportStore'
import ColorPicker from './ColorPicker.vue'

const { t } = useLanguageStore()
const exportStore = useExportStore()

const props = defineProps<{
  container: HTMLElement | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 导出图片
const handleExport = async () => {
  if (!props.container) return
  await exportStore.exportImage(props.container)
  emit('close')
}

// 监听设置变化，更新预览
watch(
  () => [
    exportStore.settings.format,
    exportStore.settings.quality
  ],
  () => {
    if (props.container) {
      exportStore.calculatePreview(props.container)
    }
  }
)

// 背景类型和颜色使用防抖更新
watch(
  () => [
    exportStore.settings.bgType,
    exportStore.settings.bgColor
  ],
  () => {
    if (props.container) {
      exportStore.debouncedCalculatePreview(props.container)
    }
  }
)

// 在组件挂载时计算预览
onMounted(() => {
  if (props.container) {
    exportStore.calculatePreview(props.container)
  }
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
