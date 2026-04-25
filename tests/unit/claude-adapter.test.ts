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
import { claudeAdapter, installSkill, isSkillInstalled } from '../../src/lib/adapters/claude.js'
import { homedir } from 'os'
import { join } from 'path'

const AGENTS_DIR = join(homedir(), '.claude', 'agents')
const SKILLS_DIR = join(homedir(), '.claude', 'skills')

const profile: Profile = {
  name: 'testprofile',
  description: 'A test profile.',
  model: 'sonnet',
  content: '# Principles\nDo good work.',
  raw: '---\nname: testprofile\n---\n# Principles\nDo good work.',
}

beforeEach(() => vi.clearAllMocks())

describe('claudeAdapter.install', () => {
  it('writes profile to ~/.claude/agents/<name>.md via tmp file', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    await claudeAdapter.install(profile, { force: true })

    const expectedDest = join(AGENTS_DIR, 'testprofile.md')
    expect(fs.writeFileSync).toHaveBeenCalledWith(`${expectedDest}.tmp`, profile.raw, 'utf8')
    expect(fs.renameSync).toHaveBeenCalledWith(`${expectedDest}.tmp`, expectedDest)
  })

  it('skips confirm when force is true even if file exists', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    await claudeAdapter.install(profile, { force: true })
    expect(confirm).not.toHaveBeenCalled()
    expect(fs.writeFileSync).toHaveBeenCalled()
  })

  it('prompts when file exists and force is not set', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(confirm).mockResolvedValue(true)
    await claudeAdapter.install(profile)
    expect(confirm).toHaveBeenCalled()
    expect(fs.writeFileSync).toHaveBeenCalled()
  })

  it('skips write when user declines overwrite prompt', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(confirm).mockResolvedValue(false)
    await claudeAdapter.install(profile)
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })
})

describe('claudeAdapter.isInstalled', () => {
  it('returns true when agent file exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    expect(claudeAdapter.isInstalled('testprofile')).toBe(true)
  })

  it('returns false when agent file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    expect(claudeAdapter.isInstalled('testprofile')).toBe(false)
  })
})

describe('claudeAdapter.remove', () => {
  it('deletes the agent file when force is true', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    await claudeAdapter.remove('testprofile', { force: true })
    expect(fs.unlinkSync).toHaveBeenCalledWith(join(AGENTS_DIR, 'testprofile.md'))
  })

  it('does nothing when file does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    await claudeAdapter.remove('testprofile', { force: true })
    expect(fs.unlinkSync).not.toHaveBeenCalled()
  })

  it('prompts before deleting when force is not set', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(confirm).mockResolvedValue(true)
    await claudeAdapter.remove('testprofile')
    expect(confirm).toHaveBeenCalled()
    expect(fs.unlinkSync).toHaveBeenCalled()
  })

  it('skips deletion when user declines prompt', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(confirm).mockResolvedValue(false)
    await claudeAdapter.remove('testprofile')
    expect(fs.unlinkSync).not.toHaveBeenCalled()
  })
})

describe('claudeAdapter.list', () => {
  it('returns empty array when agents dir does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    expect(await claudeAdapter.list()).toEqual([])
  })

  it('returns sorted profiles parsed from agent files', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(['merencia.md', 'caarlos0.md'] as any)
    vi.mocked(fsp.readFile)
      .mockResolvedValueOnce('---\nname: merencia\ndescription: Merencia profile.\n---\n' as any)
      .mockResolvedValueOnce('---\nname: caarlos0\ndescription: caarlos0 profile.\n---\n' as any)

    const result = await claudeAdapter.list()
    expect(result).toEqual([
      { name: 'caarlos0', description: 'caarlos0 profile.' },
      { name: 'merencia', description: 'Merencia profile.' },
    ])
  })

  it('skips files without valid frontmatter', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(['broken.md'] as any)
    vi.mocked(fsp.readFile).mockResolvedValueOnce('no frontmatter here' as any)
    expect(await claudeAdapter.list()).toEqual([])
  })
})

describe('installSkill / isSkillInstalled', () => {
  it('writes skill to ~/.claude/skills/<name>/SKILL.md via tmp file', () => {
    const dest = join(SKILLS_DIR, 'pair-with', 'SKILL.md')
    installSkill('pair-with', '# skill content')
    expect(fs.writeFileSync).toHaveBeenCalledWith(`${dest}.tmp`, '# skill content', 'utf8')
    expect(fs.renameSync).toHaveBeenCalledWith(`${dest}.tmp`, dest)
  })

  it('returns true when skill file exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    expect(isSkillInstalled('pair-with')).toBe(true)
  })
})
