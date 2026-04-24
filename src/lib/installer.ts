import { existsSync, mkdirSync, writeFileSync, renameSync, unlinkSync, readdirSync } from 'fs'
import { readFile } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'
import { AGENTS_DIR, SKILLS_DIR, agentPath, skillDir, skillPath } from './paths.js'
import { Profile } from './validator.js'

export function ensureDirs(): void {
  mkdirSync(AGENTS_DIR, { recursive: true })
  mkdirSync(SKILLS_DIR, { recursive: true })
}

export function isInstalled(name: string): boolean {
  return existsSync(agentPath(name))
}

export function installProfile(profile: Profile): void {
  const dest = agentPath(profile.name)
  const tmp = `${dest}.tmp`
  writeFileSync(tmp, profile.raw, 'utf8')
  renameSync(tmp, dest)
}

export function removeProfile(name: string): void {
  const path = agentPath(name)
  if (!existsSync(path)) return
  unlinkSync(path)
}

export function installSkill(name: string, content: string): void {
  const dir = skillDir(name)
  mkdirSync(dir, { recursive: true })
  const dest = skillPath(name)
  const tmp = `${dest}.tmp`
  writeFileSync(tmp, content, 'utf8')
  renameSync(tmp, dest)
}

export function isSkillInstalled(name: string): boolean {
  return existsSync(skillPath(name))
}

export async function listInstalled(): Promise<Array<{ name: string; description: string }>> {
  if (!existsSync(AGENTS_DIR)) return []

  const files = readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'))
  const results: Array<{ name: string; description: string }> = []

  for (const file of files) {
    try {
      const raw = await readFile(join(AGENTS_DIR, file), 'utf8')
      const { data } = matter(raw)
      if (data.name && data.description) {
        results.push({ name: data.name as string, description: data.description as string })
      }
    } catch {
      // skip unreadable files
    }
  }

  return results.sort((a, b) => a.name.localeCompare(b.name))
}
