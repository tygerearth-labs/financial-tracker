import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all savings targets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')

    const where = profileId ? { profileId } : {}

    const savings = await db.savingsTarget.findMany({
      where,
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(savings)
  } catch (error) {
    console.error('Error fetching savings targets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch savings targets' },
      { status: 500 }
    )
  }
}

// POST create new savings target
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, targetAmount, currentAmount, startDate, targetDate, allocationPercent, profileId } = body

    if (!name || !targetAmount || !startDate || !targetDate || !profileId) {
      return NextResponse.json(
        { error: 'Name, targetAmount, startDate, targetDate, and profileId are required' },
        { status: 400 }
      )
    }

    const savingsTarget = await db.savingsTarget.create({
      data: {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : 0,
        startDate: new Date(startDate),
        targetDate: new Date(targetDate),
        allocationPercent: allocationPercent !== undefined ? parseFloat(allocationPercent) : 0,
        profileId,
      },
      include: {
        profile: true,
      },
    })

    return NextResponse.json(savingsTarget, { status: 201 })
  } catch (error) {
    console.error('Error creating savings target:', error)
    return NextResponse.json(
      { error: 'Failed to create savings target' },
      { status: 500 }
    )
  }
}
