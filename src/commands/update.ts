import { install } from './install.js'
import { getAdapter, detectAdapters, claudeAdapter } from '../lib/adapters/index.js'
import { UserError } from '../lib/errors.js'

export async function update(handle: string, opts: { for?: string }): Promise<void> {
  const adapters = opts.for
    ? [getAdapter(opts.for)]
    : detectAdapters().length > 0 ? detectAdapters() : [claudeAdapter]

  const isInstalled = adapters.some(a => a.isInstalled(handle))
  if (!isInstalled) {
    throw new UserError(`Profile "${handle}" is not installed. Use "install" to install it first.`)
  }

  await install(handle, { force: true, for: opts.for })
}
