import { homedir } from 'os'
import { join } from 'path'

export const CLAUDE_DIR = join(homedir(), '.claude')
export const AGENTS_DIR = join(CLAUDE_DIR, 'agents')
export const SKILLS_DIR = join(CLAUDE_DIR, 'skills')

export const agentPath = (name: string) => join(AGENTS_DIR, `${name}.md`)
export const skillDir = (name: string) => join(SKILLS_DIR, name)
export const skillPath = (name: string) => join(skillDir(name), 'SKILL.md')
