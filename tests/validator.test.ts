import { describe, it, expect } from 'vitest'
import { parse } from '../src/lib/validator.js'
import { UserError } from '../src/lib/errors.js'

const VALID_PROFILE = `---
name: testhandle
description: A test profile for unit testing.
model: sonnet
---

# Principles

Do good work.

# Decision heuristics

Pick the simpler option.

# Tone and communication

Direct and terse.

# Dialogue examples

---

**Example 1**

> User: what do you think?

Response here.
`

describe('parse', () => {
  it('returns a valid Profile for a well-formed file', () => {
    const profile = parse(VALID_PROFILE, 'test')
    expect(profile.name).toBe('testhandle')
    expect(profile.description).toBe('A test profile for unit testing.')
    expect(profile.model).toBe('sonnet')
    expect(profile.content).toContain('# Principles')
    expect(profile.raw).toBe(VALID_PROFILE)
  })

  it('model is optional', () => {
    const raw = VALID_PROFILE.replace('\nmodel: sonnet', '')
    const profile = parse(raw, 'test')
    expect(profile.model).toBeUndefined()
  })

  it('throws UserError when name is missing', () => {
    const raw = VALID_PROFILE.replace('name: testhandle\n', '')
    expect(() => parse(raw, 'test')).toThrow(UserError)
    expect(() => parse(raw, 'test')).toThrow(/name/)
  })

  it('throws UserError when description is missing', () => {
    const raw = VALID_PROFILE.replace('description: A test profile for unit testing.\n', '')
    expect(() => parse(raw, 'test')).toThrow(UserError)
    expect(() => parse(raw, 'test')).toThrow(/description/)
  })

  it('throws UserError when Principles section is missing', () => {
    const raw = VALID_PROFILE.replace('# Principles', '# Something Else')
    expect(() => parse(raw, 'test')).toThrow(UserError)
    expect(() => parse(raw, 'test')).toThrow(/Principles/)
  })

  it('throws UserError when Decision heuristics section is missing', () => {
    const raw = VALID_PROFILE.replace('# Decision heuristics', '# Something Else')
    expect(() => parse(raw, 'test')).toThrow(UserError)
    expect(() => parse(raw, 'test')).toThrow(/Decision heuristics/)
  })

  it('throws UserError when Tone section is missing', () => {
    const raw = VALID_PROFILE.replace('# Tone and communication', '# Something Else')
    expect(() => parse(raw, 'test')).toThrow(UserError)
    expect(() => parse(raw, 'test')).toThrow(/Tone/)
  })

  it('throws UserError when Dialogue examples section is missing', () => {
    const raw = VALID_PROFILE.replace('# Dialogue examples', '# Something Else')
    expect(() => parse(raw, 'test')).toThrow(UserError)
    expect(() => parse(raw, 'test')).toThrow(/Dialogue examples/)
  })

  it('section match is case-insensitive', () => {
    const raw = VALID_PROFILE
      .replace('# Principles', '# PRINCIPLES')
      .replace('# Tone and communication', '# TONE AND COMMUNICATION')
    expect(() => parse(raw, 'test')).not.toThrow()
  })

  it('includes source name in error messages', () => {
    const raw = VALID_PROFILE.replace('name: testhandle\n', '')
    expect(() => parse(raw, 'myprofile')).toThrow(/myprofile/)
  })
})
