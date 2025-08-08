import { NextRequest, NextResponse } from 'next/server'
import { generateLinkedInSearchUrl, generateLinkedInVariants } from '@/lib/linkedin-url'
import { generateIndeedUrl, generateGlassdoorUrl, generateMonsterUrl, generateZipRecruiterUrl } from '@/lib/other-job-urls'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      keyword,
      location,
      experienceLevel,
      remote,
      jobType,
      easyApply,
      distance,
      sortBy,
      datePosted,
      postedWithinDays,
      industry,
      industryIds,
      geoId,
      fPP,
      includeOthers,
      locationMode, // 'text' | 'geo' | 'both'
      returnVariants, // boolean
    } = body

    // Validate minimal fields (keyword or location should exist)
    if (!keyword && !location) {
      return NextResponse.json(
        { error: 'Provide at least keyword or location' },
        { status: 400 }
      )
    }

    const params = {
      keyword,
      location,
      experienceLevel,
      remote,
      jobType,
      easyApply: !!easyApply,
      distance: typeof distance === 'number' ? distance : undefined,
      sortBy,
      datePosted,
      postedWithinDays: typeof postedWithinDays === 'number' ? postedWithinDays : undefined,
      industry,
      industryIds,
      geoId,
      fPP,
      locationMode,
    } as const

    const variants = generateLinkedInVariants(params)

    if (!includeOthers && !returnVariants) {
      return NextResponse.json({ url: variants.url })
    }

    const generic = { keyword, location, distance, jobType, experienceLevel, remote }

    return NextResponse.json({
      url: variants.url,
      ...(returnVariants ? { variants } : {}),
      ...(includeOthers
        ? {
            others: {
              indeed: generateIndeedUrl(generic),
              glassdoor: generateGlassdoorUrl(generic),
              monster: generateMonsterUrl(generic),
              ziprecruiter: generateZipRecruiterUrl(generic),
            },
          }
        : {}),
    })
  } catch (error) {
    console.error('Error generating LinkedIn URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate LinkedIn URL' },
      { status: 500 }
    )
  }
}
