import { defineStore } from 'pinia'
import { ref } from 'vue'
import en from '../locales/en'
import zh from '../locales/zh'
import { usePersistStore } from './persistStore'

type Language = 'en' | 'zh'
type TranslationObject = {
  [key: string]: string | TranslationObject
}
type Messages = TranslationObject

export const useLanguageStore = defineStore('language', () => {
  const persistStore = usePersistStore()
  const currentLanguage = ref<Language>(persistStore.loadLanguage() as Language)
  const messages: Record<Language, Messages> = { en, zh }

  function setLanguage(lang: Language) {
    currentLanguage.value = lang
    persistStore.saveLanguage(lang)
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
