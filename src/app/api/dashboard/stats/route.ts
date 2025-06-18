import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, addDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const nextWeek = addDays(now, 7)

    // Get total schedules for current month
    const totalSchedules = await prisma.exerciseSchedule.count({
      where: {
        userId,
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })

    // Get completed schedules for current month
    const completedSchedules = await prisma.exerciseSchedule.count({
      where: {
        userId,
        completed: true,
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    })

    // Get active bets (both placed and received)
    const activeBetsPlaced = await prisma.bet.count({
      where: {
        placerId: userId,
        status: 'ACTIVE'
      }
    })

    const activeBetsReceived = await prisma.bet.count({
      where: {
        targetId: userId,
        status: 'ACTIVE'
      }
    })

    const activeBets = activeBetsPlaced + activeBetsReceived

    // Get pending payments (missed exercises with lost bets)
    const pendingPayments = await prisma.notification.count({
      where: {
        userId,
        type: 'PAYMENT_DUE',
        read: false
      }
    })

    // Get upcoming exercises (next 7 days)
    const upcomingExercises = await prisma.exerciseSchedule.findMany({
      where: {
        userId,
        date: {
          gte: now,
          lte: nextWeek
        },
        completed: false
      },
      orderBy: {
        date: 'asc'
      },
      take: 5,
      select: {
        id: true,
        date: true,
        exerciseType: true,
        timeSlot: true
      }
    })

    const stats = {
      totalSchedules,
      completedSchedules,
      activeBets,
      pendingPayments,
      upcomingExercises: upcomingExercises.map(exercise => ({
        ...exercise,
        date: exercise.date.toISOString()
      }))
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}