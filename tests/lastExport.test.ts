import { describe, expect, it } from 'vitest'
import {
  basenameFromPath,
  makeLastExportInfo,
  parseLastExport,
  serializeLastExport,
} from '../src/shared/lastExport'

describe('lastExport', () => {
  it('extracts basename from paths', () => {
    expect(basenameFromPath('/tmp/foo/library.spd.zip')).toBe('library.spd.zip')
    expect(basenameFromPath('C:\\backups\\a.spd.zip')).toBe('a.spd.zip')
  })

  it('round-trips JSON', () => {
    const info = makeLastExportInfo('/x/library-desk-backup-2026-10-16-1800.spd.zip')
    expect(info.fileName).toBe('library-desk-backup-2026-10-16-1800.spd.zip')
    expect(parseLastExport(serializeLastExport(info))).toEqual(info)
  })

  it('rejects invalid payloads', () => {
    expect(parseLastExport(null)).toBeNull()
    expect(parseLastExport('{}')).toBeNull()
    expect(parseLastExport('nope')).toBeNull()
  })
})
