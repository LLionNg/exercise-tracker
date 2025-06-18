'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Target, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, ArrowLeft, Calendar } from 'lucide-react'

interface Bet {
  id: string
  amount: number
  prediction: boolean
  status: 'ACTIVE' | 'RESOLVED'
  result?: 'WON' | 'LOST'
  createdAt: string
  resolvedAt?: string
  target?: {
    id: string
    name: string
    email: string
  }
  placer?: {
    id: string
    name: string
    email: string
  }
  schedule: {
    id: string
    exerciseType: string
    date: string
    timeSlot: string
    completed: boolean
  }
}

interface BetsData {
  betsPlaced: Bet[]
  betsReceived: Bet[]
}

export default function MyBetsPage() {
  // Mock session data - replace with your auth system
  const { data: session, status } = useSession()
  const router = useRouter()
  const [betsData, setBetsData] = useState<BetsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'placed' | 'received'>('placed')
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
    if (status === 'loading') return
    if (!session) router.push('/login')
  }, [session, status, router])

  useEffect(() => {
    if (!session?.user?.id) return
    
    const fetchBets = async () => {
        try {
        const response = await fetch('/api/bets')
        if (response.ok) {
            const data = await response.json()
            setBetsData(data)
        }
        } catch (error) {
        console.error('Failed to fetch bets:', error)
        } finally {
        setLoading(false)
        }
    }

    fetchBets()
  }, [session?.user?.id])

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

  if (!session || !betsData) return null

  const calculateStats = (bets: Bet[]) => {
    const total = bets.length
    const won = bets.filter(bet => bet.result === 'WON').length
    const lost = bets.filter(bet => bet.result === 'LOST').length
    const active = bets.filter(bet => bet.status === 'ACTIVE').length
    const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0)
    const winnings = bets.filter(bet => bet.result === 'WON').reduce((sum, bet) => sum + bet.amount, 0)
    const losses = bets.filter(bet => bet.result === 'LOST').reduce((sum, bet) => sum + bet.amount, 0)
    
    return {
      total,
      won,
      lost,
      active,
      totalAmount,
      winnings,
      losses,
      netProfit: winnings - losses,
      winRate: total > 0 ? Math.round((won / (won + lost)) * 100) : 0
    }
  }

  const placedStats = calculateStats(betsData.betsPlaced)
  const receivedStats = calculateStats(betsData.betsReceived)

  return (
    <div className="bets-page">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => window.history.back()}>
              <ArrowLeft size={20} />
            </button>
            <div className="header-text">
              <h1 className="page-title">My Bets</h1>
              <p className="page-subtitle">Track your betting history and performance</p>
            </div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tab-content">
          <button
            className={`tab-button ${activeTab === 'placed' ? 'active' : ''}`}
            onClick={() => setActiveTab('placed')}
          >
            Bets I Placed ({placedStats.total})
          </button>
          <button
            className={`tab-button ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Bets On Me ({receivedStats.total})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <StatsCard 
            title="Total Bets" 
            value={activeTab === 'placed' ? placedStats.total : receivedStats.total}
            icon={<Target size={20} />}
            color="blue"
          />
          <StatsCard 
            title="Win Rate" 
            value={`${activeTab === 'placed' ? placedStats.winRate : receivedStats.winRate}%`}
            icon={<TrendingUp size={20} />}
            color="green"
          />
          <StatsCard 
            title="Active Bets" 
            value={activeTab === 'placed' ? placedStats.active : receivedStats.active}
            icon={<Clock size={20} />}
            color="yellow"
          />
          <StatsCard 
            title="Net P&L" 
            value={`${activeTab === 'placed' ? placedStats.netProfit : receivedStats.netProfit} ฿`}
            icon={placedStats.netProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            color={placedStats.netProfit >= 0 ? "green" : "red"}
          />
        </div>

        {/* Bets List */}
        <div className="bets-container">
          <div className="bets-header">
            <h2 className="bets-title">
              {activeTab === 'placed' ? 'Bets I Placed' : 'Bets On My Workouts'}
            </h2>
          </div>

          <div className="bets-content">
            {(activeTab === 'placed' ? betsData.betsPlaced : betsData.betsReceived).length === 0 ? (
              <div className="empty-state">
                <Target size={48} />
                <h3>No bets found</h3>
                <p>
                  {activeTab === 'placed' 
                    ? "You haven't placed any bets yet. Visit friends' schedules to start betting!"
                    : "No one has bet on your workouts yet. Keep scheduling to attract some bets!"
                  }
                </p>
                {activeTab === 'placed' && (
                  <button
                    className="browse-friends-btn"
                    onClick={() => window.location.href = '/friends'}
                  >
                    Browse Friends
                  </button>
                )}
              </div>
            ) : (
              <div className="bets-list">
                {(activeTab === 'placed' ? betsData.betsPlaced : betsData.betsReceived).map((bet, index) => (
                  <BetCard 
                    key={bet.id} 
                    bet={bet} 
                    isLast={index === (activeTab === 'placed' ? betsData.betsPlaced : betsData.betsReceived).length - 1}
                    viewType={activeTab}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .bets-page {
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

        .tab-navigation {
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .tab-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
        }

        .tab-button {
          padding: 16px 24px;
          border-bottom: 2px solid transparent;
          background-color: transparent;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-button.active {
          border-bottom-color: var(--color-blue);
          color: var(--color-blue);
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .bets-container {
          background-color: var(--bg-secondary);
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .bets-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .bets-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .bets-content {
          padding: 0;
        }

        .empty-state {
          padding: 48px 24px;
          text-align: center;
          color: var(--text-secondary);
        }

        .empty-state h3 {
          font-size: 16px;
          font-weight: 500;
          margin: 16px 0 8px 0;
          color: var(--text-primary);
        }

        .empty-state p {
          margin: 0 0 16px 0;
        }

        .browse-friends-btn {
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

        .browse-friends-btn:hover {
          background-color: var(--color-blue-dark);
        }

        .bets-list {
          display: flex;
          flex-direction: column;
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
          --color-blue: #4f46e5;
          --color-blue-dark: #4338ca;
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
          --color-blue: #6366f1;
          --color-blue-dark: #4f46e5;
        }
      `}</style>
    </div>
  )
}

function StatsCard({ title, value, icon, color }: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'red'
}) {
  return (
    <div className="stats-card">
      <div className="stats-content">
        <div className={`stats-icon ${color}`}>
          {icon}
        </div>
        <div className="stats-text">
          <p className="stats-label">{title}</p>
          <p className="stats-value">{value}</p>
        </div>
      </div>

      <style jsx>{`
        .stats-card {
          background-color: var(--bg-secondary);
          padding: 20px;
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
        }

        .stats-content {
         display: flex;
         align-items: center;
         gap: 12px;
       }

       .stats-icon {
         padding: 8px;
         border-radius: 8px;
       }

       .stats-icon.blue {
         background-color: var(--color-blue-light);
         color: var(--color-blue-dark);
       }

       .stats-icon.green {
         background-color: var(--color-green-light);
         color: var(--color-green-dark);
       }

       .stats-icon.yellow {
         background-color: var(--color-yellow-light);
         color: var(--color-yellow-dark);
       }

       .stats-icon.red {
         background-color: var(--color-red-light);
         color: var(--color-red-dark);
       }

       .stats-text {
         flex: 1;
       }

       .stats-label {
         font-size: 12px;
         color: var(--text-secondary);
         margin: 0 0 4px 0;
         text-transform: uppercase;
         letter-spacing: 0.05em;
       }

       .stats-value {
         font-size: 24px;
         font-weight: 700;
         color: var(--text-primary);
         margin: 0;
       }

       :global([data-theme="light"]) {
         --color-blue-light: #dbeafe;
         --color-blue-dark: #1d4ed8;
         --color-green-light: #d1fae5;
         --color-green-dark: #065f46;
         --color-yellow-light: #fef3c7;
         --color-yellow-dark: #92400e;
         --color-red-light: #fee2e2;
         --color-red-dark: #991b1b;
       }

       :global([data-theme="dark"]) {
         --color-blue-light: #312e81;
         --color-blue-dark: #93c5fd;
         --color-green-light: #064e3b;
         --color-green-dark: #6ee7b7;
         --color-yellow-light: #78350f;
         --color-yellow-dark: #fbbf24;
         --color-red-light: #7f1d1d;
         --color-red-dark: #fca5a5;
       }
     `}</style>
   </div>
 )
}

function BetCard({ bet, isLast, viewType }: { 
 bet: Bet, 
 isLast: boolean,
 viewType: 'placed' | 'received'
}) {
 const otherUser = viewType === 'placed' ? bet.target : bet.placer
 const isActive = bet.status === 'ACTIVE'
 const isWon = bet.result === 'WON'
 const isLost = bet.result === 'LOST'

 const getStatusColor = () => {
   if (isActive) return 'var(--color-yellow)'
   if (isWon) return 'var(--color-green)'
   if (isLost) return 'var(--color-red)'
   return 'var(--text-secondary)'
 }

 const getStatusIcon = () => {
   if (isActive) return <Clock size={16} />
   if (isWon) return <CheckCircle size={16} />
   if (isLost) return <XCircle size={16} />
   return null
 }

 const getPredictionText = () => {
   if (viewType === 'placed') {
     return bet.prediction ? 'Will complete' : 'Will miss'
   } else {
     return bet.prediction ? 'Predicted completion' : 'Predicted miss'
   }
 }

 return (
   <div className="bet-card">
     <div className="bet-content">
       {/* Left side - Bet details */}
       <div className="bet-details">
         <div className="bet-header">
           <h3 className="bet-title">{bet.schedule.exerciseType}</h3>
           <div className="bet-amount">{bet.amount} ฿</div>
         </div>
         
         <p className="bet-info">
           {viewType === 'placed' ? 'Bet on' : 'Bet by'} {otherUser?.name || 'Unknown User'} • {new Date(bet.schedule.date).toLocaleDateString()} • {bet.schedule.timeSlot}
         </p>
         
         <div className={`prediction-badge ${bet.prediction ? 'success' : 'danger'}`}>
           {getPredictionText()}
         </div>
       </div>

       {/* Right side - Status and actions */}
       <div className="bet-actions">
         <div className="status-badge" style={{ backgroundColor: `${getStatusColor()}20`, color: getStatusColor() }}>
           {getStatusIcon()}
           {isActive ? 'Active' : bet.result}
         </div>
         
         {otherUser && (
           <button
             className="profile-btn"
             onClick={() => window.open(`/profile/${otherUser.id}`, '_blank')}
           >
             <Calendar size={14} />
             View Profile
           </button>
         )}
       </div>
     </div>

     {/* Bottom details for resolved bets */}
     {!isActive && (
       <div className="bet-footer">
         Exercise {bet.schedule.completed ? 'completed' : 'missed'} • 
         Resolved on {bet.resolvedAt ? new Date(bet.resolvedAt).toLocaleDateString() : 'Unknown'}
       </div>
     )}

     <style jsx>{`
       .bet-card {
         padding: 20px 24px;
         border-bottom: ${isLast ? 'none' : '1px solid var(--border-light)'};
         transition: all 0.2s ease;
       }

       .bet-card:hover {
         background-color: var(--bg-hover-light);
       }

       .bet-content {
         display: flex;
         justify-content: space-between;
         align-items: flex-start;
       }

       .bet-details {
         flex: 1;
       }

       .bet-header {
         display: flex;
         align-items: center;
         gap: 8px;
         margin-bottom: 8px;
       }

       .bet-title {
         font-size: 16px;
         font-weight: 600;
         color: var(--text-primary);
         margin: 0;
       }

       .bet-amount {
         background-color: var(--bg-tertiary);
         color: var(--text-secondary);
         padding: 2px 8px;
         border-radius: 12px;
         font-size: 12px;
         font-weight: 500;
       }

       .bet-info {
         font-size: 14px;
         color: var(--text-secondary);
         margin: 0 0 8px 0;
       }

       .prediction-badge {
         padding: 4px 8px;
         border-radius: 12px;
         font-size: 12px;
         font-weight: 500;
         width: fit-content;
       }

       .prediction-badge.success {
         background-color: var(--color-green-light);
         color: var(--color-green-dark);
       }

       .prediction-badge.danger {
         background-color: var(--color-red-light);
         color: var(--color-red-dark);
       }

       .bet-actions {
         display: flex;
         align-items: center;
         gap: 12px;
       }

       .status-badge {
         display: flex;
         align-items: center;
         gap: 6px;
         padding: 6px 12px;
         border-radius: 20px;
         font-size: 12px;
         font-weight: 500;
       }

       .profile-btn {
         background-color: var(--bg-tertiary);
         color: var(--text-primary);
         padding: 6px 12px;
         border-radius: 6px;
         border: none;
         font-size: 12px;
         font-weight: 500;
         cursor: pointer;
         display: flex;
         align-items: center;
         gap: 4px;
         transition: background-color 0.2s ease;
       }

       .profile-btn:hover {
         background-color: var(--bg-hover);
       }

       .bet-footer {
         margin-top: 12px;
         padding-top: 12px;
         border-top: 1px solid var(--border-light);
         font-size: 12px;
         color: var(--text-secondary);
       }

       :global([data-theme="light"]) {
         --border-light: #f3f4f6;
         --bg-hover-light: #f9fafb;
         --color-green: #10b981;
         --color-red: #ef4444;
         --color-yellow: #f59e0b;
       }

       :global([data-theme="dark"]) {
         --border-light: #374151;
         --bg-hover-light: #1f2937;
         --color-green: #34d399;
         --color-red: #f87171;
         --color-yellow: #fbbf24;
       }
     `}</style>
   </div>
 )
}