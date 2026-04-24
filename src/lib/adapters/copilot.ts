import { existsSync, mkdirSync, writeFileSync, renameSync, unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import { confirm } from '@inquirer/prompts'
import pc from 'picocolors'
import type { Adapter, InstallOptions } from './types.js'
import type { Profile } from '../validator.js'

const MARKER_PREFIX = '<!-- ia-pair-profiles:'
const MARKER_SUFFIX = '-->'

function instructionsPath(cwd: string) {
  return join(cwd, '.github', 'copilot-instructions.md')
}

function buildContent(profile: Profile): string {
  return [
    `${MARKER_PREFIX} ${profile.name} ${MARKER_SUFFIX}`,
    `# Pair programming with ${profile.name}`,
    '',
    `> ${profile.description}`,
    '',
    profile.content.trim(),
  ].join('\n')
}

function readInstalledName(cwd: string): string | null {
  const path = instructionsPath(cwd)
  if (!existsSync(path)) return null
  const content = readFileSync(path, 'utf8')
  const match = content.match(new RegExp(`${MARKER_PREFIX} ([\\w-]+) ${MARKER_SUFFIX}`))
  return match ? match[1] : null
}

export const copilotAdapter: Adapter = {
  id: 'copilot',
  label: 'GitHub Copilot',

  detect() {
    // Copilot is opt-in — always available but not auto-detected
    return false
  },

  async install(profile: Profile, opts: InstallOptions = {}) {
    const cwd = opts.cwd ?? process.cwd()
    const dest = instructionsPath(cwd)

    if (existsSync(dest) && !opts.force) {
      const existing = readInstalledName(cwd)
      const msg = existing
        ? `[Copilot] ${dest} already has profile "${existing}". Overwrite with "${profile.name}"?`
        : `[Copilot] ${dest} already exists. Overwrite?`
      const overwrite = await confirm({ message: msg, default: false })
      if (!overwrite) return
    }

    mkdirSync(join(cwd, '.github'), { recursive: true })
    const tmp = `${dest}.tmp`
    writeFileSync(tmp, buildContent(profile), 'utf8')
    renameSync(tmp, dest)
    console.log(`  ${pc.green('✓')} GitHub Copilot → ${pc.dim(dest)}`)
  },

  isInstalled(name: string) {
    return readInstalledName(process.cwd()) === name
  },

  async remove(name: string, opts: { force?: boolean } = {}) {
    const cwd = process.cwd()
    const path = instructionsPath(cwd)
    if (!existsSync(path)) return

    if (!opts.force) {
      const ok = await confirm({ message: `[Copilot] Remove "${name}" from ${path}?`, default: false })
      if (!ok) return
    }

    unlinkSync(path)
  },

  async list() {
    const name = readInstalledName(process.cwd())
    if (!name) return []
    return [{ name, description: 'Installed via .github/copilot-instructions.md' }]
  },
}
