import { useEffect, useId, useRef, useState } from 'react'
import { getDesk } from '@renderer/api'
import { LAST_EXPORT_SETTING_KEY, parseLastExport, type LastExportInfo } from '@shared/lastExport'
import { countLibraryGroups } from '@shared/libraryStats'
import type { Entry } from '@shared/types'

interface LibraryInfoButtonProps {
  catalog: Entry[]
}

function formatExportWhen(at: string): string {
  try {
    return new Date(at).toLocaleString('de-DE')
  } catch {
    return at
  }
}

export function LibraryInfoButton({ catalog }: LibraryInfoButtonProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [lastExport, setLastExport] = useState<LastExportInfo | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const stats = countLibraryGroups(catalog)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    void getDesk()
      .settings.get(LAST_EXPORT_SETTING_KEY)
      .then((raw) => {
        if (!cancelled) setLastExport(parseLastExport(raw))
      })
      .catch(() => {
        if (!cancelled) setLastExport(null)
      })
    return () => {
      cancelled = true
    }
  }, [open, catalog])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') setOpen(false)
    }
    const timer = window.setTimeout(() => {
      window.addEventListener('pointerdown', onPointerDown)
      window.addEventListener('keydown', onKey)
    }, 0)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="library-info" ref={rootRef}>
      <button
        type="button"
        className="library-info-trigger"
        aria-label="Bibliotheksinfo"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        i
      </button>
      {open ? (
        <div id={panelId} className="library-info-panel" role="dialog" aria-label="Bibliotheksinfo">
          <p className="library-info-heading">Einträge</p>
          <ul className="library-info-list">
            <li>
              Gesamt: <strong>{stats.total}</strong>
            </li>
            <li>
              Suno: <strong>{stats.suno}</strong>
            </li>
            <li>
              Allgemein: <strong>{stats.general}</strong>
            </li>
          </ul>
          <p className="library-info-heading">Letzte Sicherung / Export</p>
          {lastExport ? (
            <ul className="library-info-list">
              <li>{formatExportWhen(lastExport.at)}</li>
              <li className="library-info-filename" title={lastExport.fileName}>
                {lastExport.fileName}
              </li>
            </ul>
          ) : (
            <p className="library-info-empty">Noch keine Sicherung oder kein Export erfasst.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
