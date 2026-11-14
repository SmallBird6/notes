import { TOKEN_STORAGE_KEY } from '../config'

export function looksLikeFineGrained(token: string): boolean {
  return token.trim().startsWith('github_pat_')
}

export function readToken(): string | null {
  try {
    const value = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!value || !looksLikeFineGrained(value)) return null
    return value
  } catch {
    return null
  }
}

export function storeToken(token: string): void {
  const trimmed = token.trim()
  if (!looksLikeFineGrained(trimmed)) return
  localStorage.setItem(TOKEN_STORAGE_KEY, trimmed)
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
