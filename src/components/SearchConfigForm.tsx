'use client'

import { useState } from 'react'
import { SearchConfig } from '@/types'

interface SearchConfigFormProps {
  searchConfigs: SearchConfig[]
  onConfigCreated: () => void
}

export default function SearchConfigForm({ searchConfigs, onConfigCreated }: SearchConfigFormProps) {
  const [formData, setFormData] = useState({
    keyword: '',
    location: '',
    experienceLevel: '',
    remote: '',
    jobType: '',
    easyApply: false
  })
  const [loading, setLoading] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')

  const experienceLevels = ['Internship', 'Entry level', 'Associate', 'Mid-Senior level', 'Director', 'Executive']
  const remoteOptions = ['On-Site', 'Remote', 'Hybrid']
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Other', 'Internship']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/search-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          keyword: '',
          location: '',
          experienceLevel: '',
          remote: '',
          jobType: '',
          easyApply: false
        })
        setGeneratedUrl('')
        onConfigCreated()
        alert('Search configuration created successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to create search configuration'}`)
      }
    } catch (error) {
      console.error('Error creating search config:', error)
      alert('Failed to create search configuration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateUrl = async () => {
    // Generate LinkedIn URL using the same logic as your n8n code
    let url = "https://www.linkedin.com/jobs/search/?f_TPR=r86400"

    const { keyword, location, experienceLevel, remote, jobType, easyApply } = formData

    if (keyword && keyword.trim() !== "") {
      url += `&keywords=${encodeURIComponent(keyword)}`
    }

    if (location && location.trim() !== "") {
      url += `&location=${encodeURIComponent(location)}`
    }

    if (experienceLevel && experienceLevel.trim() !== "") {
      const transformedExperiences = experienceLevel
        .split(",")
        .map((exp) => {
          switch (exp.trim()) {
            case "Internship": return "1"
            case "Entry level": return "2"
            case "Associate": return "3"
            case "Mid-Senior level": return "4"
            case "Director": return "5"
            case "Executive": return "6"
            default: return ""
          }
        })
        .filter(Boolean)
      
      if (transformedExperiences.length > 0) {
        url += `&f_E=${transformedExperiences.join(",")}`
      }
    }

    if (remote && remote.trim() !== "") {
      const transformedRemote = remote
        .split(",")
        .map((e) => {
          switch (e.trim()) {
            case "Remote": return "2"
            case "Hybrid": return "3"
            case "On-Site": return "1"
            default: return ""
          }
        })
        .filter(Boolean)
      
      if (transformedRemote.length > 0) {
        url += `&f_WT=${transformedRemote.join(",")}`
      }
    }

    if (jobType && jobType.trim() !== "") {
      const transformedJobType = jobType
        .split(",")
        .map((type) => {
          const trimmed = type.trim()
          switch (trimmed) {
            case "Full-time": return "F"
            case "Part-time": return "P"
            case "Contract": return "C"
            case "Temporary": return "T"
            case "Other": return "O"
            case "Internship": return "I"
            default: return trimmed.charAt(0).toUpperCase()
          }
        })
        .filter(Boolean)
      
      if (transformedJobType.length > 0) {
        url += `&f_JT=${transformedJobType.join(",")}`
      }
    }

    if (easyApply) {
      url += "&f_EA=true"
    }

    setGeneratedUrl(url)
  }

  const handleCheckboxChange = (value: string, field: 'experienceLevel' | 'remote' | 'jobType') => {
    const currentValues = formData[field].split(',').map((v: string) => v.trim()).filter(Boolean)
    const isSelected = currentValues.includes(value)
    
    const newValues = isSelected
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value]
    
    setFormData(prev => ({
      ...prev,
      [field]: newValues.join(', ')
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Search Configuration</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
              Keywords
            </label>
            <input
              type="text"
              id="keyword"
              value={formData.keyword}
              onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              placeholder="e.g., nodejs, python, fullstack, frontend, devops"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              placeholder="e.g., Philadelphia"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Experience Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {experienceLevels.map((level) => (
                <label key={level} className="flex items-center p-3 bg-white/30 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.experienceLevel.split(',').map(v => v.trim()).includes(level)}
                    onChange={() => handleCheckboxChange(level, 'experienceLevel')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Work Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {remoteOptions.map((option) => (
                <label key={option} className="flex items-center p-3 bg-white/30 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remote.split(',').map(v => v.trim()).includes(option)}
                    onChange={() => handleCheckboxChange(option, 'remote')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Job Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {jobTypes.map((type) => (
                <label key={type} className="flex items-center p-3 bg-white/30 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.jobType.split(',').map(v => v.trim()).includes(type)}
                    onChange={() => handleCheckboxChange(type, 'jobType')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center p-4 bg-white/30 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={formData.easyApply}
                onChange={(e) => setFormData(prev => ({ ...prev, easyApply: e.target.checked }))}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Easy Apply Only</span>
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={generateUrl}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-medium"
            >
              Generate LinkedIn URL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 font-medium"
            >
              {loading ? 'Creating...' : 'Save Configuration'}
            </button>
          </div>
        </form>

        {generatedUrl && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Generated LinkedIn URL:
            </h3>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <code className="text-xs break-all text-gray-700">{generatedUrl}</code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedUrl)
                alert('URL copied to clipboard!')
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to clipboard
            </button>
          </div>
        )}
      </div>

      {/* Existing Configurations */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-full p-2">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Existing Configurations ({searchConfigs.length})
          </h2>
        </div>
        
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {searchConfigs.map((config) => (
            <div key={config.id} className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:bg-white/60 transition-all duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">🔍 Keywords:</span>
                  <span className="text-gray-600">{config.keyword}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">📍 Location:</span>
                  <span className="text-gray-600">{config.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">🎯 Experience:</span>
                  <span className="text-gray-600">{config.experienceLevel}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">🏠 Work Type:</span>
                  <span className="text-gray-600">{config.remote}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">💼 Job Type:</span>
                  <span className="text-gray-600">{config.jobType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">⚡ Easy Apply:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${config.easyApply ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {config.easyApply ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Created: {new Date(config.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          
          {searchConfigs.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-lg font-medium">No search configurations found</p>
              <p className="text-sm mt-1">Create one using the form to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
