import { NextRequest, NextResponse } from 'next/server'
import { generateLinkedInSearchUrl } from '@/lib/linkedin-url'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      keyword,
      location,
      experienceLevel,
      remote,
      jobType,
      easyApply
    } = body

    // Validate required fields
    if (!keyword || !location || !experienceLevel || !remote || !jobType) {
      return NextResponse.json(
        { error: 'Missing required fields: keyword, location, experienceLevel, remote, jobType' },
        { status: 400 }
      )
    }

    const url = generateLinkedInSearchUrl({
      keyword,
      location,
      experienceLevel,
      remote,
      jobType,
      easyApply: easyApply || false
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error generating LinkedIn URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate LinkedIn URL' },
      { status: 500 }
    )
  }
}
