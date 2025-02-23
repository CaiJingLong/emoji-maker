<template>
  <div class="accordion-item">
    <div class="accordion-header" @click="$emit('toggle')">
      <h3>{{ t('app.layers') }}</h3>
      <span class="accordion-icon" :class="{ 'is-expanded': isExpanded }">▼</span>
    </div>
    <div class="accordion-content" :class="{ 'is-expanded': isExpanded }">
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
          @click.stop="$emit('select', index)"
          @contextmenu.prevent.stop="$emit('context-menu', $event, index)"
          draggable="true"
          @dragstart.stop="handleDragStart($event, index)"
          @dragend.stop="$emit('layer-drag-end', $event)"
          @drop.stop="handleDrop($event, index)"
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
          <span class="layer-item-visibility" @click="$emit('toggle-visibility', index, $event)">
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
</template>

<script setup lang="ts">
import { useLanguageStore } from '@/stores/language'
import type { Element } from '@/stores/persistStore'

const { t } = useLanguageStore()

interface Props {
  elements: Element[]
  selectedIndex: number | null
  isExpanded: boolean
}

interface Emits {
  (e: 'toggle'): void
  (e: 'select', index: number): void
  (e: 'context-menu', event: MouseEvent, index: number): void
  (e: 'toggle-visibility', index: number, event: MouseEvent): void
  (e: 'layer-drag-end', event: DragEvent): void
  (e: 'layer-drop', draggedIndex: number, targetIndex: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleDragStart = (event: DragEvent, index: number) => {
  if (!event.dataTransfer) return
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify({
    isInternal: true,
    isLayerSort: true,
    index
  }))
}

const handleDrop = (event: DragEvent, targetIndex: number) => {
  const data = event.dataTransfer?.getData('text/plain')
  if (!data) return

  try {
    const draggedData = JSON.parse(data)
    if (draggedData.isInternal && draggedData.isLayerSort) {
      emit('layer-drop', draggedData.index, targetIndex)
    }
  } catch (e) {
    console.error('Invalid drag data')
  }
}

const getImageNumber = (index: number): string => {
  // 只计算图片类型的元素
  const imageElements = props.elements.filter(el => el.type === 'image')
  // 获取当前元素之前的所有图片元素
  const previousImages = props.elements.slice(0, index).filter(el => el.type === 'image')
  // 当前是第几个图片 + 1（因为要从1开始）
  return `#${previousImages.length + 1}`
}
</script>

<style scoped>
.accordion-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: white;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}

.accordion-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.accordion-icon {
  transition: transform 0.3s ease;
  color: #666;
}

.accordion-icon.is-expanded {
  transform: rotate(180deg);
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.accordion-content.is-expanded {
  max-height: 500px;
}

.layer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.layer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;
}

.layer-item:hover {
  background-color: #f5f5f5;
}

.layer-item.selected {
  background-color: #e3f2fd;
}

.layer-item.hidden {
  opacity: 0.5;
}

.layer-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.layer-item-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #f0f0f0;
}

.text-icon {
  font-weight: bold;
  color: #666;
}

.image-icon {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 2px;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.layer-item-text {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-item-visibility {
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.layer-item-visibility:hover {
  background-color: #eee;
}
</style> 