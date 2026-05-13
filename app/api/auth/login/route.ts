import { NextRequest, NextResponse } from 'next/server'
import { verifyLogin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { id, password } = await req.json()
  const manager = verifyLogin(id, password)

  if (!manager) {
    return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  const response = NextResponse.json({ manager })
  response.cookies.set('manager', JSON.stringify(manager), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7일
  })
  return response
}
