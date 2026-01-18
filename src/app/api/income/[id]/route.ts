import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single income record
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const income = await db.income.findUnique({
      where: { id },
      include: {
        category: true,
        profile: true,
      },
    })

    if (!income) {
      return NextResponse.json(
        { error: 'Income record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json(
      { error: 'Failed to fetch income' },
      { status: 500 }
    )
  }
}

// PATCH update income record
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { amount, description, date, categoryId } = body

    const income = await db.income.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        description,
        date: date !== undefined ? new Date(date) : undefined,
        categoryId,
      },
      include: {
        category: true,
        profile: true,
      },
    })

    return NextResponse.json(income)
  } catch (error) {
    console.error('Error updating income:', error)
    return NextResponse.json(
      { error: 'Failed to update income' },
      { status: 500 }
    )
  }
}

// DELETE income record
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.income.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json(
      { error: 'Failed to delete income' },
      { status: 500 }
    )
  }
}
