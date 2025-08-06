'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'
import JobBoard from '@/components/JobBoard'

export default function Home() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Job Search Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your job search configurations and view results from your n8n automation
          </p>
        </div>
        <JobBoard />
      </div>
    </div>
  )
}
