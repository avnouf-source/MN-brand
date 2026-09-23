'use client'
import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    try {
      const mode = localStorage.getItem('mn_theme_mode')
      if (mode === 'dark') {
        setIsDark(true)
        document.documentElement.classList.add('dark')
      } else {
        setIsDark(false)
        document.documentElement.classList.remove('dark')
      }
    } catch {}
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      try { localStorage.setItem('mn_theme_mode', 'dark') } catch {}
    } else {
      document.documentElement.classList.remove('dark')
      try { localStorage.setItem('mn_theme_mode', 'light') } catch {}
    }
  }

  return (
    <button
      onClick={toggle}
      type="button"
      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition text-slate-500 active:scale-95"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun size={15} className="text-amber-400" />
      ) : (
        <Moon size={15} className="text-slate-600" />
      )}
    </button>
  )
}
