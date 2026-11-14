import { describe, expect, it } from 'vitest'
import { putText } from './client'

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
