import { reactive } from 'vue'
import { contentDir, githubBranch } from '../config'
import {
  deleteContent,
  explainError,
  fetchAnonymousCatalogText,
  fetchRawText,
  getCatalogBlob,
  getCommitSha,
  getContentTree,
  getFileBlob,
  GitHubError,
  putBytes,
  putCatalog,
  putText,
  verifyToken,
  type TreeEntry,
  type WriteResult,
} from '../github/client'
import { anonymousCatalogDue, CATALOG_PATH, parseCatalog, serializeCatalog } from './catalogFile'
import { fileKind, parentDir, repoPathToRoute } from '../github/paths'
import { frontMatter, type Heading } from './render'
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

const AUTH_REFRESH_MS = 30_000
const ANON_CACHE_KEY = 'notes.catalog'

let lastAuthCheck = 0
let anonCheckedAt = 0
let started = false
let writeChain: Promise<unknown> = Promise.resolve()
let textLoads = 0

function touch(): void {
  notes.revision += 1
}

function cacheKey(sha: string): string {
  return `notes.tree.${sha}`
}

function readAnonCache(): { at: number; paths: string[] } | null {
  try {
    const raw = sessionStorage.getItem(ANON_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { at?: number; paths?: unknown }
    if (!parsed || typeof parsed.at !== 'number' || !Array.isArray(parsed.paths)) return null
    const paths = parsed.paths.filter((item): item is string => typeof item === 'string')
    return { at: parsed.at, paths }
  } catch {
    return null
  }
}

function writeAnonCache(paths: string[], at: number): void {
  try {
    sessionStorage.setItem(ANON_CACHE_KEY, JSON.stringify({ at, paths }))
  } catch {
    /* 缓存写不进去时仍然使用内存目录 */
  }
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
    const matter = frontMatter(text)
    if (matter.fields) {
      const title = /^title:\s*(.+)$/m.exec(matter.fields)
      const value = title ? unquote(title[1].trim()) : ''
      if (value) return value
    }
    let inFence = false
    for (const line of matter.body.split(/\r?\n/)) {
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

function catalogPaths(): string[] {
  return notes.entries.filter((entry) => entry.kind === 'md' || entry.kind === 'image').map((entry) => entry.path)
}

function applyCatalogPaths(paths: string[]): void {
  if (notes.commitSha !== githubBranch) notes.texts = new Map()
  notes.commitSha = githubBranch
  notes.entries = paths.map((path) => ({
    path,
    sha: '',
    size: 0,
    kind: fileKind(path),
  }))
  notes.truncated = false
  notes.error = ''
  touch()
}

async function preloadTexts(ref: string, token?: string): Promise<void> {
  const generation = ++textLoads
  for (const entry of notes.entries) {
    if (generation !== textLoads || notes.commitSha !== ref) return
    if (entry.kind !== 'md' || notes.texts.has(entry.path)) continue
    try {
      const text = await fetchRawText(ref, entry.path, token)
      if (generation !== textLoads || notes.commitSha !== ref) return
      rememberText(entry.path, text)
    } catch (error) {
      if (error instanceof GitHubError && error.status === 404) continue
      return
    }
  }
}

export async function loadText(path: string): Promise<string | null> {
  const cached = notes.texts.get(path)
  if (cached !== undefined && notes.commitSha) return cached
  if (!notes.commitSha) return null
  try {
    const text = await fetchRawText(notes.commitSha, path, readToken() ?? undefined)
    if (notes.commitSha) rememberText(path, text)
    return text
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null
    notes.error = explainError(error)
    return cached ?? null
  }
}

async function refreshAnonymous(force: boolean): Promise<void> {
  const now = Date.now()
  const cached = readAnonCache()
  const lastAt = Math.max(cached?.at ?? 0, anonCheckedAt)
  if (!anonymousCatalogDue(lastAt, now, force)) {
    if (cached && (notes.entries.length === 0 || notes.commitSha !== githubBranch)) {
      applyCatalogPaths(cached.paths)
      void preloadTexts(githubBranch)
    }
    return
  }
  notes.loading = true
  try {
    const text = await fetchAnonymousCatalogText()
    const paths = parseCatalog(text)
    const at = Date.now()
    anonCheckedAt = at
    writeAnonCache(paths, at)
    applyCatalogPaths(paths)
    void preloadTexts(githubBranch)
  } catch (error) {
    anonCheckedAt = Date.now()
    if (error instanceof Error && error.message === '目录清单无法读取') {
      notes.error = '目录清单无法读取'
      return
    }
    if (error instanceof GitHubError && error.status === 404) {
      notes.error = '目录清单不存在'
      return
    }
    notes.error = explainError(error)
  } finally {
    notes.loading = false
  }
}

function rememberCatalog(result: WriteResult): void {
  notes.commitSha = result.commitSha
  const existing = entryByPath(CATALOG_PATH)
  if (existing) existing.sha = result.blobSha
  else {
    notes.entries.push({
      path: CATALOG_PATH,
      sha: result.blobSha,
      size: 0,
      kind: 'other',
    })
  }
  writeCache()
}

async function syncCatalog(token: string): Promise<void> {
  const text = serializeCatalog(catalogPaths())
  let sha = entryByPath(CATALOG_PATH)?.sha
  if (!sha) {
    try {
      const current = await getCatalogBlob(token)
      sha = current.sha
      rememberCatalog({ commitSha: notes.commitSha, path: CATALOG_PATH, blobSha: sha })
    } catch (error) {
      if (!(error instanceof GitHubError) || error.status !== 404) throw error
      sha = undefined
    }
  }
  try {
    const result = await putCatalog(token, text, sha || undefined)
    rememberCatalog(result)
  } catch (error) {
    if (error instanceof GitHubError && error.status === 409) {
      try {
        const fresh = await getCatalogBlob(token)
        rememberCatalog({ commitSha: notes.commitSha, path: CATALOG_PATH, blobSha: fresh.sha })
      } catch {
        /* 保留原来的冲突错误，不自动重试写入 */
      }
    }
    throw error
  }
}

async function refreshAuthenticated(token: string, force: boolean): Promise<void> {
  const now = Date.now()
  if (!force && lastAuthCheck !== 0 && now - lastAuthCheck < AUTH_REFRESH_MS) return
  lastAuthCheck = now
  notes.loading = true
  try {
    const sha = await getCommitSha(token)
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
      void preloadTexts(sha, token)
      return
    }
    if (sha !== notes.commitSha) notes.texts = new Map()
    const tree = await getContentTree(sha, token)
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
    void preloadTexts(sha, token)
  } catch (error) {
    if (shouldDropToken(error)) {
      clearToken()
      notes.tokenOk = false
      await refreshAnonymous(true)
      throw error
    }
    notes.error = explainError(error)
  } finally {
    notes.loading = false
  }
}

export async function refresh(force = false, tokenOverride?: string): Promise<void> {
  const token = tokenOverride ?? readToken()
  if (!token) {
    await refreshAnonymous(force)
    return
  }
  await refreshAuthenticated(token, force)
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
    const result = await enqueueWrite(async () => {
      const written = await putText(token, path, text, entryByPath(path)?.sha)
      applyWrite(written, text, new TextEncoder().encode(text).length)
      await syncCatalog(token)
      return written
    })
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
    const result = await enqueueWrite(async () => {
      const existing = entryByPath(path)
      if (!existing) throw new GitHubError('这篇还不存在', 404)
      const removed = await deleteContent(token, path, existing.sha)
      applyDelete(removed)
      await syncCatalog(token)
      return removed
    })
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
      await syncCatalog(token)
      return result
    }
    const bytes = new Uint8Array(await file.arrayBuffer())
    const result = await putBytes(token, path, bytes, existing?.sha)
    applyWrite(result, undefined, bytes.byteLength)
    await syncCatalog(token)
    return result
  })
}

export async function loginWithToken(token: string): Promise<void> {
  await verifyToken(token)
  await refresh(true, token)
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
  void refresh(true).catch(() => undefined)
  const onFocus = () => {
    void refresh(false)
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') onFocus()
  })
  window.addEventListener('focus', onFocus)
}
