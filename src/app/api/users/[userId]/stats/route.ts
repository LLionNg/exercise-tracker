import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const totalSchedules = user._count.schedules
    const completedSchedules = user.schedules.filter(s => s.completed).length
    const completionRate = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0
    
    // Calculate streak days (consecutive days with completed workouts)
    const sortedCompletedDates = user.schedules
      .filter(s => s.completed)
      .map(s => new Date(s.date))
      .sort((a, b) => b.getTime() - a.getTime())
    
    let streakDays = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (const date of sortedCompletedDates) {
      const scheduleDate = new Date(date)
      scheduleDate.setHours(0, 0, 0, 0)
      
      if (scheduleDate.getTime() === currentDate.getTime()) {
        streakDays++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (scheduleDate.getTime() < currentDate.getTime()) {
        break
      }
    }

    // Count this week's workouts
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const thisWeekWorkouts = user.schedules.filter(s => {
      const scheduleDate = new Date(s.date)
      return scheduleDate >= startOfWeek && scheduleDate <= now && s.completed
    }).length

    const stats = {
      totalSchedules,
      completedSchedules,
      completionRate,
      activeBets: user._count.betsReceived,
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