import { describe, expect, it, vi } from 'vitest'
import { notes, refresh, titleFromText } from './catalog'

describe('sidebar titles', () => {
  it('prefers the YAML title, then the first heading, then the filename', () => {
    expect(titleFromText('---\ntitle: 侧栏\n---\n\n# 正文标题\n', '01-file.md')).toBe('侧栏')
    expect(titleFromText('---\ntitle: "怎么写"\n---\n\n# 别的\n', 'a.md')).toBe('怎么写')
    expect(titleFromText('# 正文标题\n', '01-file.md')).toBe('正文标题')
    expect(titleFromText('```\n# 不是标题\n```\n\n# 真标题\n', 'a.md')).toBe('真标题')
    expect(titleFromText('没有标题\n', '01-file.md')).toBe('file')
    expect(titleFromText(undefined, '02_笔记.md')).toBe('笔记')
  })
})

describe('anonymous refresh', () => {
  it('reads the catalog from raw and does not call api.github.com', async () => {
    const urls: string[] = []
    const store = new Map<string, string>()
    const original = globalThis.fetch
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    })
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    })
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      urls.push(url)
      if (url.endsWith('/content/catalog.json')) {
        return new Response(JSON.stringify({ paths: ['content/index.md', 'content/guide/图.png'] }), { status: 200 })
      }
      return new Response('# 首页\n', { status: 200 })
    }) as typeof fetch
    try {
      notes.entries = []
      notes.commitSha = ''
      await refresh(true)
      await new Promise((resolve) => setTimeout(resolve, 30))
      expect(urls.some((url) => url.includes('api.github.com'))).toBe(false)
      expect(urls[0]).toBe('https://raw.githubusercontent.com/SmallBird6/notes/main/content/catalog.json')
      expect(notes.entries.map((entry) => entry.path)).toEqual(['content/guide/图.png', 'content/index.md'])
      expect(notes.commitSha).toBe('main')
      const before = urls.length
      await refresh(false)
      const later = urls.slice(before)
      expect(later.some((url) => url.includes('api.github.com') || url.endsWith('/content/catalog.json'))).toBe(false)
    } finally {
      globalThis.fetch = original
      vi.unstubAllGlobals()
    }
  })
})
