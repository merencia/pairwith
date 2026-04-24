import type { Profile } from '../validator.js'

export interface InstallOptions {
  force?: boolean
  cwd?: string
}

export interface Adapter {
  readonly id: string
  readonly label: string
  detect(): boolean
  install(profile: Profile, opts?: InstallOptions): Promise<void>
  isInstalled(name: string): boolean
  remove(name: string, opts?: { force?: boolean }): Promise<void>
  list(): Promise<Array<{ name: string; description: string }>>
}
