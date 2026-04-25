import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Profile } from '../../src/lib/validator.js'

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  renameSync: vi.fn(),
  unlinkSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
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
import { copilotAdapter, installSkill } from '../../src/lib/adapters/copilot.js'
import { homedir } from 'os'
import { join } from 'path'

const AGENTS_DIR = join(homedir(), '.copilot', 'agents')
const SKILLS_DIR = join(homedir(), '.copilot', 'skills')

const profile: Profile = {
  name: 'testprofile',
  description: 'A test profile.',
  model: 'sonnet',
  content: '# Principles\nDo good work.',
  raw: '---\nname: testprofile\n---\n# Principles\nDo good work.',
}

beforeEach(() => vi.clearAllMocks())

describe('copilotAdapter.install', () => {
  it('writes to ~/.copilot/agents/<name>.agent.md via tmp file', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    await copilotAdapter.install(profile, { force: true })

    const dest = join(AGENTS_DIR, 'testprofile.agent.md')
    expect(fs.writeFileSync).toHaveBeenCalledWith(`${dest}.tmp`, profile.raw, 'utf8')
    expect(fs.renameSync).toHaveBeenCalledWith(`${dest}.tmp`, dest)
  })

  it('prompts when file exists and force is not set', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(confirm).mockResolvedValue(true)
    await copilotAdapter.install(profile)
    expect(confirm).toHaveBeenCalled()
    expect(fs.writeFileSync).toHaveBeenCalled()
  })

  it('skips write when user declines overwrite prompt', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(confirm).mockResolvedValue(false)
    await copilotAdapter.install(profile)
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })
})

describe('copilotAdapter.isInstalled', () => {
  it('checks for the .agent.md file', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    expect(copilotAdapter.isInstalled('testprofile')).toBe(true)
    expect(fs.existsSync).toHaveBeenCalledWith(join(AGENTS_DIR, 'testprofile.agent.md'))
  })
})

describe('copilotAdapter.remove', () => {
  it('deletes the agent file when force is true', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue('')
    await copilotAdapter.remove('testprofile', { force: true })
    expect(fs.unlinkSync).toHaveBeenCalledWith(join(AGENTS_DIR, 'testprofile.agent.md'))
  })

  it('does nothing when neither agent file nor legacy file exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    await copilotAdapter.remove('testprofile', { force: true })
    expect(fs.unlinkSync).not.toHaveBeenCalled()
  })
})

describe('copilotAdapter.list', () => {
  it('returns empty array when agents dir does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    expect(await copilotAdapter.list()).toEqual([])
  })

  it('returns profiles parsed from .agent.md files', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readdirSync).mockReturnValue(['merencia.agent.md'] as any)
    vi.mocked(fsp.readFile).mockResolvedValueOnce(
      '---\nname: merencia\ndescription: Merencia profile.\n---\n' as any
    )

    const result = await copilotAdapter.list()
    expect(result).toEqual([{ name: 'merencia', description: 'Merencia profile.' }])
  })
})

describe('installSkill (copilot)', () => {
  it('rewrites Claude agent path references to Copilot paths', () => {
    const content = 'Install to ~/.claude/agents/<handle>.md for use'
    installSkill('pair-with', content)

    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string
    expect(written).toContain('~/.copilot/agents/<handle>.agent.md')
    expect(written).not.toContain('~/.claude/agents/<handle>.md')
  })

  it('writes to ~/.copilot/skills/<name>/SKILL.md via tmp file', () => {
    const dest = join(SKILLS_DIR, 'pair-with', 'SKILL.md')
    installSkill('pair-with', '# skill')
    expect(fs.renameSync).toHaveBeenCalledWith(`${dest}.tmp`, dest)
  })
})
