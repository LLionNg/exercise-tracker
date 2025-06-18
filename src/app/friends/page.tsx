'use client'

import { useState, useEffect } from 'react'
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{user.name || 'Anonymous User'}&apos;s Workouts</h2>
          <p className="modal-subtitle">Upcoming exercises you can bet on</p>
        </div>

        {/* Schedules List */}
        <div className="schedules-container">
          {loading ? (
            <div className="loading-state">
              <div>Loading schedules...</div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No Upcoming Workouts</h3>
              <p>This user hasn&apos;t scheduled any workouts for the next week.</p>
            </div>
          ) : (
            <div className="schedules-list">
              {schedules.map((schedule) => (
                <ScheduleItem 
                  key={schedule.id}
                  schedule={schedule}
                  onBet={() => {
                    setSelectedSchedule(schedule)
                    setShowBetForm(true)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
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

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-content {
            background-color: var(--bg-secondary);
            border-radius: 12px;
            padding: 32px;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow: auto;
            box-shadow: var(--shadow-lg);
          }

          .modal-header {
            margin-bottom: 24px;
          }

          .modal-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 8px 0;
          }

          .modal-subtitle {
            font-size: 14px;
            color: var(--text-secondary);
            margin: 0;
          }

          .schedules-container {
            margin-bottom: 24px;
          }

          .loading-state, .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
          }

          .empty-state h3 {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 16px 0 8px 0;
          }

          .empty-state p {
            margin: 0;
          }

          .schedules-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .modal-footer {
            text-align: center;
          }

          .btn-close {
            background-color: var(--bg-tertiary);
            color: var(--text-primary);
            padding: 12px 24px;
            border-radius: 8px;
            border: none;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }

          .btn-close:hover {
            background-color: var(--bg-hover);
          }

          :global([data-theme="light"]) {
            --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
          }

          :global([data-theme="dark"]) {
            --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);
          }
        `}</style>
      </div>
    </div>
  )
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

function BettingForm({ schedule, targetUser, onClose, onSuccess }: {
  schedule: { id: string; exerciseType: string; date: Date; timeSlot: string; completed: boolean },
  targetUser: { id: string; name: string; email: string },
  onClose: () => void,
  onSuccess: () => void
}) {
  const [prediction, setPrediction] = useState<boolean>(true)
  const [amount, setAmount] = useState(100)
  const [submitting, setSubmitting] = useState(false)

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

  return (
    <div className="betting-overlay" onClick={onClose}>
      <div className="betting-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="betting-title">Place Your Bet</h3>
        
        <div className="bet-target-info">
          <p className="bet-target-label">Betting on</p>
          <p className="bet-target-name">
            {targetUser.name}&apos;s {schedule.exerciseType}
          </p>
          <p className="bet-target-details">
            {schedule.date.toLocaleDateString()} • {schedule.timeSlot}
          </p>
        </div>

        <div className="form-section">
          <label className="form-label">Your Prediction</label>
          <div className="prediction-buttons">
            <button
              className={`prediction-btn ${prediction ? 'active success' : ''}`}
              onClick={() => setPrediction(true)}
            >
              Will Complete ✅
            </button>
            <button
              className={`prediction-btn ${!prediction ? 'active danger' : ''}`}
              onClick={() => setPrediction(false)}
            >
              Will Miss ❌
            </button>
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">Bet Amount (Baht)</label>
          <input
            className="amount-input"
            type="number"
            min="50"
            max="1000"
            step="50"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div className="form-actions">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Placing Bet...' : `Bet ${amount} Baht`}
          </button>
        </div>

        <style jsx>{`
          .betting-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1001;
            padding: 20px;
          }

          .betting-modal {
            background-color: var(--bg-secondary);
            border-radius: 12px;
            padding: 32px;
            max-width: 400px;
            width: 100%;
            box-shadow: var(--shadow-lg);
          }

          .betting-title {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 16px 0;
          }

          .bet-target-info {
            background-color: var(--bg-primary);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
          }

          .bet-target-label {
            font-size: 14px;
            color: var(--text-secondary);
            margin: 0 0 8px 0;
          }

          .bet-target-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
          }

          .bet-target-details {
            font-size: 14px;
            color: var(--text-secondary);
            margin: 4px 0 0 0;
          }

          .form-section {
            margin-bottom: 20px;
          }

          .form-label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 8px;
          }

          .prediction-buttons {
           display: flex;
           gap: 8px;
         }

         .prediction-btn {
           flex: 1;
           padding: 12px;
           border-radius: 8px;
           border: 2px solid var(--border-color);
           background-color: var(--bg-secondary);
           color: var(--text-secondary);
           font-size: 14px;
           font-weight: 500;
           cursor: pointer;
           transition: all 0.2s ease;
         }

         .prediction-btn.active.success {
           border-color: var(--color-success);
           background-color: var(--color-success-light);
           color: var(--color-success-dark);
         }

         .prediction-btn.active.danger {
           border-color: var(--color-danger);
           background-color: var(--color-danger-light);
           color: var(--color-danger-dark);
         }

         .amount-input {
           width: 100%;
           padding: 12px;
           border-radius: 8px;
           border: 1px solid var(--border-color);
           background-color: var(--bg-secondary);
           color: var(--text-primary);
           font-size: 16px;
           box-sizing: border-box;
         }

         .amount-input:focus {
           outline: none;
           border-color: var(--color-blue);
         }

         .form-actions {
           display: flex;
           gap: 12px;
         }

         .btn-cancel {
           flex: 1;
           background-color: var(--bg-tertiary);
           color: var(--text-primary);
           padding: 12px;
           border-radius: 8px;
           border: none;
           font-size: 14px;
           font-weight: 500;
           cursor: pointer;
           transition: background-color 0.2s ease;
         }

         .btn-cancel:hover:not(:disabled) {
           background-color: var(--bg-hover);
         }

         .btn-submit {
           flex: 1;
           background-color: var(--color-blue);
           color: white;
           padding: 12px;
           border-radius: 8px;
           border: none;
           font-size: 14px;
           font-weight: 500;
           cursor: pointer;
           transition: background-color 0.2s ease;
         }

         .btn-submit:hover:not(:disabled) {
           background-color: var(--color-blue-dark);
         }

         .btn-submit:disabled {
           background-color: var(--text-secondary);
           cursor: not-allowed;
         }

         :global([data-theme="light"]) {
           --color-success: #10b981;
           --color-success-light: #d1fae5;
           --color-success-dark: #065f46;
           --color-danger: #ef4444;
           --color-danger-light: #fee2e2;
           --color-danger-dark: #991b1b;
         }

         :global([data-theme="dark"]) {
           --color-success: #34d399;
           --color-success-light: #064e3b;
           --color-success-dark: #6ee7b7;
           --color-danger: #f87171;
           --color-danger-light: #7f1d1d;
           --color-danger-dark: #fca5a5;
         }
       `}</style>
     </div>
   </div>
 )
}