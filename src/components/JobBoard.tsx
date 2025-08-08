'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Job, SearchConfig } from '@/types'
import JobsList from './JobsList'
import SearchConfigForm from './SearchConfigForm'
import AiAssistant from '@/components/AiAssistant'

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
  const [activeTab, setActiveTab] = useState<'jobs' | 'config' | 'ai'>('jobs')
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({ 
    status: 'checking', 
    database: 'checking...' 
  })
  const { data: session } = useSession();
  const router = useRouter();

  // Check database health on component mount

  useEffect(() => {
    checkDatabaseHealth();
    fetchJobs();
    fetchSearchConfigs();
  }, []);

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


  async function fetchJobs() {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      // Ensure jobs is always an array
      setJobs(Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : []);
    } catch (error) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSearchConfigs() {
    try {
      const response = await fetch('/api/search-configs');
      const data = await response.json();
      setSearchConfigs(data);
    } catch (error) {
      // Optionally handle error
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with logout and database status - Mobile Optimized */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-3">Welcome back, {session?.user?.name || session?.user?.email}</p>
            {/* Database Status Indicator - Mobile Friendly */}
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">{session?.user?.name || session?.user?.email}</span>
                <button 
                  onClick={() => router.push('/settings')} 
                  className="text-gray-600 hover:text-gray-800 hover:underline"
                >
                  Settings
                </button>
                <button onClick={() => signOut()} className="text-blue-600 hover:underline">Logout</button>
              </div>
              <div className={`w-3 h-3 rounded-full ml-2 ${
                healthStatus.status === 'healthy'
                  ? 'bg-green-500'
                  : healthStatus.status === 'unhealthy'
                  ? 'bg-red-500'
                  : 'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className={`text-xs sm:text-sm font-medium ${
                healthStatus.status === 'healthy'
                  ? 'text-green-700'
                  : healthStatus.status === 'unhealthy'
                  ? 'text-red-700'
                  : 'text-yellow-700'
              }`}>
                Database: {healthStatus.database}
              </span>
            </div>
            <button
              onClick={checkDatabaseHealth}
              className="text-xs text-gray-500 hover:text-gray-700 underline px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              Refresh
            </button>
            {healthStatus.error && (
              <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded-md">{healthStatus.error}</p>
            )}
          </div>
          {/* Action Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => router.push('/settings')}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
            <button
              onClick={() => signOut()}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-blue-100 text-xs sm:text-sm mb-1">Total Jobs</p>
              <p className="text-2xl sm:text-3xl font-bold">{jobs.length}</p>
            </div>
            <div className="bg-white/20 rounded-full p-2 sm:p-3 self-end sm:self-auto">
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        {/* ...repeat for other stat cards... */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-green-100 text-xs sm:text-sm mb-1">Applied</p>
              <p className="text-2xl sm:text-3xl font-bold">{jobs.filter(j => j.status === 'applied').length}</p>
            </div>
            <div className="bg-white/20 rounded-full p-2 sm:p-3 self-end sm:self-auto">
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-purple-100 text-xs sm:text-sm mb-1">New Jobs</p>
              <p className="text-2xl sm:text-3xl font-bold">{jobs.filter(j => j.status === 'new').length}</p>
            </div>
            <div className="bg-white/20 rounded-full p-2 sm:p-3 self-end sm:self-auto">
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="mb-2 sm:mb-0">
              <p className="text-orange-100 text-xs sm:text-sm mb-1">Configs</p>
              <p className="text-2xl sm:text-3xl font-bold">{searchConfigs.length}</p>
            </div>
            <div className="bg-white/20 rounded-full p-2 sm:p-3 self-end sm:self-auto">
              <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Mobile Optimized */}
      <div className="flex bg-white/60 backdrop-blur-sm p-1 rounded-2xl sm:rounded-3xl border border-white/20 shadow-lg overflow-hidden">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-all duration-200 ${
            activeTab === 'jobs'
              ? 'bg-white text-gray-900 shadow-lg scale-105'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">Jobs</span>
            <span className="sm:hidden">Jobs</span>
            <span className="hidden sm:inline">({jobs.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-all duration-200 ${
            activeTab === 'config'
              ? 'bg-white text-gray-900 shadow-lg scale-105'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">Search Config</span>
            <span className="sm:hidden">Config</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-all duration-200 ${
            activeTab === 'ai'
              ? 'bg-white text-gray-900 shadow-lg scale-105'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
          aria-label="AI Assistant tab"
        >
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a7 7 0 00-7 7v3a5 5 0 00-2 4v1a2 2 0 002 2h4v-5H6V9a6 6 0 1112 0v5h-3v5h4a2 2 0 002-2v-1a5 5 0 00-2-4V9a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="sm:hidden">AI</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="animate-slide-up">
        {activeTab === 'jobs' ? (
          <JobsList jobs={jobs} loading={loading} onRefresh={fetchJobs} />
        ) : activeTab === 'config' ? (
          <SearchConfigForm 
            searchConfigs={searchConfigs} 
            onConfigCreated={fetchSearchConfigs}
          />
        ) : (
          <AiAssistant />
        )}
      </div>
    </div>
  );
}


