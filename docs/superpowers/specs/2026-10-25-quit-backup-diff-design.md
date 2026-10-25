# Quit-Backup nur bei Library-Diff

**Datum:** 2026-10-25  
**Scope:** Electron `before-quit` Dialog; Auto-Backup-Scheduler unverändert.

## Verhalten

1. Vor dem Quit-Dialog: Content-Hash der aktuellen Library mit `lastBackupContentHash` (in `auto-backup.json`) vergleichen.
2. Hash gleich **oder** leere Library → still beenden (kein Dialog).
3. Hash anders **oder** nie gebackupt bei nicht-leerer Library → bestehender Dialog.
4. Erfolgreiches Backup (`runAutoBackup`, inkl. Quit „Mit Backup“) → Hash persistieren.
5. „Ohne Backup beenden“ → Hash unverändert (nächster Quit fragt wieder).
6. Backup fehlgeschlagen → bestehender Warn-Dialog.

## Diff / Hash

- Shared: kanonischer Payload (`entries` als Export-Rows ohne `exportedAt`, Media als `{path, sha256}`) + `shouldPromptQuitBackup`.
- Main: gleiche Medienquellen wie `buildSpdZipBuffer`/`collectMedia`, SHA-256, **kein** Schreiben ins Backup-Folder nur für den Diff.
- Web: kein Quit-Dialog (no-op / unberührt).

## Edge-Cases

| Situation | Dialog? |
|-----------|---------|
| Leere Library | Nein |
| Daten, nie erfolgreich gebackupt (`lastSuccessAt` leer) | Ja |
| Daten, Hash == gespeichert | Nein |
| Daten, Hash != gespeichert | Ja |
| Quit ohne Backup | Hash bleibt alt |
| Upgrade: `lastSuccessAt` gesetzt, Hash fehlt | Beim Start Hash aus aktuellem Stand seeden (einmalig) |
