/** Inclusive range between two ids in an ordered list (Shift-select). */
export function idsInRange(orderedIds: readonly string[], fromId: string, toId: string): string[] {
  const from = orderedIds.indexOf(fromId)
  const to = orderedIds.indexOf(toId)
  if (from < 0 && to < 0) return []
  if (from < 0) return [toId]
  if (to < 0) return [fromId]
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  return orderedIds.slice(lo, hi + 1)
}
