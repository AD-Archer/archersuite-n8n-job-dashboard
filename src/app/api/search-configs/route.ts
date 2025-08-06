import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const searchConfigs = await prisma.searchConfig.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(searchConfigs)
  } catch (error) {
    console.error('Error fetching search configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search configurations' },
      { status: 500 }
    )
  }
}

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
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const searchConfig = await prisma.searchConfig.create({
      data: {
        keyword,
        location,
        experienceLevel,
        remote,
        jobType,
        easyApply: easyApply || false
      }
    })

    return NextResponse.json(searchConfig, { status: 201 })
  } catch (error) {
    console.error('Error creating search config:', error)
    return NextResponse.json(
      { error: 'Failed to create search configuration' },
      { status: 500 }
    )
  }
}
