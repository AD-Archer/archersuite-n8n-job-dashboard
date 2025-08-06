export interface SearchParams {
  keyword: string
  location: string
  experienceLevel: string
  remote: string
  jobType: string
  easyApply: boolean
}

export function generateLinkedInSearchUrl(params: SearchParams): string {
  let url = "https://www.linkedin.com/jobs/search/?f_TPR=r86400"

  const { keyword, location, experienceLevel, remote, jobType, easyApply } = params

  if (keyword && keyword.trim() !== "") {
    url += `&keywords=${encodeURIComponent(keyword)}`
  }

  if (location && location.trim() !== "") {
    url += `&location=${encodeURIComponent(location)}`
  }

  if (experienceLevel && experienceLevel.trim() !== "") {
    // Transform experience level to LinkedIn format
    // Internship -> 1, Entry level -> 2, Associate -> 3, 
    // Mid-Senior level -> 4, Director -> 5, Executive -> 6
    const transformedExperiences = experienceLevel
      .split(",")
      .map((exp) => {
        switch (exp.trim()) {
          case "Internship":
            return "1"
          case "Entry level":
            return "2"
          case "Associate":
            return "3"
          case "Mid-Senior level":
            return "4"
          case "Director":
            return "5"
          case "Executive":
            return "6"
          default:
            return ""
        }
      })
      .filter(Boolean) // filter out any empty strings
    
    if (transformedExperiences.length > 0) {
      url += `&f_E=${transformedExperiences.join(",")}`
    }
  }

  if (remote && remote.trim() !== "") {
    // Transform remote options to LinkedIn format
    // On-Site -> 1, Remote -> 2, Hybrid -> 3
    const transformedRemote = remote
      .split(",")
      .map((e) => {
        switch (e.trim()) {
          case "Remote":
            return "2"
          case "Hybrid":
            return "3"
          case "On-Site":
            return "1"
          default:
            return ""
        }
      })
      .filter(Boolean) // filter out any empty strings
    
    if (transformedRemote.length > 0) {
      url += `&f_WT=${transformedRemote.join(",")}`
    }
  }

  if (jobType && jobType.trim() !== "") {
    // Transform job type to LinkedIn format
    // Full-time -> F, Part-time -> P, Contract -> C, Temporary -> T, Other -> O
    const transformedJobType = jobType
      .split(",")
      .map((type) => {
        const trimmed = type.trim()
        switch (trimmed) {
          case "Full-time":
            return "F"
          case "Part-time":
            return "P"
          case "Contract":
            return "C"
          case "Temporary":
            return "T"
          case "Other":
            return "O"
          case "Internship":
            return "I"
          default:
            return trimmed.charAt(0).toUpperCase()
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

  return url
}
