import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const existing = await prisma.searchConfig.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Soft delete: mark as inactive so it disappears from GET list
    await prisma.searchConfig.update({ where: { id }, data: { isActive: false } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting search config:', error)
    return NextResponse.json({ error: 'Failed to delete search configuration' }, { status: 500 })
  }
}
