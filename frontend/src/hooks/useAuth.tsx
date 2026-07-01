import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '../types'
import { getMe } from '../api'

interface AuthCtx {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const Ctx = createContext<AuthCtx>({ user: null, token: null, login: () => {}, logout: () => {}, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('jt_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('jt_token')
    if (t) {
      getMe().then(setUser).catch(() => { localStorage.removeItem('jt_token'); setToken(null) }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (t: string, u: User) => {
    localStorage.setItem('jt_token', t)
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('jt_token')
    setToken(null)
    setUser(null)
  }

  return <Ctx.Provider value={{ user, token, login, logout, loading }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
