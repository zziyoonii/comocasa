import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Como Casa — 운영 대시보드',
  description: '해운대·충무로 숙소 통합 관리 시스템',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
