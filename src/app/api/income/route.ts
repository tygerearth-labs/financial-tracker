import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all income records
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {}
    if (profileId) {
      where.profileId = profileId
    }
    if (month || year) {
      const dateFilter: any = {}
      if (month) dateFilter.gte = new Date(parseInt(year || new Date().getFullYear()), parseInt(month) - 1, 1)
      if (month) dateFilter.lt = new Date(parseInt(year || new Date().getFullYear()), parseInt(month), 1)
      if (year && !month) {
        dateFilter.gte = new Date(parseInt(year), 0, 1)
        dateFilter.lt = new Date(parseInt(year) + 1, 0, 1)
      }
      where.date = dateFilter
    }

    const income = await db.income.findMany({
      where,
      include: {
        category: true,
        profile: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json(
      { error: 'Failed to fetch income' },
      { status: 500 }
    )
  }
}

// POST create new income record
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, description, date, categoryId, profileId } = body

    if (!amount || !date || !categoryId || !profileId) {
      return NextResponse.json(
        { error: 'Amount, date, categoryId, and profileId are required' },
        { status: 400 }
      )
    }

    const income = await db.income.create({
      data: {
        amount: parseFloat(amount),
        description: description || null,
        date: new Date(date),
        categoryId,
        profileId,
      },
      include: {
        category: true,
        profile: true,
      },
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error) {
    console.error('Error creating income:', error)
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    )
  }
}
