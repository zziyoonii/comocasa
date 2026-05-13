import { google } from 'googleapis'

export function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

export const SHEET_IDS = {
  haundae: process.env.SHEET_ID_HAUNDAE!,
  chungmuro: process.env.SHEET_ID_CHUNGMURO!,
}

export const SHEET_NAMES = {
  reservations: '예약데이터',
  doorlock: '도어락마스터',
  cleaning: '청소스케줄',
}
