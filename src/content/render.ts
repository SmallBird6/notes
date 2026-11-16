import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdownLang from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import katex from 'katex'
import { rawFileUrl, type TreeEntry } from '../github/client'
import { repoPathToRoute, routeHref } from '../github/paths'
import { slugify } from './slug'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('go', go)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdownLang)
hljs.registerLanguage('python', python)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yaml)

const CALLOUT_TYPES = ['note', 'tip', 'info', 'warning', 'caution', 'danger', 'important'] as const
type CalloutType = (typeof CALLOUT_TYPES)[number]

const CALLOUT_TITLES: Record<CalloutType, string> = {
  note: '笔记',
  tip: '提示',
  info: '信息',
  warning: '警告',
  caution: '注意',
  danger: '危险',
  important: '重要',
}

export type Heading = { level: number; text: string; slug: string }

/** Leading YAML block only. The saved note is left unchanged. */
export function frontMatter(source: string): { body: string; fields: string | null } {
  const match = /^(?:\uFEFF)?---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*\r?\n?/.exec(source)
  if (!match) return { body: source, fields: null }
  return { body: source.slice(match[0].length), fields: match[1] }
}

export type RenderContext = {
  currentPath: string
  entries: Pick<TreeEntry, 'path' | 'kind'>[]
  commitSha: string
}

export type WikiMatch =
  | { status: 'one'; path: string }
  | { status: 'ambiguous' }
  | { status: 'missing' }

function safeLink(url: string): boolean {
  const value = url.trim()
  if (!value || value.startsWith('//')) return false
  if (value.startsWith('#') || value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) return true
  const match = /^([a-z][a-z0-9+.-]*):/i.exec(value)
  if (!match) return true
  const protocol = match[1].toLowerCase()
  return protocol === 'http' || protocol === 'https'
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
    return ''
  },
})

markdown.validateLink = safeLink
markdown.use(markdownItAnchor, { slugify, tabIndex: false })

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeMarkdownText(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+\-.!|])/g, '\\$1')
}

function directoryOf(path: string): string {
  const index = path.lastIndexOf('/')
  return index === -1 ? '' : path.slice(0, index)
}

function baseName(path: string): string {
  return path.split('/').pop() ?? path
}

export function resolveWikiTarget(
  entries: Pick<TreeEntry, 'path' | 'kind'>[],
  name: string,
  currentPath: string,
  kind: 'md' | 'image',
): WikiMatch {
  const target = name.trim()
  const matches = entries.filter((entry) => entry.kind === kind && nameMatches(entry.path, target, kind))
  if (matches.length === 0) return { status: 'missing' }
  if (matches.length === 1) return { status: 'one', path: matches[0].path }
  const sameDir = matches.filter((entry) => directoryOf(entry.path) === directoryOf(currentPath))
  if (sameDir.length === 1) return { status: 'one', path: sameDir[0].path }
  return { status: 'ambiguous' }
}

function nameMatches(path: string, name: string, kind: 'md' | 'image'): boolean {
  const file = baseName(path)
  if (kind === 'image') return file === name || file === baseName(name)
  const stem = file.replace(/\.md$/i, '')
  if (!name.includes('/')) return stem === name || file === name
  const wanted = name.replace(/\.md$/i, '')
  const relative = path.slice(path.indexOf('/') + 1).replace(/\.md$/i, '')
  return relative === wanted || path.endsWith(`/${name}`) || path.endsWith(`/${name}.md`)
}

function splitWiki(inner: string): { target: string; alias?: string; heading?: string } {
  let body = inner.trim()
  let alias: string | undefined
  const pipe = body.indexOf('|')
  if (pipe >= 0) {
    alias = body.slice(pipe + 1).trim()
    body = body.slice(0, pipe).trim()
  }
  const hash = body.indexOf('#')
  let heading: string | undefined
  if (hash >= 0) {
    heading = body.slice(hash + 1).trim()
    body = body.slice(0, hash).trim()
  }
  return { target: body, alias, heading }
}

function maskCode(source: string): { text: string; blocks: string[] } {
  const blocks: string[] = []
  const text = source
    .replace(/```[\s\S]*?```/g, (block) => {
      const index = blocks.push(block) - 1
      return `\uE000CODE${index}\uE000`
    })
    .replace(/`[^`\n]+`/g, (block) => {
      const index = blocks.push(block) - 1
      return `\uE000CODE${index}\uE000`
    })
  return { text, blocks }
}

function unmaskCode(text: string, blocks: string[]): string {
  return text.replace(/\uE000CODE(\d+)\uE000/g, (_, index: string) => blocks[Number(index)] ?? '')
}

function replaceImages(source: string, context: RenderContext): string {
  return source.replace(/!\[\[([^\]\n]+)\]\]/g, (raw, inner: string) => {
    const { target } = splitWiki(inner)
    const match = resolveWikiTarget(context.entries, target, context.currentPath, 'image')
    if (match.status !== 'one' || !context.commitSha) return escapeMarkdownText(raw)
    const alt = escapeMarkdownText(baseName(match.path))
    return `![${alt}](${rawFileUrl(context.commitSha, match.path)})`
  })
}

function replaceWikilinks(source: string, context: RenderContext): string {
  return source.replace(/\[\[([^\]\n]+)\]\]/g, (raw, inner: string) => {
    const { target, alias, heading } = splitWiki(inner)
    const label = alias || target || raw
    const match = resolveWikiTarget(context.entries, target, context.currentPath, 'md')
    if (match.status === 'ambiguous') return escapeMarkdownText(`${label}（有多篇同名笔记）`)
    if (match.status === 'missing') return escapeMarkdownText(label)
    const href = routeHref(repoPathToRoute(match.path), heading ? slugify(heading) : undefined)
    return `[${escapeMarkdownText(label)}](${href})`
  })
}

function replaceCallouts(source: string, htmlBlocks: string[], codeBlocks: string[]): string {
  const lines = source.split('\n')
  const output: string[] = []
  let index = 0
  while (index < lines.length) {
    if (!lines[index].startsWith('>')) {
      output.push(lines[index])
      index += 1
      continue
    }
    const block: string[] = []
    while (index < lines.length && lines[index].startsWith('>')) {
      block.push(lines[index])
      index += 1
    }
    const first = block[0].replace(/^>\s?/, '')
    const match = /^\[!(note|tip|info|warning|caution|danger|important)\][+-]?\s*(.*)$/i.exec(first)
    if (!match) {
      output.push(...block)
      continue
    }
    const type = match[1].toLowerCase() as CalloutType
    const title = unmaskCode(match[2].trim() || CALLOUT_TITLES[type], codeBlocks)
    const body = unmaskCode(block.slice(1).map((line) => line.replace(/^>\s?/, '')).join('\n'), codeBlocks)
    const id = htmlBlocks.push(renderCallout(type, title, body)) - 1
    output.push('', `@@CALLOUT${id}@@`, '')
  }
  return output.join('\n')
}

function renderCallout(type: CalloutType, title: string, body: string): string {
  const titleHtml = escapeHtml(title)
  const bodyHtml = escapeHtml(body).replace(/\n/g, '<br>')
  return `<aside class="callout ${type}"><p class="callout-title">${titleHtml}</p><div class="callout-body">${bodyHtml}</div></aside>`
}

type MathBlock = { tex: string; display: boolean }

function replaceMath(source: string, blocks: MathBlock[]): string {
  const withoutDisplay = source.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) => {
    const id = blocks.push({ tex: tex.trim(), display: true }) - 1
    return `\n\n@@MATH${id}@@\n\n`
  })
  let output = ''
  for (let index = 0; index < withoutDisplay.length; index += 1) {
    if (withoutDisplay[index] !== '$') {
      output += withoutDisplay[index]
      continue
    }
    const next = withoutDisplay[index + 1]
    if (next === undefined || /\s/.test(next) || next === '$') {
      output += '$'
      continue
    }
    let closer = -1
    for (let cursor = index + 2; cursor < withoutDisplay.length; cursor += 1) {
      if (withoutDisplay[cursor] === '\n') break
      if (withoutDisplay[cursor] === '$') {
        if (!/\s/.test(withoutDisplay[cursor - 1])) closer = cursor
        break
      }
    }
    if (closer === -1) {
      output += '$'
      continue
    }
    const tex = withoutDisplay.slice(index + 1, closer)
    const id = blocks.push({ tex, display: false }) - 1
    output += `@@MATH${id}@@`
    index = closer
  }
  return output
}

function renderMath(block: MathBlock): string {
  try {
    return katex.renderToString(block.tex, { displayMode: block.display, throwOnError: false, trust: false })
  } catch {
    return `<code>${escapeHtml(block.tex)}</code>`
  }
}

function applyHtmlSlots(html: string, callouts: string[], maths: MathBlock[]): string {
  let output = html.replace(/<p>@@CALLOUT(\d+)@@<\/p>/g, (_, id: string) => callouts[Number(id)] ?? '')
  output = output.replace(/@@CALLOUT(\d+)@@/g, (_, id: string) => callouts[Number(id)] ?? '')
  output = output.replace(/<p>@@MATH(\d+)@@<\/p>/g, (_, id: string) => renderMath(maths[Number(id)]))
  output = output.replace(/@@MATH(\d+)@@/g, (_, id: string) => renderMath(maths[Number(id)]))
  return output
}

export function renderMarkdown(source: string, context: RenderContext): { html: string; headings: Heading[] } {
  const masked = maskCode(frontMatter(source).body)
  const callouts: string[] = []
  const maths: MathBlock[] = []
  const processed = unmaskCode(
    replaceMath(replaceCallouts(replaceWikilinks(replaceImages(masked.text, context), context), callouts, masked.blocks), maths),
    masked.blocks,
  )
  const tokens = markdown.parse(processed, {})
  const headings: Heading[] = []
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (token.type !== 'heading_open') continue
    const inline = tokens[index + 1]
    const text = inline && inline.type === 'inline' ? inline.content : ''
    const slug = token.attrGet('id') || slugify(text)
    headings.push({ level: Number(token.tag.slice(1)), text, slug })
  }
  return { html: applyHtmlSlots(markdown.renderer.render(tokens, markdown.options, {}), callouts, maths), headings }
}

export function isCalloutType(value: string): value is CalloutType {
  return (CALLOUT_TYPES as readonly string[]).includes(value)
}
