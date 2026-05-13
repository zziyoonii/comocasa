'use client'
import { useState } from 'react'
import { Branch, CleaningTask } from '@/lib/types'
import { format } from 'date-fns'

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: '당일 교체', color: '#ef4444' },
  2: { label: '체크아웃', color: '#f59e0b' },
  3: { label: '체크인 준비', color: '#10b981' },
  4: { label: '연박 중', color: '#6366f1' },
}

const STATUS_COLORS: Record<string, string> = {
  '대기': '#7c8299',
  '진행중': '#f59e0b',
  '완료': '#10b981',
}

interface Props { branch: Branch }

export default function CleaningView({ branch }: Props) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [tasks, setTasks] = useState<CleaningTask[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function fetchSchedule() {
    setLoading(true)
    setSaved(false)
    const res = await fetch(`/api/cleaning?branch=${branch}&date=${date}`)
    const data = await res.json()
    setTasks(data.tasks || [])
    setLoading(false)
  }

  async function saveSchedule() {
    const res = await fetch('/api/cleaning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch, date, tasks }),
    })
    if (res.ok) setSaved(true)
  }

  function updateStatus(room: string, status: CleaningTask['status']) {
    setTasks(prev => prev.map(t => t.room === room ? { ...t, status } : t))
  }

  const branchLabel = branch === 'haundae' ? '해운대' : '충무로'

  return (
    <div className="max-w-3xl">
      {/* 날짜 선택 */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="px-3 py-2 rounded text-sm"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        />
        <button onClick={fetchSchedule} disabled={loading}
          className="px-4 py-2 rounded text-xs font-semibold"
          style={{ background: 'var(--color-accent)', color: 'white', opacity: loading ? 0.7 : 1 }}>
          {loading ? '생성 중...' : '스케줄 생성'}
        </button>
        {tasks.length > 0 && (
          <button onClick={saveSchedule}
            className="px-4 py-2 rounded text-xs font-semibold"
            style={{ background: saved ? '#10b981' : 'var(--color-surface-2)', color: saved ? 'white' : 'var(--color-text-muted)' }}>
            {saved ? '✓ 저장됨' : '구글 시트 저장'}
          </button>
        )}
      </div>

      {/* 태스크 목록 */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {branchLabel} · {date} · 총 {tasks.length}개 객실
          </div>

          {tasks.map(task => {
            const priorityInfo = PRIORITY_LABELS[task.priority]
            return (
              <div key={task.room} className="flex items-center gap-4 px-4 py-3 rounded-lg"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                {/* 우선순위 */}
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: priorityInfo.color }} />

                {/* 호수 */}
                <div className="w-12 font-mono font-bold text-sm shrink-0">{task.room}</div>

                {/* 우선순위 라벨 */}
                <div className="w-24 text-xs shrink-0" style={{ color: priorityInfo.color }}>{priorityInfo.label}</div>

                {/* 도어락 */}
                <div className="w-24 font-mono text-sm font-semibold shrink-0" style={{ color: 'var(--color-accent)' }}>
                  🔐 {task.doorPassword}
                </div>

                {/* 손님 정보 */}
                <div className="flex-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {task.checkoutGuest && <div>↑ {task.checkoutGuest}</div>}
                  {task.checkinGuest && <div>↓ {task.checkinGuest}</div>}
                  {task.memo && <div className="text-yellow-400">⚠ {task.memo}</div>}
                </div>

                {/* 상태 버튼 */}
                <div className="flex gap-1 shrink-0">
                  {(['대기', '진행중', '완료'] as CleaningTask['status'][]).map(s => (
                    <button key={s} onClick={() => updateStatus(task.room, s)}
                      className="px-2 py-1 rounded text-xs transition-all"
                      style={{
                        background: task.status === s ? STATUS_COLORS[s] : 'var(--color-surface-2)',
                        color: task.status === s ? 'white' : 'var(--color-text-muted)',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tasks.length === 0 && !loading && (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          날짜를 선택하고 스케줄 생성 버튼을 누르세요
        </div>
      )}
    </div>
  )
}
