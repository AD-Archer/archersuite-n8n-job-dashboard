export interface SearchParams {
  keyword?: string
  location?: string
  experienceLevel?: string
  remote?: string
  jobType?: string
  easyApply?: boolean
  distance?: number
  sortBy?: 'R' | 'DD' // R: Relevance, DD: Date (most recent)
  datePosted?: 'any' | 'past24h' | 'past3days' | 'pastWeek' | 'pastMonth'
  geoId?: string
  fPP?: string // optional LinkedIn f_PP param
  industry?: string | string[]
  industryIds?: string // comma-separated numeric ids
  postedWithinDays?: number
  locationMode?: 'text' | 'geo' | 'both'
}

const INDUSTRY_MAP: Record<string, string> = {
  // Minimal mapping; pass industryIds directly for full control
  'software development': '4',
  'software engineer': '4',
  'software engineering': '4',
};

function encodeKeywords(keyword?: string) {
  if (!keyword) return ''
  return `&keywords=${encodeURIComponent(keyword)}`
}

function encodeLocation(location?: string) {
  if (!location) return ''
  return `&location=${encodeURIComponent(location)}`
}

function encodeExperience(experienceLevel?: string) {
  if (!experienceLevel?.trim()) return ''
  const transformed = experienceLevel
    .split(',')
    .map((exp) => {
      switch (exp.trim()) {
        case 'Internship':
        case 'internship':
          return '1'
        case 'Entry level':
        case 'Entry':
        case 'entry':
          return '2'
        case 'Associate':
        case 'associate':
          return '3'
        case 'Mid-Senior level':
        case 'Mid-Senior':
        case 'mid':
          return '4'
        case 'Director':
        case 'director':
          return '5'
        case 'Executive':
        case 'executive':
          return '6'
        default:
          return ''
      }
    })
    .filter(Boolean)
  return transformed.length ? `&f_E=${transformed.join(',')}` : ''
}

function encodeRemote(remote?: string) {
  if (!remote?.trim()) return ''
  const transformed = remote
    .split(',')
    .map((e) => {
      switch (e.trim()) {
        case 'Remote':
        case 'remote':
          return '2'
        case 'Hybrid':
        case 'hybrid':
          return '3'
        case 'On-Site':
        case 'On-site':
        case 'onsite':
          return '1'
        default:
          return ''
      }
    })
    .filter(Boolean)
  return transformed.length ? `&f_WT=${transformed.join(',')}` : ''
}

function encodeJobType(jobType?: string) {
  if (!jobType?.trim()) return ''
  const transformed = jobType
    .split(',')
    .map((type) => {
      const t = type.trim().toLowerCase()
      switch (t) {
        case 'full-time':
        case 'full time':
        case 'fulltime':
          return 'F'
        case 'part-time':
        case 'part time':
          return 'P'
        case 'contract':
          return 'C'
        case 'temporary':
          return 'T'
        case 'internship':
          return 'I'
        case 'other':
          return 'O'
        default:
          return ''
      }
    })
    .filter(Boolean)
  return transformed.length ? `&f_JT=${transformed.join(',')}` : ''
}

function encodeDatePosted(datePosted?: SearchParams['datePosted'], postedWithinDays?: number) {
  if (typeof postedWithinDays === 'number' && postedWithinDays > 0) {
    const seconds = Math.floor(postedWithinDays * 86400)
    return `&f_TPR=r${seconds}`
  }
  switch (datePosted) {
    case 'past24h':
      return '&f_TPR=r86400'
    case 'past3days':
      return '&f_TPR=r259200'
    case 'pastWeek':
      return '&f_TPR=r604800'
    case 'pastMonth':
      return '&f_TPR=r2592000'
    case 'any':
    default:
      return '' // omit for Any time
  }
}

function encodeIndustry(params: SearchParams) {
  if (params.industryIds) return `&f_I=${params.industryIds}`
  const industries = Array.isArray(params.industry)
    ? params.industry
    : params.industry
    ? params.industry.split(',')
    : []
  const ids = industries
    .map((i) => INDUSTRY_MAP[i.trim().toLowerCase()] || '')
    .filter(Boolean)
  return ids.length ? `&f_I=${ids.join(',')}` : ''
}

// Build a LinkedIn URL with options to control which location params are used
function buildLinkedInUrl(params: SearchParams, opts: { useTextLocation: boolean; useGeoLocation: boolean }) {
  let url = 'https://www.linkedin.com/jobs/search/?origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true'

  url += encodeKeywords(params.keyword)
  if (opts.useTextLocation) url += encodeLocation(params.location)
  url += encodeExperience(params.experienceLevel)
  url += encodeRemote(params.remote)
  url += encodeJobType(params.jobType)
  url += encodeDatePosted(params.datePosted, params.postedWithinDays)
  url += encodeIndustry(params)

  if (params.easyApply) url += '&f_AL=true'
  if (params.distance && params.distance > 0) url += `&distance=${params.distance}`
  if (params.sortBy) url += `&sortBy=${params.sortBy}`
  if (opts.useGeoLocation && params.geoId) url += `&geoId=${params.geoId}`
  if (opts.useGeoLocation && params.fPP) url += `&f_PP=${params.fPP}`

  return url
}

export function generateLinkedInVariants(params: SearchParams) {
  const text = buildLinkedInUrl(params, { useTextLocation: true, useGeoLocation: false })
  const geo = buildLinkedInUrl(params, { useTextLocation: false, useGeoLocation: true })

  let selected: 'text' | 'geo' = 'text'
  if (params.locationMode === 'geo' && params.geoId) selected = 'geo'
  else if (params.locationMode === 'text') selected = 'text'
  else if (params.locationMode === 'both') selected = params.geoId ? 'geo' : 'text'
  else if (params.geoId) selected = 'geo'

  const url = selected === 'geo' ? geo : text
  return { url, selected, text, geo }
}

export function generateLinkedInSearchUrl(params: SearchParams): string {
  const { url } = generateLinkedInVariants(params)
  return url
}
