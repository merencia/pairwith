import { writeFileSync, existsSync } from 'fs'
import { checkbox, input, confirm } from '@inquirer/prompts'
import pc from 'picocolors'
import { resolve } from '../lib/resolver.js'
import {
  fetchOfficialProfile,
  fetchOfficialProfileList,
  fetchExternalProfile,
  fetchSkill,
  fetchTemplate,
} from '../lib/github.js'
import { parse } from '../lib/validator.js'
import { getAdapter, detectAdapters, allAdapters, claudeAdapter } from '../lib/adapters/index.js'
import { installSkill, isSkillInstalled } from '../lib/adapters/claude.js'
import type { Adapter } from '../lib/adapters/types.js'

const SKILLS = ['pair-with', 'create-profile']

export interface InstallCommandOptions {
  force?: boolean
  all?: boolean
  skipProfile?: boolean
  for?: string
}

export async function install(arg: string | undefined, opts: InstallCommandOptions): Promise<void> {
  if (!arg) {
    await bootstrap(opts)
    return
  }

  await installSingle(arg, opts)
}

async function resolveAdapters(forOpt: string | undefined): Promise<Adapter[]> {
  if (forOpt === 'all') return allAdapters()
  if (forOpt) return [getAdapter(forOpt)]

  const detected = detectAdapters()
  if (detected.length > 0) return detected

  // nothing detected — default to claude
  return [claudeAdapter]
}

async function installSingle(arg: string, opts: InstallCommandOptions): Promise<void> {
  const source = resolve(arg)

  process.stderr.write('Fetching profile...\n')

  let raw: string
  if (source.type === 'official') {
    raw = await fetchOfficialProfile(source.handle)
  } else if (source.type === 'external') {
    raw = await fetchExternalProfile(source.user, source.repo, source.handle)
  } else {
    raw = await fetchExternalProfile(...parseUrlSource(source.url))
  }

  const profile = parse(raw, arg)
  const adapters = await resolveAdapters(opts.for)

  console.log(`Installing "${profile.name}"...`)
  for (const adapter of adapters) {
    await adapter.install(profile, { force: opts.force, cwd: process.cwd() })
  }

  console.log(`\n${pc.bold('Done!')} Open your AI tool and start pairing with ${pc.cyan(profile.name)}.`)
  if (adapters.some(a => a.id === 'claude')) {
    console.log(`  In Claude Code: /pair-with ${profile.name} <your task>`)
  }
}

async function bootstrap(opts: InstallCommandOptions): Promise<void> {
  console.log(pc.bold('pairwith — setup\n'))

  // install Claude skills
  console.log('Installing Claude Code skills...')
  for (const skill of SKILLS) {
    if (isSkillInstalled(skill)) {
      console.log(`  ${pc.dim('already installed')} ${skill}`)
      continue
    }
    const content = await fetchSkill(skill)
    installSkill(skill, content)
    console.log(`  ${pc.green('✓')} ${skill}`)
  }

  // fetch available profiles
  process.stderr.write('\nFetching available profiles...\n')
  const available = await fetchOfficialProfileList()
  const adapters = await resolveAdapters(opts.for)

  const adapterLabels = adapters.map(a => a.label).join(', ')
  console.log(`Installing for: ${pc.cyan(adapterLabels)}\n`)

  let toInstall: string[] = []

  if (opts.all) {
    toInstall = available
  } else {
    toInstall = await checkbox({
      message: 'Which profiles would you like to install?',
      choices: available.map(handle => ({ name: handle, value: handle })),
    })
  }

  if (toInstall.length > 0) {
    console.log('\nInstalling profiles...')
    for (const handle of toInstall) {
      const raw = await fetchOfficialProfile(handle)
      const profile = parse(raw, handle)
      for (const adapter of adapters) {
        await adapter.install(profile, { force: opts.force, cwd: process.cwd() })
      }
    }
  }

  // scaffold own profile
  if (!opts.skipProfile) {
    console.log()
    const handle = await input({
      message: 'Your GitHub handle to scaffold your own profile (leave empty to skip):',
    })

    if (handle.trim()) {
      await scaffoldProfile(handle.trim())
    }
  }

  console.log(`\n${pc.bold('Done!')}`)
  console.log(`  /pair-with <handle> <task>  — pair in Claude Code`)
  console.log(`  /create-profile             — generate a profile with AI`)
  console.log(`  pairwith list        — browse the official registry`)
}

async function scaffoldProfile(handle: string): Promise<void> {
  const dest = `./${handle}.md`

  if (existsSync(dest)) {
    const overwrite = await confirm({
      message: `${dest} already exists. Overwrite?`,
      default: false,
    })
    if (!overwrite) return
  }

  const template = await fetchTemplate()
  const scaffold = template.replace(/^name: your-handle$/m, `name: ${handle}`)

  writeFileSync(dest, scaffold, 'utf8')
  console.log(`\n${pc.green('✓')} Draft created at ${pc.bold(dest)}`)
  console.log(`  Fill in the sections and open a PR at github.com/merencia/pairwith`)
}

function parseUrlSource(url: string): [string, string, string | undefined] {
  const u = new URL(url)
  const parts = u.pathname.split('/').filter(Boolean)
  const [user, repo, , , ...rest] = parts
  const handle = rest.length ? rest[rest.length - 1].replace(/\.md$/, '') : undefined
  return [user, repo, handle]
}
