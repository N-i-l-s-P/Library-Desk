import { describe, expect, it } from 'vitest'
import { countLibraryGroups } from '../src/shared/libraryStats'
import type { Entry } from '../src/shared/types'

function entry(partial: Partial<Entry> & Pick<Entry, 'id' | 'groupId' | 'kind'>): Entry {
  return {
    version: 1,
    title: partial.id,
    stylePrompt: '',
    lyrics: '',
    promptBody: '',
    systemRole: '',
    usageGuide: '',
    notes: '',
    tags: [],
    rating: 0,
    published: false,
    publishLinks: [],
    audio: null,
    cover: null,
    attachments: [],
    createdAt: 1,
    updatedAt: 1,
    ...partial,
  }
}

describe('countLibraryGroups', () => {
  it('counts groups by kind, not versions', () => {
    const catalog = [
      entry({ id: 'a1', groupId: 'g1', kind: 'suno', version: 1 }),
      entry({ id: 'a2', groupId: 'g1', kind: 'suno', version: 2 }),
      entry({ id: 'b1', groupId: 'g2', kind: 'general' }),
    ]
    expect(countLibraryGroups(catalog)).toEqual({ total: 2, suno: 1, general: 1 })
  })
})
