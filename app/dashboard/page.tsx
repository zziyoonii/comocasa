'use client'
import { useState, useEffect } from 'react'
import { Branch } from '@/lib/types'
import CalendarView from '@/components/CalendarView'
import CleaningView from '@/components/CleaningView'
import WelcomeView from '@/components/WelcomeView'

type Tab = 'calendar' | 'cleaning' | 'welcome'

export default function DashboardPage() {
  const [branch, setBranch] = useState<Branch>('chungmuro')
  const [tab, setTab] = useState<Tab>('calendar')
  const [manager, setManager] = useState<{ id: string; name: string; color: string } | null>(null)

  useEffect(() => {
    const stored = document.cookie.split(';').find(c => c.trim().startsWith('manager='))
    if (!stored) { window.location.href = '/' ; return }
    try {
      const val = decodeURIComponent(stored.split('=')[1])
      setManager(JSON.parse(val))
    } catch { window.location.href = '/' }
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const branchLabel = { haundae: '해운대', chungmuro: '충무로' }
  const tabLabel: Record<Tab, string> = { calendar: '예약 캘린더', cleaning: '청소 스케줄', welcome: '웰컴 메시지' }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="flex items-center gap-6">
          <span className="text-base font-bold tracking-tight">Como Casa</span>

          {/* 지점 탭 */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--color-bg)' }}>
            {(['chungmuro', 'haundae'] as Branch[]).map(b => (
              <button
                key={b}
                onClick={() => setBranch(b)}
                className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all"
                style={{
                  background: branch === b ? (b === 'haundae' ? 'var(--color-haundae)' : 'var(--color-chungmuro)') : 'transparent',
                  color: branch === b ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {branchLabel[b]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 기능 탭 */}
          <nav className="flex gap-1">
            {(['calendar', 'cleaning', 'welcome'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{
                  background: tab === t ? 'var(--color-surface-2)' : 'transparent',
                  color: tab === t ? 'var(--color-text)' : 'var(--color-text-muted)',
                }}
              >
                {tabLabel[t]}
              </button>
            ))}
          </nav>

          {/* 매니저 */}
          {manager && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold text-white"
                style={{ background: manager.color }}>
                {manager.name[0]}
              </div>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{manager.name}</span>
              <button onClick={handleLogout} className="text-xs px-2 py-1 rounded"
                style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-2)' }}>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 메인 */}
      <main className="flex-1 overflow-hidden p-6">
        {tab === 'calendar' && <CalendarView branch={branch} managerId={manager?.id || ''} managerColor={manager?.color || '#888'} />}
        {tab === 'cleaning' && <CleaningView branch={branch} />}
        {tab === 'welcome' && <WelcomeView branch={branch} />}
      </main>
    </div>
  )
}
