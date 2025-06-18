'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Target, Users, Bell, Plus, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import EnhancedThemeToggle from '@/components/EnhancedThemeToggle'

interface DashboardStats {
  totalSchedules: number
  completedSchedules: number
  activeBets: number
  pendingPayments: number
  upcomingExercises: Array<{
    id: string
    date: string
    exerciseType: string
    timeSlot: string
  }>
}

export default function ThemedDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [session?.user?.id])

  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--border-color)',
            borderTop: '4px solid var(--text-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Loading...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const completionRate = stats ? 
    (stats.totalSchedules > 0 ? (stats.completedSchedules / stats.totalSchedules * 100).toFixed(1) : '0') : '0'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', transition: 'var(--transition-theme)' }}>
      {/* Header */}
      <div className="header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className="header-title">Exercise Tracker</h1>
            </div>
            
            <div className="header-user">
              <EnhancedThemeToggle />
              
              <button className="notification-btn">
                <Bell size={20} />
                {stats && stats.pendingPayments > 0 && (
                  <span className="notification-badge">
                    {stats.pendingPayments}
                  </span>
                )}
              </button>
              
              <div className="user-info">
                <p className="user-name">{session.user?.name}</p>
                <p className="user-email">{session.user?.email}</p>
              </div>
              
              <img
                src={session.user?.image || ''}
                alt="Profile"
                className="avatar"
              />
              
              <button
                onClick={() => signOut()}
                className="btn btn-ghost"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="main-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h2 className="welcome-title">
              Welcome back, {session.user?.name?.split(' ')[0]}! 👋
            </h2>
            <p className="welcome-subtitle">
              Track your fitness journey and stay accountable with friends.
            </p>
          </div>

          {/* Quick Stats */}
          {loading ? (
            <div className="stats-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="loading-card">
                  <div className="loading-bar wide"></div>
                  <div className="loading-bar narrow"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-info">
                    <h4>Completion Rate</h4>
                    <p className="stat-value success">{completionRate}%</p>
                  </div>
                  <TrendingUp size={32} color="var(--color-success)" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-info">
                    <h4>Completed</h4>
                    <p className="stat-value primary">{stats?.completedSchedules || 0}</p>
                  </div>
                  <CheckCircle size={32} color="var(--text-accent)" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-info">
                    <h4>Active Bets</h4>
                    <p className="stat-value purple">{stats?.activeBets || 0}</p>
                  </div>
                  <Target size={32} color="var(--color-purple)" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-content">
                  <div className="stat-info">
                    <h4>Pending Payments</h4>
                    <p className="stat-value danger">{stats?.pendingPayments || 0}</p>
                  </div>
                  <Clock size={32} color="var(--color-danger)" />
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="actions-grid">
            {/* My Calendar */}
            <Link href="/calendar" className="action-card">
              <div className="action-header">
                <div className="action-icon blue">
                  <Calendar size={24} color="var(--color-blue)" />
                </div>
                <div>
                  <h3 className="action-title">My Exercise Calendar</h3>
                  <p className="action-subtitle">Schedule and track workouts</p>
                </div>
              </div>
              
              {/* Upcoming exercises preview */}
              {stats?.upcomingExercises && stats.upcomingExercises.length > 0 ? (
                <div className="upcoming-list">
                  <p className="upcoming-header">Upcoming</p>
                  {stats.upcomingExercises.slice(0, 2).map((exercise) => (
                    <div key={exercise.id} className="upcoming-item">
                      <span className="upcoming-exercise">{exercise.exerciseType}</span>
                      <span className="upcoming-time">{exercise.timeSlot}</span>
                    </div>
                  ))}
                  {stats.upcomingExercises.length > 2 && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                      +{stats.upcomingExercises.length - 2} more
                    </p>
                  )}
                </div>
              ) : (
                <div className="add-first">
                  <Plus size={16} />
                  <span>Add your first workout</span>
                </div>
              )}
            </Link>

            {/* Browse Friends */}
            <Link href="/friends" className="action-card">
              <div className="action-header">
                <div className="action-icon purple">
                  <Users size={24} color="var(--color-purple)" />
                </div>
                <div>
                  <h3 className="action-title">Friends' Schedules</h3>
                  <p className="action-subtitle">View and bet on friends' workouts</p>
                </div>
              </div>
              
              <div className="add-first">
                <Target size={16} />
                <span>Place bets and stay motivated</span>
              </div>
            </Link>

            {/* My Bets */}
            <Link href="/bets" className="action-card">
              <div className="action-header">
                <div className="action-icon yellow">
                  <Target size={24} color="var(--color-warning)" />
                </div>
                <div>
                  <h3 className="action-title">My Bets</h3>
                  <p className="action-subtitle">Track your betting history</p>
                </div>
              </div>
              
              <div className="add-first">
                <Clock size={16} />
                <span>Active bets</span>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h3 className="activity-title">Recent Activity</h3>
            <div className="no-activity">
              No recent activity. Start by scheduling your first workout!
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}