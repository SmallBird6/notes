import { describe, expect, it } from 'vitest'
import { contentDir } from '../config'
import { editRouteToRepoPath, encodeGitHubPath, isWritablePath, repoPathToRoute, routeCandidates, writablePath } from './paths'

describe('writable paths', () => {
  it('allows markdown and images under content', () => {
    expect(contentDir).toBe('content')
    expect(isWritablePath('content/guide/write.md')).toBe(true)
    expect(isWritablePath('content/guide/图.png')).toBe(true)
    expect(writablePath('content/caf\u0065\u0301.md')).toBe('content/caf\u00e9.md')
  })

  it('rejects traversal, empty segments, and files outside content', () => {
    expect(isWritablePath('content/../src/main.ts')).toBe(false)
    expect(isWritablePath('src/main.ts')).toBe(false)
    expect(isWritablePath('content//a.md')).toBe(false)
    expect(isWritablePath('content/./a.md')).toBe(false)
    expect(isWritablePath('content\\a.md')).toBe(false)
    expect(isWritablePath(' content/a.md')).toBe(false)
    expect(isWritablePath('content/a.md ')).toBe(false)
    expect(isWritablePath('content/a.txt')).toBe(false)
  })
})

describe('route mapping', () => {
  it('maps repository paths and edit routes', () => {
    expect(repoPathToRoute('content/index.md')).toBe('/')
    expect(repoPathToRoute('content/guide/index.md')).toBe('/guide')
    expect(repoPathToRoute('content/guide/write.md')).toBe('/guide/write')
    expect(routeCandidates('/guide')).toEqual(['content/guide.md', 'content/guide/index.md'])
    expect(editRouteToRepoPath('/edit')).toBe('content/index.md')
    expect(editRouteToRepoPath('/edit/guide/write')).toBe('content/guide/write.md')
  })

  it('encodes path segments and keeps slashes', () => {
    expect(encodeGitHubPath('content/指南/开始.md')).toBe('content/%E6%8C%87%E5%8D%97/%E5%BC%80%E5%A7%8B.md')
  })
})
