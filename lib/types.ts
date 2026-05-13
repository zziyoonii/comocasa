export type Branch = 'haundae' | 'chungmuro'

export interface Reservation {
  id: string
  branch: Branch
  room: string
  platform: string
  guestName: string
  checkIn: string  // YYYY-MM-DD
  checkOut: string // YYYY-MM-DD
  nights: number
  managerId: string
  memo?: string
  language?: 'ko' | 'zh' | 'ja'
}

export interface DoorlockEntry {
  branch: Branch
  room: string
  password: string
  updatedAt: string
}

export interface CleaningTask {
  branch: Branch
  room: string
  priority: 1 | 2 | 3 | 4
  status: '대기' | '진행중' | '완료'
  doorPassword: string
  checkoutGuest?: string  // "플랫폼+박수+예약자명"
  checkinGuest?: string
  memo?: string
}

export interface Manager {
  id: string
  name: string
  color: string
}

export const PLATFORMS = ['에어비앤비', '야놀자', '여기어때', '부킹닷컴', '트립닷컴', '아고다'] as const
export type Platform = typeof PLATFORMS[number]

export const PLATFORM_COLORS: Record<string, string> = {
  '에어비앤비': '#FF5A5F',
  '야놀자': '#FF2D55',
  '여기어때': '#FF6B2C',
  '부킹닷컴': '#003580',
  '트립닷컴': '#00A1E4',
  '아고다': '#5B2D8E',
}

// 충무로 객실 목록
export const CHUNGMURO_ROOMS = [
  '306', '307', '308',
  '405', '408', '409',
  '604',
  '718',
  '801', '803', '808', '813', '818', '821',
  '903', '904',
  '1007',
  '1112', '1210', '1214', '1216',
  '1303', '1319',
  '1405', '1413', '1415', '1419',
  '1515',
  '1710', '1715',
]

// 해운대 객실 목록
export const HAUNDAE_ROOMS = [
  '602', '606', '607',
  '703',
  '808', '813', '818',
  '1007', '1110', '1113',
  '1503',
  '1803',
  '2802', '2803',
  '3405', '3501',
]
