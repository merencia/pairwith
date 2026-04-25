import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Profile } from '../../src/lib/validator.js'

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  renameSync: vi.fn(),
  unlinkSync: vi.fn(),
  readdirSync: vi.fn(),
}))

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}))

vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
}))

import * as fs from 'fs'
import * as fsp from 'fs/promises'
import { confirm } from '@inquirer/prompts'
import { cursorAdapter } from '../../src/lib/adapters/cursor.js'
import { homedir } from 'os'
import { join } from 'path'

const CURSOR_RULES_DIR = join(homedir(), '.cursor', 'rules')

const profile: Profile = {
  name: 'testprofile',
  description: 'A test profile.',
  model: 'sonnet',
  content: '# Principles\nDo good work.',
  raw: '---\nname: testprofile\n---\n# Principles\nDo good work.',
}

beforeEach(() => vi.clearAllMocks())

describe('cursorAdapter.install', () => {
  it('writes to ~/.cursor/rules/<name>.mdc via tmp file', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    await cursorAdapter.install(profile, { force: true })

    const dest = join(CURSOR_RULES_DIR, 'testprofile.mdc')
    expect(fs.writeFileSync).toHaveBeenCalledWith(`${dest}.tmp`, expect.any(String), 'utf8')
    expect(fs.renameSync).toHaveBeenCalledWith(`${dest}.tmp`, dest)
  })

  it('wraps content in .mdc frontmatter format', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    await cursorAdapter.install(profile, { force: true })

    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string
    expect(written).toContain('---')
    expect(written).toContain('description: A test profile.')
    expect(written).toContain('alwaysApply: false')
    expect(written).toContain('# Principles')
    expect(written).not.toContain('name: testprofile')
  })

  it('uses profile.content (not raw) for the body', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    await cursorAdapter.install(profile, { force: true })

    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string
    expect(written).toContain(profile.content.trim())
  })

  it('prompts when file exists and force is not set', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(confirm).mockResolvedValue(true)
    await cursorAdapter.install(profile)
    expect(confirm).toHaveBeenCalled()
    expect(fs.writeFileSync).toHaveBeenCalled()
  })

  it('skips write when user declines overwrite prompt', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(confirm).mockResolvedValue(false)
    await cursorAdapter.install(profile)
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })
})

describe('cursorAdapter.isInstalled', () => {
  it('checks for the .mdc file', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    expect(cursorAdapter.isInstalled('testprofile')).toBe(true)
    expect(fs.existsSync).toHaveBeenCalledWith(join(CURSOR_RULES_DIR, 'testprofile.mdc'))
  })
})

describe('cursorAdapter.remove', () => {
  it('deletes the .mdc file when force is true', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    await cursorAdapter.remove('testprofile', { force: true })
    expect(fs.unlinkSync).toHaveBeenCalledWith(join(CURSOR_RULES_DIR, 'testprofile.mdc'))
  })

  it('does nothing when file does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    await cursorAdapter.remove('testprofile', { force: true })
    expect(fs.unlinkSync).not.toHaveBeenCalled()
  })
})

describe('cursorAdapter.list', () => {
  it('returns empty array when rules dir does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    expect(await cursorAdapter.list()).toEqual([])
  })

  it('parses description from .mdc frontmatter', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(['merencia.mdc'] as any)
    vi.mocked(fsp.readFile).mockResolvedValueOnce(
      '---\ndescription: Merencia profile.\nalwaysApply: false\n---\n# content' as any
    )

    const result = await cursorAdapter.list()
    expect(result).toEqual([{ name: 'merencia', description: 'Merencia profile.' }])
  })
})
