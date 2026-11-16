import { describe, expect, it } from 'vitest'
import { ANON_CATALOG_MS, anonymousCatalogDue, parseCatalog, serializeCatalog } from './catalogFile'

describe('content catalog', () => {
  it('lists markdown and image paths in a stable order', () => {
    const text = serializeCatalog([
      'content/index.md',
      'content/guide/图.png',
      'content/guide/write.md',
      'content/catalog.json',
      'content/../src/main.ts',
      'src/main.ts',
    ])
    expect(JSON.parse(text)).toEqual({
      paths: ['content/guide/图.png', 'content/guide/write.md', 'content/index.md'],
    })
  })

  it('rejects a catalog that is not a path list', () => {
    expect(() => parseCatalog('{')).toThrow('目录清单无法读取')
    expect(() => parseCatalog('{"files":[]}')).toThrow('目录清单无法读取')
  })

  it('refetches an anonymous catalog at most every 10 minutes unless forced', () => {
    const now = 1_000_000
    expect(anonymousCatalogDue(0, now, false)).toBe(true)
    expect(anonymousCatalogDue(now - 60_000, now, false)).toBe(false)
    expect(anonymousCatalogDue(now - ANON_CATALOG_MS, now, false)).toBe(true)
    expect(anonymousCatalogDue(now - 1_000, now, true)).toBe(true)
  })
})
