import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.job.count({ where })
    ])

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle both single job and array of jobs
    const jobsData = Array.isArray(body) ? body : [body]
    
    const createdJobs = []
    const skippedJobs = []

    for (const jobData of jobsData) {
      const {
        title,
        company,
        location,
        description,
        url, // or 'link' from n8n
        // score,
        // coverLetter,
        // Application fields that might be passed
        salary,
        experienceLevel,
        remote,
        jobType,
        easyApply,
        postedDate
      } = jobData

      // Handle 'link' field from n8n if 'url' is not provided
      const jobUrl = url || jobData.link

      // Validate required fields
      if (!title || !company || !jobUrl) {
        return NextResponse.json(
          { error: 'Missing required fields: title, company, url/link' },
          { status: 400 }
        )
      }

      try {
        // Check if job already exists by URL to prevent duplicates
        const existingJob = await prisma.job.findUnique({
          where: { url: jobUrl }
        })

        if (existingJob) {
          skippedJobs.push({ url: jobUrl, reason: 'Job already exists' })
          continue
        }

        const job = await prisma.job.create({
          data: {
            title,
            company,
            location,
            description,
            url: jobUrl,
            // score: score ? parseFloat(score.toString()) : null,
            // coverLetter,
            salary,
            experienceLevel,
            remote,
            jobType,
            easyApply: easyApply || false,
            postedDate
          }
        })

        createdJobs.push(job)
      } catch (error) {
        console.error(`Error creating job with URL ${url}:`, error)
        skippedJobs.push({ url, reason: 'Database error' })
      }
    }

    return NextResponse.json({
      created: createdJobs.length,
      skipped: skippedJobs.length,
      createdJobs,
      skippedJobs
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating jobs:', error)
    return NextResponse.json(
      { error: 'Failed to create jobs' },
      { status: 500 }
    )
  }
}
