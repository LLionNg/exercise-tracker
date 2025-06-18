import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { completed, completedAt } = body

    // Find the schedule and verify ownership
    const schedule = await prisma.exerciseSchedule.findUnique({
      where: { id: params.id }
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    if (schedule.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the schedule
    const updatedSchedule = await prisma.exerciseSchedule.update({
      where: { id: params.id },
      data: {
        completed: completed ?? schedule.completed,
        completedAt: completedAt ? new Date(completedAt) : null
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

    // If exercise was just completed or uncompleted, we might need to resolve bets
    if (completed !== undefined && completed !== schedule.completed) {
      await resolveBets(params.id, completed)
    }

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the schedule and verify ownership
    const schedule = await prisma.exerciseSchedule.findUnique({
      where: { id: params.id },
      include: { bets: true }
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    if (schedule.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if there are active bets
    const activeBets = schedule.bets.filter(bet => bet.status === 'ACTIVE')
    if (activeBets.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete schedule with active bets' },
        { status: 400 }
      )
    }

    // Delete the schedule
    await prisma.exerciseSchedule.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}

// Helper function to resolve bets when exercise is completed/missed
async function resolveBets(scheduleId: string, completed: boolean) {
  try {
    const activeBets = await prisma.bet.findMany({
      where: {
        scheduleId,
        status: 'ACTIVE'
      },
      include: {
        placer: true,
        target: true,
        schedule: true
      }
    })

    for (const bet of activeBets) {
      // Determine if the bet was won
      const betWon = bet.prediction === completed
      
      // Update bet status
      await prisma.bet.update({
        where: { id: bet.id },
        data: {
          status: 'RESOLVED',
          result: betWon ? 'WON' : 'LOST',
          resolvedAt: new Date()
        }
      })

      // Create notifications
      if (betWon) {
        // Notify the bet placer they won
        await prisma.notification.create({
          data: {
            userId: bet.placerId,
            type: 'BET_WON',
            title: 'Bet Won!',
            message: `You won your bet on ${bet.target.name}'s exercise! You correctly predicted they would ${completed ? 'complete' : 'miss'} their workout.`,
            data: {
              betId: bet.id,
              amount: bet.amount,
              scheduleId: bet.scheduleId
            }
          }
        })
      } else {
        // Notify the bet placer they lost
        await prisma.notification.create({
          data: {
            userId: bet.placerId,
            type: 'BET_LOST',
            title: 'Bet Lost',
            message: `You lost your bet on ${bet.target.name}'s exercise. They ${completed ? 'completed' : 'missed'} their workout.`,
            data: {
              betId: bet.id,
              amount: bet.amount,
              scheduleId: bet.scheduleId
            }
          }
        })
      }

      // If exercise was missed, notify the target user about payment
      if (!completed) {
        await prisma.notification.create({
          data: {
            userId: bet.targetId,
            type: 'PAYMENT_DUE',
            title: 'Payment Due',
            message: `You missed your ${bet.schedule.exerciseType} workout. Please pay ${bet.amount} Baht to ${bet.placer.name}.`,
            data: {
              betId: bet.id,
              amount: bet.amount,
              payeeName: bet.placer.name,
              payeeEmail: bet.placer.email
            }
          }
        })
      }
    }
  } catch (error) {
    console.error('Error resolving bets:', error)
  }
}