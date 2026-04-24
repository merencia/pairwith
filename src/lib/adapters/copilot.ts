import { existsSync, mkdirSync, writeFileSync, renameSync, unlinkSync, readdirSync, readFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { confirm } from '@inquirer/prompts'
import pc from 'picocolors'
import matter from 'gray-matter'
import type { Adapter, InstallOptions } from './types.js'
import type { Profile } from '../validator.js'

const COPILOT_DIR = join(homedir(), '.copilot')
const AGENTS_DIR = join(COPILOT_DIR, 'agents')
const SKILLS_DIR = join(COPILOT_DIR, 'skills')

const agentPath = (name: string) => join(AGENTS_DIR, `${name}.agent.md`)
const skillDir = (name: string) => join(SKILLS_DIR, name)
const skillPath = (name: string) => join(skillDir(name), 'SKILL.md')

// Skills shipped by pairwith reference Claude paths; rewrite for Copilot CLI.
function rewriteSkillContent(content: string): string {
  return content.replaceAll('~/.claude/agents/<handle>.md', '~/.copilot/agents/<handle>.agent.md')
}

export function installSkill(name: string, content: string): void {
  mkdirSync(skillDir(name), { recursive: true })
  const dest = skillPath(name)
  const tmp = `${dest}.tmp`
  writeFileSync(tmp, rewriteSkillContent(content), 'utf8')
  renameSync(tmp, dest)
}

export function isSkillInstalled(name: string): boolean {
  return existsSync(skillPath(name))
}

const legacyInstructionsPath = (cwd: string) =>
  join(cwd, '.github', 'copilot-instructions.md')
const LEGACY_MARKER_RE = /<!-- pairwith: ([\w-]+) -->/

function readLegacyName(cwd: string): string | null {
  const path = legacyInstructionsPath(cwd)
  if (!existsSync(path)) return null
  const match = readFileSync(path, 'utf8').match(LEGACY_MARKER_RE)
  return match ? match[1] : null
}

export const copilotAdapter: Adapter = {
  id: 'copilot',
  label: 'GitHub Copilot CLI',

  detect() {
    return existsSync(COPILOT_DIR)
  },

  async install(profile: Profile, opts: InstallOptions = {}) {
    const dest = agentPath(profile.name)

    if (existsSync(dest) && !opts.force) {
      const overwrite = await confirm({
        message: `[Copilot CLI] Profile "${profile.name}" already exists. Overwrite?`,
        default: false,
      })
      if (!overwrite) return
    }

    mkdirSync(AGENTS_DIR, { recursive: true })
    const tmp = `${dest}.tmp`
    writeFileSync(tmp, profile.raw, 'utf8')
    renameSync(tmp, dest)
    console.log(`  ${pc.green('✓')} GitHub Copilot CLI → ${pc.dim(dest)}`)
  },

  isInstalled(name: string) {
    return existsSync(agentPath(name))
  },

  async remove(name: string, opts: { force?: boolean } = {}) {
    const cwd = process.cwd()
    const targets = [agentPath(name)].filter(p => existsSync(p))
    if (readLegacyName(cwd) === name) targets.push(legacyInstructionsPath(cwd))

    if (targets.length === 0) return

    if (!opts.force) {
      const list = targets.map(p => `\n    - ${p}`).join('')
      const ok = await confirm({
        message: `[Copilot CLI] Remove "${name}" from:${list}`,
        default: false,
      })
      if (!ok) return
    }

    for (const path of targets) unlinkSync(path)
  },

  async list() {
    if (!existsSync(AGENTS_DIR)) return []
    const files = readdirSync(AGENTS_DIR).filter(f => f.endsWith('.agent.md'))
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
