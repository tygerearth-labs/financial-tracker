import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single savings target
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const savings = await db.savingsTarget.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    })

    if (!savings) {
      return NextResponse.json(
        { error: 'Savings target not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(savings)
  } catch (error) {
    console.error('Error fetching savings target:', error)
    return NextResponse.json(
      { error: 'Failed to fetch savings target' },
      { status: 500 }
    )
  }
}

// PATCH update savings target
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, targetAmount, currentAmount, startDate, targetDate, allocationPercent } = body

    const savings = await db.savingsTarget.update({
      where: { id },
      data: {
        name,
        targetAmount: targetAmount !== undefined ? parseFloat(targetAmount) : undefined,
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : undefined,
        startDate: startDate !== undefined ? new Date(startDate) : undefined,
        targetDate: targetDate !== undefined ? new Date(targetDate) : undefined,
        allocationPercent: allocationPercent !== undefined ? parseFloat(allocationPercent) : undefined,
      },
      include: {
        profile: true,
      },
    })

    return NextResponse.json(savings)
  } catch (error) {
    console.error('Error updating savings target:', error)
    return NextResponse.json(
      { error: 'Failed to update savings target' },
      { status: 500 }
    )
  }
}

// DELETE savings target
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.savingsTarget.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting savings target:', error)
    return NextResponse.json(
      { error: 'Failed to delete savings target' },
      { status: 500 }
    )
  }
}
