import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsClient, SHEET_IDS, SHEET_NAMES } from '@/lib/sheets'
import { Reservation, Branch } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const branch = searchParams.get('branch') as Branch
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  if (!branch || !SHEET_IDS[branch]) {
    return NextResponse.json({ error: 'Invalid branch' }, { status: 400 })
  }

  try {
    const sheets = getGoogleSheetsClient()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_IDS[branch],
      range: `${SHEET_NAMES.reservations}!A2:J`,
    })

    const rows = res.data.values || []
    let reservations: Reservation[] = rows.map(row => ({
      id: row[0],
      branch: row[1] as Branch,
      room: row[2],
      platform: row[3],
      guestName: row[4],
      checkIn: row[5],
      checkOut: row[6],
      nights: parseInt(row[7]) || 0,
      managerId: row[8],
      memo: row[9] || '',
    }))

    // 월 필터링
    if (year && month) {
      reservations = reservations.filter(r => {
        const ci = new Date(r.checkIn)
        const co = new Date(r.checkOut)
        const targetMonth = new Date(parseInt(year), parseInt(month) - 1, 1)
        const targetEnd = new Date(parseInt(year), parseInt(month), 0)
        return ci <= targetEnd && co >= targetMonth
      })
    }

    return NextResponse.json({ reservations })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { branch, room, platform, guestName, checkIn, checkOut, managerId, memo, language } = body

  if (!branch || !room || !platform || !guestName || !checkIn || !checkOut) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const nights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
  const id = uuidv4()

  const newRow = [id, branch, room, platform, guestName, checkIn, checkOut, nights, managerId, memo || '', language || 'ko']

  try {
    const sheets = getGoogleSheetsClient()
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_IDS[branch],
      range: `${SHEET_NAMES.reservations}!A:K`,
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    })

    return NextResponse.json({ id, success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save reservation' }, { status: 500 })
  }
}
