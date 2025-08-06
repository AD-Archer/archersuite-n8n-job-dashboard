export interface SearchConfig {
  id: string
  keyword: string
  location: string
  experienceLevel: string
  remote: string
  jobType: string
  easyApply: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Job {
  id: string
  title: string // from n8n
  company: string // from n8n
  location?: string // from n8n
  description?: string // from n8n
  url: string // 'link' from n8n
  score?: number // from n8n
  coverLetter?: string // from n8n
  // Application-specific fields
  salary?: string
  experienceLevel?: string
  remote?: string
  jobType?: string
  easyApply: boolean
  postedDate?: string
  appliedDate?: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface JobsResponse {
  jobs: Job[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateJobsResponse {
  created: number
  skipped: number
  createdJobs: Job[]
  skippedJobs: Array<{
    url: string
    reason: string
  }>
}
