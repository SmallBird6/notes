import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { renderMarkdown, resolveWikiTarget } from './render'

const entries = [
  { path: 'content/index.md', kind: 'md' as const },
  { path: 'content/guide/write.md', kind: 'md' as const },
  { path: 'content/guide/示例.md', kind: 'md' as const },
  { path: 'content/extra/示例.md', kind: 'md' as const },
  { path: 'content/guide/图.png', kind: 'image' as const },
  { path: 'content/extra/图.png', kind: 'image' as const },
]

function render(source: string, currentPath = 'content/index.md'): string {
  return renderMarkdown(source, { currentPath, entries, commitSha: 'abc123' }).html
}

describe('wikilinks', () => {
  it('links a unique filename and an alias', () => {
    const html = render('[[write|怎么写]]')
    expect(html).toContain('href="/notes/guide/write"')
    expect(html).toContain('怎么写')
  })

  it('adds the shared slug for a heading', () => {
    const html = render('[[write#安装]]')
    expect(html).toContain('/notes/guide/write#')
    expect(html).toMatch(/安装|%E5%AE%89%E8%A3%85/)
  })

  it('prefers the note in the same directory', () => {
    expect(resolveWikiTarget(entries, '示例', 'content/guide/write.md', 'md')).toEqual({
      status: 'one',
      path: 'content/guide/示例.md',
    })
    expect(render('[[示例]]', 'content/guide/write.md')).toContain('/notes/guide/%E7%A4%BA%E4%BE%8B')
  })

  it('does not invent a link when several notes share a name', () => {
    const html = render('[[示例]]', 'content/index.md')
    expect(html).toContain('有多篇同名笔记')
    expect(html).not.toContain('<a ')
  })

  it('shows a missing name without a link', () => {
    const html = render('[[没有这篇笔记]]')
    expect(html).toContain('没有这篇笔记')
    expect(html).not.toContain('<a ')
  })

  it('embeds the image from the same directory and ignores the width', () => {
    const html = render('![[图.png|200]]', 'content/guide/write.md')
    expect(html).toContain('https://raw.githubusercontent.com/SmallBird6/notes/abc123/content/guide/%E5%9B%BE.png')
    expect(html).not.toContain('content/extra')
    expect(html).not.toContain('width=')
  })
})

describe('markdown rules', () => {
  it('renders callouts as escaped asides', () => {
    const html = render('> [!warning] 小心\n> <script>alert(1)</script>')
    expect(html).toContain('<aside class="callout warning">')
    expect(html).toContain('小心')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('shows raw HTML as text and highlights code', () => {
    const html = render('<b>粗</b>\n\n```ts\nconst a = 1\n```')
    expect(html).toContain('&lt;b&gt;')
    expect(html).not.toContain('<b>')
    expect(html).toContain('language-ts')
    expect(html).toContain('hljs')
  })

  it('renders paired math and leaves currency alone', () => {
    expect(render('能量 $E = mc^2$')).toContain('katex')
    expect(render('价格 $100 元')).not.toContain('katex')
    expect(render('$$\na^2\n$$')).toContain('katex-display')
  })

  it('hides leading YAML front matter without removing a later rule', () => {
    const source = '---\ntitle: 怎么写\n---\n\n# 怎么写\n\n正文\n\n---\n\n下一段\n'
    const html = render(source)
    expect(source.startsWith('---')).toBe(true)
    expect(html).not.toContain('title:')
    expect(html).toContain('<h1')
    expect(html).toContain('怎么写')
    expect(html).toContain('<hr')
    expect(html).toContain('下一段')
  })

  it('renders the Chinese sample articles with the section 8 rules', () => {
    const home = render(readFileSync('content/index.md', 'utf8'), 'content/index.md')
    const write = render(readFileSync('content/guide/write.md', 'utf8'), 'content/guide/write.md')
    expect(home).not.toContain('title:')
    expect(write).not.toContain('title:')
    expect(home).toContain('class="callout tip"')
    expect(home).toContain('有多篇同名笔记')
    expect(home).toContain('katex')
    expect(home).toContain('language-ts')
    expect(home).toContain('language-mermaid')
    expect(home).toContain('&lt;script&gt;')
    expect(home).not.toContain('<script>')
    expect(write).toContain('class="callout warning"')
    expect(write).toContain('content/../src/main.ts')
    expect(write).not.toContain('CODE')
    expect(write).toContain('https://raw.githubusercontent.com/SmallBird6/notes/abc123/content/guide/%E5%9B%BE.png')
    expect(write).toContain('/notes/guide/%E7%A4%BA%E4%BE%8B')
    expect(write).toContain('没有这篇笔记')
    expect(write).not.toContain('<a href="javascript:')
    expect(write).toContain('登录')
  })

  it('drops javascript links', () => {
    const html = render('[脚本](javascript:alert(1))')
    expect(html).toContain('脚本')
    expect(html).not.toContain('<a')
    expect(html).not.toContain('href="javascript:')
  })
})
