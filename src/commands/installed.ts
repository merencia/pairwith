import pc from 'picocolors'
import { getAdapter, allAdapters } from '../lib/adapters/index.js'

export async function installed(opts: { for?: string }): Promise<void> {
  const adapters = opts.for ? [getAdapter(opts.for)] : allAdapters()

  let total = 0

  for (const adapter of adapters) {
    const profiles = await adapter.list()
    if (profiles.length === 0) continue

    total += profiles.length
    console.log(pc.bold(`\n${adapter.label} (${profiles.length})\n`))
    for (const { name, description } of profiles) {
      console.log(`  ${pc.cyan(name)}`)
      console.log(`  ${pc.dim(description)}\n`)
    }
  }

  if (total === 0) {
    console.log('No profiles installed.')
    console.log(`Run ${pc.dim('pairwith install')} to get started.`)
  }
}
