'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Target, TrendingUp, Users } from 'lucide-react'
import { useParams } from 'next/navigation'
import DatabaseConnectedCalendar from '@/components/Calendar/DatabaseConnectedCalendar'

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface UserStats {
  totalSchedules: number
  completedSchedules: number
  completionRate: number
  activeBets: number
  streakDays: number
  thisWeekWorkouts: number
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
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
    if (!userId) return
    
    const fetchUserData = async () => {
        try {
        const [userResponse, statsResponse] = await Promise.all([
            fetch(`/api/users/${userId}`),
            fetch(`/api/users/${userId}/stats`)
        ])
        
        if (userResponse.ok && statsResponse.ok) {
            const userData = await userResponse.json()
            const statsData = await statsResponse.json()
            setUser(userData)
            setStats(statsData)
        }
        } catch (error) {
        console.error('Failed to fetch user data:', error)
        } finally {
        setLoading(false)
        }
    }

    fetchUserData()
    }, [userId])

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

  if (!user || !stats) {
    return (
      <div className="error-container">
        <div className="error-text">User not found</div>
        <style jsx>{`
          .error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--bg-primary);
          }
          .error-text {
            font-size: 18px;
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => window.history.back()}>
              <ArrowLeft size={20} />
            </button>
            <div className="user-info">
              <div className="avatar">
                {user.image ? (
                  <img src={user.image} alt={user.name || 'User'} className="avatar-img" />
                ) : (
                  (user.name?.[0] || user.email[0]).toUpperCase()
                )}
              </div>
              <div className="user-details">
                <h1 className="user-name">{user.name || 'Anonymous User'}</h1>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
          </div>
          
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.completionRate}%</div>
                <div className="stat-label">Completion Rate</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon green">
                <Target size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.completedSchedules}</div>
                <div className="stat-label">Workouts Completed</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon yellow">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.activeBets}</div>
                <div className="stat-label">Active Bets</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon purple">
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.streakDays}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="calendar-section">
        <div className="calendar-content">
          <div className="calendar-header">
            <h2 className="calendar-title">Exercise Schedule</h2>
            <p className="calendar-subtitle">View {user.name}&apos;s public workout calendar</p>
          </div>
          
          <div className="calendar-container">
            <DatabaseConnectedCalendar userId={userId} isOwnCalendar={false} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background-color: var(--bg-primary);
          transition: background-color 0.3s ease;
        }

        .header {
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          padding: 20px 0;
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
          gap: 20px;
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

        .user-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
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
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .user-email {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0;
        }

        .theme-toggle {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .theme-toggle:hover {
          background-color: var(--bg-hover);
        }

        .stats-section {
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          padding: 32px 0;
        }

        .stats-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background-color: var(--bg-primary);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon {
          padding: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.blue {
          background-color: var(--color-blue-light);
          color: var(--color-blue);
        }

        .stat-icon.green {
          background-color: var(--color-green-light);
          color: var(--color-green);
        }

        .stat-icon.yellow {
          background-color: var(--color-yellow-light);
          color: var(--color-yellow);
        }

        .stat-icon.purple {
          background-color: var(--color-purple-light);
          color: var(--color-purple);
        }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .calendar-section {
          padding: 40px 0;
        }

        .calendar-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .calendar-header {
          margin-bottom: 32px;
        }

        .calendar-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .calendar-subtitle {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0;
        }

        .calendar-container {
          background-color: var(--bg-secondary);
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .calendar-placeholder {
          padding: 80px 40px;
          text-align: center;
          color: var(--text-secondary);
        }

        .calendar-placeholder p {
          margin: 16px 0 0 0;
          font-size: 16px;
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
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
          --color-blue: #4f46e5;
          --color-blue-light: #dbeafe;
          --color-green: #10b981;
          --color-green-light: #d1fae5;
          --color-yellow: #f59e0b;
          --color-yellow-light: #fef3c7;
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
          --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
          --color-blue: #6366f1;
          --color-blue-light: #312e81;
          --color-green: #34d399;
          --color-green-light: #064e3b;
          --color-yellow: #fbbf24;
          --color-yellow-light: #78350f;
          --color-purple: #a855f7;
          --color-purple-light: #581c87;
        }
      `}</style>
    </div>
  )
}