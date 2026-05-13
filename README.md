# Como Casa 운영 대시보드

해운대·충무로 숙소 통합 관리 시스템

## 기술 스택
- **프레임워크**: Next.js 14 (App Router)
- **배포**: Vercel
- **DB**: Google Sheets API
- **스타일**: Tailwind CSS

---

## 로컬 셋업

```bash
npm install
cp .env.example .env.local
# .env.local 값 채우기 (아래 참고)
npm run dev
```

---

## 환경변수 설정

### 1. Google Service Account 생성
1. [Google Cloud Console](https://console.cloud.google.com) → 새 프로젝트
2. API & Services → Google Sheets API 활성화
3. IAM → 서비스 계정 생성 → JSON 키 다운로드
4. `.env.local`에 `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` 입력

### 2. Google Sheets 준비
각 지점별 스프레드시트를 만들고 서비스 계정 이메일에 편집 권한 부여

#### 예약데이터 시트 컬럼 (A~K)
| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| id | branch | room | platform | guestName | checkIn | checkOut | nights | managerId | memo | language |

#### 도어락마스터 시트 컬럼 (A~D)
| A | B | C | D |
|---|---|---|---|
| branch | room | password | updatedAt |

#### 청소스케줄 시트 컬럼 (A~H)
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| date | priority | room | doorPassword | status | checkoutGuest | checkinGuest | memo |

### 3. 매니저 계정 설정
`.env.local`의 `MANAGERS` 값을 JSON 배열로 입력:
```json
[
  {"id":"lee","name":"이영은","password":"비밀번호","color":"#6366f1"},
  {"id":"kim_s","name":"김샛별","password":"비밀번호","color":"#f59e0b"},
  {"id":"kim_j","name":"김지윤","password":"비밀번호","color":"#10b981"},
  {"id":"hwang","name":"황미려","password":"비밀번호","color":"#ef4444"}
]
```

---

## Vercel 배포

```bash
npm install -g vercel
vercel
```

Vercel 대시보드 → Settings → Environment Variables에 `.env.local` 내용 동일하게 입력

---

## 기능

### Phase 1 ✅
- 예약 캘린더 (해운대/충무로 탭, 드래그 입력)
- 청소 스케줄 자동 생성 (우선순위 정렬, 도어락 자동 조회)
- 웰컴 메시지 생성 (한/중/일, 비번 자동 삽입, 클립보드 복사)
- 매니저 로그인 (4명)

### Phase 2 ✅
- Google Sheets 연동 (예약 CRUD 실시간 저장)
- 도어락 마스터 시트 연동
- 청소 스케줄 시트 저장

### Phase 3 (추후)
- Gmail 파싱 반자동 예약 입력
- 모바일 최적화
- 정산 리포트
