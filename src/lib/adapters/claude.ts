import { existsSync, mkdirSync, writeFileSync, renameSync, unlinkSync, readdirSync } from 'fs'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { confirm } from '@inquirer/prompts'
import pc from 'picocolors'
import matter from 'gray-matter'
import { homedir } from 'os'
import type { Adapter, InstallOptions } from './types.js'
import type { Profile } from '../validator.js'

const CLAUDE_DIR = join(homedir(), '.claude')
const AGENTS_DIR = join(CLAUDE_DIR, 'agents')
const SKILLS_DIR = join(CLAUDE_DIR, 'skills')

const agentPath = (name: string) => join(AGENTS_DIR, `${name}.md`)
export const skillDir = (name: string) => join(SKILLS_DIR, name)
export const skillPath = (name: string) => join(skillDir(name), 'SKILL.md')

export function installSkill(name: string, content: string): void {
  mkdirSync(skillDir(name), { recursive: true })
  const dest = skillPath(name)
  const tmp = `${dest}.tmp`
  writeFileSync(tmp, content, 'utf8')
  renameSync(tmp, dest)
}

export function isSkillInstalled(name: string): boolean {
  return existsSync(skillPath(name))
}

export const claudeAdapter: Adapter = {
  id: 'claude',
  label: 'Claude Code',

  detect() {
    return existsSync(CLAUDE_DIR)
  },

  async install(profile: Profile, opts: InstallOptions = {}) {
    mkdirSync(AGENTS_DIR, { recursive: true })

    const dest = agentPath(profile.name)

    if (existsSync(dest) && !opts.force) {
      const overwrite = await confirm({
        message: `[Claude Code] Profile "${profile.name}" already exists. Overwrite?`,
        default: false,
      })
      if (!overwrite) return
    }

    const tmp = `${dest}.tmp`
    writeFileSync(tmp, profile.raw, 'utf8')
    renameSync(tmp, dest)
    console.log(`  ${pc.green('✓')} Claude Code → ${pc.dim(dest)}`)
  },

  isInstalled(name: string) {
    return existsSync(agentPath(name))
  },

  async remove(name: string, opts: { force?: boolean } = {}) {
    const path = agentPath(name)
    if (!existsSync(path)) return

    if (!opts.force) {
      const ok = await confirm({ message: `[Claude Code] Remove "${name}"?`, default: false })
      if (!ok) return
    }

    unlinkSync(path)
  },

  async list() {
    if (!existsSync(AGENTS_DIR)) return []
    const files = readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'))
    const results: Array<{ name: string; description: string }> = []
    for (const file of files) {
      try {
        const raw = await readFile(join(AGENTS_DIR, file), 'utf8')
        const { data } = matter(raw)
        if (data.name && data.description) {
          results.push({ name: data.name as string, description: data.description as string })
        }
      } catch { /* skip */ }
    }
    return results.sort((a, b) => a.name.localeCompare(b.name))
  },
}
