'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ScheduleResponse, Bet } from '@/types/schedule'
import { Users, Calendar, Target, ArrowLeft, ChevronRight } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface ScheduleProps {
  id: string
  exerciseType: string
  date: Date
  timeSlot: string
  completed: boolean
  bets: Bet[]
}

interface UserWithStats extends User {
  stats: {
    totalSchedules: number
    completedSchedules: number
    completionRate: number
    activeBets: number
    upcomingWorkouts: number
  }
}

export default function FriendsPage() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark))
  }, [])

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users')
            if (response.ok) {
            const data = await response.json()
            setUsers(data)
            } else {
            console.error('Failed to fetch users')
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    fetchUsers()
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--bg-primary);
          }
          .loading-text {
            font-size: 18px;
            color: var(--text-secondary);
          }
          :global([data-theme="light"]) {
            --bg-primary: #f9fafb;
            --text-secondary: #6b7280;
          }
          :global([data-theme="dark"]) {
            --bg-primary: #111827;
            --text-secondary: #9ca3af;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="friends-page">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => window.history.back()}>
              <ArrowLeft size={20} />
            </button>
            <div className="header-text">
              <h1 className="page-title">Friends&apos; Schedules</h1>
              <p className="page-subtitle">View workout schedules and place bets on friends</p>
            </div>
          </div>
          
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className="friends-count">
              <Users size={16} />
              <span>{users.length} Friends</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {users.length === 0 ? (
          <div className="no-friends">
            <Users size={48} />
            <h3>No Friends Found</h3>
            <p>Only whitelisted users can access this platform. Ask the admin to add more users to see their schedules here.</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <UserCard 
                key={user.id} 
                user={user} 
                onViewSchedule={() => setSelectedUser(user)}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <style jsx>{`
        .friends-page {
          min-height: 100vh;
          background-color: var(--bg-primary);
          transition: background-color 0.3s ease;
        }

        .header {
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          padding: 16px 0;
          transition: all 0.3s ease;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-button {
          display: flex;
          align-items: center;
          padding: 8px;
          border-radius: 8px;
          background-color: var(--bg-tertiary);
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background-color: var(--bg-hover);
        }

        .header-text {
          display: flex;
          flex-direction: column;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 4px 0 0 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .theme-toggle {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .theme-toggle:hover {
          background-color: var(--bg-hover);
        }

        .friends-count {
          background-color: var(--color-purple-light);
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-purple);
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .no-friends {
          background-color: var(--bg-secondary);
          border-radius: 12px;
          padding: 48px 32px;
          text-align: center;
          box-shadow: var(--shadow-sm);
          color: var(--text-secondary);
        }

        .no-friends h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 16px 0 8px 0;
        }

        .no-friends p {
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        /* Theme Variables */
        :global([data-theme="light"]) {
          --bg-primary: #f9fafb;
          --bg-secondary: #ffffff;
          --bg-tertiary: #f3f4f6;
          --bg-hover: #e5e7eb;
          --text-primary: #111827;
          --text-secondary: #6b7280;
          --border-color: #e5e7eb;
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
          --color-purple: #8b5cf6;
          --color-purple-light: #f3e8ff;
        }

        :global([data-theme="dark"]) {
          --bg-primary: #111827;
          --bg-secondary: #1f2937;
          --bg-tertiary: #374151;
          --bg-hover: #4b5563;
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --border-color: #374151;
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
          --color-purple: #a855f7;
          --color-purple-light: #581c87;
        }
      `}</style>
    </div>
  )
}

function UserCard({ user, onViewSchedule }: { 
  user: UserWithStats, 
  onViewSchedule: () => void 
}) {
  return (
    <div className="user-card" onClick={onViewSchedule}>
      {/* User Info */}
      <div className="user-info">
        <div className="avatar">
          {user.image ? (
            <img src={user.image} alt={user.name || 'User'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            (user.name?.[0] || user.email[0]).toUpperCase()
          )}
        </div>
        <div className="user-details">
          <h3 className="user-name">{user.name || 'Anonymous User'}</h3>
          <p className="user-email">{user.email}</p>
        </div>
        <ChevronRight size={20} color="var(--text-tertiary)" />
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{user.stats.completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{user.stats.totalSchedules}</div>
          <div className="stat-label">Total Workouts</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="btn btn-secondary"
          onClick={(e) => {
            e.stopPropagation()
            window.location.assign(`/profile/${user.id}`)
          }}
        >
          <Calendar size={16} />
          View Calendar
        </button>
        <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); onViewSchedule() }}>
          <Target size={16} />
          Place Bet
        </button>
      </div>

      {/* Status Indicators */}
      {(user.stats.upcomingWorkouts > 0 || user.stats.activeBets > 0) && (
        <div className="status-indicators">
          {user.stats.upcomingWorkouts > 0 && (
            <div className="status-badge status-blue">
              {user.stats.upcomingWorkouts} upcoming
            </div>
          )}
          {user.stats.activeBets > 0 && (
            <div className="status-badge status-yellow">
              {user.stats.activeBets} active bets
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .user-card {
          background-color: var(--bg-secondary);
          border-radius: 12px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .user-email {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn-secondary {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .btn-secondary:hover {
          background-color: var(--bg-hover);
        }

        .btn-primary {
          background-color: var(--color-blue);
          color: white;
        }

        .btn-primary:hover {
          background-color: var(--color-blue-dark);
        }

        .status-indicators {
          display: flex;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-blue {
          background-color: var(--color-blue-light);
          color: var(--color-blue-dark);
        }

        .status-yellow {
          background-color: var(--color-yellow-light);
          color: var(--color-yellow-dark);
        }

        :global([data-theme="light"]) {
          --text-tertiary: #d1d5db;
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
          --color-blue: #4f46e5;
          --color-blue-dark: #4338ca;
          --color-blue-light: #dbeafe;
          --color-yellow-light: #fef3c7;
          --color-yellow-dark: #92400e;
        }

        :global([data-theme="dark"]) {
          --text-tertiary: #6b7280;
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
          --color-blue: #6366f1;
          --color-blue-dark: #4f46e5;
          --color-blue-light: #312e81;
          --color-yellow-light: #78350f;
          --color-yellow-dark: #fbbf24;
        }
      `}</style>
    </div>
  )
}

function UserDetailModal({ user, onClose }: { 
  user: UserWithStats, 
  onClose: () => void 
}) {
  const [schedules, setSchedules] = useState<ScheduleProps[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleProps | null>(null)
  const [showBetForm, setShowBetForm] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before creating portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const fetchSchedules = async () => {
        try {
            const now = new Date()
            const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            
            const response = await fetch(
            `/api/schedules?userId=${user.id}&start=${now.toISOString()}&end=${oneWeekLater.toISOString()}`
            )
            
            if (response.ok) {
            const data = await response.json()
            setSchedules(data.map((s: ScheduleResponse) => ({
                ...s,
                date: new Date(s.date)
            })))
            }
        } catch (error) {
            console.error('Failed to fetch schedules:', error)
        } finally {
            setLoading(false)
        }
    }

    fetchSchedules()
  }, [user.id])

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        inset: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '10000',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--bg-secondary, #1f2937)',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color, #374151)',
          color: 'var(--text-primary, #f9fafb)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text-primary, #f9fafb)',
            margin: '0 0 8px 0'
          }}>
            {user.name || 'Anonymous User'}&apos;s Workouts
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary, #d1d5db)',
            margin: '0'
          }}>
            Upcoming exercises you can bet on
          </p>
        </div>

        {/* Schedules List */}
        <div style={{ marginBottom: '24px' }}>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--text-secondary, #d1d5db)' 
            }}>
              <div>Loading schedules...</div>
            </div>
          ) : schedules.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--text-secondary, #d1d5db)' 
            }}>
              <Calendar size={48} style={{ margin: '0 auto 16px auto', display: 'block' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary, #f9fafb)',
                margin: '16px 0 8px 0'
              }}>
                No Upcoming Workouts
              </h3>
              <p style={{ margin: '0' }}>
                This user hasn&apos;t scheduled any workouts for the next week.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {schedules.map((schedule) => (
                <div 
                  key={schedule.id}
                  style={{
                    border: '1px solid var(--border-color, #374151)',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: 'var(--bg-primary, #111827)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--text-primary, #f9fafb)',
                        margin: '0 0 4px 0'
                      }}>
                        {schedule.exerciseType}
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary, #d1d5db)',
                        margin: '0 0 8px 0',
                        textTransform: 'capitalize'
                      }}>
                        {schedule.date.toLocaleDateString()} • {schedule.timeSlot}
                      </p>
                      {schedule.bets && schedule.bets.length > 0 && (
                        <div style={{
                          backgroundColor: 'rgba(251, 191, 36, 0.1)',
                          color: '#f59e0b',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          width: 'fit-content'
                        }}>
                          {schedule.bets.length} active bet{schedule.bets.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSchedule(schedule)
                        setShowBetForm(true)
                      }}
                      disabled={schedule.completed}
                      style={{
                        backgroundColor: schedule.completed ? 'var(--bg-tertiary, #374151)' : '#4f46e5',
                        color: schedule.completed ? 'var(--text-secondary, #d1d5db)' : 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: schedule.completed ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {schedule.completed ? 'Completed' : 'Place Bet'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: 'var(--bg-tertiary, #374151)',
              color: 'var(--text-primary, #f9fafb)',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        {/* Betting Form Modal */}
        {showBetForm && selectedSchedule && (
          <BettingForm 
            schedule={selectedSchedule}
            targetUser={user}
            onClose={() => {
              setShowBetForm(false)
              setSelectedSchedule(null)
            }}
            onSuccess={() => {
              setShowBetForm(false)
              setSelectedSchedule(null)
              alert('Bet placed successfully!')
            }}
          />
        )}
      </div>
    </div>
  )

  // Only render portal on client-side after mounting
  if (!mounted || typeof window === 'undefined') {
    return null
  }

  // Create portal directly to document.body
  return createPortal(modalContent, document.body)
}

function ScheduleItem({ schedule, onBet }: { 
  schedule: ScheduleProps,
  onBet: () => void 
}) {
  const hasActiveBets = schedule.bets && schedule.bets.length > 0
  
  return (
    <div className="schedule-item">
      <div className="schedule-content">
        <div className="schedule-info">
          <h4 className="schedule-title">{schedule.exerciseType}</h4>
          <p className="schedule-details">
            {schedule.date.toLocaleDateString()} • {schedule.timeSlot}
          </p>
          {hasActiveBets && (
            <div className="bet-indicator">
              {schedule.bets.length} active bet{schedule.bets.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <button
          className="bet-button"
          onClick={onBet}
          disabled={schedule.completed}
        >
          {schedule.completed ? 'Completed' : 'Place Bet'}
        </button>
      </div>

      <style jsx>{`
        .schedule-item {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px;
          background-color: var(--bg-primary);
        }

        .schedule-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .schedule-info {
          flex: 1;
        }

        .schedule-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .schedule-details {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0 0 8px 0;
          text-transform: capitalize;
        }

        .bet-indicator {
          background-color: var(--color-yellow-light);
          color: var(--color-yellow-dark);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          width: fit-content;
        }

        .bet-button {
          background-color: var(--color-blue);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .bet-button:hover:not(:disabled) {
          background-color: var(--color-blue-dark);
        }

        .bet-button:disabled {
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}

// Replace the BettingForm function in your friends page with this enhanced version:

function BettingForm({ schedule, targetUser, onClose, onSuccess }: {
  schedule: { id: string; exerciseType: string; date: Date; timeSlot: string; completed: boolean },
  targetUser: { id: string; name: string; email: string },
  onClose: () => void,
  onSuccess: () => void
}) {
  const [prediction, setPrediction] = useState<boolean>(true)
  const [amount, setAmount] = useState(100)
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Ensure component is mounted before creating portal
  useEffect(() => {
    setMounted(true)
    // Add escape key listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      setMounted(false)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [submitting])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200) // Match animation duration
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    
    try {
        const response = await fetch('/api/bets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            targetUserId: targetUser.id,
            scheduleId: schedule.id,
            prediction,
            amount
            })
        })

        if (response.ok) {
            onSuccess()
        } else {
            const error = await response.json()
            alert('Failed to place bet: ' + (error.error || 'Unknown error'))
        }
        } catch (error) {
        console.error('Error placing bet:', error)
        alert('Failed to place bet. Please try again.')
        } finally {
        setSubmitting(false)
        }
    }

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        inset: '0',
        backgroundColor: isClosing ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.8)',
        backdropFilter: isClosing ? 'blur(0px)' : 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '999999',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: isClosing ? 'fadeOut 0.2s ease-out forwards' : 'fadeIn 0.3s ease-out forwards'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--bg-secondary, #1e293b)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--border-color, #475569)',
          position: 'relative',
          color: 'var(--text-primary, #f8fafc)',
          transform: isClosing ? 'scale(0.95) translateY(20px)' : 'scale(1) translateY(0)',
          opacity: isClosing ? '0' : '1',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          animation: isClosing ? 'modalSlideOut 0.2s ease-out forwards' : 'modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={submitting}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--bg-tertiary, #334155)',
            color: 'var(--text-secondary, #cbd5e1)',
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            opacity: submitting ? '0.5' : '1'
          }}
          onMouseOver={(e) => {
            if (!submitting) {
              e.currentTarget.style.backgroundColor = 'var(--bg-quaternary, #475569)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary, #334155)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          ×
        </button>

        <h3 style={{
          fontSize: '28px',
          fontWeight: '800',
          color: 'var(--text-primary, #f8fafc)',
          margin: '0 0 24px 0',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Place Your Bet
        </h3>
        
        <div style={{
          backgroundColor: 'var(--bg-primary, #0f172a)',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '28px',
          border: '1px solid var(--border-color, #475569)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899)',
            borderRadius: '16px 16px 0 0'
          }} />
          
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary, #cbd5e1)',
            margin: '0 0 12px 0',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Betting Target
          </p>
          <p style={{
            fontSize: '20px',
            fontWeight: '800',
            color: 'var(--text-primary, #f8fafc)',
            margin: '0',
            lineHeight: '1.2'
          }}>
            {targetUser.name}&apos;s {schedule.exerciseType}
          </p>
          <p style={{
            fontSize: '15px',
            color: 'var(--text-secondary, #cbd5e1)',
            margin: '12px 0 0 0',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#4f46e5', 
              borderRadius: '50%',
              display: 'inline-block'
            }} />
            {schedule.date.toLocaleDateString()} • {schedule.timeSlot}
          </p>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--text-primary, #f8fafc)',
            marginBottom: '16px'
          }}>
            Your Prediction
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              style={{
                flex: '1',
                padding: '20px 16px',
                borderRadius: '16px',
                border: prediction ? '3px solid #22c55e' : '2px solid var(--border-color, #475569)',
                backgroundColor: prediction ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-secondary, #1e293b)',
                color: prediction ? '#22c55e' : 'var(--text-secondary, #cbd5e1)',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: prediction ? 'scale(1.02)' : 'scale(1)',
                boxShadow: prediction ? '0 8px 25px rgba(34, 197, 94, 0.25)' : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => setPrediction(true)}
              onMouseOver={(e) => {
                if (!prediction) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover, #334155)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }
              }}
              onMouseOut={(e) => {
                if (!prediction) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #1e293b)'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              {prediction && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                  borderRadius: '13px'
                }} />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                Will Complete ✅
              </span>
            </button>
            <button
              style={{
                flex: '1',
                padding: '20px 16px',
                borderRadius: '16px',
                border: !prediction ? '3px solid #ef4444' : '2px solid var(--border-color, #475569)',
                backgroundColor: !prediction ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-secondary, #1e293b)',
                color: !prediction ? '#ef4444' : 'var(--text-secondary, #cbd5e1)',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: !prediction ? 'scale(1.02)' : 'scale(1)',
                boxShadow: !prediction ? '0 8px 25px rgba(239, 68, 68, 0.25)' : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => setPrediction(false)}
              onMouseOver={(e) => {
                if (prediction) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover, #334155)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }
              }}
              onMouseOut={(e) => {
                if (prediction) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #1e293b)'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              {!prediction && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                  borderRadius: '13px'
                }} />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                Will Miss ❌
              </span>
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'block',
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--text-primary, #f8fafc)',
            marginBottom: '16px'
          }}>
            Bet Amount (Baht)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              min="50"
              max="1000"
              step="50"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '20px 24px',
                borderRadius: '16px',
                border: '2px solid var(--border-color, #475569)',
                backgroundColor: 'var(--bg-tertiary, #334155)',
                color: 'var(--text-primary, #f8fafc)',
                fontSize: '24px',
                fontWeight: '700',
                boxSizing: 'border-box',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5'
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #1e293b)'
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color, #475569)'
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary, #334155)'
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <div style={{
              position: 'absolute',
              right: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-secondary, #cbd5e1)',
              pointerEvents: 'none'
            }}>
              ฿
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          <button
            onClick={handleClose}
            disabled={submitting}
            style={{
              flex: '1',
              backgroundColor: 'var(--bg-tertiary, #334155)',
              color: 'var(--text-primary, #f8fafc)',
              padding: '18px 24px',
              borderRadius: '16px',
              border: '2px solid var(--border-color, #475569)',
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? '0.5' : '1',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, #475569)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)'
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary, #334155)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: '2',
              background: submitting ? '#6b7280' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
              padding: '18px 24px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '18px',
              fontWeight: '800',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? '0.7' : '1',
              boxShadow: submitting ? 'none' : '0 8px 25px rgba(79, 70, 229, 0.4)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!submitting) {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(79, 70, 229, 0.6)'
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(79, 70, 229, 0.4)'
            }}
          >
            {submitting && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '24px',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            <span style={{ marginLeft: submitting ? '32px' : '0', transition: 'margin-left 0.3s ease' }}>
              {submitting ? 'Placing Bet...' : `Bet ${amount} ฿`}
            </span>
          </button>
        </div>

        {/* Keyframes for animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          
          @keyframes modalSlideIn {
            from { 
              opacity: 0; 
              transform: scale(0.8) translateY(30px); 
            }
            to { 
              opacity: 1; 
              transform: scale(1) translateY(0); 
            }
          }
          
          @keyframes modalSlideOut {
            from { 
              opacity: 1; 
              transform: scale(1) translateY(0); 
            }
            to { 
              opacity: 0; 
              transform: scale(0.9) translateY(20px); 
            }
          }
          
          @keyframes spin {
            0% { transform: translateY(-50%) rotate(0deg); }
            100% { transform: translateY(-50%) rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )

  // Only render portal on client-side after mounting
  if (!mounted || typeof window === 'undefined') {
    return null
  }

  // Create portal directly to document.body
  return createPortal(modalContent, document.body)
}