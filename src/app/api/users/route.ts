import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, startOfDay } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const BANGKOK_TZ = 'Asia/Bangkok'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current time in Bangkok timezone
    const nowUTC = new Date()
    const nowBangkok = toZonedTime(nowUTC, BANGKOK_TZ)
    
    // Get start of today in Bangkok timezone
    const todayStartBangkok = startOfDay(nowBangkok)
    const todayStartUTC = fromZonedTime(todayStartBangkok, BANGKOK_TZ)
    const todayEndUTC = addDays(todayStartUTC, 1)
    
    // Get next week for upcoming workouts
    const oneWeekLater = addDays(nowBangkok, 7)
    const oneWeekLaterUTC = fromZonedTime(oneWeekLater, BANGKOK_TZ)

    // Get all users except the current user
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: session.user.id
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: {
            schedules: true,
            betsReceived: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        },
        schedules: {
          select: {
            completed: true,
            date: true
          }
        }
      }
    })

    // Calculate stats for each user with Bangkok timezone consideration
    const usersWithStats = users.map(user => {
      // FIXED: Include past exercises + today's completed exercises only
      const eligibleSchedules = user.schedules.filter(s => {
        const scheduleDate = new Date(s.date)
        
        // Include all past exercises
        if (scheduleDate < todayStartUTC) return true
        
        // Include today's completed exercises only
        if (scheduleDate >= todayStartUTC && 
            scheduleDate < todayEndUTC && 
            s.completed) return true
        
        return false
      })
      
      const totalSchedules = eligibleSchedules.length
      const completedSchedules = eligibleSchedules.filter(s => s.completed).length
      const completionRate = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0
      
      // Count upcoming workouts (from today onwards, next 7 days)
      const upcomingWorkouts = user.schedules.filter(s => {
        const scheduleDate = new Date(s.date)
        return scheduleDate >= todayStartUTC && 
               scheduleDate <= oneWeekLaterUTC && 
               !s.completed
      }).length

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        stats: {
          totalSchedules,
          completedSchedules,
          completionRate,
          activeBets: user._count.betsReceived,
          upcomingWorkouts
        }
      }
    })

    return NextResponse.json(usersWithStats)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}