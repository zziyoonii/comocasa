import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsClient, SHEET_IDS, SHEET_NAMES } from '@/lib/sheets'
import { Branch, CleaningTask, Reservation } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const branch = searchParams.get('branch') as Branch
  const date = searchParams.get('date') // YYYY-MM-DD

  if (!branch || !date) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  try {
    const sheets = getGoogleSheetsClient()

    // 예약 데이터 조회
    const resRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_IDS[branch],
      range: `${SHEET_NAMES.reservations}!A2:K`,
    })

    // 도어락 마스터 조회
    const doorRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_IDS[branch],
      range: `${SHEET_NAMES.doorlock}!A2:D`,
    })

    const reservations: Reservation[] = (resRes.data.values || []).map(row => ({
      id: row[0], branch: row[1] as Branch, room: row[2],
      platform: row[3], guestName: row[4], checkIn: row[5],
      checkOut: row[6], nights: parseInt(row[7]) || 0,
      managerId: row[8], memo: row[9] || '',
    }))

    const doorlockMap: Record<string, string> = {}
    ;(doorRes.data.values || []).forEach(row => {
      doorlockMap[row[1]] = row[2] // room -> password
    })

    // 청소 스케줄 생성
    const tasks = generateCleaningTasks(date, reservations, doorlockMap, branch)

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to generate cleaning schedule' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { branch, date, tasks } = await req.json()

  try {
    const sheets = getGoogleSheetsClient()
    const rows = tasks.map((t: CleaningTask) => [
      date, t.priority, t.room, t.doorPassword,
      t.status, t.checkoutGuest || '', t.checkinGuest || '', t.memo || ''
    ])

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_IDS[branch as Branch],
      range: `${SHEET_NAMES.cleaning}!A:H`,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to save cleaning schedule' }, { status: 500 })
  }
}

function generateCleaningTasks(
  date: string,
  reservations: Reservation[],
  doorlockMap: Record<string, string>,
  branch: Branch
): CleaningTask[] {
  const checkouts = reservations.filter(r => r.checkOut === date)
  const checkins = reservations.filter(r => r.checkIn === date)

  const checkoutRooms = new Set(checkouts.map(r => r.room))
  const checkinRooms = new Set(checkins.map(r => r.room))

  const allRooms = new Set([...checkoutRooms, ...checkinRooms])
  const tasks: CleaningTask[] = []

  allRooms.forEach(room => {
    const hasCheckout = checkoutRooms.has(room)
    const hasCheckin = checkinRooms.has(room)
    const checkoutRes = checkouts.find(r => r.room === room)
    const checkinRes = checkins.find(r => r.room === room)

    let priority: 1 | 2 | 3 | 4
    if (hasCheckout && hasCheckin) priority = 1
    else if (hasCheckout) priority = 2
    else if (hasCheckin) priority = 3
    else priority = 4

    tasks.push({
      branch,
      room,
      priority,
      status: '대기',
      doorPassword: doorlockMap[room] || '-',
      checkoutGuest: checkoutRes
        ? `${checkoutRes.platform} ${checkoutRes.nights}박 ${checkoutRes.guestName}`
        : undefined,
      checkinGuest: checkinRes
        ? `${checkinRes.platform} ${checkinRes.nights}박 ${checkinRes.guestName}`
        : undefined,
      memo: checkinRes?.memo || checkoutRes?.memo || '',
    })
  })

  return tasks.sort((a, b) => a.priority - b.priority)
}
