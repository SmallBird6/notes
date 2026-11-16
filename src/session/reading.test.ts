import { describe, expect, it } from 'vitest'
import {
  clampArticleWidth,
  clampBodyFontSize,
  DEFAULT_ARTICLE_WIDTH,
  DEFAULT_BODY_FONT_SIZE,
  MAX_ARTICLE_WIDTH,
  MAX_BODY_FONT_SIZE,
  MIN_ARTICLE_WIDTH,
  MIN_BODY_FONT_SIZE,
} from './reading'

describe('reading preferences', () => {
  it('keeps the article column inside its limits', () => {
    expect(clampArticleWidth(Number.NaN)).toBe(DEFAULT_ARTICLE_WIDTH)
    expect(clampArticleWidth(100)).toBe(MIN_ARTICLE_WIDTH)
    expect(clampArticleWidth(4000)).toBe(MAX_ARTICLE_WIDTH)
    expect(clampArticleWidth(1000, 800)).toBe(800)
    expect(clampArticleWidth(700.4)).toBe(700)
  })

  it('keeps the body font size inside its limits', () => {
    expect(clampBodyFontSize(Number.NaN)).toBe(DEFAULT_BODY_FONT_SIZE)
    expect(clampBodyFontSize(8)).toBe(MIN_BODY_FONT_SIZE)
    expect(clampBodyFontSize(40)).toBe(MAX_BODY_FONT_SIZE)
    expect(clampBodyFontSize(18.6)).toBe(19)
  })
})
