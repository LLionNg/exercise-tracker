import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    const now = new Date()
    
    // Find all overdue exercises that haven't been completed
    const overdueSchedules = await prisma.exerciseSchedule.findMany({
      where: {
        date: {
          lt: now
        },
        completed: false,
        bets: {
          some: {
            status: 'ACTIVE'
          }
        }
      },
      include: {
        bets: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            placer: true,
            target: true
          }
        },
        user: true
      }
    })

    let resolvedCount = 0
    let notificationsCreated = 0

    for (const schedule of overdueSchedules) {
      // Check if exercise is more than 2 hours overdue to avoid timezone issues
      const hoursOverdue = (now.getTime() - schedule.date.getTime()) / (1000 * 60 * 60)
      if (hoursOverdue < 2) continue

      for (const bet of schedule.bets) {
        // Resolve the bet - exercise was missed so completed = false
        const betWon = bet.prediction === false // Won if they predicted it would be missed
        
        await prisma.bet.update({
          where: { id: bet.id },
          data: {
            status: 'RESOLVED',
            result: betWon ? 'WON' : 'LOST',
            resolvedAt: now
          }
        })
        resolvedCount++

        // Create notifications
        if (betWon) {
          // Notify the bet placer they won
          await prisma.notification.create({
            data: {
              userId: bet.placerId,
              type: 'BET_WON',
              title: '🎉 Bet Won!',
              message: `You won ${bet.amount} Baht! ${bet.target.name} missed their ${schedule.exerciseType} workout.`,
              data: {
                betId: bet.id,
                amount: bet.amount,
                scheduleId: schedule.id,
                exerciseType: schedule.exerciseType
              }
            }
          })
        } else {
          // Notify the bet placer they lost
          await prisma.notification.create({
            data: {
              userId: bet.placerId,
              type: 'BET_LOST',
              title: '😔 Bet Lost',
              message: `You lost ${bet.amount} Baht. ${bet.target.name} missed their ${schedule.exerciseType} workout as you predicted they would complete it.`,
              data: {
                betId: bet.id,
                amount: bet.amount,
                scheduleId: schedule.id,
                exerciseType: schedule.exerciseType
              }
            }
          })
        }

        // Always notify the target user about payment due
        await prisma.notification.create({
          data: {
            userId: bet.targetId,
            type: 'PAYMENT_DUE',
            title: '💸 Payment Due',
            message: `You missed your ${schedule.exerciseType} workout. Please pay ${bet.amount} Baht to ${bet.placer.name}.`,
            data: {
              betId: bet.id,
              amount: bet.amount,
              payeeName: bet.placer.name,
              payeeEmail: bet.placer.email,
              scheduleId: schedule.id
            }
          }
        })

        notificationsCreated += 3 // Won/Lost + Payment Due notifications
      }
    }

    return NextResponse.json({
      message: 'Bet resolution completed',
      resolvedBets: resolvedCount,
      notificationsCreated,
      processedSchedules: overdueSchedules.length,
      timestamp: now.toISOString()
    })
  } catch (error) {
    console.error('Error resolving bets:', error)
    return NextResponse.json(
      { error: 'Failed to resolve bets' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Cron endpoint is ready',
    timestamp: new Date().toISOString()
  })
}