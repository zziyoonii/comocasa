'use client'
import { useState, useEffect } from 'react'
import { Branch } from '@/lib/types'
import { format } from 'date-fns'

interface CheckinGuest {
  room: string
  guestName: string
  platform: string
  nights: number
  language: string
  doorPassword: string
}

interface Props { branch: Branch }

export default function WelcomeView({ branch }: Props) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [checkins, setCheckins] = useState<CheckinGuest[]>([])
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  async function fetchCheckins() {
    setLoading(true)
    const res = await fetch(`/api/welcome?branch=${branch}&date=${date}`)
    const data = await res.json()
    setCheckins(data.checkins || [])
    setMessages({})
    setLoading(false)
  }

  async function generateMessage(guest: CheckinGuest, lang: string) {
    const res = await fetch('/api/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch, room: guest.room, password: guest.doorPassword, language: lang }),
    })
    const data = await res.json()
    setMessages(prev => ({ ...prev, [guest.room]: data.message }))
  }

  async function copyMessage(room: string) {
    await navigator.clipboard.writeText(messages[room])
    setCopied(room)
    setTimeout(() => setCopied(null), 2000)
  }

  const langLabel: Record<string, string> = { ko: '🇰🇷 한국어', zh: '🇨🇳 중국어', ja: '🇯🇵 일본어' }

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
        <button onClick={fetchCheckins} disabled={loading}
          className="px-4 py-2 rounded text-xs font-semibold"
          style={{ background: 'var(--color-accent)', color: 'white', opacity: loading ? 0.7 : 1 }}>
          {loading ? '조회 중...' : '체크인 목록 조회'}
        </button>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          ⏰ 오후 3시 발송 기준
        </span>
      </div>

      {/* 체크인 목록 */}
      {checkins.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            오늘 체크인 {checkins.length}건
          </div>

          {checkins.map(guest => (
            <div key={guest.room} className="rounded-lg overflow-hidden"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              {/* 게스트 정보 */}
              <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm">{guest.room}호</span>
                  <span className="text-sm">{guest.guestName}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                    {guest.platform} {guest.nights}박
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                    🔐 {guest.doorPassword}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {langLabel[guest.language] || '🇰🇷 한국어'}
                  </span>
                </div>
              </div>

              {/* 언어 선택 + 메시지 생성 */}
              <div className="px-4 py-3">
                <div className="flex gap-2 mb-3">
                  {['ko', 'zh', 'ja'].map(lang => (
                    <button key={lang} onClick={() => generateMessage(guest, lang)}
                      className="px-3 py-1.5 rounded text-xs font-medium transition-all"
                      style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                      {langLabel[lang]}
                    </button>
                  ))}
                </div>

                {messages[guest.room] && (
                  <div className="relative">
                    <pre className="text-xs p-3 rounded whitespace-pre-wrap leading-relaxed"
                      style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', fontFamily: 'inherit' }}>
                      {messages[guest.room]}
                    </pre>
                    <button
                      onClick={() => copyMessage(guest.room)}
                      className="absolute top-2 right-2 px-3 py-1.5 rounded text-xs font-semibold transition-all"
                      style={{
                        background: copied === guest.room ? '#10b981' : 'var(--color-accent)',
                        color: 'white',
                      }}>
                      {copied === guest.room ? '✓ 복사됨' : '복사'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {checkins.length === 0 && !loading && (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          날짜를 선택하고 체크인 목록을 조회하세요
        </div>
      )}
    </div>
  )
}
