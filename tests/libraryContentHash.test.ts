import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  canonicalizeLibraryContent,
  hashCanonicalLibraryContent,
  shouldPromptQuitBackup,
  shouldSeedBackupContentHash,
  type LibraryFingerprintInput,
} from '../src/shared/libraryContentHash'

function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

const baseInput = (): LibraryFingerprintInput => ({
  entries: [
    {
      id: 'b',
      title: 'Beta',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'a',
      title: 'Alpha',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  media: [
    { path: 'media/b/x.bin', sha256: 'bbb' },
    { path: 'media/a/y.bin', sha256: 'aaa' },
  ],
})

describe('canonicalizeLibraryContent', () => {
  it('is stable regardless of entry/media insertion order', () => {
    const a = canonicalizeLibraryContent(baseInput())
    const b = canonicalizeLibraryContent({
      entries: [...baseInput().entries].reverse(),
      media: [...baseInput().media].reverse(),
    })
    expect(a).toBe(b)
  })

  it('changes when an entry field changes', () => {
    const before = canonicalizeLibraryContent(baseInput())
    const after = canonicalizeLibraryContent({
      ...baseInput(),
      entries: baseInput().entries.map((row) =>
        row.id === 'a' ? { ...row, title: 'Alpha changed' } : row,
      ),
    })
    expect(after).not.toBe(before)
  })

  it('changes when media digest changes', () => {
    const before = canonicalizeLibraryContent(baseInput())
    const after = canonicalizeLibraryContent({
      ...baseInput(),
      media: baseInput().media.map((part) =>
        part.path === 'media/a/y.bin' ? { ...part, sha256: 'changed' } : part,
      ),
    })
    expect(after).not.toBe(before)
  })
})

describe('hashCanonicalLibraryContent', () => {
  it('returns sha256 of the canonical payload (same after backup-equivalent input)', () => {
    const canonical = canonicalizeLibraryContent(baseInput())
    expect(hashCanonicalLibraryContent(baseInput())).toBe(sha256Hex(canonical))
    expect(hashCanonicalLibraryContent(baseInput())).toBe(hashCanonicalLibraryContent(baseInput()))
  })
})

describe('shouldPromptQuitBackup', () => {
  const hash = 'abc'

  it('skips dialog for empty library (even without prior backup)', () => {
    expect(shouldPromptQuitBackup(hash, null, false)).toBe(false)
    expect(shouldPromptQuitBackup(hash, 'old', false)).toBe(false)
  })

  it('prompts when library has data and never backed up', () => {
    expect(shouldPromptQuitBackup(hash, null, true)).toBe(true)
    expect(shouldPromptQuitBackup(hash, '', true)).toBe(true)
  })

  it('skips dialog when hash matches last backup', () => {
    expect(shouldPromptQuitBackup(hash, hash, true)).toBe(false)
  })

  it('prompts when hash differs from last backup', () => {
    expect(shouldPromptQuitBackup(hash, 'other', true)).toBe(true)
  })
})

describe('shouldSeedBackupContentHash', () => {
  it('seeds only when a prior success exists but hash is missing (upgrade)', () => {
    expect(shouldSeedBackupContentHash(null, '2026-10-25T19:41:24.621Z')).toBe(true)
    expect(shouldSeedBackupContentHash('', '2026-10-25T19:41:24.621Z')).toBe(true)
    expect(shouldSeedBackupContentHash('abc', '2026-10-25T19:41:24.621Z')).toBe(false)
    expect(shouldSeedBackupContentHash(null, null)).toBe(false)
  })
})
