import type { Entry } from './types'
import { groupEntriesForDisplay } from './versionGroups'

export interface LibraryGroupStats {
  total: number
  suno: number
  general: number
}

/** Counts version groups (list rows), split by representative kind. */
export function countLibraryGroups(entries: readonly Entry[]): LibraryGroupStats {
  const groups = groupEntriesForDisplay([...entries])
  let suno = 0
  let general = 0
  for (const group of groups) {
    if (group.representative.kind === 'general') general += 1
    else suno += 1
  }
  return { total: groups.length, suno, general }
}
