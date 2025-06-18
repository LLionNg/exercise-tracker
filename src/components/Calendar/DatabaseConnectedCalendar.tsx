'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ExerciseSchedule, ScheduleResponse } from '@/types/schedule'
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { Plus, CheckCircle, Clock, Users, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

interface ThemedCalendarProps {
  userId?: string
  isOwnCalendar?: boolean
}

export default function ThemedCalendar({ userId, isOwnCalendar = true }: ThemedCalendarProps) {
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [schedules, setSchedules] = useState<ExerciseSchedule[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const targetUserId = userId || session?.user?.id
  const currentDate = new Date()

  // Fetch schedules for the current month from your API
  useEffect(() => {
    if (!targetUserId) return
    
    const fetchSchedules = async () => {
      setLoading(true)
      try {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        
        const response = await fetch(
          `/api/schedules?userId=${targetUserId}&start=${start.toISOString()}&end=${end.toISOString()}`
        )
        
        if (response.ok) {
          const data = await response.json()
          setSchedules(data.map((s: ScheduleResponse) => ({
            ...s,
            date: new Date(s.date)
          })))
        } else {
          console.error('Failed to fetch schedules:', response.statusText)
        }
      } catch (error) {
        console.error('Failed to fetch schedules:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [targetUserId, currentMonth])

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => isSameDay(schedule.date, date))
  }

  const selectedDateSchedules = getSchedulesForDate(selectedDate)

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = startOfMonth(currentMonth)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-secondary)', 
      borderRadius: '12px', 
      boxShadow: 'var(--shadow-medium)', 
      padding: '32px',
      border: '1px solid var(--border-color)',
      transition: 'var(--transition-theme)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px' 
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: 'var(--text-primary)',
          margin: 0,
          transition: 'var(--transition-theme)'
        }}>
          {isOwnCalendar ? 'My Exercise Calendar' : 'Exercise Schedule'}
        </h2>
        {isOwnCalendar && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: 'var(--text-accent)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'var(--text-accent-hover)'
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = 'var(--shadow-light)'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'var(--text-accent)'
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'var(--shadow-sm)'
            }}
          >
            <Plus size={20} />
            Add Exercise
          </button>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '32px' 
      }}>
        {/* Calendar */}
        <div>
          {/* Calendar Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              style={{
                padding: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'var(--transition-theme)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'var(--bg-hover)'
                e.target.style.borderColor = 'var(--border-hover)'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'var(--bg-secondary)'
                e.target.style.borderColor = 'var(--border-color)'
              }}
            >
              <ChevronLeft size={20} color="var(--text-secondary)" />
            </button>
            
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              margin: 0,
              transition: 'var(--transition-theme)'
            }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              style={{
                padding: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'var(--transition-theme)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'var(--bg-hover)'
                e.target.style.borderColor = 'var(--border-hover)'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'var(--bg-secondary)'
                e.target.style.borderColor = 'var(--border-color)'
              }}
            >
              <ChevronRight size={20} color="var(--text-secondary)" />
            </button>
          </div>

          {/* Day Headers */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '2px',
            marginBottom: '8px'
          }}>
            {dayNames.map(day => (
              <div key={day} style={{
                padding: '12px 8px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '4px',
                transition: 'var(--transition-theme)'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '2px',
            backgroundColor: 'var(--border-color)',
            padding: '2px',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {calendarDays.map((date, index) => {
              const daySchedules = getSchedulesForDate(date)
              const hasSchedules = daySchedules.length > 0
              const hasBets = daySchedules.some(s => s.bets.length > 0)
              const isPast = date < currentDate && !isSameDay(date, currentDate)
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
              const isSelected = isSameDay(date, selectedDate)
              const isToday = isSameDay(date, currentDate)

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    position: 'relative',
                    height: '48px',
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--text-accent)' : isToday ? 'var(--bg-hover)' : 'var(--bg-secondary)',
                    color: isSelected ? 'white' : isCurrentMonth ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: hasSchedules ? '600' : '400',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = 'var(--bg-hover)'
                      e.target.style.transform = 'scale(1.05)'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = isToday ? 'var(--bg-hover)' : 'var(--bg-secondary)'
                      e.target.style.transform = 'scale(1)'
                    }
                  }}
                >
                  {format(date, 'd')}
                  
                  {/* Exercise indicators */}
                  {hasSchedules && (
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '2px'
                    }}>
                      {daySchedules.slice(0, 3).map((schedule, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            backgroundColor: schedule.completed 
                              ? 'var(--color-success)' 
                              : isPast 
                                ? 'var(--color-danger)' 
                                : 'var(--color-blue)'
                          }}
                        />
                      ))}
                      {daySchedules.length > 3 && (
                        <div style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--text-secondary)',
                          fontSize: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          +
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Bet indicator */}
                  {hasBets && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'var(--color-warning)',
                      borderRadius: '50%',
                      boxShadow: '0 0 0 1px var(--bg-secondary)'
                    }} />
                  )}

                  {/* Today indicator */}
                  {isToday && !isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      width: '6px',
                      height: '6px',
                      backgroundColor: 'var(--text-accent)',
                      borderRadius: '50%'
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ 
            marginTop: '24px', 
            padding: '20px', 
            backgroundColor: 'var(--bg-tertiary)', 
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            transition: 'var(--transition-theme)'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: 'var(--text-primary)', 
              marginBottom: '16px',
              margin: '0 0 16px 0',
              transition: 'var(--transition-theme)'
            }}>
              Legend
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '12px',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-blue)', borderRadius: '50%' }}></div>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500', transition: 'var(--transition-theme)' }}>Scheduled</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-success)', borderRadius: '50%' }}></div>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500', transition: 'var(--transition-theme)' }}>Completed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-danger)', borderRadius: '50%' }}></div>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500', transition: 'var(--transition-theme)' }}>Missed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-warning)', borderRadius: '50%' }}></div>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500', transition: 'var(--transition-theme)' }}>Has Bets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div>
          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid var(--border-color)',
            transition: 'var(--transition-theme)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              marginBottom: '16px',
              margin: '0 0 16px 0',
              paddingBottom: '12px',
              borderBottom: '2px solid var(--border-color)',
              transition: 'var(--transition-theme)'
            }}>
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--border-color)',
                  borderTop: '3px solid var(--text-accent)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px auto'
                }}></div>
                Loading...
              </div>
            ) : selectedDateSchedules.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '2px dashed var(--border-color)',
                transition: 'var(--transition-theme)'
              }}>
                <Clock size={48} color="var(--text-secondary)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
                <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px', margin: '0 0 8px 0', fontSize: '16px' }}>
                  No exercises scheduled
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', margin: '0 0 20px 0' }}>
                  Add your first workout for this day
                </p>
                {isOwnCalendar && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                      backgroundColor: 'var(--text-accent)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = 'var(--text-accent-hover)'
                      e.target.style.transform = 'translateY(-1px)'
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'var(--text-accent)'
                      e.target.style.transform = 'translateY(0)'
                    }}
                  >
                    Add Exercise
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedDateSchedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    isOwnCalendar={isOwnCalendar}
                    onUpdate={() => {
                      // Refresh schedules
                      const start = startOfMonth(currentMonth)
                      const end = endOfMonth(currentMonth)
                      
                      fetch(`/api/schedules?userId=${targetUserId}&start=${start.toISOString()}&end=${end.toISOString()}`)
                        .then(response => response.json())
                        .then(data => {
                          setSchedules(data.map((s: ScheduleResponse) => ({
                            ...s,
                            date: new Date(s.date)
                          })))
                        })
                        .catch(error => console.error('Failed to refresh schedules:', error))
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <AddExerciseModal
          date={selectedDate}
          onClose={() => setShowAddModal(false)}
          onAdd={(newSchedule) => {
            setSchedules(prev => [...prev, newSchedule])
            setShowAddModal(false)
          }}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Enhanced Schedule Card Component
function ScheduleCard({ 
  schedule, 
  isOwnCalendar, 
  onUpdate 
}: { 
  schedule: ExerciseSchedule
  isOwnCalendar: boolean
  onUpdate: () => void 
}) {
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isPast = schedule.date < new Date() && !isSameDay(schedule.date, new Date())

  const handleToggleComplete = async () => {
    if (!isOwnCalendar) return
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          completed: !schedule.completed,
          completedAt: !schedule.completed ? new Date().toISOString() : null
        })
      })
      
      if (response.ok) {
        onUpdate()
      } else {
        console.error('Failed to update schedule:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to update schedule:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!isOwnCalendar) return
    
    if (schedule.bets.length > 0) {
      alert('Cannot delete exercise with active bets!')
      return
    }
    
    if (!confirm(`Are you sure you want to delete "${schedule.exerciseType}"?`)) {
      return
    }
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        onUpdate()
      } else {
        const error = await response.json()
        console.error('Failed to delete schedule:', error)
        alert('Failed to delete exercise: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error)
      alert('Failed to delete exercise. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '20px',
      backgroundColor: schedule.completed 
        ? 'var(--color-success-light)' 
        : isPast 
          ? 'var(--color-danger-light)' 
          : 'var(--bg-secondary)',
      transition: 'var(--transition-theme), transform 0.2s ease',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseOver={(e) => {
      e.target.style.transform = 'translateY(-2px)'
      e.target.style.boxShadow = 'var(--shadow-light)'
    }}
    onMouseOut={(e) => {
      e.target.style.transform = 'translateY(0)'
      e.target.style.boxShadow = 'none'
    }}
    >
      {/* Status indicator bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        backgroundColor: schedule.completed 
          ? 'var(--color-success)' 
          : isPast 
            ? 'var(--color-danger)' 
            : 'var(--color-blue)'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginLeft: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, transition: 'var(--transition-theme)' }}>
              {schedule.exerciseType}
            </h4>
            {schedule.completed && <CheckCircle size={20} color="var(--color-success)" />}
          </div>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)', 
            textTransform: 'capitalize',
            marginBottom: '12px',
            margin: '0 0 12px 0',
            fontWeight: '500',
            transition: 'var(--transition-theme)'
          }}>
            {schedule.timeSlot}
          </p>
          
          {/* Bets section */}
          {schedule.bets.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#92400e',
              backgroundColor: 'var(--color-warning-light)',
              padding: '6px 12px',
              borderRadius: '20px',
              width: 'fit-content',
              border: '1px solid var(--color-warning)',
              transition: 'var(--transition-theme)'
            }}>
              <Users size={14} />
              <span style={{ fontWeight: '500' }}>
                {schedule.bets.length} bet{schedule.bets.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        {isOwnCalendar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
            {!isPast && (
              <button
                onClick={handleToggleComplete}
                disabled={updating}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: updating ? 'not-allowed' : 'pointer',
                  backgroundColor: schedule.completed ? 'var(--color-success)' : 'var(--text-secondary)',
                  color: 'white',
                  opacity: updating ? 0.5 : 1,
                  minWidth: '90px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
                onMouseOver={(e) => {
                  if (!updating) {
                    e.target.style.backgroundColor = schedule.completed ? '#16a34a' : '#4b5563'
                    e.target.style.transform = 'scale(1.02)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!updating) {
                    e.target.style.backgroundColor = schedule.completed ? 'var(--color-success)' : 'var(--text-secondary)'
                    e.target.style.transform = 'scale(1)'
                  }
                }}
              >
                {updating ? (
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <>
                    {schedule.completed ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {schedule.completed ? 'Done' : 'Mark Done'}
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600',
                cursor: deleting ? 'not-allowed' : 'pointer',
                backgroundColor: 'var(--color-danger)',
                color: 'white',
                opacity: deleting ? 0.5 : 1,
                minWidth: '90px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                if (!deleting) {
                  e.target.style.backgroundColor = '#dc2626'
                  e.target.style.transform = 'scale(1.02)'
                }
              }}
              onMouseOut={(e) => {
                if (!deleting) {
                  e.target.style.backgroundColor = 'var(--color-danger)'
                  e.target.style.transform = 'scale(1)'
                }
              }}
            >
              {deleting ? (
                <div style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              ) : (
                <>
                  <Trash2 size={14} />
                  Remove
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Enhanced Add Exercise Modal Component
function AddExerciseModal({ 
  date, 
  onClose, 
  onAdd 
}: { 
  date: Date
  onClose: () => void
  onAdd: (schedule: ExerciseSchedule) => void 
}) {
  const [exerciseType, setExerciseType] = useState('')
  const [timeSlot, setTimeSlot] = useState('morning')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exerciseType.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date.toISOString(),
          exerciseType: exerciseType.trim(),
          timeSlot
        })
      })

      if (response.ok) {
        const newSchedule = await response.json()
        onAdd({
          ...newSchedule,
          date: new Date(newSchedule.date)
        })
      } else {
        const error = await response.json()
        console.error('Failed to create schedule:', error)
        alert('Failed to create exercise: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to create schedule:', error)
      alert('Failed to create exercise. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 50,
      backdropFilter: 'blur(4px)'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose()
    }}
    >
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-large)',
        padding: '32px',
        width: '100%',
        maxWidth: '480px',
        border: '1px solid var(--border-color)',
        transition: 'var(--transition-theme)',
        transform: 'scale(1)',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px',
          margin: '0 0 8px 0',
          color: 'var(--text-primary)',
          transition: 'var(--transition-theme)'
        }}>
          Add Exercise
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          margin: '0 0 24px 0',
          transition: 'var(--transition-theme)'
        }}>
          {format(date, 'EEEE, MMMM d, yyyy')}
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '8px',
              transition: 'var(--transition-theme)'
            }}>
              Exercise Type
            </label>
            <input
              type="text"
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              placeholder="e.g., Running, Gym, Cycling, Swimming"
              style={{
                width: '100%',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-tertiary)',
                outline: 'none',
                transition: 'var(--transition-theme)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--border-focus)'
                e.target.style.backgroundColor = 'var(--bg-secondary)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)'
                e.target.style.backgroundColor = 'var(--bg-tertiary)'
              }}
              required
              autoFocus
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '8px',
              transition: 'var(--transition-theme)'
            }}>
              Time Slot
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              style={{
                width: '100%',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-tertiary)',
                outline: 'none',
                transition: 'var(--transition-theme)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--border-focus)'
                e.target.style.backgroundColor = 'var(--bg-secondary)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)'
                e.target.style.backgroundColor = 'var(--bg-tertiary)'
              }}
            >
              <option value="morning">🌅 Morning</option>
              <option value="afternoon">☀️ Afternoon</option>
              <option value="evening">🌆 Evening</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'var(--bg-hover)'
                e.target.style.borderColor = 'var(--border-hover)'
                e.target.style.color = 'var(--text-primary)'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'var(--bg-secondary)'
                e.target.style.borderColor = 'var(--border-color)'
                e.target.style.color = 'var(--text-secondary)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !exerciseType.trim()}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: 'var(--text-accent)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading || !exerciseType.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !exerciseType.trim() ? 0.5 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '120px',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                if (!loading && exerciseType.trim()) {
                  e.target.style.backgroundColor = 'var(--text-accent-hover)'
                  e.target.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseOut={(e) => {
                if (!loading && exerciseType.trim()) {
                  e.target.style.backgroundColor = 'var(--text-accent)'
                  e.target.style.transform = 'translateY(0)'
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Exercise
                </>
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
          @keyframes modalSlideIn {
            0% { 
              opacity: 0; 
              transform: scale(0.9) translateY(-10px); 
            }
            100% { 
              opacity: 1; 
              transform: scale(1) translateY(0); 
            }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}