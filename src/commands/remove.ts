import pc from 'picocolors'
import { getAdapter, detectAdapters, claudeAdapter } from '../lib/adapters/index.js'
import { UserError } from '../lib/errors.js'

export async function remove(handle: string, opts: { force?: boolean; for?: string }): Promise<void> {
  const adapters = opts.for
    ? [getAdapter(opts.for)]
    : detectAdapters().length > 0 ? detectAdapters() : [claudeAdapter]

  let removed = false

  for (const adapter of adapters) {
    if (!adapter.isInstalled(handle)) continue
    await adapter.remove(handle, { force: opts.force })
    console.log(pc.green('✓') + ` Removed "${handle}" from ${adapter.label}.`)
    removed = true
  }

  if (!removed) {
    throw new UserError(`Profile "${handle}" is not installed.`)
  }
}
