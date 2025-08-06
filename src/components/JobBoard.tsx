'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Job, SearchConfig } from '@/types'
import JobsList from './JobsList'
import SearchConfigForm from './SearchConfigForm'

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking'
  database: string
  timestamp?: string
  error?: string
}

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchConfigs, setSearchConfigs] = useState<SearchConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'jobs' | 'config'>('jobs')
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({ 
    status: 'checking', 
    database: 'checking...' 
  })
  const { logout, user } = useAuth()

  // Check database health on component mount
  useEffect(() => {
    checkDatabaseHealth()
    fetchJobs()
    fetchSearchConfigs()
  }, [])

  const checkDatabaseHealth = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealthStatus(data)
    } catch {
      setHealthStatus({
        status: 'unhealthy',
        database: 'disconnected',
        error: 'Failed to reach health endpoint'
      })
    }
  }

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      } else {
        console.error('Failed to fetch jobs:', response.statusText)
        setJobs([])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSearchConfigs = async () => {
    try {
      const response = await fetch('/api/search-configs')
      if (response.ok) {
        const data = await response.json()
        setSearchConfigs(data || [])
      } else {
        console.error('Failed to fetch search configs:', response.statusText)
        setSearchConfigs([])
      }
    } catch (error) {
      console.error('Error fetching search configs:', error)
      setSearchConfigs([])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with logout and database status */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
            
            {/* Database Status Indicator */}
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${
                healthStatus.status === 'healthy' 
                  ? 'bg-green-500' 
                  : healthStatus.status === 'unhealthy' 
                  ? 'bg-red-500' 
                  : 'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className={`text-sm font-medium ${
                healthStatus.status === 'healthy' 
                  ? 'text-green-700' 
                  : healthStatus.status === 'unhealthy' 
                  ? 'text-red-700' 
                  : 'text-yellow-700'
              }`}>
                Database: {healthStatus.database}
              </span>
              <button
                onClick={checkDatabaseHealth}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Refresh
              </button>
            </div>
            {healthStatus.error && (
              <p className="text-xs text-red-600 mt-1">Error: {healthStatus.error}</p>
            )}
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Jobs</p>
              <p className="text-3xl font-bold">{jobs.length}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Applied</p>
              <p className="text-3xl font-bold">{jobs.filter(j => j.status === 'applied').length}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">New Jobs</p>
              <p className="text-3xl font-bold">{jobs.filter(j => j.status === 'new').length}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Configs</p>
              <p className="text-3xl font-bold">{searchConfigs.length}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/60 backdrop-blur-sm p-1 rounded-2xl w-fit border border-white/20 shadow-lg">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'jobs'
              ? 'bg-white text-gray-900 shadow-lg scale-105'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Jobs ({jobs.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-8 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'config'
              ? 'bg-white text-gray-900 shadow-lg scale-105'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span>Search Config</span>
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'jobs' ? (
        <JobsList jobs={jobs} loading={loading} onRefresh={fetchJobs} />
      ) : (
        <SearchConfigForm 
          searchConfigs={searchConfigs} 
          onConfigCreated={fetchSearchConfigs}
        />
      )}
    </div>
  )
}
