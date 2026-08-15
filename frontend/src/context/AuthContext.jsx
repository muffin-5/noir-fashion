import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (!token) {
      setLoading(false)
      return
    }
    client
      .get('/auth/me/')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username, password) => {
    const { data } = await client.post('/auth/login/', { username, password })
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    const me = await client.get('/auth/me/')
    setUser(me.data)
    return me.data
  }, [])

  const signup = useCallback(async (payload) => {
    const { data } = await client.post('/auth/register/', payload)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}