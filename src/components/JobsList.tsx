'use client'

import Link from 'next/link';
import { Job } from '@/types'
import { useState } from 'react';

interface JobsListProps {
  jobs: Job[]
  loading: boolean
  onRefresh: () => void
}

export default function JobsList({ jobs, loading, onRefresh }: JobsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  // Filter out archived jobs
  const filteredJobs = jobs.filter((job: Job) => (job.status !== 'archived') && (statusFilter === 'all' || job.status === statusFilter));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'applied':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'interview':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'offer':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-2xl sm:rounded-3xl p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-700 text-sm sm:text-base">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-white/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl p-2 sm:p-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Job Results
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">{filteredJobs.length} jobs found</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={onRefresh}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List - Mobile Optimized */}
      <div className="max-h-[70vh] sm:max-h-[600px] overflow-y-auto px-1 sm:px-0">
        {filteredJobs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredJobs.map((job: Job, index: number) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block p-3 sm:p-6 hover:bg-white/60 transition-all duration-200 group animate-slide-up rounded-xl sm:rounded-2xl mb-2 sm:mb-0 shadow-sm border border-gray-100"
                style={{animationDelay: `${index * 50}ms`}}
              >
                <div className="flex flex-col space-y-2 sm:space-y-3">
                  {/* Main Job Info */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                    <div className="flex-1 min-w-0 mb-1 sm:mb-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {job.title}
                      </h3>
                      <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">{job.company}</p>
                    </div>
                    <span className={`text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-full border font-medium whitespace-nowrap ml-2 ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                  {/* Job Details - Mobile Stack */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-sm">
                    {job.location && (
                      <p className="text-gray-700 flex items-center">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{job.location}</span>
                      </p>
                    )}
                    {job.salary && (
                      <p className="text-green-600 flex items-center font-medium">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{job.salary}</span>
                      </p>
                    )}
                  </div>
                  {/* Tags - Mobile Friendly */}
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {job.remote && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg border border-blue-200">
                        {job.remote}
                      </span>
                    )}
                    {job.jobType && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg border border-purple-200">
                        {job.jobType}
                      </span>
                    )}
                    {job.easyApply && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg border border-green-200 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Easy Apply
                      </span>
                    )}
                  </div>
                  {/* Dates - Mobile Stack */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-600 space-y-1 sm:space-y-0 mt-1">
                    {job.postedDate && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Posted: {job.postedDate}
                      </span>
                    )}
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Added: {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-4 sm:px-8 py-12 sm:py-16 text-center">
            <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-gray-300 mb-4 sm:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No jobs found</p>
            <p className="text-sm sm:text-base text-gray-600">
              Jobs will appear here when your automation adds them to the database
            </p>
          </div>
        )}
      </div>
    </div>
  )
}