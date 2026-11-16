import { describe, expect, it } from 'vitest'
import { clipboardImageFiles, pastedImageName } from './pasteImage'

const when = new Date(2026, 10, 16, 1, 44, 55, 7)

describe('pasted images', () => {
  it('names a clipboard image from a short timestamp', () => {
    expect(pastedImageName('image/png', when, new Set())).toBe('20261116-014455007.png')
    expect(pastedImageName('image/jpeg', when, new Set())).toBe('20261116-014455007.jpg')
    expect(pastedImageName('image/gif', when, new Set())).toBe('20261116-014455007.gif')
    expect(pastedImageName('image/webp', when, new Set())).toBe('20261116-014455007.webp')
    expect(pastedImageName('image/bmp', when, new Set())).toBeNull()
  })

  it('adds a suffix when that timestamp is already used', () => {
    const taken = new Set(['20261116-014455007.png'])
    expect(pastedImageName('image/png', when, taken)).toBe('20261116-014455007-2.png')
  })

  it('reads only png, jpeg, gif, and webp files from the clipboard', () => {
    const png = new File([new Uint8Array([1])], 'clip.png', { type: 'image/png' })
    const text = new File(['hello'], 'note.md', { type: 'text/plain' })
    const files = clipboardImageFiles({
      items: [
        { kind: 'string', type: 'text/plain', getAsFile: () => null },
        { kind: 'file', type: 'image/png', getAsFile: () => png },
        { kind: 'file', type: 'text/plain', getAsFile: () => text },
      ],
    })
    expect(files).toEqual([png])
  })
})
