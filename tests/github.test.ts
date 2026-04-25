import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserError } from '../src/lib/errors.js'
import {
  fetchOfficialProfile,
  fetchOfficialProfileList,
  fetchExternalProfile,
  fetchSkill,
  fetchTemplate,
} from '../src/lib/github.js'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function makeResponse(status: number, body: string, contentLength?: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({
      'content-length': String(contentLength ?? body.length),
    }),
    text: () => Promise.resolve(body),
    json: () => Promise.resolve(JSON.parse(body)),
  } as Response
}

beforeEach(() => mockFetch.mockReset())

describe('fetchOfficialProfile', () => {
  it('returns profile content on 200', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, '# profile content'))
    const result = await fetchOfficialProfile('merencia')
    expect(result).toBe('# profile content')
  })

  it('throws UserError on 404', async () => {
    mockFetch.mockResolvedValue(makeResponse(404, ''))
    await expect(fetchOfficialProfile('unknown')).rejects.toThrow(UserError)
    await expect(fetchOfficialProfile('unknown')).rejects.toThrow(/unknown/)
  })

  it('throws generic error on non-404 failure', async () => {
    mockFetch.mockResolvedValue(makeResponse(500, ''))
    await expect(fetchOfficialProfile('merencia')).rejects.toThrow(/500/)
  })

  it('fetches from the correct URL with encoded handle', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, '# ok'))
    await fetchOfficialProfile('caarlos0')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/profiles/caarlos0.md'),
      expect.anything()
    )
  })

  it('throws when content-length header exceeds 1MB', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, 'x', 1_024 * 1_024 + 1))
    await expect(fetchOfficialProfile('merencia')).rejects.toThrow(/size/)
  })

  it('throws when actual body exceeds 1MB even without content-length', async () => {
    const big = 'x'.repeat(1_024 * 1_024 + 1)
    mockFetch.mockResolvedValue(makeResponse(200, big, 0))
    await expect(fetchOfficialProfile('merencia')).rejects.toThrow(/size/)
  })
})

describe('fetchOfficialProfileList', () => {
  it('returns sorted list of handles from directory listing', async () => {
    const files = [
      { name: 'merencia.md', type: 'file' },
      { name: 'caarlos0.md', type: 'file' },
      { name: 'akitaonrails.md', type: 'file' },
    ]
    mockFetch.mockResolvedValue(makeResponse(200, JSON.stringify(files)))
    const result = await fetchOfficialProfileList()
    expect(result).toEqual(['akitaonrails', 'caarlos0', 'merencia'])
  })

  it('ignores non-file entries and non-.md files', async () => {
    const files = [
      { name: 'merencia.md', type: 'file' },
      { name: 'subdir', type: 'dir' },
      { name: 'README.txt', type: 'file' },
    ]
    mockFetch.mockResolvedValue(makeResponse(200, JSON.stringify(files)))
    const result = await fetchOfficialProfileList()
    expect(result).toEqual(['merencia'])
  })

  it('throws on API failure', async () => {
    mockFetch.mockResolvedValue(makeResponse(503, ''))
    await expect(fetchOfficialProfileList()).rejects.toThrow(/503/)
  })
})

describe('fetchExternalProfile', () => {
  it('resolves from profiles/<handle>.md first when handle is provided', async () => {
    mockFetch
      .mockResolvedValueOnce(makeResponse(200, '# from profiles/'))
    const result = await fetchExternalProfile('user', 'repo', 'alice')
    expect(result).toBe('# from profiles/')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/profiles/alice.md'),
      expect.anything()
    )
  })

  it('falls back to .claude/agents/<handle>.md when profiles/ returns 404', async () => {
    mockFetch
      .mockResolvedValueOnce(makeResponse(404, ''))
      .mockResolvedValueOnce(makeResponse(200, '# from agents/'))
    const result = await fetchExternalProfile('user', 'repo', 'alice')
    expect(result).toBe('# from agents/')
  })

  it('throws UserError when no candidate is found with a handle', async () => {
    mockFetch.mockResolvedValue(makeResponse(404, ''))
    await expect(fetchExternalProfile('user', 'repo', 'alice')).rejects.toThrow(UserError)
    await expect(fetchExternalProfile('user', 'repo', 'alice')).rejects.toThrow(/alice/)
  })

  it('resolves from profile.md at root when no handle is given', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(200, '# root profile'))
    const result = await fetchExternalProfile('user', 'repo')
    expect(result).toBe('# root profile')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/profile.md'),
      expect.anything()
    )
  })

  it('falls back to single .md file detection when no handle and no root profile', async () => {
    const apiListing = [
      { name: 'alice.md', type: 'file' },
      { name: 'README.md', type: 'file' },
    ]
    mockFetch
      .mockResolvedValueOnce(makeResponse(404, ''))  // profile.md
      .mockResolvedValueOnce(makeResponse(404, ''))  // PROFILE.md
      .mockResolvedValueOnce(makeResponse(404, ''))  // .claude/agents/profile.md
      .mockResolvedValueOnce(makeResponse(200, JSON.stringify(apiListing)))
      .mockResolvedValueOnce(makeResponse(200, '# auto-detected'))
    const result = await fetchExternalProfile('user', 'repo')
    expect(result).toBe('# auto-detected')
  })

  it('throws UserError when no profile found and no handle given', async () => {
    mockFetch
      .mockResolvedValue(makeResponse(404, ''))
    await expect(fetchExternalProfile('user', 'repo')).rejects.toThrow(UserError)
  })

  it('uses encoded user and repo in URL', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(200, '# ok'))
    await fetchExternalProfile('my user', 'my repo', 'alice')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('my%20user/my%20repo'),
      expect.anything()
    )
  })
})

describe('fetchSkill', () => {
  it('returns skill content on 200', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, '# skill content'))
    const result = await fetchSkill('pair-with')
    expect(result).toBe('# skill content')
  })

  it('throws on failure', async () => {
    mockFetch.mockResolvedValue(makeResponse(404, ''))
    await expect(fetchSkill('nonexistent')).rejects.toThrow(/nonexistent/)
  })

  it('fetches from the correct path', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, '# ok'))
    await fetchSkill('pair-with')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/skills/pair-with/SKILL.md'),
      expect.anything()
    )
  })
})

describe('fetchTemplate', () => {
  it('returns template content on 200', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, '# template'))
    const result = await fetchTemplate()
    expect(result).toBe('# template')
  })

  it('throws on failure', async () => {
    mockFetch.mockResolvedValue(makeResponse(500, ''))
    await expect(fetchTemplate()).rejects.toThrow(/500/)
  })
})
