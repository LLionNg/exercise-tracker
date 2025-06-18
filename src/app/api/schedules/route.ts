import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(_request.url)
    const userId = searchParams.get('userId') || session.user.id
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    // Build where clause
    const where: { userId: string; date?: { gte: Date; lte: Date } } = { userId }
    
    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end)
      }
    }

    const schedules = await prisma.exerciseSchedule.findMany({
      where,
      include: {
        bets: {
          include: {
            placer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await _request.json()
    const { date, exerciseType, timeSlot } = body

    // Validate input
    if (!date || !exerciseType || !timeSlot) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already has a schedule for this date and time slot
    const existingSchedule = await prisma.exerciseSchedule.findUnique({
      where: {
        userId_date_timeSlot: {
          userId: session.user.id,
          date: new Date(date),
          timeSlot
        }
      }
    })

    if (existingSchedule) {
      return NextResponse.json(
        { error: 'Exercise already scheduled for this time slot' },
        { status: 409 }
      )
    }

    // Create new schedule
    const schedule = await prisma.exerciseSchedule.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        exerciseType,
        timeSlot,
        completed: false
      },
      include: {
        bets: {
          include: {
            placer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}