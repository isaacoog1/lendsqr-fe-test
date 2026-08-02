export interface ApiError {
  message: string
  status: number
}

/**
 * Every endpoint answers in the same envelope. The payload is unwrapped in the
 * service layer so nothing above it has to know the wire format.
 */
export interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

export interface Pagination {
  page: number
  perPage: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
