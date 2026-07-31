/**
 * Dates and money are formatted with the platform's `Intl` APIs rather than a
 * date library. Moment is in maintenance-only status per its own maintainers,
 * and pulling ~70 kB into the bundle for a single call was not defensible.
 */

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
})

/** "May 15, 2020 10:00 AM" — the format used across the design. */
export function formatDate(date: string | Date): string {
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'

  // Intl separates date and time with a comma; the design does not.
  return DATE_FORMATTER.format(parsed).replace(/,([^,]*)$/, '$1')
}

export function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount)
}
