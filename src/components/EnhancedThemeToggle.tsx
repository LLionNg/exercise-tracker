'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function EnhancedThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    // Prevent flash by checking for saved theme immediately
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark)
    
    setIsDark(shouldBeDark)
    setMounted(true)
    
    // Apply theme to document immediately
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light')
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light'
        setIsDark(e.matches)
        document.documentElement.setAttribute('data-theme', newTheme)
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  const toggleTheme = () => {
    if (isAnimating) return // Prevent rapid clicking
    
    setIsAnimating(true)
    const newTheme = isDark ? 'light' : 'dark'
    
    // Add a subtle animation delay
    setTimeout(() => {
      setIsDark(!isDark)
      localStorage.setItem('theme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
      
      setTimeout(() => setIsAnimating(false), 150)
    }, 50)
    
    // Haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  // Prevent hydration issues
  if (!mounted) {
    return (
      <div style={{ width: '40px', height: '40px' }} />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      disabled={isAnimating}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div style={{ position: 'relative', width: '20px', height: '20px' }}>
        {/* Sun Icon */}
        <Sun 
          size={20} 
          className={`theme-icon ${!isDark ? 'active' : 'exiting'}`}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            color: !isDark ? '#f59e0b' : '#6b7280'
          }}
        />
        
        {/* Moon Icon */}
        <Moon 
          size={20} 
          className={`theme-icon ${isDark ? 'active' : 'entering'}`}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            color: isDark ? '#60a5fa' : '#6b7280'
          }}
        />
      </div>
    </button>
  )
}