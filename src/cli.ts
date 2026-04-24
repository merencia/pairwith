import { Command } from 'commander'
import pc from 'picocolors'
import matter from 'gray-matter'
import { UserError } from './lib/errors.js'
import { install } from './commands/install.js'
import { list } from './commands/list.js'
import { installed } from './commands/installed.js'
import { remove } from './commands/remove.js'
import { update } from './commands/update.js'
import { resolve } from './lib/resolver.js'
import { fetchOfficialProfile, fetchExternalProfile } from './lib/github.js'
import { parse } from './lib/validator.js'

const TOOL_OPTIONS = 'claude, copilot, cursor, all'

const program = new Command()

program
  .name('ia-pair-profile')
  .description('Install and manage developer pair programming profiles for AI coding tools')
  .version('0.1.0')

program
  .command('install [source]')
  .description('Install a profile, or run without args to bootstrap everything')
  .option('-f, --force', 'overwrite existing files without prompting')
  .option('--all', 'install all official profiles without prompting (bootstrap mode)')
  .option('--skip-profile', 'skip own profile scaffolding (bootstrap mode)')
  .option('--for <tool>', `target a specific tool (${TOOL_OPTIONS})`)
  .action(async (source: string | undefined, opts) => {
    await run(() => install(source, opts))
  })

program
  .command('list')
  .description('List available profiles in the official registry')
  .option('-s, --search <term>', 'filter by name')
  .action(async (opts) => {
    await run(() => list(opts))
  })

program
  .command('search <term>')
  .description('Search profiles in the official registry')
  .action(async (term: string) => {
    await run(() => list({ search: term }))
  })

program
  .command('installed')
  .description('Show locally installed profiles')
  .option('--for <tool>', `filter by tool (${TOOL_OPTIONS})`)
  .action(async (opts) => {
    await run(() => installed(opts))
  })

program
  .command('remove <handle>')
  .description('Remove an installed profile')
  .option('-f, --force', 'skip confirmation prompt')
  .option('--for <tool>', `remove from a specific tool (${TOOL_OPTIONS})`)
  .action(async (handle: string, opts) => {
    await run(() => remove(handle, opts))
  })

program
  .command('update <handle>')
  .description('Update an installed profile to the latest version')
  .option('--for <tool>', `update for a specific tool (${TOOL_OPTIONS})`)
  .action(async (handle: string, opts) => {
    await run(() => update(handle, opts))
  })

program
  .command('print <source>')
  .description('Print the profile body to stdout — pipe it into any tool')
  .action(async (source: string) => {
    await run(async () => {
      const resolved = resolve(source)
      let raw: string
      if (resolved.type === 'official') {
        raw = await fetchOfficialProfile(resolved.handle)
      } else if (resolved.type === 'external') {
        raw = await fetchExternalProfile(resolved.user, resolved.repo, resolved.handle)
      } else {
        raw = await fetchExternalProfile(...parseUrlSource(resolved.url))
      }
      const profile = parse(raw, source)
      process.stdout.write(profile.content.trim() + '\n')
    })
  })

program.parse()

async function run(fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
  } catch (err) {
    if (err instanceof UserError) {
      process.stderr.write(pc.red('Error: ') + err.message + '\n')
      process.exit(1)
    }
    if (err instanceof Error) {
      process.stderr.write(pc.red('Unexpected error: ') + err.message + '\n')
      if (process.argv.includes('--verbose')) {
        process.stderr.write((err.stack ?? '') + '\n')
      }
    }
    process.exit(2)
  }
}

function parseUrlSource(url: string): [string, string, string | undefined] {
  const u = new URL(url)
  const parts = u.pathname.split('/').filter(Boolean)
  const [user, repo, , , ...rest] = parts
  const handle = rest.length ? rest[rest.length - 1].replace(/\.md$/, '') : undefined
  return [user, repo, handle]
}
