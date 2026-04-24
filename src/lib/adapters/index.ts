import { claudeAdapter } from './claude.js'
import { copilotAdapter } from './copilot.js'
import { cursorAdapter } from './cursor.js'
import type { Adapter } from './types.js'
import { UserError } from '../errors.js'

export { claudeAdapter, copilotAdapter, cursorAdapter }
export type { Adapter }

const ALL_ADAPTERS: Adapter[] = [claudeAdapter, cursorAdapter, copilotAdapter]

export function getAdapter(id: string): Adapter {
  const adapter = ALL_ADAPTERS.find(a => a.id === id)
  if (!adapter) {
    const valid = ALL_ADAPTERS.map(a => a.id).join(', ')
    throw new UserError(`Unknown tool "${id}". Valid options: ${valid}.`)
  }
  return adapter
}

export function detectAdapters(): Adapter[] {
  return ALL_ADAPTERS.filter(a => a.detect())
}

export function allAdapters(): Adapter[] {
  return ALL_ADAPTERS
}
