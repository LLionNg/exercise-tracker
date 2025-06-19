import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, addDays, startOfDay, subDays } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export async function GET(
  _request: NextRequest, 
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Use Bangkok timezone
    const BANGKOK_TZ = 'Asia/Bangkok'
    const nowUTC = new Date()
    const nowBangkok = toZonedTime(nowUTC, BANGKOK_TZ)
    
    // Get start of today in Bangkok timezone
    const todayStartBangkok = startOfDay(nowBangkok)
    const todayStartUTC = fromZonedTime(todayStartBangkok, BANGKOK_TZ)
    const todayEndUTC = addDays(todayStartUTC, 1)
    
    // Get month boundaries
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

    // Calculate completion rate
    const completionRate = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0

    // Get active bets on this user
    const activeBets = await prisma.bet.count({
      where: {
        targetId: userId,
        status: 'ACTIVE'
      }
    })

    // Calculate streak days (consecutive completed days)
    let streakDays = 0
    let checkDate = subDays(todayStartUTC, 1) // Start from yesterday
    
    // Check the last 30 days for streak calculation
    for (let i = 0; i < 30; i++) {
      const dayStart = startOfDay(checkDate)
      const dayEnd = addDays(dayStart, 1)
      
      const scheduleCount = await prisma.exerciseSchedule.count({
        where: {
          userId,
          date: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      })
      
      if (scheduleCount === 0) {
        // No exercise scheduled for this day, continue streak
        checkDate = subDays(checkDate, 1)
        continue
      }
      
      const completedCount = await prisma.exerciseSchedule.count({
        where: {
          userId,
          date: {
            gte: dayStart,
            lt: dayEnd
          },
          completed: true
        }
      })
      
      if (completedCount === scheduleCount) {
        // All exercises completed for this day
        streakDays++
        checkDate = subDays(checkDate, 1)
      } else {
        // Not all exercises completed, break streak
        break
      }
    }

    // Get this week's workouts (including today)
    const thisWeekStart = subDays(todayStartUTC, nowBangkok.getDay()) // Start of week
    const thisWeekWorkouts = await prisma.exerciseSchedule.count({
      where: {
        userId,
        date: {
          gte: thisWeekStart,
          lt: nextWeekUTC
        },
        completed: true
      }
    })

    const stats = {
      totalSchedules,
      completedSchedules,
      completionRate,
      activeBets,
      streakDays,
      thisWeekWorkouts
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}