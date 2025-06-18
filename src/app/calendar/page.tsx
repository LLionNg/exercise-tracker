'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ThemedCalendar from '@/components/Calendar/DatabaseConnectedCalendar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EnhancedThemeToggle from '@/components/EnhancedThemeToggle'

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', transition: 'var(--transition-theme)' }}>
      {/* Header */}
      <div className="header">
        <div className="container">
          <div className="header-content">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'var(--transition-theme)'
                }}
                onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="header-user">
              <EnhancedThemeToggle />
              
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Welcome, {session.user?.name}
              </span>
              <img
                src={session.user?.image || ''}
                alt="Profile"
                className="avatar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div style={{ padding: '32px 16px' }}>
          <ThemedCalendar isOwnCalendar={true} />
        </div>
      </div>
    </div>
  )
}