export interface Bet {
  id: string
  placerId: string
  amount: number
  prediction: boolean
  placer: {
    name: string
    email: string
  }
}

export interface ExerciseSchedule {
  id: string
  date: Date
  exerciseType: string
  timeSlot: string
  completed: boolean
  completedAt?: Date
  bets: Bet[]
}

export interface ScheduleResponse {
  id: string
  date: string
  exerciseType: string
  timeSlot: string
  completed: boolean
  completedAt?: string
  bets: Bet[]
}