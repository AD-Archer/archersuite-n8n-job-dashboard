import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Delete all jobs and search configurations
    // Use transaction to ensure atomicity
    await prisma.$transaction([
      prisma.job.deleteMany({}),
      prisma.searchConfig.deleteMany({})
    ]);

    return NextResponse.json({ 
      message: 'Database reset successfully. All job data and search configurations have been deleted.' 
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
