import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PAGE_SIZE,
  hasActiveFilters,
  parseUsersQuery,
  toFilterValues,
} from './usersQuery'

function parse(search: string) {
  return parseUsersQuery(new URLSearchParams(search))
}

describe('parseUsersQuery', () => {
  describe('defaults', () => {
    it('starts on the first page at the default size', () => {
      expect(parse('')).toEqual({
        page: 1,
        perPage: DEFAULT_PAGE_SIZE,
        sortBy: undefined,
        sortOrder: undefined,
        search: undefined,
        organization: undefined,
        username: undefined,
        email: undefined,
        phoneNumber: undefined,
        dateJoined: undefined,
        status: undefined,
      })
    })
  })

  describe('paging and sorting', () => {
    it('reads page and size as numbers', () => {
      const query = parse('page=3&perPage=50')

      expect(query.page).toBe(3)
      expect(query.perPage).toBe(50)
    })

    it('reads a sortable column and direction', () => {
      const query = parse('sortBy=dateJoined&sortOrder=desc')

      expect(query.sortBy).toBe('dateJoined')
      expect(query.sortOrder).toBe('desc')
    })
  })

  describe('filters', () => {
    it('maps the header search parameter onto the API name', () => {
      expect(parse('q=grace').search).toBe('grace')
    })

    it('trims surrounding whitespace', () => {
      expect(parse('q=%20grace%20').search).toBe('grace')
    })

    it('treats a blank value as absent', () => {
      expect(parse('q=%20%20&username=').search).toBeUndefined()
      expect(parse('q=%20%20&username=').username).toBeUndefined()
    })

    it('reads every filter the panel offers', () => {
      const query = parse(
        'organization=Lendsqr&username=grace&email=grace%40lendsqr.com' +
          '&phoneNumber=0801&dateJoined=2026-05-29&status=active',
      )

      expect(query).toMatchObject({
        organization: 'Lendsqr',
        username: 'grace',
        email: 'grace@lendsqr.com',
        phoneNumber: '0801',
        dateJoined: '2026-05-29',
        status: 'active',
      })
    })
  })

  // The URL is editable, and the API answers anything it does not recognise
  // with a 400. A hand-typed parameter should fall back, not break the page.
  describe('rejecting values the API would refuse', () => {
    it('falls back to page one for a non-numeric page', () => {
      expect(parse('page=abc').page).toBe(1)
      expect(parse('page=0').page).toBe(1)
      expect(parse('page=-4').page).toBe(1)
    })

    it("falls back to the default size beyond the API's ceiling", () => {
      expect(parse('perPage=5000').perPage).toBe(DEFAULT_PAGE_SIZE)
    })

    it('drops a column that cannot be sorted on', () => {
      expect(parse('sortBy=accountBalance').sortBy).toBeUndefined()
    })

    it('drops an unknown sort direction', () => {
      expect(parse('sortOrder=sideways').sortOrder).toBeUndefined()
    })

    it('drops a status outside the four the API accepts', () => {
      expect(parse('status=retired').status).toBeUndefined()
    })

    it('drops a date that is not a calendar day', () => {
      expect(parse('dateJoined=last-tuesday').dateJoined).toBeUndefined()
      expect(
        parse('dateJoined=2026-05-29T12:00:00Z').dateJoined,
      ).toBeUndefined()
    })
  })
})

describe('toFilterValues', () => {
  it('fills unset fields with empty strings so the form can be seeded', () => {
    expect(toFilterValues(parse('organization=Lendsqr'))).toEqual({
      organization: 'Lendsqr',
      username: '',
      email: '',
      phoneNumber: '',
      dateJoined: '',
      status: '',
    })
  })
})

describe('hasActiveFilters', () => {
  it('is false for an untouched query', () => {
    expect(hasActiveFilters(parse(''))).toBe(false)
  })

  it('is true when any filter is applied', () => {
    expect(hasActiveFilters(parse('status=active'))).toBe(true)
  })

  // Search is not a column filter — the empty state offers to clear both, but
  // the funnel icon only lights up for filters.
  it('ignores search, paging and sorting', () => {
    expect(hasActiveFilters(parse('q=grace&page=2&sortBy=email'))).toBe(false)
  })
})
