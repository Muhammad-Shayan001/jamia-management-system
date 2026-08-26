import 'server-only'
import { notFound } from 'next/navigation'

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  ur: () => import('../dictionaries/ur.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async (locale: string) => {
  if (!hasLocale(locale)) notFound()
  return dictionaries[locale]()
}
