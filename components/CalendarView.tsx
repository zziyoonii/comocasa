'use client'
import { useState, useEffect, useRef } from 'react'
import { Branch, Reservation, PLATFORMS, PLATFORM_COLORS, CHUNGMURO_ROOMS, HAUNDAE_ROOMS } from '@/lib/types'
import { format, getDaysInMonth, startOfMonth, addMonths, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props {
  branch: Branch
  managerId: string
  managerColor: string
}

export default function CalendarView({ branch, managerId, managerColor }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRes, setEditingRes] = useState<Reservation | null>(null)
  const [dragStart, setDragStart] = useState<{ room: string; day: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<number | null>(null)
  const [form, setForm] = useState({ platform: '에어비앤비', guestName: '', memo: '', language: 'ko' })

  const rooms = branch === 'chungmuro' ? CHUNGMURO_ROOMS : HAUNDAE_ROOMS
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const daysInMonth = getDaysInMonth(currentDate)

  useEffect(() => {
    fetchReservations()
  }, [branch, year, month])

  async function fetchReservations() {
    setLoading(true)
    const res = await fetch(`/api/reservations?branch=${branch}&year=${year}&month=${month}`)
    const data = await res.json()
    setReservations(data.reservations || [])
    setLoading(false)
  }

  function getReservationsForCell(room: string, day: number) {
    return reservations.filter(r => {
      const ci = new Date(r.checkIn)
      const co = new Date(r.checkOut)
      const cellDate = new Date(year, month - 1, day)
      return r.room === room && ci <= cellDate && co > cellDate
    })
  }

  function isCheckIn(r: Reservation, day: number) {
    return new Date(r.checkIn).getDate() === day &&
      new Date(r.checkIn).getMonth() + 1 === month
  }

  async function handleSave() {
    const checkIn = `${year}-${String(month).padStart(2, '0')}-${String(dragStart!.day).padStart(2, '0')}`
    const checkOut = `${year}-${String(month).padStart(2, '0')}-${String(dragEnd! + 1).padStart(2, '0')}`

    const payload = {
      branch,
      room: dragStart!.room,
      platform: form.platform,
      guestName: form.guestName,
      checkIn,
      checkOut,
      managerId,
      memo: form.memo,
      language: form.language,
    }

    if (editingRes) {
      await fetch(`/api/reservations/${editingRes.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload }),
      })
    } else {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setModalOpen(false)
    setEditingRes(null)
    setDragStart(null)
    setDragEnd(null)
    fetchReservations()
  }

  async function handleDelete(id: string) {
    if (!confirm('예약을 삭제하시겠습니까?')) return
    await fetch(`/api/reservations/${id}?branch=${branch}`, { method: 'DELETE' })
    setModalOpen(false)
    fetchReservations()
  }

  function openEdit(r: Reservation) {
    setEditingRes(r)
    setDragStart({ room: r.room, day: new Date(r.checkIn).getDate() })
    setDragEnd(new Date(r.checkOut).getDate() - 1)
    setForm({ platform: r.platform, guestName: r.guestName, memo: r.memo || '', language: 'ko' })
    setModalOpen(true)
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="px-3 py-1.5 rounded text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
            ←
          </button>
          <span className="text-base font-semibold">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="px-3 py-1.5 rounded text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
            →
          </button>
          <button onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
            오늘
          </button>
        </div>
        {loading && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>로딩 중...</span>}
      </div>

      {/* 캘린더 */}
      <div className="overflow-auto flex-1 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
        <div style={{ minWidth: `${80 + daysInMonth * 36}px` }}>
          {/* 날짜 헤더 */}
          <div className="flex sticky top-0 z-10" style={{ background: 'var(--color-surface)' }}>
            <div className="w-20 shrink-0 p-2 text-xs font-medium border-r border-b" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              객실
            </div>
            {days.map(d => {
              const date = new Date(year, month - 1, d)
              const dow = date.getDay()
              const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              return (
                <div key={d} className="w-9 shrink-0 text-center p-1 border-r border-b text-xs"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: isToday ? 'var(--color-accent)' : dow === 0 ? '#ef4444' : dow === 6 ? '#60a5fa' : 'var(--color-text-muted)',
                    fontWeight: isToday ? 700 : 400,
                  }}>
                  <div>{d}</div>
                  <div style={{ fontSize: '9px' }}>{'일월화수목금토'[dow]}</div>
                </div>
              )
            })}
          </div>

          {/* 객실 행 */}
          {rooms.map(room => (
            <div key={room} className="flex" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="w-20 shrink-0 flex items-center px-3 text-xs font-mono font-semibold border-r"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}>
                {room}
              </div>
              {days.map(d => {
                const cellRes = getReservationsForCell(room, d)
                const res = cellRes[0]
                const isStart = res && isCheckIn(res, d)
                const isDragging = dragStart?.room === room && dragStart.day <= d && (dragEnd || dragStart.day) >= d

                return (
                  <div key={d}
                    className="w-9 h-9 shrink-0 border-r relative cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: isDragging && !res ? 'rgba(91,142,240,0.2)' : 'var(--color-surface)',
                    }}
                    onMouseDown={() => {
                      if (!res) {
                        setDragStart({ room, day: d })
                        setDragEnd(d)
                      }
                    }}
                    onMouseEnter={() => {
                      if (dragStart?.room === room && !res) setDragEnd(d)
                    }}
                    onMouseUp={() => {
                      if (dragStart?.room === room && !res) {
                        setModalOpen(true)
                        setForm({ platform: '에어비앤비', guestName: '', memo: '', language: 'ko' })
                      }
                    }}
                    onClick={() => res && openEdit(res)}
                  >
                    {res && isStart && (
                      <div
                        className="absolute inset-y-1 rounded text-white flex items-center px-1 overflow-hidden"
                        style={{
                          left: 0,
                          right: `-${(new Date(res.checkOut).getDate() - d - 1) * 36}px`,
                          background: PLATFORM_COLORS[res.platform] || managerColor,
                          fontSize: '10px',
                          fontWeight: 600,
                          zIndex: 2,
                          maxWidth: `${(new Date(res.checkOut).getDate() - d) * 36 - 2}px`,
                        }}
                      >
                        {res.platform[0]} {res.nights}박 {res.guestName}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 예약 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className="w-96 rounded-xl p-6 space-y-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 className="font-semibold text-sm">
              {editingRes ? '예약 수정' : '예약 입력'} — {dragStart?.room}호
              {dragStart && dragEnd && ` (${dragStart.day}일 ~ ${dragEnd + 1}일)`}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>플랫폼</label>
                <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>예약자명</label>
                <input value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })}
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  placeholder="예약자 이름" />
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>게스트 언어</label>
                <div className="flex gap-2">
                  {[{ v: 'ko', l: '한국어' }, { v: 'zh', l: '중국어' }, { v: 'ja', l: '일본어' }].map(({ v, l }) => (
                    <button key={v} onClick={() => setForm({ ...form, language: v })}
                      className="flex-1 py-1.5 rounded text-xs font-medium transition-all"
                      style={{
                        background: form.language === v ? 'var(--color-accent)' : 'var(--color-surface-2)',
                        color: form.language === v ? 'white' : 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)',
                      }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>메모</label>
                <input value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })}
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  placeholder="특이사항" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {editingRes && (
                <button onClick={() => handleDelete(editingRes.id)}
                  className="px-4 py-2 rounded text-xs font-medium"
                  style={{ background: '#ef4444', color: 'white' }}>
                  삭제
                </button>
              )}
              <button onClick={() => { setModalOpen(false); setEditingRes(null) }}
                className="flex-1 py-2 rounded text-xs font-medium"
                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                취소
              </button>
              <button onClick={handleSave}
                className="flex-1 py-2 rounded text-xs font-semibold"
                style={{ background: 'var(--color-accent)', color: 'white' }}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
