'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, X } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  data?: any
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds: [notificationId],
          markAsRead: true
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BET_WON': return '🎉'
      case 'BET_LOST': return '😔'
      case 'PAYMENT_DUE': return '💸'
      case 'NEW_BET_PLACED': return '🎯'
      case 'EXERCISE_REMINDER': return '⏰'
      default: return '📱'
    }
  }

  return (
    <div className="notification-bell">
      <button 
        className="bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={markAllAsRead}
                disabled={loading}
              >
                {loading ? 'Marking...' : 'Mark all read'}
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={32} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-content">
                    <div className="notification-header">
                      <span className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <span className="notification-title">{notification.title}</span>
                      {!notification.read && (
                        <button
                          className="mark-read-btn"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .notification-bell {
          position: relative;
        }

        .bell-button {
          position: relative;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .bell-button:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background-color: var(--color-danger);
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 320px;
          max-height: 400px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          overflow: hidden;
        }

        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .dropdown-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .mark-all-read-btn {
          background: none;
          border: none;
          color: var(--color-blue);
          font-size: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .mark-all-read-btn:hover {
          background-color: var(--color-blue-light);
        }

        .mark-all-read-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .notifications-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .no-notifications {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-secondary);
        }

        .no-notifications p {
          margin: 8px 0 0 0;
          font-size: 14px;
        }

        .notification-item {
          padding: 16px;
          border-bottom: 1px solid var(--border-light);
          transition: background-color 0.2s ease;
        }

        .notification-item:hover {
          background-color: var(--bg-hover-light);
        }

        .notification-item.unread {
          background-color: var(--color-blue-light);
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .notification-icon {
          font-size: 16px;
        }

        .notification-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }

        .mark-read-btn {
          background: none;
          border: none;
          color: var(--color-green);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mark-read-btn:hover {
          background-color: var(--color-green-light);
        }

        .notification-message {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0 0 6px 0;
        }

        .notification-time {
          font-size: 11px;
          color: var(--text-tertiary);
        }

        /* Theme Variables */
        :global([data-theme="light"]) {
          --color-danger: #ef4444;
          --color-blue: #4f46e5;
          --color-blue-light: #eff6ff;
          --color-green: #10b981;
          --color-green-light: #ecfdf5;
          --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
          --border-light: #f3f4f6;
          --bg-hover-light: #f9fafb;
          --text-tertiary: #9ca3af;
        }

        :global([data-theme="dark"]) {
          --color-danger: #f87171;
          --color-blue: #6366f1;
          --color-blue-light: #1e1b4b;
          --color-green: #34d399;
          --color-green-light: #064e3b;
          --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);
          --border-light: #374151;
          --bg-hover-light: #1f2937;
          --text-tertiary: #6b7280;
        }
      `}</style>
    </div>
  )
}