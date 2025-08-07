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

  // Read env vars at module scope so they're statically replaced at build time
  const ENV_USER = process.env.NEXT_PUBLIC_LOGIN_USER || 'admin@job.com';
  const ENV_PASS = process.env.NEXT_PUBLIC_LOGIN_PASS || 'admin123';

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === ENV_USER && password === ENV_PASS) {
      const authData = { user: { email }, timestamp: Date.now() };
      localStorage.setItem('job-auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setUser({ email });
      return true;
    }
    return false;
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
