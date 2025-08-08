export interface GenericParams {
  keyword?: string
  location?: string
  distance?: number // in miles where supported
  jobType?: string // comma-separated
  experienceLevel?: string // comma-separated
  remote?: string // comma-separated
}

export function generateIndeedUrl(p: GenericParams) {
  let url = 'https://www.indeed.com/jobs?'
  const q: string[] = []
  if (p.keyword) q.push(`q=${encodeURIComponent(p.keyword)}`)
  if (p.location) q.push(`l=${encodeURIComponent(p.location)}`)
  if (typeof p.distance === 'number') q.push(`radius=${p.distance}`)
  // jobType mapping
  if (p.jobType) {
    const jtMap: Record<string, string> = { 'full-time': 'fulltime', 'part-time': 'parttime', contract: 'contract', temporary: 'temporary', internship: 'internship' }
    const val = p.jobType.split(',').map(s => jtMap[s.trim().toLowerCase()]).filter(Boolean)[0]
    if (val) q.push(`jt=${val}`)
  }
  url += q.join('&')
  return url
}

export function generateGlassdoorUrl(p: GenericParams) {
  let url = 'https://www.glassdoor.com/Job/jobs.htm?'
  const q: string[] = []
  if (p.keyword) q.push(`sc.keyword=${encodeURIComponent(p.keyword)}`)
  if (p.location) q.push(`locT=C&locId=&locKeyword=${encodeURIComponent(p.location)}`)
  return url + q.join('&')
}

export function generateMonsterUrl(p: GenericParams) {
  let url = 'https://www.monster.com/jobs/search?'
  const q: string[] = []
  if (p.keyword) q.push(`q=${encodeURIComponent(p.keyword)}`)
  if (p.location) q.push(`where=${encodeURIComponent(p.location)}`)
  return url + q.join('&')
}

export function generateZipRecruiterUrl(p: GenericParams) {
  let url = 'https://www.ziprecruiter.com/jobs-search?'
  const q: string[] = []
  if (p.keyword) q.push(`search=${encodeURIComponent(p.keyword)}`)
  if (p.location) q.push(`location=${encodeURIComponent(p.location)}`)
  return url + q.join('&')
}
