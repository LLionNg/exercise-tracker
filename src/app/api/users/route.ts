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

    // Calculate stats for each user
    const usersWithStats = users.map(user => {
      const totalSchedules = user._count.schedules
      const completedSchedules = user.schedules.filter(s => s.completed).length
      const completionRate = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0
      
      // Count upcoming workouts (next 7 days)
      const now = new Date()
      const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const upcomingWorkouts = user.schedules.filter(s => 
        new Date(s.date) >= now && 
        new Date(s.date) <= oneWeekLater && 
        !s.completed
      ).length

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