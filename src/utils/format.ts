import moment from 'moment'

export function formatDate(date: string | Date): string {
  return moment(date).format('MMM D, YYYY h:mm A')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount)
}
