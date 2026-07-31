import { describe, it, expect } from 'vitest'
import { buildUser } from '@/test/factories'
import {
  breakdownByStatus,
  topOrganizations,
  recentlyJoined,
} from './dashboardInsights'

describe('breakdownByStatus', () => {
  it('counts each status and its share of the whole', () => {
    const users = [
      buildUser({ status: 'active' }),
      buildUser({ status: 'active' }),
      buildUser({ status: 'pending' }),
      buildUser({ status: 'blacklisted' }),
    ]

    const rows = breakdownByStatus(users)

    expect(rows).toEqual([
      { status: 'active', count: 2, percentage: 50 },
      { status: 'inactive', count: 0, percentage: 0 },
      { status: 'pending', count: 1, percentage: 25 },
      { status: 'blacklisted', count: 1, percentage: 25 },
    ])
  })

  it('always reports every status, including absent ones', () => {
    const rows = breakdownByStatus([buildUser({ status: 'active' })])

    expect(rows.map((row) => row.status)).toEqual([
      'active',
      'inactive',
      'pending',
      'blacklisted',
    ])
  })

  it('does not divide by zero on an empty dataset', () => {
    const rows = breakdownByStatus([])

    expect(rows.every((row) => row.count === 0)).toBe(true)
    expect(rows.every((row) => row.percentage === 0)).toBe(true)
  })
})

describe('topOrganizations', () => {
  it('ranks organizations by user count, largest first', () => {
    const users = [
      ...Array.from({ length: 3 }, () =>
        buildUser({ organization: 'Lendsqr' }),
      ),
      ...Array.from({ length: 2 }, () => buildUser({ organization: 'Irorun' })),
      buildUser({ organization: 'Kuda' }),
    ]

    expect(topOrganizations(users)).toEqual([
      { organization: 'Lendsqr', count: 3 },
      { organization: 'Irorun', count: 2 },
      { organization: 'Kuda', count: 1 },
    ])
  })

  it('breaks ties alphabetically so the order is stable', () => {
    const users = [
      buildUser({ organization: 'Zenith' }),
      buildUser({ organization: 'Access' }),
    ]

    expect(topOrganizations(users).map((row) => row.organization)).toEqual([
      'Access',
      'Zenith',
    ])
  })

  it('caps the list at the requested limit', () => {
    const users = Array.from({ length: 12 }, (_, index) =>
      buildUser({ organization: `Org ${index}` }),
    )

    expect(topOrganizations(users)).toHaveLength(5)
    expect(topOrganizations(users, 3)).toHaveLength(3)
  })

  it('returns nothing for an empty dataset', () => {
    expect(topOrganizations([])).toEqual([])
  })
})

describe('recentlyJoined', () => {
  it('returns the newest sign-ups first', () => {
    const users = [
      buildUser({ username: 'oldest', dateJoined: '2020-01-01T00:00:00.000Z' }),
      buildUser({ username: 'newest', dateJoined: '2024-06-01T00:00:00.000Z' }),
      buildUser({ username: 'middle', dateJoined: '2022-03-01T00:00:00.000Z' }),
    ]

    expect(recentlyJoined(users).map((user) => user.username)).toEqual([
      'newest',
      'middle',
      'oldest',
    ])
  })

  it('does not mutate the dataset it was given', () => {
    const users = [
      buildUser({ username: 'a', dateJoined: '2020-01-01T00:00:00.000Z' }),
      buildUser({ username: 'b', dateJoined: '2024-01-01T00:00:00.000Z' }),
    ]
    const originalOrder = users.map((user) => user.username)

    recentlyJoined(users)

    expect(users.map((user) => user.username)).toEqual(originalOrder)
  })

  it('caps the list at the requested limit', () => {
    const users = Array.from({ length: 20 }, () => buildUser())

    expect(recentlyJoined(users)).toHaveLength(5)
    expect(recentlyJoined(users, 2)).toHaveLength(2)
  })
})
