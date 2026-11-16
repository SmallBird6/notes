import { contentDir } from '../config'
import { fileKind } from '../github/paths'

export const CATALOG_PATH = `${contentDir}/catalog.json`
export const ANON_CATALOG_MS = 10 * 60 * 1000

export function anonymousCatalogDue(lastAt: number, now: number, force: boolean): boolean {
  if (force) return true
  if (!lastAt) return true
  return now - lastAt >= ANON_CATALOG_MS
}

function listedPath(path: string): boolean {
  if (!path.startsWith(`${contentDir}/`)) return false
  const segments = path.slice(contentDir.length + 1).split('/')
  if (segments.some((segment) => segment.length === 0 || segment === '.' || segment === '..' || segment.startsWith('.'))) {
    return false
  }
  const kind = fileKind(path)
  return kind === 'md' || kind === 'image'
}

export function serializeCatalog(paths: Iterable<string>): string {
  const unique = [...new Set([...paths].filter(listedPath))].sort((a, b) => a.localeCompare(b, 'zh', { numeric: true }))
  return `${JSON.stringify({ paths: unique }, null, 2)}\n`
}

export function parseCatalog(text: string): string[] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('目录清单无法读取')
  }
  if (!data || typeof data !== 'object' || !Array.isArray((data as { paths?: unknown }).paths)) {
    throw new Error('目录清单无法读取')
  }
  return JSON.parse(serializeCatalog((data as { paths: unknown[] }).paths.filter((item): item is string => typeof item === 'string')))
    .paths as string[]
}
