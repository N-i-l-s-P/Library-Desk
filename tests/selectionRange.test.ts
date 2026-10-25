import { describe, expect, it } from 'vitest'
import { idsInRange } from '../src/shared/selectionRange'

describe('idsInRange', () => {
  const order = ['a', 'b', 'c', 'd', 'e']

  it('selects inclusive range in either direction', () => {
    expect(idsInRange(order, 'b', 'd')).toEqual(['b', 'c', 'd'])
    expect(idsInRange(order, 'd', 'b')).toEqual(['b', 'c', 'd'])
  })

  it('handles same endpoints', () => {
    expect(idsInRange(order, 'c', 'c')).toEqual(['c'])
  })
})
