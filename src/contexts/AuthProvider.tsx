import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { STORAGE_KEYS } from '@/constants'
import { clearSelectedUser } from '@/utils'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
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
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
