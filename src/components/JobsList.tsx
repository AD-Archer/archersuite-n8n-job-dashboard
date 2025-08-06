'use client'

import { useState } from 'react'
import { Job } from '@/types'

interface JobsListProps {
  jobs: Job[]
  loading: boolean
  onRefresh: () => void
}

export default function JobsList({ jobs, loading, onRefresh }: JobsListProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredJobs = jobs.filter(job => 
    statusFilter === 'all' || job.status === statusFilter
  )

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
        return 'bg-gray-100 text-black-800 border-gray-200'
    }
  }

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    // Simulate API call
    setTimeout(() => {
      alert(`Job status updated to: ${newStatus}`)
      onRefresh()
      setSelectedJob(null)
    }, 500)
  }

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-black-800">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-white/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black-900">
              Job Results ({filteredJobs.length})
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredJobs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 hover:bg-white/60 cursor-pointer transition-all duration-200 group"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-black-800 mt-1 font-medium">{job.company}</p>
                    {job.location && (
                      <p className="text-sm text-black-700 mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {job.location}
                      </p>
                    )}
                    {job.salary && (
                      <p className="text-sm text-green-600 mt-1 flex items-center font-medium">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        {job.salary}
                      </p>
                    )}
                    <div className="flex items-center space-x-3 mt-3">
                      {job.remote && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                          {job.remote}
                        </span>
                      )}
                      {job.jobType && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                          {job.jobType}
                        </span>
                      )}
                      {job.easyApply && (
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Easy Apply
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    <span className={`text-xs px-3 py-2 rounded-full border font-medium ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    {job.postedDate && (
                      <span className="text-xs text-black-700 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Posted: {job.postedDate}
                      </span>
                    )}
                    <span className="text-xs text-black-700 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Added: {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-8 py-16 text-center">
            <svg className="w-24 h-24 mx-auto text-black-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            <p className="text-xl font-semibold text-black-700 mb-2">No jobs found</p>
            <p className="text-black-600">
              Jobs will appear here when your n8n automation adds them to the database
            </p>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-white/20">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-black-900">{selectedJob.title}</h2>
                  <p className="text-black-800 text-lg">{selectedJob.company}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-black-400 hover:text-black-600 p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              {selectedJob.location && (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-black-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-black-800">Location:</span>
                  <span className="text-black-800">{selectedJob.location}</span>
                </div>
              )}
              
              {selectedJob.salary && (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-black-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-black-800">Salary:</span>
                  <span className="text-green-600 font-medium">{selectedJob.salary}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {selectedJob.remote && (
                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                    {selectedJob.remote}
                  </span>
                )}
                {selectedJob.jobType && (
                  <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg border border-purple-200">
                    {selectedJob.jobType}
                  </span>
                )}
                {selectedJob.easyApply && (
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-200 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Easy Apply
                  </span>
                )}
              </div>

              {selectedJob.description && (
                <div>
                  <span className="font-medium text-black-800 block mb-3">Description:</span>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-black-800 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedJob.description}
                  </div>
                </div>
              )}

              {selectedJob.score && (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-black-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-black-800">Score:</span>
                  <span className="text-black-800">{selectedJob.score}</span>
                </div>
              )}

              {selectedJob.coverLetter && (
                <div>
                  <span className="font-medium text-black-800 block mb-3">Cover Letter:</span>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-black-800 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedJob.coverLetter}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <span className="font-medium text-black-800">Status:</span>
                <select
                  value={selectedJob.status}
                  onChange={(e) => updateJobStatus(selectedJob.id, e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-6">
                <a
                  href={selectedJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>View on LinkedIn</span>
                </a>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 bg-gray-200 text-black-700 py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
