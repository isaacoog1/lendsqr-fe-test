import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { STORAGE_KEYS } from '@/constants'
import { clearSelectedUser } from '@/utils'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  })

  const login = useCallback((token: string) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    clearSelectedUser()
    // Cached users outlive the session otherwise: with a 10 minute gcTime the
    // next sign-in would be served the previous account's data without a refetch.
    queryClient.clear()
    setIsAuthenticated(false)
  }, [queryClient])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
