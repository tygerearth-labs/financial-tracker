import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all profiles
export async function GET() {
  try {
    const profiles = await db.profile.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

// POST create new profile
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const profile = await db.profile.create({
      data: {
        name,
        description: description || null,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}
