import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Job } from '@prisma/client'

interface N8nJobResult {
  created: number
  skipped: number
  createdJobs: Job[]
  skippedJobs: Array<{
    url: string
    reason: string
  }>
}

// Dedicated endpoint for n8n job creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle both single job and array of jobs from n8n
    const jobsData = Array.isArray(body) ? body : [body]
    
    const results: N8nJobResult = {
      created: 0,
      skipped: 0,
      createdJobs: [],
      skippedJobs: []
    }

    for (const jobData of jobsData) {
      const {
        Title,
        Company,
        Location,
        link,
        title,
        company,
        location,
        applyLink,
        description,
        score,
        coverLetter
      } = jobData

      // Support both n8n field naming conventions
      const jobTitle = Title || title
      const jobCompany = Company || company
      const jobLocation = Location || location
      const jobUrl = link || applyLink

      // Validate required fields
      if (!jobTitle || !jobCompany || !jobUrl) {
        results.skippedJobs.push({ 
          url: jobUrl || 'unknown', 
          reason: 'Missing required fields: title, company, and applyLink/link' 
        })
        results.skipped++
        continue
      }

      try {
        // Check if job already exists by URL to prevent duplicates
        const existingJob = await prisma.job.findUnique({
          where: { url: jobUrl }
        })

        if (existingJob) {
          results.skippedJobs.push({ url: jobUrl, reason: 'Job already exists' })
          results.skipped++
          continue
        }

        const job = await prisma.job.create({
          data: {
            title: jobTitle,
            company: jobCompany,
            location: jobLocation || null,
            description: description || null,
            url: jobUrl,
            score: score ? parseFloat(score.toString()) : null,
            coverLetter: coverLetter || null,
            easyApply: false, // Default value
            status: 'new' // Default status
          }
        })

        results.createdJobs.push(job)
        results.created++
      } catch (error) {
        console.error('Error creating job:', error)
        results.skippedJobs.push({ 
          url: jobUrl, 
          reason: 'Database error: ' + (error instanceof Error ? error.message : 'Unknown error')
        })
        results.skipped++
      }
    }

    return NextResponse.json(results, { status: 201 })
  } catch (error) {
    console.error('Error in n8n jobs endpoint:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Get search configurations for n8n
export async function GET() {
  try {
    const searchConfigs = await prisma.searchConfig.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    // Transform for n8n consumption
    const n8nConfigs = searchConfigs.map(config => ({
      id: config.id,
      Keyword: config.keyword,
      Location: config.location,
      'Experience Level': config.experienceLevel,
      Remote: config.remote,
      'Job Type': config.jobType,
      'Easy Apply': config.easyApply
    }))

    return NextResponse.json(n8nConfigs)
  } catch (error) {
    console.error('Error fetching search configs for n8n:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search configurations' },
      { status: 500 }
    )
  }
}
