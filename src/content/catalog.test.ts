import { describe, expect, it } from 'vitest'
import { titleFromText } from './catalog'

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
