import { describe, expect, it } from 'vitest'
import { slugify } from './slug'

describe('slugify', () => {
  it('trims, lowercases, and turns spaces into hyphens', () => {
    expect(slugify('  Hello   World  ')).toBe('hello-world')
  })

  it('keeps letters, numbers, hyphens, and underscores', () => {
    expect(slugify('安装')).toBe('安装')
    expect(slugify('A_B-C')).toBe('a_b-c')
    expect(slugify('Hello, 世界!')).toBe('hello-世界')
  })
})
