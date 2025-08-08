'use client'

import { useState, useEffect } from 'react'
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
    easyApply: false,
    distance: 25,
    sortBy: 'R' as 'R' | 'DD',
    datePosted: 'any' as 'any' | 'past24h' | 'past3days' | 'pastWeek' | 'pastMonth',
    postedWithinDays: undefined as number | undefined,
    locationMode: 'both' as 'text' | 'geo' | 'both',
    returnVariants: true,
    includeOthers: false,
  })
  const [loading, setLoading] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [variants, setVariants] = useState<{ selected: 'text'|'geo'; text: string; geo: string } | null>(null)
  const [otherUrls, setOtherUrls] = useState<{ indeed?: string; glassdoor?: string; monster?: string; ziprecruiter?: string } | null>(null)
  const [exampleUrls, setExampleUrls] = useState<Record<string, string>>({})

  const experienceLevels = ['Internship', 'Entry level', 'Associate', 'Mid-Senior level', 'Director', 'Executive']
  const remoteOptions = ['On-Site', 'Remote', 'Hybrid']
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Other', 'Internship']

  useEffect(() => {
    async function fetchExamples() {
      const results: Record<string, string> = {}
      await Promise.all(searchConfigs.map(async (config) => {
        try {
          const res = await fetch('/api/generate-linkedin-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...config, returnVariants: false, includeOthers: false })
          })
          const data = await res.json()
          if (data.url) results[config.id] = data.url
        } catch {}
      }))
      setExampleUrls(results)
    }
    if (searchConfigs.length > 0) fetchExamples()
  }, [searchConfigs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/search-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          keyword: '',
          location: '',
          experienceLevel: '',
          remote: '',
          jobType: '',
          easyApply: false,
          distance: 25,
          sortBy: 'R',
          datePosted: 'any',
          postedWithinDays: undefined,
          locationMode: 'both',
          returnVariants: true,
          includeOthers: false,
        })
        setGeneratedUrl('')
        setVariants(null)
        setOtherUrls(null)
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
    try {
      const response = await fetch('/api/generate-linkedin-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate URL')
      setGeneratedUrl(data.url)
      setVariants(data.variants || null)
      setOtherUrls(data.others || null)
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleCheckboxChange = (value: string, field: 'experienceLevel' | 'remote' | 'jobType') => {
    const currentValues = formData[field].split(',').map((v: string) => v.trim()).filter(Boolean)
    const isSelected = currentValues.includes(value)
    const newValues = isSelected ? currentValues.filter((v) => v !== value) : [...currentValues, value]
    setFormData(prev => ({ ...prev, [field]: newValues.join(', ') }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this search config?')) return
    try {
      const res = await fetch(`/api/search-configs/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }
      onConfigCreated()
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black-900">Create Search Configuration</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-black-800 mb-2">
              Keywords
            </label>
            <input
              type="text"
              id="keyword"
              value={formData.keyword}
              onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
              className="w-full px-4 py-3 border border-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              placeholder="e.g., nodejs, python, fullstack, frontend, devops"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-black-800 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 border border-black-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              placeholder="e.g., Philadelphia"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black-800 mb-3">
              Experience Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              {experienceLevels.map((level) => (
                <label key={level} className="flex items-center p-3 bg-white/30 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.experienceLevel.split(',').map(v => v.trim()).includes(level)}
                    onChange={() => handleCheckboxChange(level, 'experienceLevel')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-black-300 rounded"
                  />
                  <span className="ml-3 text-sm text-black-800">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black-800 mb-3">
              Work Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {remoteOptions.map((option) => (
                <label key={option} className="flex items-center p-3 bg-white/30 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remote.split(',').map(v => v.trim()).includes(option)}
                    onChange={() => handleCheckboxChange(option, 'remote')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-black-300 rounded"
                  />
                  <span className="ml-3 text-sm text-black-800">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black-800 mb-3">
              Job Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {jobTypes.map((type) => (
                <label key={type} className="flex items-center p-3 bg-white/30 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.jobType.split(',').map(v => v.trim()).includes(type)}
                    onChange={() => handleCheckboxChange(type, 'jobType')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-black-300 rounded"
                  />
                  <span className="ml-3 text-sm text-black-800">{type}</span>
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
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-black-300 rounded"
              />
              <span className="ml-3 text-sm font-medium text-black-800">Easy Apply Only</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black-800 mb-2">Distance (miles)</label>
              <input type="number" min={0} value={formData.distance}
                onChange={(e) => setFormData(prev => ({ ...prev, distance: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-black-200 rounded-xl bg-white/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black-800 mb-2">Sort By</label>
              <select value={formData.sortBy} onChange={(e) => setFormData(prev => ({ ...prev, sortBy: e.target.value as 'R'|'DD' }))}
                className="w-full px-4 py-3 border border-black-200 rounded-xl bg-white/50">
                <option value="R">Most Relevant</option>
                <option value="DD">Most Recent</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-black-800 mb-2">Date Posted</label>
              <select value={formData.datePosted} onChange={(e) => setFormData(prev => ({ ...prev, datePosted: e.target.value as any }))}
                className="w-full px-4 py-3 border border-black-200 rounded-xl bg-white/50">
                <option value="any">Any time</option>
                <option value="past24h">Past 24 hours</option>
                <option value="past3days">Past 3 days</option>
                <option value="pastWeek">Past week</option>
                <option value="pastMonth">Past month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black-800 mb-2">Or within days</label>
              <input type="number" min={0} placeholder="e.g. 7" value={formData.postedWithinDays ?? ''}
                onChange={(e) => setFormData(prev => ({ ...prev, postedWithinDays: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-4 py-3 border border-black-200 rounded-xl bg-white/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black-800 mb-2">Location Mode</label>
              <select value={formData.locationMode} onChange={(e) => setFormData(prev => ({ ...prev, locationMode: e.target.value as any }))}
                className="w-full px-4 py-3 border border-black-200 rounded-xl bg-white/50">
                <option value="both">Auto (best)</option>
                <option value="geo">GeoId (exact)</option>
                <option value="text">Text (city/state)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center">
              <input type="checkbox" checked={formData.returnVariants}
                onChange={(e) => setFormData(prev => ({ ...prev, returnVariants: e.target.checked }))}
                className="h-4 w-4 mr-2" />
              <span className="text-sm">Return LinkedIn URL variants</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={formData.includeOthers}
                onChange={(e) => setFormData(prev => ({ ...prev, includeOthers: e.target.checked }))}
                className="h-4 w-4 mr-2" />
              <span className="text-sm">Include Indeed/Glassdoor/Monster/ZipRecruiter</span>
            </label>
          </div>

          <div className="flex space-x-4">
            <button type="button" onClick={generateUrl}
              className="flex-1 bg-gradient-to-r from-black-500 to-black-600 text-black py-3 px-6 rounded-xl hover:from-black-600 hover:to-black-700">
              Generate LinkedIn URL
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-black py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Save Configuration'}
            </button>
          </div>
        </form>

        {generatedUrl && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h3 className="text-sm font-medium text-black-800 mb-3">Generated LinkedIn URL:</h3>
            <div className="bg-white p-3 rounded-lg border border-black-200">
              <code className="text-xs break-all text-black-800">{generatedUrl}</code>
            </div>
            {variants && (
              <div className="mt-3 text-xs text-black-800">
                <div>Selected: <span className="font-semibold">{variants.selected}</span></div>
                <div className="mt-1">Text URL: <a className="text-blue-600 hover:underline" href={variants.text} target="_blank">Open</a></div>
                <div>Geo URL: <a className="text-blue-600 hover:underline" href={variants.geo} target="_blank">Open</a></div>
              </div>
            )}
            {otherUrls && (
              <div className="mt-3 text-xs text-black-800 space-y-1">
                {otherUrls.indeed && <div>Indeed: <a className="text-blue-600 hover:underline" href={otherUrls.indeed} target="_blank">Open</a></div>}
                {otherUrls.glassdoor && <div>Glassdoor: <a className="text-blue-600 hover:underline" href={otherUrls.glassdoor} target="_blank">Open</a></div>}
                {otherUrls.monster && <div>Monster: <a className="text-blue-600 hover:underline" href={otherUrls.monster} target="_blank">Open</a></div>}
                {otherUrls.ziprecruiter && <div>ZipRecruiter: <a className="text-blue-600 hover:underline" href={otherUrls.ziprecruiter} target="_blank">Open</a></div>}
              </div>
            )}
            <button onClick={() => { navigator.clipboard.writeText(generatedUrl); alert('URL copied to clipboard!') }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">Copy to clipboard</button>
          </div>
        )}
      </div>

      {/* Existing Configurations */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-full p-2">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black-900">
            Existing Configurations ({searchConfigs.length})
          </h2>
        </div>
        
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {searchConfigs.map((config) => (
            <div key={config.id} className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl p-6 hover:bg-white/60 transition-all duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-black-800">🔍 Keywords:</span>
                  <span className="text-black-800">{config.keyword}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-black-800">📍 Location:</span>
                  <span className="text-black-800">{config.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-black-800">🎯 Experience:</span>
                  <span className="text-black-800">{config.experienceLevel}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-black-800">🏠 Work Type:</span>
                  <span className="text-black-800">{config.remote}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-black-800">💼 Job Type:</span>
                  <span className="text-black-800">{config.jobType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-black-800">⚡ Easy Apply:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${config.easyApply ? 'bg-green-100 text-green-700' : 'bg-black-100 text-black-700'}`}>
                    {config.easyApply ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-black-700 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Created: {new Date(config.createdAt).toLocaleDateString()}
              </div>
              {exampleUrls[config.id] && (
                <div className="mt-2 text-xs text-black-700">
                  <span className="font-medium">Example LinkedIn URL: </span>
                  <a href={exampleUrls[config.id]} target="_blank" className="text-blue-600 hover:underline break-all">{exampleUrls[config.id]}</a>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button onClick={() => handleDelete(config.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Delete</button>
              </div>
            </div>
          ))}
          
          {searchConfigs.length === 0 && (
            <div className="text-center text-black-700 py-12">
              <svg className="w-16 h-16 mx-auto text-black-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
