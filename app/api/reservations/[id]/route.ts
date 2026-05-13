import { NextRequest, NextResponse } from 'next/server'
import { getGoogleSheetsClient, SHEET_IDS, SHEET_NAMES } from '@/lib/sheets'
import { Branch } from '@/lib/types'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { branch } = body

  try {
    const sheets = getGoogleSheetsClient()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_IDS[branch as Branch],
      range: `${SHEET_NAMES.reservations}!A:A`,
    })

    const rows = res.data.values || []
    const rowIndex = rows.findIndex(r => r[0] === params.id)
    if (rowIndex === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { room, platform, guestName, checkIn, checkOut, managerId, memo, language } = body
    const nights = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    const updatedRow = [params.id, branch, room, platform, guestName, checkIn, checkOut, nights, managerId, memo || '', language || 'ko']

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_IDS[branch as Branch],
      range: `${SHEET_NAMES.reservations}!A${rowIndex + 1}:K${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [updatedRow] },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const branch = searchParams.get('branch') as Branch

  try {
    const sheets = getGoogleSheetsClient()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_IDS[branch],
      range: `${SHEET_NAMES.reservations}!A:A`,
    })

    const rows = res.data.values || []
    const rowIndex = rows.findIndex(r => r[0] === params.id)
    if (rowIndex === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // 해당 행을 빈 값으로 지우기 (실제 삭제는 batchUpdate 필요)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SHEET_IDS[branch],
      range: `${SHEET_NAMES.reservations}!A${rowIndex + 1}:K${rowIndex + 1}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
