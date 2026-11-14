import { describe, expect, it } from 'vitest'
import { decodeBase64Utf8, encodeBase64Bytes, encodeBase64Utf8 } from './codec'

describe('base64', () => {
  it('encodes UTF-8 text without splitting code points', () => {
    expect(encodeBase64Utf8('中文')).toBe('5Lit5paH')
    expect(decodeBase64Utf8(encodeBase64Utf8('中文🙂'))).toBe('中文🙂')
  })

  it('round-trips chunks larger than one slice', () => {
    const text = 'a'.repeat(40_000) + '中'
    expect(decodeBase64Utf8(encodeBase64Utf8(text))).toBe(text)
  })

  it('encodes raw image bytes', () => {
    const bytes = new Uint8Array([0, 255, 128, 10])
    expect(decodeBase64Utf8(encodeBase64Bytes(bytes))).toBe(new TextDecoder().decode(bytes))
    expect(encodeBase64Bytes(bytes)).toBe(btoa(String.fromCharCode(0, 255, 128, 10)))
  })
})
