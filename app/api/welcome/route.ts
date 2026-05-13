import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsClient, SHEET_IDS, SHEET_NAMES } from '@/lib/sheets'
import { Branch, Reservation } from '@/lib/types'
import { WELCOME_TEMPLATES, BRANCH_NAMES, Language } from '@/lib/templates'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const branch = searchParams.get('branch') as Branch
  const date = searchParams.get('date')

  if (!branch || !date) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  try {
    const sheets = getGoogleSheetsClient()

    const resRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_IDS[branch],
      range: `${SHEET_NAMES.reservations}!A2:K`,
    })

    const doorRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_IDS[branch],
      range: `${SHEET_NAMES.doorlock}!A2:D`,
    })

    const reservations: Reservation[] = (resRes.data.values || []).map(row => ({
      id: row[0], branch: row[1] as Branch, room: row[2],
      platform: row[3], guestName: row[4], checkIn: row[5],
      checkOut: row[6], nights: parseInt(row[7]) || 0,
      managerId: row[8], memo: row[9] || '',
      language: (row[10] || 'ko') as 'ko' | 'zh' | 'ja',
    }))

    const doorlockMap: Record<string, string> = {}
    ;(doorRes.data.values || []).forEach(row => {
      doorlockMap[row[1]] = row[2]
    })

    const todayCheckins = reservations.filter(r => r.checkIn === date)

    const checkins = todayCheckins.map(r => ({
      room: r.room,
      guestName: r.guestName,
      platform: r.platform,
      nights: r.nights,
      language: r.language || 'ko',
      doorPassword: doorlockMap[r.room] || '-',
    }))

    return NextResponse.json({ checkins })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch checkins' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { branch, room, password, language } = await req.json()
  const branchName = BRANCH_NAMES[branch] || branch
  const template = WELCOME_TEMPLATES[language as Language]

  if (!template) return NextResponse.json({ error: 'Invalid language' }, { status: 400 })

  const message = template(room, password, branchName)
  return NextResponse.json({ message })
}
