import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetUserId, scheduleId, prediction, amount } = await _request.json()

    // Validate input
    if (!targetUserId || !scheduleId || typeof prediction !== 'boolean' || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount < 50 || amount > 1000) {
      return NextResponse.json(
        { error: 'Bet amount must be between 50 and 1000 Baht' },
        { status: 400 }
      )
    }

    // Check if user is trying to bet on themselves
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot bet on your own exercises' },
        { status: 400 }
      )
    }

    // Check if schedule exists and belongs to target user
    const schedule = await prisma.exerciseSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        bets: {
          where: {
            placerId: session.user.id,
            status: 'ACTIVE'
          }
        }
      }
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Exercise schedule not found' },
        { status: 404 }
      )
    }

    if (schedule.userId !== targetUserId) {
      return NextResponse.json(
        { error: 'Schedule does not belong to target user' },
        { status: 400 }
      )
    }

    // Check if exercise is already completed
    if (schedule.completed) {
      return NextResponse.json(
        { error: 'Cannot bet on completed exercises' },
        { status: 400 }
      )
    }

    // Check if exercise is in the past
    if (new Date(schedule.date) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot bet on past exercises' },
        { status: 400 }
      )
    }

    // Check if user already has an active bet on this exercise
    if (schedule.bets.length > 0) {
      return NextResponse.json(
        { error: 'You already have an active bet on this exercise' },
        { status: 400 }
      )
    }

    // Create the bet
    const bet = await prisma.bet.create({
      data: {
        placerId: session.user.id,
        targetId: targetUserId,
        scheduleId,
        amount,
        prediction,
        status: 'ACTIVE'
      },
      include: {
        placer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        target: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        schedule: {
          select: {
            id: true,
            exerciseType: true,
            date: true,
            timeSlot: true
          }
        }
      }
    })

    // Create notification for the target user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'NEW_BET_PLACED',
        title: 'New Bet Placed!',
        message: `${bet.placer.name} placed a ${amount} Baht bet on your ${bet.schedule.exerciseType} workout. They predict you will ${prediction ? 'complete' : 'miss'} it.`,
        data: {
          betId: bet.id,
          placerName: bet.placer.name,
          amount,
          prediction,
          exerciseType: bet.schedule.exerciseType,
          scheduleId: bet.schedule.id
        }
      }
    })

    return NextResponse.json(bet, { status: 201 })
  } catch (error) {
    console.error('Error creating bet:', error)
    return NextResponse.json(
      { error: 'Failed to create bet' },
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(_request.url)
    const userId = searchParams.get('userId') || session.user.id

    // Get bets placed by or received by the user
    const betsPlaced = await prisma.bet.findMany({
      where: {
        placerId: userId
      },
      include: {
        target: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        schedule: {
          select: {
            id: true,
            exerciseType: true,
            date: true,
            timeSlot: true,
            completed: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const betsReceived = await prisma.bet.findMany({
      where: {
        targetId: userId
      },
      include: {
        placer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        schedule: {
          select: {
            id: true,
            exerciseType: true,
            date: true,
            timeSlot: true,
            completed: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      betsPlaced: betsPlaced.map(bet => ({
        ...bet,
        schedule: {
          ...bet.schedule,
          date: bet.schedule.date.toISOString()
        }
      })),
      betsReceived: betsReceived.map(bet => ({
        ...bet,
        schedule: {
          ...bet.schedule,
          date: bet.schedule.date.toISOString()
        }
      }))
    })
  } catch (error) {
    console.error('Error fetching bets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    )
  }
}