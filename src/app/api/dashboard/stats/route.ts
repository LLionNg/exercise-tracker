import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, addDays, startOfDay } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    // Use Bangkok timezone (Asia/Bangkok)
    const BANGKOK_TZ = 'Asia/Bangkok'
    
    // Get current time in Bangkok timezone
    const nowUTC = new Date()
    const nowBangkok = toZonedTime(nowUTC, BANGKOK_TZ)
    
    // Get start of today in Bangkok timezone and convert to UTC for database query
    const todayStartBangkok = startOfDay(nowBangkok)
    const todayStartUTC = fromZonedTime(todayStartBangkok, BANGKOK_TZ)
    const todayEndUTC = addDays(todayStartUTC, 1)
    
    // Get month boundaries in Bangkok timezone
    const monthStartBangkok = startOfMonth(nowBangkok)
    const monthEndBangkok = endOfMonth(nowBangkok)
    const monthStartUTC = fromZonedTime(monthStartBangkok, BANGKOK_TZ)
    const monthEndUTC = fromZonedTime(monthEndBangkok, BANGKOK_TZ)
    
    // Get next week for upcoming exercises
    const nextWeekBangkok = addDays(nowBangkok, 7)
    const nextWeekUTC = fromZonedTime(nextWeekBangkok, BANGKOK_TZ)

    // FIXED: Count ALL past exercises + today's completed exercises
    const totalSchedules = await prisma.exerciseSchedule.count({
      where: {
        userId,
        date: {
          gte: monthStartUTC,
          lte: monthEndUTC
        },
        OR: [
          // Include all exercises from completed days (before today)
          { date: { lt: todayStartUTC } },
          // Include today's exercises that are already completed
          { 
            date: { 
              gte: todayStartUTC,
              lt: todayEndUTC
            },
            completed: true 
          }
        ]
      }
    })

    // Get completed schedules (all completed exercises that are eligible)
    const completedSchedules = await prisma.exerciseSchedule.count({
      where: {
        userId,
        completed: true,
        date: {
          gte: monthStartUTC,
          lte: monthEndUTC
        },
        OR: [
          // Include all completed exercises from past days
          { date: { lt: todayStartUTC } },
          // Include today's completed exercises
          { 
            date: { 
              gte: todayStartUTC,
              lt: todayEndUTC
            }
          }
        ]
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

    // Get upcoming exercises (from today onwards, next 7 days)
    const upcomingExercises = await prisma.exerciseSchedule.findMany({
      where: {
        userId,
        date: {
          gte: todayStartUTC,  // Include today's exercises
          lte: nextWeekUTC
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