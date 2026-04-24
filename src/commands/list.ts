import pc from 'picocolors'
import { fetchOfficialProfileList } from '../lib/github.js'

export async function list(opts: { search?: string }): Promise<void> {
  process.stderr.write('Fetching profile list...\n')

  const profiles = await fetchOfficialProfileList()

  const filtered = opts.search
    ? profiles.filter(h => h.toLowerCase().includes(opts.search!.toLowerCase()))
    : profiles

  if (filtered.length === 0) {
    console.log(opts.search ? `No profiles matching "${opts.search}".` : 'No profiles in registry.')
    return
  }

  console.log(pc.bold(`\nOfficial profiles (${filtered.length})\n`))
  for (const handle of filtered) {
    console.log(`  ${handle}`)
  }
  console.log()
  console.log(`Install one: ${pc.dim('ia-pair-profile install <handle>')}`)
}
