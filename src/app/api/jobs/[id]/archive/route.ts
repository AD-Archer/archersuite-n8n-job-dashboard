import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.update({
      where: { id: params.id },
      data: { status: 'archived' },
    });
    return NextResponse.json({ success: true, job });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to archive job' }, { status: 500 });
  }
}
