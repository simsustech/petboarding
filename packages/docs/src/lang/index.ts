export interface Language {
  isoName: string
  home: {
    title: string
  }
  pricing: {
    title: string
  }
  contact: {
    title: string
  }
  developers: {
    title: string
  }
  documentation: {
    title: string
    users: string
    employees: string
    administrators: string
  }
  testimonial: {
    labels: {
      clients: string
      endUsers: string
    }
  }
}

import type { Ref } from 'vue'
import { ref } from 'vue'
import en from './en-US.js'
export const lang = ref(en)

const locales = import.meta.glob<{ default: Language }>([
  './*.ts',
  '!./index.ts'
])

export const defineLang = (lang: Language) => {
  return lang
}

export const useLang = () => {
  return lang as Ref<Language>
}

let loadingLanguage = false
export const loadLang = async (isoName: string) => {
  if (!loadingLanguage) {
    loadingLanguage = true
    try {
      const data = (await locales[`./${isoName}.ts`]()).default

      if (data) {
        lang.value = data
      }
    } catch (e) {
      if (import.meta.env.DEBUG) console.error(e)
      throw new Error(`[petboarding] Failed to load ${isoName} language file.`)
    }
    loadingLanguage = false
  }
}
