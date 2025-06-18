'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Target, Users} from 'lucide-react'

export default function CleanHomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading...</div>
      </div>
    )
  }

  // If user is logged in, show loading while redirecting
  if (session) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Redirecting to dashboard...</div>
      </div>
    )
  }

  // Show landing page for non-logged-in users
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)'
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '64px 16px' 
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            color: '#111827', 
            marginBottom: '16px',
            margin: 0
          }}>
            Exercise Tracker
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280', 
            marginBottom: '32px',
            margin: '0 0 32px 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Track your workouts, challenge friends, and stay accountable with our betting system
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              backgroundColor: '#4f46e5',
              color: 'white',
              fontWeight: '600',
              padding: '12px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#4338ca'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#4f46e5'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px',
          marginBottom: '64px'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '32px', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              backgroundColor: '#dbeafe', 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Calendar size={32} color="#2563eb" />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Track Workouts
            </h3>
            <p style={{ 
              color: '#6b7280',
              margin: 0,
              lineHeight: 1.6
            }}>
              Schedule your exercise routines and mark them as completed. 
              Keep track of your fitness journey with our intuitive calendar interface.
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '32px', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              backgroundColor: '#f3e8ff', 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Users size={32} color="#8b5cf6" />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Social Accountability
            </h3>
            <p style={{ 
              color: '#6b7280',
              margin: 0,
              lineHeight: 1.6
            }}>
              View your friends&apos; workout schedules and stay motivated together. 
              Public schedules create accountability and encourage consistency.
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '32px', 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ 
              backgroundColor: '#fef3c7', 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Target size={32} color="#f59e0b" />
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Betting System
            </h3>
            <p style={{ 
              color: '#6b7280',
              margin: 0,
              lineHeight: 1.6
            }}>
              Place friendly bets on workout completion. 
              Add stakes to your commitments and make fitness more engaging and rewarding.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '48px 32px', 
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '32px',
            margin: '0 0 32px 0'
          }}>
            How It Works
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ 
                backgroundColor: '#4f46e5', 
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                1
              </div>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                Schedule Workouts
              </h4>
              <p style={{ 
                color: '#6b7280',
                margin: 0,
                fontSize: '14px'
              }}>
                Plan your exercise routine using our calendar interface
              </p>
            </div>

            <div>
              <div style={{ 
                backgroundColor: '#4f46e5', 
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                2
              </div>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                Friends Can Bet
              </h4>
              <p style={{ 
                color: '#6b7280',
                margin: 0,
                fontSize: '14px'
              }}>
                Your friends can place bets on whether you&apos;ll complete your workouts
              </p>
            </div>

            <div>
              <div style={{ 
                backgroundColor: '#4f46e5', 
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                3
              </div>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                Stay Accountable
              </h4>
              <p style={{ 
                color: '#6b7280',
                margin: 0,
                fontSize: '14px'
              }}>
                Complete your workouts or pay up! The stakes keep you motivated
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}