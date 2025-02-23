<template>
  <div class="tools-panel">
    <div class="tools-container">
      <div class="tools-group">
        <button @click="handleUpload">{{ t('app.upload') }}</button>
        <button @click="$emit('add-text')">{{ t('app.addText') }}</button>
        <button class="clear-btn" @click="$emit('show-clear-confirm')">{{ t('app.clear') }}</button>
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
        <button @click="$emit('export')">{{ t('app.download') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLanguageStore } from '@/stores/language'

const { t } = useLanguageStore()

interface Emits {
  (e: 'add-text'): void
  (e: 'show-clear-confirm'): void
  (e: 'export'): void
  (e: 'file-selected', files: FileList): void
}

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement | null>(null)

const handleUpload = () => {
  fileInput.value?.click()
}

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    emit('file-selected', input.files)
    // 清空 input 值，这样同一个文件可以重复选择
    input.value = ''
  }
}
</script>

<style scoped>
.tools-panel {
  padding: 8px;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
}

.tools-container {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.tools-group {
  display: flex;
  gap: 8px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4a90e2;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

button:hover {
  background-color: #357abd;
}

.clear-btn {
  background-color: #e74c3c;
}

.clear-btn:hover {
  background-color: #c0392b;
}
</style> 