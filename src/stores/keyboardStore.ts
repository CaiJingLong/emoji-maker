import { defineStore } from 'pinia'
import { usePersistStore, type Element } from './persistStore'

export const useKeyboardStore = defineStore('keyboard', () => {
  const persistStore = usePersistStore()

  // 处理键盘事件
  const handleKeyDown = async (
    event: KeyboardEvent,
    {
      selectedElement,
      deleteElement,
      selectedIndex,
      addElementToCanvas
    }: {
      selectedElement: Element | null
      deleteElement: (index: number) => void
      selectedIndex: number | null
      addElementToCanvas: (element: Partial<Element>) => void
    }
  ) => {
    // 如果正在编辑文本，不处理快捷键
    if (selectedElement?.isEditing) return

    // 处理快捷键
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'z':
          event.preventDefault()
          if (event.shiftKey) {
            const redoResult = persistStore.redo()
            if (redoResult) {
              return { type: 'history', elements: redoResult }
            }
          } else {
            const undoResult = persistStore.undo()
            if (undoResult) {
              return { type: 'history', elements: undoResult }
            }
          }
          break
        case 'v':
          event.preventDefault()
          try {
            const clipboardItems = await navigator.clipboard.read()
            for (const clipboardItem of clipboardItems) {
              // 优先处理图片
              for (const type of clipboardItem.types) {
                if (type.startsWith('image/')) {
                  const blob = await clipboardItem.getType(type)
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    if (e.target?.result) {
                      addElementToCanvas({
                        type: 'image',
                        content: e.target.result as string,
                        style: {
                          left: '50%',
                          top: '50%',
                          position: 'absolute',
                          width: '200px',
                          height: 'auto'
                        }
                      })
                    }
                  }
                  reader.readAsDataURL(blob)
                  return
                }
              }
              // 如果没有图片，尝试读取文本
              if (clipboardItem.types.includes('text/plain')) {
                const text = await clipboardItem.getType('text/plain')
                const textContent = await text.text()
                if (textContent.trim()) {
                  addElementToCanvas({
                    type: 'text',
                    content: textContent,
                    style: {
                      left: '50%',
                      top: '50%',
                      position: 'absolute',
                      fontSize: '24px',
                      color: '#000000'
                    }
                  })
                }
              }
            }
          } catch (error) {
            console.debug('剪贴板访问被拒绝或不可用')
          }
          break
      }
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIndex !== null) {
      event.preventDefault()
      deleteElement(selectedIndex)
    }
  }

  return {
    handleKeyDown
  }
}) 