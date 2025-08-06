'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  user: { email: string } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const savedAuth = localStorage.getItem('job-auth')
    if (savedAuth) {
      const authData = JSON.parse(savedAuth)
      setIsAuthenticated(true)
      setUser(authData.user)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple mock authentication - in production, you'd call your auth API
    if (email === 'admin@job.com' && password === 'admin123') {
      const authData = { user: { email }, timestamp: Date.now() }
      localStorage.setItem('job-auth', JSON.stringify(authData))
      setIsAuthenticated(true)
      setUser({ email })
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('job-auth')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
