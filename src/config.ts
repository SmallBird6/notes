function readEnv(name: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[name]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export const githubOwner = readEnv('VITE_GITHUB_OWNER', 'SmallBird6')
export const githubRepo = readEnv('VITE_GITHUB_REPO', 'notes')
export const githubBranch = readEnv('VITE_GITHUB_BRANCH', 'main')
export const contentDir = readEnv('VITE_CONTENT_DIR', 'content').replace(/^\/+|\/+$/g, '')

export const MAX_FILE_BYTES = 1024 * 1024
export const TOKEN_STORAGE_KEY = 'notes.github.token'
export const THEME_STORAGE_KEY = 'notes.theme'
