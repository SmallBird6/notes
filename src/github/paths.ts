import { contentDir } from '../config'

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp']

export function encodeGitHubPath(path: string): string {
  return path.split('/').map((segment) => encodeURIComponent(segment)).join('/')
}

export function normalizeRepoPath(path: string): string {
  return path.normalize('NFC')
}

function hasAllowedExtension(path: string): boolean {
  const lower = path.toLowerCase()
  if (lower.endsWith('.md')) return true
  return IMAGE_EXTS.some((ext) => lower.endsWith(ext))
}

export function writablePath(input: string): string | null {
  if (typeof input !== 'string') return null
  const path = normalizeRepoPath(input)
  if (path !== path.trim()) return null
  if (path.includes('\\')) return null
  if (path.startsWith('/') || path.endsWith('/')) return null
  const prefix = `${contentDir}/`
  if (!path.startsWith(prefix)) return null
  const rest = path.slice(prefix.length)
  if (!rest) return null
  const segments = rest.split('/')
  if (segments.some((segment) => segment.length === 0 || segment === '.' || segment === '..')) return null
  if (segments.some((segment) => segment !== segment.trim())) return null
  if (!hasAllowedExtension(path)) return null
  return path
}

export function isWritablePath(input: string): boolean {
  return writablePath(input) !== null
}

export function isContentPath(input: string): boolean {
  const path = normalizeRepoPath(input)
  if (path.includes('\\') || path.includes('//')) return false
  if (!path.startsWith(`${contentDir}/`)) return false
  const rest = path.slice(contentDir.length + 1)
  return rest.length > 0 && !rest.split('/').some((segment) => segment.length === 0 || segment === '.' || segment === '..')
}

export function fileKind(path: string): 'md' | 'image' | 'other' {
  const lower = path.toLowerCase()
  if (lower.endsWith('.md')) return 'md'
  if (IMAGE_EXTS.some((ext) => lower.endsWith(ext))) return 'image'
  return 'other'
}

export function repoPathToRoute(repoPath: string): string {
  const prefix = `${contentDir}/`
  let rel = repoPath.startsWith(prefix) ? repoPath.slice(prefix.length) : repoPath
  rel = rel.replace(/\.md$/i, '')
  if (rel === 'index') return '/'
  if (rel.endsWith('/index')) return `/${rel.slice(0, -'/index'.length)}`
  return `/${rel}`
}

export function routeHref(route: string, hash?: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = route === '/' ? `${base}/` : `${base}${route.split('/').map((part, index) => (index === 0 ? part : encodeURIComponent(part))).join('/')}`
  if (!hash) return path
  return `${path}#${encodeURIComponent(hash)}`
}

export function routeCandidates(routePath: string): string[] {
  const rel = decodeURIComponent(routePath.replace(/^\/+|\/+$/g, '')).normalize('NFC')
  if (!rel) return [`${contentDir}/index.md`]
  const stem = rel.replace(/\.md$/i, '')
  return [`${contentDir}/${stem}.md`, `${contentDir}/${stem}/index.md`]
}

export function resolveRoutePath(routePath: string, known: readonly { path: string }[]): string {
  const candidates = routeCandidates(routePath)
  const found = candidates.find((candidate) => known.some((entry) => entry.path === candidate))
  return found ?? candidates[0]
}

export function editRouteToRepoPath(routePath: string): string {
  const rel = decodeURIComponent(routePath.replace(/^\/edit\/?/, '').replace(/^\/+|\/+$/g, '')).normalize('NFC')
  if (!rel) return `${contentDir}/index.md`
  const withExt = rel.toLowerCase().endsWith('.md') ? rel : `${rel}.md`
  return `${contentDir}/${withExt}`
}

export function repoPathToEditRoute(repoPath: string): string {
  const rel = repoPath.slice(contentDir.length + 1).replace(/\.md$/i, '')
  if (!rel || rel === 'index') return '/edit'
  return `/edit/${rel}`
}

export function initialDocument(repoPath: string): string {
  const base = repoPath.split('/').pop()?.replace(/\.md$/i, '') ?? '未命名'
  const title = base.replace(/^\d+[.\-_\s]+/, '') || base
  return `# ${title}\n\n`
}

export function parentDir(repoPath: string): string {
  const index = repoPath.lastIndexOf('/')
  if (index <= 0) return contentDir
  return repoPath.slice(0, index)
}
