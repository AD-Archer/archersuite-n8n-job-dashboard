import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variable first
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { 
          status: 'unhealthy',
          database: 'disconnected',
          error: 'DATABASE_URL environment variable not found',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    // Dynamic import to avoid module loading issues
    const { prisma } = await import('@/lib/prisma')
    
    // Simple database ping by checking if we can connect and query
    const result = await prisma.searchConfig.findFirst()
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      hasData: result !== null,
      recordCount: await prisma.searchConfig.count()
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    
    // More detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: errorMessage,
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
    }
    
    return NextResponse.json(
      { 
        status: 'unhealthy',
        database: 'disconnected',
        error: errorMessage,
        errorDetails,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
