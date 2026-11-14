import { describe, expect, it } from 'vitest'
import { contentDir, githubBranch, githubOwner, githubRepo } from './config'

describe('build config', () => {
  it('reads the public repository settings', () => {
    expect(githubOwner).toBe('SmallBird6')
    expect(githubRepo).toBe('notes')
    expect(githubBranch).toBe('main')
    expect(contentDir).toBe('content')
  })
})
