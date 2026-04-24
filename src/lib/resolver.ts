import { UserError } from './errors.js'

export type Source =
  | { type: 'official'; handle: string }
  | { type: 'external'; user: string; repo: string; handle?: string }

export function resolve(arg: string): Source {
  if (arg.startsWith('https://') || arg.startsWith('http://')) {
    return parseUrl(arg)
  }

  if (arg.includes('/')) {
    const [userRepo, handle] = arg.split('#')
    const parts = userRepo.split('/')
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new UserError(`Invalid source format: "${arg}". Expected <user>/<repo> or <user>/<repo>#<handle>.`)
    }
    return { type: 'external', user: parts[0], repo: parts[1], handle }
  }

  if (!arg.match(/^[a-zA-Z0-9_-]+$/)) {
    throw new UserError(`Invalid handle: "${arg}". Handles can only contain letters, numbers, hyphens, and underscores.`)
  }

  return { type: 'official', handle: arg }
}

function parseUrl(url: string): Source {
  try {
    const u = new URL(url)
    if (u.hostname !== 'github.com') {
      throw new UserError(`Only GitHub URLs are supported. Got: ${url}`)
    }
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length < 2) {
      throw new UserError(`Could not parse GitHub URL: ${url}`)
    }
    const [user, repo, , , ...rest] = parts
    const handle = rest.length ? rest[rest.length - 1].replace(/\.md$/, '') : undefined
    return { type: 'external', user, repo, handle }
  } catch (e) {
    if (e instanceof UserError) throw e
    throw new UserError(`Invalid URL: ${url}`)
  }
}
