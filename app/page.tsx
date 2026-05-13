'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = await res.json()
      setError(data.error || '로그인 실패')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-10">
          <div className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>
            Como Casa
          </div>
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            운영 관리 시스템
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
              아이디
            </label>
            <input
              type="text"
              value={id}
              onChange={e => setId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
              placeholder="아이디 입력"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
              placeholder="비밀번호 입력"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: 'var(--color-accent)',
              color: 'white',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
