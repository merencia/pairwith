import { describe, it, expect } from 'vitest'
import { resolve } from '../src/lib/resolver.js'
import { UserError } from '../src/lib/errors.js'

describe('resolve', () => {
  describe('official handle', () => {
    it('returns official source for bare handle', () => {
      expect(resolve('caarlos0')).toEqual({ type: 'official', handle: 'caarlos0' })
    })

    it('accepts handles with hyphens and underscores', () => {
      expect(resolve('my-handle_123')).toEqual({ type: 'official', handle: 'my-handle_123' })
    })

    it('throws for handle with invalid characters', () => {
      expect(() => resolve('invalid handle!')).toThrow(UserError)
    })
  })

  describe('external user/repo', () => {
    it('returns external source for user/repo', () => {
      expect(resolve('merencia/pairwith')).toEqual({
        type: 'external',
        user: 'merencia',
        repo: 'pairwith',
        handle: undefined,
      })
    })

    it('returns external source with handle for user/repo#handle', () => {
      expect(resolve('merencia/pairwith#caarlos0')).toEqual({
        type: 'external',
        user: 'merencia',
        repo: 'pairwith',
        handle: 'caarlos0',
      })
    })

    it('throws for malformed user/repo/extra', () => {
      expect(() => resolve('a/b/c')).toThrow(UserError)
    })

    it('throws for missing repo', () => {
      expect(() => resolve('merencia/')).toThrow(UserError)
    })
  })

  describe('GitHub URL', () => {
    it('resolves repo URL to external source', () => {
      expect(resolve('https://github.com/merencia/pairwith')).toEqual({
        type: 'external',
        user: 'merencia',
        repo: 'pairwith',
        handle: undefined,
      })
    })

    it('resolves file URL and extracts handle from filename', () => {
      expect(resolve('https://github.com/merencia/pairwith/blob/main/profiles/caarlos0.md')).toEqual({
        type: 'external',
        user: 'merencia',
        repo: 'pairwith',
        handle: 'caarlos0',
      })
    })

    it('throws for non-GitHub URL', () => {
      expect(() => resolve('https://gitlab.com/user/repo')).toThrow(UserError)
    })

    it('throws for invalid URL', () => {
      expect(() => resolve('https://')).toThrow(UserError)
    })
  })
})
