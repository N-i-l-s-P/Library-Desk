import { createHash } from 'node:crypto'

/** Deterministic library fingerprint input (Electron quit-diff / backup). Web: unused. */
export type LibraryFingerprintMedia = {
  path: string
  sha256: string
}

export type LibraryFingerprintInput = {
  /** Export-shaped entry rows (no volatile `exportedAt`). */
  entries: ReadonlyArray<Record<string, unknown> & { id: string }>
  media: ReadonlyArray<LibraryFingerprintMedia>
}

export function canonicalizeLibraryContent(input: LibraryFingerprintInput): string {
  const entries = [...input.entries].sort((a, b) => a.id.localeCompare(b.id))
  const media = [...input.media]
    .map((part) => ({ path: part.path, sha256: part.sha256 }))
    .sort((a, b) => a.path.localeCompare(b.path))
  return JSON.stringify({
    format: 'library-desk-content-v1',
    entries,
    media,
  })
}

export function hashCanonicalLibraryContent(input: LibraryFingerprintInput): string {
  return createHash('sha256').update(canonicalizeLibraryContent(input), 'utf8').digest('hex')
}

/**
 * Quit backup dialog: only when library has data and content differs from last successful backup.
 * Empty library → never prompt. „Ohne Backup“ leaves lastBackupContentHash unchanged.
 */
export function shouldPromptQuitBackup(
  currentHash: string,
  lastBackupContentHash: string | null | undefined,
  hasLibraryContent: boolean,
): boolean {
  if (!hasLibraryContent) return false
  if (lastBackupContentHash == null || lastBackupContentHash.trim() === '') return true
  return currentHash !== lastBackupContentHash
}

/** Upgrade: prior backup success exists but content hash was never stored. */
export function shouldSeedBackupContentHash(
  lastBackupContentHash: string | null | undefined,
  lastSuccessAt: string | null | undefined,
): boolean {
  const hasHash =
    lastBackupContentHash != null && lastBackupContentHash.trim().length > 0
  const hasSuccess = lastSuccessAt != null && lastSuccessAt.trim().length > 0
  return !hasHash && hasSuccess
}
