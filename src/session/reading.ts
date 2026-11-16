import { ref } from 'vue'

export const ARTICLE_WIDTH_KEY = 'notes.articleWidth'
export const BODY_FONT_SIZE_KEY = 'notes.bodyFontSize'

export const DEFAULT_ARTICLE_WIDTH = 960
export const MIN_ARTICLE_WIDTH = 560
export const MAX_ARTICLE_WIDTH = 1600

export const DEFAULT_BODY_FONT_SIZE = 17
export const MIN_BODY_FONT_SIZE = 14
export const MAX_BODY_FONT_SIZE = 24

export const articleWidth = ref(DEFAULT_ARTICLE_WIDTH)
export const bodyFontSize = ref(DEFAULT_BODY_FONT_SIZE)

export function clampArticleWidth(value: number, limit = MAX_ARTICLE_WIDTH): number {
  const ceiling = Math.max(MIN_ARTICLE_WIDTH, Math.min(limit, MAX_ARTICLE_WIDTH))
  if (!Number.isFinite(value)) return Math.min(DEFAULT_ARTICLE_WIDTH, ceiling)
  return Math.min(Math.max(Math.round(value), MIN_ARTICLE_WIDTH), ceiling)
}

export function clampBodyFontSize(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_BODY_FONT_SIZE
  return Math.min(Math.max(Math.round(value), MIN_BODY_FONT_SIZE), MAX_BODY_FONT_SIZE)
}

function readNumber(key: string): number | null {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null || raw.trim() === '') return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

function writeNumber(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    /* private mode can reject storage; the in-memory value still applies */
  }
}

export function applyReadingVars(): void {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--article-width', `${articleWidth.value}px`)
  document.documentElement.style.setProperty('--body-font-size', `${bodyFontSize.value}px`)
}

export function initReadingPrefs(): void {
  const width = readNumber(ARTICLE_WIDTH_KEY)
  const size = readNumber(BODY_FONT_SIZE_KEY)
  articleWidth.value = width === null ? DEFAULT_ARTICLE_WIDTH : clampArticleWidth(width)
  bodyFontSize.value = size === null ? DEFAULT_BODY_FONT_SIZE : clampBodyFontSize(size)
  applyReadingVars()
}

export function setArticleWidth(value: number, limit?: number): void {
  articleWidth.value = clampArticleWidth(value, limit)
  applyReadingVars()
  writeNumber(ARTICLE_WIDTH_KEY, articleWidth.value)
}

export function stepBodyFontSize(delta: number): void {
  bodyFontSize.value = clampBodyFontSize(bodyFontSize.value + delta)
  applyReadingVars()
  writeNumber(BODY_FONT_SIZE_KEY, bodyFontSize.value)
}
