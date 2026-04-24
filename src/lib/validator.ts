import matter from 'gray-matter'
import { UserError } from './errors.js'

export interface Profile {
  name: string
  description: string
  model?: string
  content: string
  raw: string
}

const REQUIRED_SECTIONS = [
  'Principles',
  'Decision heuristics',
  'Tone',
  'Dialogue examples',
]

export function parse(raw: string, source: string): Profile {
  let parsed: ReturnType<typeof matter>
  try {
    parsed = matter(raw)
  } catch {
    throw new UserError(`${source}: could not parse YAML frontmatter.`)
  }

  const { data, content } = parsed

  if (!data.name || typeof data.name !== 'string') {
    throw new UserError(`${source}: missing required frontmatter field "name".`)
  }

  if (!data.description || typeof data.description !== 'string') {
    throw new UserError(`${source}: missing required frontmatter field "description".`)
  }

  const missingSections = REQUIRED_SECTIONS.filter(
    section => !content.toLowerCase().includes(`# ${section.toLowerCase()}`)
  )

  if (missingSections.length > 0) {
    throw new UserError(
      `${source}: missing required sections: ${missingSections.map(s => `"${s}"`).join(', ')}.\n` +
      `See TEMPLATE.md for the expected structure.`
    )
  }

  return {
    name: data.name as string,
    description: data.description as string,
    model: data.model as string | undefined,
    content,
    raw,
  }
}
