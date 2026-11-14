import { contentDir, githubBranch, githubOwner, githubRepo, MAX_FILE_BYTES } from '../config'
import { decodeBase64Utf8, encodeBase64Bytes, encodeBase64Utf8 } from './codec'
import { encodeGitHubPath, fileKind, writablePath } from './paths'

const API = 'https://api.github.com'
const API_VERSION = '2026-03-10'

export type TreeEntry = {
  path: string
  sha: string
  size: number
  kind: 'md' | 'image' | 'other'
}

export type WriteResult = {
  commitSha: string
  path: string
  blobSha: string
}

export class GitHubError extends Error {
  readonly status: number
  readonly rateLimitReset?: number

  constructor(message: string, status: number, rateLimitReset?: number) {
    super(message)
    this.name = 'GitHubError'
    this.status = status
    this.rateLimitReset = rateLimitReset
  }
}

let rawMode: 'unknown' | 'ok' | 'blocked' = 'unknown'

export function isRawBlocked(): boolean {
  return rawMode === 'blocked'
}

export function rawFileUrl(commitSha: string, path: string): string {
  return `https://raw.githubusercontent.com/${githubOwner}/${githubRepo}/${commitSha}/${encodeGitHubPath(path)}`
}

function restHeaders(token?: string, accept = 'application/vnd.github+json'): Headers {
  const headers = new Headers({
    Accept: accept,
    'X-GitHub-Api-Version': API_VERSION,
  })
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return headers
}

async function fail(response: Response): Promise<GitHubError> {
  let message = response.statusText || 'GitHub 请求失败'
  try {
    const data = (await response.json()) as { message?: string }
    if (data.message) message = data.message
  } catch {
    /* 非 JSON 错误体 */
  }
  const remaining = response.headers.get('x-ratelimit-remaining')
  const resetHeader = response.headers.get('x-ratelimit-reset')
  const reset = resetHeader ? Number(resetHeader) : undefined
  const limited = remaining === '0' || /rate limit/i.test(message)
  return new GitHubError(message, response.status, limited ? reset : undefined)
}

async function request(url: string, init: RequestInit): Promise<Response> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch {
    throw new GitHubError('网络失败', 0)
  }
  if (!response.ok) throw await fail(response)
  return response
}

export function explainError(error: unknown): string {
  if (error instanceof GitHubError) {
    if (error.rateLimitReset && (error.status === 403 || error.status === 429)) {
      const when = new Date(error.rateLimitReset * 1000).toLocaleString('zh-CN')
      return `接口额度已用尽，请在 ${when} 后再试`
    }
    if (error.status === 401) return '令牌无效或已撤销，需要重新登录'
    if (error.status === 403) return '令牌不能修改这个仓库'
    if (error.status === 404) return '这篇还不存在'
    if (error.status === 409) return '文件刚刚被改过。已重新拉取最新内容，编辑器里未保存的文字已保留，请再次保存'
    if (error.status === 422) return '路径不合法或内容超过限制'
  }
  return '网络失败，目录保持上次成功的快照'
}

export async function getCommitSha(): Promise<string> {
  const response = await request(
    `${API}/repos/${githubOwner}/${githubRepo}/commits/${encodeURIComponent(githubBranch)}`,
    { headers: restHeaders() },
  )
  const data = (await response.json()) as { sha?: string }
  if (!data.sha) throw new GitHubError('没有提交号', 404)
  return data.sha
}

type GitTreeResponse = {
  truncated?: boolean
  tree?: { path?: string; type?: string; sha?: string; size?: number }[]
}

export async function getContentTree(commitSha: string): Promise<{ entries: TreeEntry[]; truncated: boolean }> {
  const response = await request(
    `${API}/repos/${githubOwner}/${githubRepo}/git/trees/${commitSha}?recursive=1`,
    { headers: restHeaders() },
  )
  const data = (await response.json()) as GitTreeResponse
  if (data.truncated) return { entries: [], truncated: true }
  const prefix = `${contentDir}/`
  const entries: TreeEntry[] = []
  for (const item of data.tree ?? []) {
    if (item.type !== 'blob' || !item.path || !item.sha) continue
    if (!item.path.startsWith(prefix)) continue
    if (item.path.split('/').some((segment) => segment.startsWith('.'))) continue
    entries.push({
      path: item.path,
      sha: item.sha,
      size: item.size ?? 0,
      kind: fileKind(item.path),
    })
  }
  return { entries, truncated: false }
}

export async function fetchRawText(commitSha: string, path: string): Promise<string> {
  if (rawMode !== 'blocked') {
    try {
      const response = await fetch(rawFileUrl(commitSha, path))
      if (response.ok) {
        rawMode = 'ok'
        return await response.text()
      }
      if (response.status === 404) throw new GitHubError('这篇还不存在', 404)
      throw new GitHubError('读取正文失败', response.status)
    } catch (error) {
      if (error instanceof GitHubError) throw error
      rawMode = 'blocked'
    }
  }
  const response = await request(
    `${API}/repos/${githubOwner}/${githubRepo}/contents/${encodeGitHubPath(path)}?ref=${encodeURIComponent(commitSha)}`,
    { headers: restHeaders(undefined, 'application/vnd.github.raw') },
  )
  return response.text()
}

export async function verifyToken(token: string): Promise<void> {
  const response = await request(`${API}/repos/${githubOwner}/${githubRepo}`, { headers: restHeaders(token) })
  const data = (await response.json()) as { permissions?: { push?: boolean } }
  if (data.permissions?.push !== true) {
    throw new GitHubError('这个令牌不能改文件', 403)
  }
}

type ContentResponse = {
  content?: { sha?: string } | null
  commit?: { sha?: string }
  sha?: string
  encoding?: string
}

function assertBytes(byteLength: number): void {
  if (byteLength > MAX_FILE_BYTES) {
    throw new GitHubError('内容超过限制', 422)
  }
}

function assertPath(path: string): string {
  const canonical = writablePath(path)
  if (!canonical) throw new GitHubError('路径不合法', 422)
  return canonical
}

export async function putContent(
  token: string,
  path: string,
  contentBase64: string,
  byteLength: number,
  blobSha?: string,
): Promise<WriteResult> {
  const canonical = assertPath(path)
  assertBytes(byteLength)
  const body: Record<string, string> = {
    message: `${blobSha ? '更新' : '新增'} ${canonical}`,
    content: contentBase64,
    branch: githubBranch,
  }
  if (blobSha) body.sha = blobSha
  const response = await request(`${API}/repos/${githubOwner}/${githubRepo}/contents/${encodeGitHubPath(canonical)}`, {
    method: 'PUT',
    headers: restHeaders(token),
    body: JSON.stringify(body),
  })
  const data = (await response.json()) as ContentResponse
  const commitSha = data.commit?.sha
  const nextBlob = data.content?.sha
  if (!commitSha || !nextBlob) throw new GitHubError('写入响应不完整', 502)
  return { commitSha, path: canonical, blobSha: nextBlob }
}

export async function putText(token: string, path: string, text: string, blobSha?: string): Promise<WriteResult> {
  const bytes = new TextEncoder().encode(text)
  return putContent(token, path, encodeBase64Utf8(text), bytes.byteLength, blobSha)
}

export async function putBytes(token: string, path: string, bytes: Uint8Array, blobSha?: string): Promise<WriteResult> {
  return putContent(token, path, encodeBase64Bytes(bytes), bytes.byteLength, blobSha)
}

export async function deleteContent(token: string, path: string, blobSha: string): Promise<WriteResult> {
  const canonical = assertPath(path)
  const response = await request(`${API}/repos/${githubOwner}/${githubRepo}/contents/${encodeGitHubPath(canonical)}`, {
    method: 'DELETE',
    headers: restHeaders(token),
    body: JSON.stringify({
      message: `删除 ${canonical}`,
      sha: blobSha,
      branch: githubBranch,
    }),
  })
  const data = (await response.json()) as ContentResponse
  if (!data.commit?.sha) throw new GitHubError('删除响应不完整', 502)
  return { commitSha: data.commit.sha, path: canonical, blobSha }
}

export async function getFileBlob(token: string, path: string): Promise<{ sha: string; text: string }> {
  const canonical = assertPath(path)
  const response = await request(
    `${API}/repos/${githubOwner}/${githubRepo}/contents/${encodeGitHubPath(canonical)}?ref=${encodeURIComponent(githubBranch)}`,
    { headers: restHeaders(token) },
  )
  const data = (await response.json()) as { sha?: string; content?: string; encoding?: string }
  if (!data.sha || !data.content) throw new GitHubError('读取文件失败', 404)
  const packed = data.content.replace(/\n/g, '')
  return { sha: data.sha, text: decodeBase64Utf8(packed) }
}
