import { existsSync, mkdirSync, writeFileSync, renameSync, unlinkSync, readdirSync } from 'fs'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import { confirm } from '@inquirer/prompts'
import pc from 'picocolors'
import type { Adapter, InstallOptions } from './types.js'
import type { Profile } from '../validator.js'

// Cursor stores user-level rules in ~/.cursor/rules/
const CURSOR_RULES_DIR = join(homedir(), '.cursor', 'rules')

function rulePath(name: string) {
  return join(CURSOR_RULES_DIR, `${name}.mdc`)
}

function buildContent(profile: Profile): string {
  return [
    '---',
    `description: ${profile.description}`,
    'alwaysApply: false',
    '---',
    '',
    `# Pair programming with ${profile.name}`,
    '',
    profile.content.trim(),
  ].join('\n')
}

export const cursorAdapter: Adapter = {
  id: 'cursor',
  label: 'Cursor',

  detect() {
    return existsSync(join(homedir(), '.cursor'))
  },

  async install(profile: Profile, opts: InstallOptions = {}) {
    mkdirSync(CURSOR_RULES_DIR, { recursive: true })

    const dest = rulePath(profile.name)

    if (existsSync(dest) && !opts.force) {
      const overwrite = await confirm({
        message: `[Cursor] Rule "${profile.name}" already exists. Overwrite?`,
        default: false,
      })
      if (!overwrite) return
    }

    const tmp = `${dest}.tmp`
    writeFileSync(tmp, buildContent(profile), 'utf8')
    renameSync(tmp, dest)
    console.log(`  ${pc.green('✓')} Cursor → ${pc.dim(dest)}`)
  },

  isInstalled(name: string) {
    return existsSync(rulePath(name))
  },

  async remove(name: string, opts: { force?: boolean } = {}) {
    const path = rulePath(name)
    if (!existsSync(path)) return

    if (!opts.force) {
      const ok = await confirm({ message: `[Cursor] Remove rule "${name}"?`, default: false })
      if (!ok) return
    }

    unlinkSync(path)
  },

  async list() {
    if (!existsSync(CURSOR_RULES_DIR)) return []
    const files = readdirSync(CURSOR_RULES_DIR).filter(f => f.endsWith('.mdc'))
    const results: Array<{ name: string; description: string }> = []
    for (const file of files) {
      try {
        const raw = await readFile(join(CURSOR_RULES_DIR, file), 'utf8')
        const descMatch = raw.match(/^description: (.+)$/m)
        const name = file.replace(/\.mdc$/, '')
        results.push({ name, description: descMatch?.[1] ?? '' })
      } catch { /* skip */ }
    }
    return results.sort((a, b) => a.name.localeCompare(b.name))
  },
}
