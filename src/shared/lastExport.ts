export const LAST_EXPORT_SETTING_KEY = 'lastLibraryExport'

export interface LastExportInfo {
  /** ISO timestamp */
  at: string
  /** Basename of the written file */
  fileName: string
}

export function basenameFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const parts = normalized.split('/')
  const name = parts[parts.length - 1] ?? ''
  return name.trim() || filePath.trim()
}

export function makeLastExportInfo(filePathOrName: string, at: Date = new Date()): LastExportInfo {
  return {
    at: at.toISOString(),
    fileName: basenameFromPath(filePathOrName),
  }
}

export function serializeLastExport(info: LastExportInfo): string {
  return JSON.stringify(info)
}

export function parseLastExport(raw: string | null | undefined): LastExportInfo | null {
  if (raw == null || raw.trim() === '') return null
  try {
    const value = JSON.parse(raw) as unknown
    if (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as LastExportInfo).at === 'string' &&
      typeof (value as LastExportInfo).fileName === 'string' &&
      (value as LastExportInfo).fileName.trim().length > 0
    ) {
      return {
        at: (value as LastExportInfo).at,
        fileName: (value as LastExportInfo).fileName.trim(),
      }
    }
  } catch {
    return null
  }
  return null
}
