import { describe, expect, it } from 'vitest'
import { fetchAnonymousCatalogText, GitHubError, putCatalog, putText } from './client'

describe('writes stay inside content', () => {
  it('does not send a request for a path outside content', async () => {
    let called = false
    const original = globalThis.fetch
    globalThis.fetch = (() => {
      called = true
      return Promise.reject(new Error('should not fetch'))
    }) as typeof fetch
    await expect(putText('github_pat_test', 'content/../src/main.ts', 'nope')).rejects.toMatchObject({ status: 422 })
    await expect(putText('github_pat_test', 'src/main.ts', 'nope')).rejects.toMatchObject({ status: 422 })
    await expect(putText('github_pat_test', 'content//a.md', 'nope')).rejects.toMatchObject({ status: 422 })
    expect(called).toBe(false)
    globalThis.fetch = original
  })
})

describe('anonymous catalog reads', () => {
  it('fetches the catalog from raw and never calls the REST API', async () => {
    const urls: string[] = []
    const original = globalThis.fetch
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      urls.push(url)
      if (url.includes('api.github.com')) throw new Error('anonymous read used the REST API')
      return new Response(JSON.stringify({ paths: ['content/index.md'] }), { status: 200 })
    }) as typeof fetch
    try {
      await expect(fetchAnonymousCatalogText()).resolves.toContain('content/index.md')
      expect(urls).toEqual(['https://raw.githubusercontent.com/SmallBird6/notes/main/content/catalog.json'])
    } finally {
      globalThis.fetch = original
    }
  })

  it('does not fall back to the REST API when the catalog is missing', async () => {
    const urls: string[] = []
    const original = globalThis.fetch
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      urls.push(String(input))
      return new Response('missing', { status: 404 })
    }) as typeof fetch
    try {
      await expect(fetchAnonymousCatalogText()).rejects.toMatchObject({ status: 404, message: '目录清单不存在' })
      expect(urls.some((url) => url.includes('api.github.com'))).toBe(false)
    } finally {
      globalThis.fetch = original
    }
  })
})

describe('catalog writes', () => {
  it('sends the existing blob sha when updating the catalog', async () => {
    const original = globalThis.fetch
    let body = ''
    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      body = String(init?.body ?? '')
      return new Response(JSON.stringify({ commit: { sha: 'abc' }, content: { sha: 'def' } }), { status: 200 })
    }) as typeof fetch
    try {
      await putCatalog('github_pat_test', '{"paths":[]}\n', 'blob123')
      expect(JSON.parse(body)).toMatchObject({ sha: 'blob123', branch: 'main' })
    } finally {
      globalThis.fetch = original
    }
  })

  it('rejects a catalog larger than 1 MB before sending it', async () => {
    let called = false
    const original = globalThis.fetch
    globalThis.fetch = (() => {
      called = true
      return Promise.reject(new Error('should not fetch'))
    }) as typeof fetch
    const huge = `{"paths":["${'a'.repeat(1024 * 1024)}"]}\n`
    await expect(putCatalog('github_pat_test', huge)).rejects.toBeInstanceOf(GitHubError)
    expect(called).toBe(false)
    globalThis.fetch = original
  })
})
