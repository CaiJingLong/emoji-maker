import { defineStore } from 'pinia'
import { ref } from 'vue'
import en from '../locales/en'
import zh from '../locales/zh'

type Language = 'en' | 'zh'
type TranslationObject = {
  [key: string]: string | TranslationObject
}
type Messages = TranslationObject

const LANGUAGE_STORAGE_KEY = 'emoji-maker-language'

// 从 localStorage 读取保存的语言设置，如果没有则返回默认值 'zh'
function getSavedLanguage(): Language {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return saved === 'en' || saved === 'zh' ? saved : 'zh'
}

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref<Language>(getSavedLanguage())
  const messages: Record<Language, Messages> = { en, zh }

  function setLanguage(lang: Language) {
    currentLanguage.value = lang
    // 保存语言设置到 localStorage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  }

  function t(key: string): string {
    const keys = key.split('.')
    let result: Messages | string = messages[currentLanguage.value]

    for (const k of keys) {
      if (typeof result === 'string' || result[k] === undefined) {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
      result = result[k]
    }

    return result as string
  }

  return {
    currentLanguage,
    setLanguage,
    t,
  }
})
