import { UserError } from './errors.js'

const REGISTRY = 'merencia/ia-pair-profiles'
const RAW = 'https://raw.githubusercontent.com'
const API = 'https://api.github.com'
const TIMEOUT_MS = 15_000
const MAX_SIZE_BYTES = 1_024 * 1_024 // 1 MB

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'ia-pair-profiles-cli',
}

async function safeFetch(url: string): Promise<Response> {
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  return res
}

async function safeText(res: Response): Promise<string> {
  const length = Number(res.headers.get('content-length') ?? 0)
  if (length > MAX_SIZE_BYTES) {
    throw new UserError(`File exceeds maximum allowed size (1 MB).`)
  }
  const text = await res.text()
  if (text.length > MAX_SIZE_BYTES) {
    throw new UserError(`File exceeds maximum allowed size (1 MB).`)
  }
  return text
}

export async function fetchOfficialProfile(handle: string): Promise<string> {
  const url = `${RAW}/${REGISTRY}/main/profiles/${encodeURIComponent(handle)}.md`
  const res = await safeFetch(url)
  if (res.status === 404) throw new UserError(`Profile "${handle}" not found in the official registry.\nRun "ia-pair-profile list" to see available profiles.`)
  if (!res.ok) throw new Error(`Failed to fetch profile: HTTP ${res.status}`)
  return safeText(res)
}

export async function fetchOfficialProfileList(): Promise<string[]> {
  const url = `${API}/repos/${REGISTRY}/contents/profiles`
  const res = await safeFetch(url)
  if (!res.ok) throw new Error(`Failed to fetch profile list: HTTP ${res.status}`)
  const files = await res.json() as Array<{ name: string; type: string }>
  return files
    .filter(f => f.type === 'file' && f.name.endsWith('.md'))
    .map(f => f.name.replace(/\.md$/, ''))
    .sort()
}

export async function fetchSkill(name: string): Promise<string> {
  const url = `${RAW}/${REGISTRY}/main/skills/${encodeURIComponent(name)}/SKILL.md`
  const res = await safeFetch(url)
  if (!res.ok) throw new Error(`Failed to fetch skill "${name}": HTTP ${res.status}`)
  return safeText(res)
}

export async function fetchTemplate(): Promise<string> {
  const url = `${RAW}/${REGISTRY}/main/TEMPLATE.md`
  const res = await safeFetch(url)
  if (!res.ok) throw new Error(`Failed to fetch template: HTTP ${res.status}`)
  return safeText(res)
}

export async function fetchExternalProfile(user: string, repo: string, handle?: string): Promise<string> {
  const base = `${RAW}/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/main`

  const candidates = handle
    ? [
        `${base}/profiles/${encodeURIComponent(handle)}.md`,
        `${base}/.claude/agents/${encodeURIComponent(handle)}.md`,
      ]
    : [
        `${base}/profile.md`,
        `${base}/PROFILE.md`,
        `${base}/.claude/agents/profile.md`,
      ]

  for (const url of candidates) {
    const res = await safeFetch(url)
    if (res.ok) return safeText(res)
  }

  if (!handle) {
    const found = await detectSingleProfile(user, repo, base)
    if (found) return found
  }

  const hint = handle
    ? `Could not find profile "${handle}" in ${user}/${repo}.`
    : `Could not find a profile in ${user}/${repo}.`

  throw new UserError(
    `${hint}\n` +
    `Accepted layouts:\n` +
    `  profile.md at root\n` +
    `  .claude/agents/<handle>.md\n` +
    `  profiles/<handle>.md  (use ${user}/${repo}#<handle>)\n`
  )
}

async function detectSingleProfile(user: string, repo: string, base: string): Promise<string | null> {
  const apiUrl = `${API}/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/contents`
  const res = await safeFetch(apiUrl)
  if (!res.ok) return null

  const files = await res.json() as Array<{ name: string; type: string }>
  const mdFiles = files.filter(
    f => f.type === 'file' && f.name.endsWith('.md') && f.name.toLowerCase() !== 'readme.md'
  )

  if (mdFiles.length === 1) {
    const r = await safeFetch(`${base}/${mdFiles[0].name}`)
    if (r.ok) return safeText(r)
  }

  return null
}
