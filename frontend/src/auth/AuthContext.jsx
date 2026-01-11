import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('dr_token') || '')
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('dr_user')
    return cached ? JSON.parse(cached) : null
  })
  const [loading, setLoading] = useState(false)
  const isAuthenticated = Boolean(token)

  const saveSession = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem('dr_token', nextToken)
    localStorage.setItem('dr_user', JSON.stringify(nextUser))
  }

  const clearSession = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('dr_token')
    localStorage.removeItem('dr_user')
  }

  const register = async ({ name, email, password }) => {
    await axios.post(`${API_URL}/auth/register`, { name, email, password })
  }

  const login = async ({ email, password }) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password })
    if (res.data?.token) {
      saveSession(res.data.token, res.data.user)
    }
    return res.data
  }

  const fetchMe = async () => {
    if (!token) return
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data?.user) {
        saveSession(token, res.data.user)
      }
    } catch (err) {
      clearSession()
      console.error('Session refresh failed', err)
    }
  }

  useEffect(() => {
    fetchMe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout: clearSession,
    setLoading,
    fetchMe
  }), [token, user, isAuthenticated, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
