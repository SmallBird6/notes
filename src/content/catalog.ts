import { reactive } from 'vue'
import { contentDir } from '../config'
import {
  deleteContent,
  explainError,
  fetchRawText,
  getCommitSha,
  getContentTree,
  getFileBlob,
  GitHubError,
  isRawBlocked,
  putBytes,
  putText,
  verifyToken,
  type TreeEntry,
  type WriteResult,
} from '../github/client'
import { fileKind, parentDir, repoPathToRoute } from '../github/paths'
import type { Heading } from './render'
import { clearToken, readToken } from '../session/token'

export type { TreeEntry, WriteResult }

export type TreeNode = {
  kind: 'dir' | 'md'
  name: string
  title: string
  path?: string
  route?: string
  children: TreeNode[]
}

export type SearchHit = {
  path: string
  route: string
  title: string
  line: string
}

type NoteState = {
  commitSha: string
  entries: TreeEntry[]
  texts: Map<string, string>
  revision: number
  truncated: boolean
  loading: boolean
  saving: boolean
  tokenOk: boolean
  error: string
  currentPath: string
  headings: Heading[]
}

export const notes = reactive<NoteState>({
  commitSha: '',
  entries: [],
  texts: new Map(),
  revision: 0,
  truncated: false,
  loading: false,
  saving: false,
  tokenOk: false,
  error: '',
  currentPath: `${contentDir}/index.md`,
  headings: [],
})

let lastCommitCheck = 0
let started = false
let writeChain: Promise<unknown> = Promise.resolve()
let textLoads = 0

function touch(): void {
  notes.revision += 1
}

function cacheKey(sha: string): string {
  return `notes.tree.${sha}`
}

function readCache(sha: string): TreeEntry[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(sha))
    if (!raw) return null
    const parsed = JSON.parse(raw) as TreeEntry[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeCache(): void {
  if (!notes.commitSha) return
  try {
    sessionStorage.setItem(cacheKey(notes.commitSha), JSON.stringify(notes.entries))
  } catch {
    /* 缓存写不进去时仍然使用内存目录 */
  }
}

export function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task)
  writeChain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

export function entryByPath(path: string): TreeEntry | undefined {
  return notes.entries.find((entry) => entry.path === path)
}

export function filenameTitle(filename: string): string {
  const base = filename.replace(/\.md$/i, '')
  return base.replace(/^\d+[.\-_\s]+/, '') || base
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

export function titleFromText(text: string | undefined, filename: string): string {
  if (text) {
    const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
    if (front) {
      const title = /^title:\s*(.+)$/m.exec(front[1])
      if (title) return unquote(title[1].trim())
    }
    let inFence = false
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith('```')) {
        inFence = !inFence
        continue
      }
      if (inFence) continue
      const heading = /^#\s+(.+?)\s*$/.exec(line)
      if (heading) return heading[1].trim()
    }
  }
  return filenameTitle(filename)
}

export function titleFor(path: string): string {
  return titleFromText(notes.texts.get(path), path.split('/').pop() ?? path)
}

function compareNames(a: string, b: string): number {
  return a.localeCompare(b, 'zh', { numeric: true, sensitivity: 'base' })
}

export function buildTree(entries: TreeEntry[], texts: Map<string, string>): TreeNode[] {
  const root: TreeNode[] = []
  const dirs = new Map<string, TreeNode>()

  const ensureDir = (dirPath: string): TreeNode[] => {
    if (dirPath === contentDir) return root
    const existing = dirs.get(dirPath)
    if (existing) return existing.children
    const parent = dirPath.slice(0, dirPath.lastIndexOf('/'))
    const siblings = ensureDir(parent)
    const node: TreeNode = {
      kind: 'dir',
      name: dirPath.split('/').pop() ?? dirPath,
      title: dirPath.split('/').pop() ?? dirPath,
      children: [],
    }
    siblings.push(node)
    dirs.set(dirPath, node)
    return node.children
  }

  for (const entry of entries) {
    if (entry.kind !== 'md') continue
    const parent = parentDir(entry.path)
    const siblings = ensureDir(parent)
    const name = entry.path.split('/').pop() ?? entry.path
    siblings.push({
      kind: 'md',
      name,
      title: titleFromText(texts.get(entry.path), name),
      path: entry.path,
      route: repoPathToRoute(entry.path),
      children: [],
    })
  }

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      const aIndex = a.kind === 'md' && a.name.toLowerCase() === 'index.md'
      const bIndex = b.kind === 'md' && b.name.toLowerCase() === 'index.md'
      if (aIndex !== bIndex) return aIndex ? -1 : 1
      if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1
      return compareNames(a.name, b.name)
    })
    for (const node of nodes) {
      if (node.kind === 'dir') sortNodes(node.children)
    }
  }
  sortNodes(root)
  return root
}

export function flattenArticles(nodes: TreeNode[]): TreeNode[] {
  const articles: TreeNode[] = []
  const walk = (list: TreeNode[]) => {
    for (const node of list) {
      if (node.kind === 'dir') walk(node.children)
      else articles.push(node)
    }
  }
  walk(nodes)
  return articles
}

export function searchNotes(query: string): SearchHit[] {
  const needle = query.trim().toLocaleLowerCase('zh')
  if (!needle) return []
  const articles = flattenArticles(buildTree(notes.entries, notes.texts))
  const hits: SearchHit[] = []
  for (const article of articles) {
    if (!article.path || !article.route) continue
    const text = notes.texts.get(article.path)
    const title = article.title
    const loweredTitle = title.toLocaleLowerCase('zh')
    const loweredPath = article.path.toLocaleLowerCase('zh')
    let line = ''
    let matched = false
    if (text) {
      const found = text.split(/\r?\n/).find((row) => row.toLocaleLowerCase('zh').includes(needle))
      if (found) {
        matched = true
        line = found.trim()
      }
    }
    if (!matched && loweredTitle.includes(needle)) {
      matched = true
      line = title
    }
    if (!matched && loweredPath.includes(needle)) {
      matched = true
      line = article.path
    }
    if (!matched) continue
    hits.push({ path: article.path, route: article.route, title, line })
    if (hits.length >= 20) break
  }
  return hits
}

function rememberText(path: string, text: string): void {
  notes.texts.set(path, text)
  touch()
}

async function preloadTexts(sha: string): Promise<void> {
  const generation = ++textLoads
  for (const entry of notes.entries) {
    if (generation !== textLoads || notes.commitSha !== sha) return
    if (entry.kind !== 'md' || notes.texts.has(entry.path)) continue
    if (isRawBlocked()) return
    try {
      const text = await fetchRawText(sha, entry.path)
      if (generation !== textLoads || notes.commitSha !== sha) return
      rememberText(entry.path, text)
    } catch (error) {
      if (error instanceof GitHubError && error.status === 404) continue
      if (isRawBlocked()) return
    }
  }
}

export async function loadText(path: string): Promise<string | null> {
  const cached = notes.texts.get(path)
  if (cached !== undefined && notes.commitSha) return cached
  if (!notes.commitSha) return null
  try {
    const text = await fetchRawText(notes.commitSha, path)
    if (notes.commitSha) rememberText(path, text)
    return text
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null
    notes.error = explainError(error)
    return cached ?? null
  }
}

export async function refresh(force = false): Promise<void> {
  const now = Date.now()
  if (!force && lastCommitCheck !== 0 && now - lastCommitCheck < 30_000) return
  lastCommitCheck = now
  notes.loading = true
  try {
    const sha = await getCommitSha()
    if (sha === notes.commitSha && notes.entries.length > 0 && !notes.truncated) {
      notes.error = ''
      return
    }
    const cached = readCache(sha)
    if (cached) {
      if (sha !== notes.commitSha) notes.texts = new Map()
      notes.commitSha = sha
      notes.entries = cached
      notes.truncated = false
      notes.error = ''
      touch()
      void preloadTexts(sha)
      return
    }
    if (sha !== notes.commitSha) notes.texts = new Map()
    const tree = await getContentTree(sha)
    if (tree.truncated) {
      notes.truncated = true
      notes.entries = []
      notes.error = '仓库文件过多，本次无法列全'
      touch()
      return
    }
    notes.commitSha = sha
    notes.entries = tree.entries
    notes.truncated = false
    notes.error = ''
    writeCache()
    touch()
    void preloadTexts(sha)
  } catch (error) {
    notes.error = explainError(error)
  } finally {
    notes.loading = false
  }
}

export function applyWrite(result: WriteResult, text?: string, byteLength?: number): void {
  notes.commitSha = result.commitSha
  const existing = entryByPath(result.path)
  if (existing) {
    existing.sha = result.blobSha
    if (byteLength !== undefined) existing.size = byteLength
  } else {
    notes.entries.push({
      path: result.path,
      sha: result.blobSha,
      size: byteLength ?? (text ? new TextEncoder().encode(text).length : 0),
      kind: fileKind(result.path),
    })
  }
  if (text !== undefined) notes.texts.set(result.path, text)
  writeCache()
  touch()
}

export function applyDelete(result: WriteResult): void {
  notes.commitSha = result.commitSha
  notes.entries = notes.entries.filter((entry) => entry.path !== result.path)
  notes.texts.delete(result.path)
  writeCache()
  touch()
}

export async function saveText(path: string, text: string): Promise<WriteResult> {
  const token = readToken()
  if (!token) throw new GitHubError('需要登录', 401)
  notes.saving = true
  try {
    const result = await enqueueWrite(() => putText(token, path, text, entryByPath(path)?.sha))
    applyWrite(result, text, new TextEncoder().encode(text).length)
    notes.error = ''
    return result
  } catch (error) {
    if (shouldDropToken(error)) {
      clearToken()
      notes.tokenOk = false
    }
    throw error
  } finally {
    notes.saving = false
  }
}

function shouldDropToken(error: unknown): boolean {
  return error instanceof GitHubError && !error.rateLimitReset && (error.status === 401 || error.status === 403)
}

export async function reloadConflict(path: string): Promise<void> {
  const token = readToken()
  if (!token) return
  const fresh = await getFileBlob(token, path)
  const existing = entryByPath(path)
  if (existing) existing.sha = fresh.sha
  else {
    notes.entries.push({
      path,
      sha: fresh.sha,
      size: new TextEncoder().encode(fresh.text).length,
      kind: fileKind(path),
    })
  }
  rememberText(path, fresh.text)
  writeCache()
}

export async function removePath(path: string): Promise<WriteResult> {
  const token = readToken()
  if (!token) throw new GitHubError('需要登录', 401)
  if (!entryByPath(path)) throw new GitHubError('这篇还不存在', 404)
  notes.saving = true
  try {
    const result = await enqueueWrite(() => {
      const existing = entryByPath(path)
      if (!existing) throw new GitHubError('这篇还不存在', 404)
      return deleteContent(token, path, existing.sha)
    })
    applyDelete(result)
    notes.error = ''
    return result
  } catch (error) {
    if (shouldDropToken(error)) {
      clearToken()
      notes.tokenOk = false
    }
    throw error
  } finally {
    notes.saving = false
  }
}

export async function uploadFile(path: string, file: File): Promise<WriteResult> {
  const token = readToken()
  if (!token) throw new GitHubError('需要登录', 401)
  const kind = fileKind(path)
  return enqueueWrite(async () => {
    const existing = entryByPath(path)
    if (kind === 'md') {
      const text = await file.text()
      const result = await putText(token, path, text, existing?.sha)
      applyWrite(result, text, new TextEncoder().encode(text).length)
      return result
    }
    const bytes = new Uint8Array(await file.arrayBuffer())
    const result = await putBytes(token, path, bytes, existing?.sha)
    applyWrite(result, undefined, bytes.byteLength)
    return result
  })
}

export async function loginWithToken(token: string): Promise<void> {
  await verifyToken(token)
  notes.tokenOk = true
}

export function markLoggedOut(): void {
  notes.tokenOk = false
}

export function setCurrentPath(path: string): void {
  notes.currentPath = path
}

export function useNotes(): NoteState {
  return notes
}

export function startNotes(): void {
  if (started || typeof window === 'undefined') return
  started = true
  const saved = readToken()
  if (saved) {
    void verifyToken(saved)
      .then(() => {
        notes.tokenOk = true
      })
      .catch((error: unknown) => {
        if (shouldDropToken(error)) {
          clearToken()
          notes.tokenOk = false
        }
      })
  }
  void refresh(true)
  const onFocus = () => {
    void refresh(false)
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') onFocus()
  })
  window.addEventListener('focus', onFocus)
}
