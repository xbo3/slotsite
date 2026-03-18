# SlotSite - 프로젝트 설계서

> 이 문서는 AI 개발 에이전트(터미널오/크롬오사장)가 읽고 따르는 **프로젝트 규칙서**입니다.
> 코드 수정, 페이지 생성, API 추가 시 반드시 이 문서의 규칙을 따르세요.

---

## 1. 프로젝트 개요

- **프로젝트명**: SlotSite
- **목적**: 슬롯 전용 온라인 게이밍 사이트
- **기술 스택**: Next.js 14 (App Router) + Node.js (Express) + PostgreSQL
- **배포**: Frontend → Vercel / Backend → Railway
- **결제**: BiPays (USDT TRC20 + KRW 은행 입출금)
- **게임 콘텐츠**: 외부 어그리게이터 API 연동 (문서 별도)

---

## 2. 폴더 구조

```
slotsite/
├── CLAUDE.md              # 이 파일 (AI 규칙서)
├── frontend/              # Next.js 프론트엔드
│   ├── app/
│   │   ├── layout.tsx     # 공통 레이아웃 (헤더, 푸터, 사이드바)
│   │   ├── page.tsx       # 메인 페이지 (/)
│   │   ├── login/
│   │   │   └── page.tsx   # 로그인 (/login)
│   │   ├── register/
│   │   │   └── page.tsx   # 회원가입 (/register)
│   │   ├── lobby/
│   │   │   └── page.tsx   # 게임 로비 (/lobby)
│   │   ├── game/
│   │   │   └── [id]/
│   │   │       └── page.tsx  # 게임 실행 (/game/:id)
│   │   ├── wallet/
│   │   │   └── page.tsx   # 내 지갑 - 충전/환전 (/wallet)
│   │   ├── mypage/
│   │   │   └── page.tsx   # 마이페이지 (/mypage)
│   │   ├── support/
│   │   │   └── page.tsx   # 고객센터 (/support)
│   │   └── admin/
│   │       ├── layout.tsx # 관리자 레이아웃
│   │       ├── page.tsx   # 관리자 대시보드 (/admin)
│   │       ├── users/
│   │       │   └── page.tsx   # 회원관리 (/admin/users)
│   │       ├── finance/
│   │       │   └── page.tsx   # 입출금관리 (/admin/finance)
│   │       └── games/
│   │           └── page.tsx   # 게임관리 (/admin/games)
│   ├── components/
│   │   ├── ui/            # 공통 UI (Button, Input, Modal, Card 등)
│   │   ├── layout/        # Header, Footer, Sidebar, MobileNav
│   │   ├── game/          # GameCard, GameGrid, GameLauncher
│   │   └── wallet/        # DepositForm, WithdrawForm, TxHistory
│   ├── lib/
│   │   ├── api.ts         # 백엔드 API 호출 함수 모음
│   │   ├── auth.ts        # JWT 토큰 관리, 로그인 상태
│   │   └── utils.ts       # 공통 유틸 (포맷, 날짜 등)
│   ├── styles/
│   │   └── globals.css    # Tailwind CSS + 커스텀 변수
│   ├── public/
│   │   └── images/        # 로고, 배너 등 정적 이미지
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/               # Node.js 백엔드
│   ├── src/
│   │   ├── index.ts       # 서버 진입점 (Express app)
│   │   ├── routes/
│   │   │   ├── auth.ts    # POST /api/auth/login, /register, /logout
│   │   │   ├── user.ts    # GET/PUT /api/user/profile, /password
│   │   │   ├── wallet.ts  # GET /api/wallet/balance, POST /deposit, /withdraw
│   │   │   ├── game.ts    # GET /api/games, POST /api/game/launch, /callback
│   │   │   └── admin.ts   # /api/admin/* (관리자 전용)
│   │   ├── middleware/
│   │   │   ├── auth.ts    # JWT 검증 미들웨어
│   │   │   └── admin.ts   # 관리자 권한 체크
│   │   ├── services/
│   │   │   ├── bipays.ts      # BiPays API 연동
│   │   │   ├── aggregator.ts  # 어그리게이터 API 연동
│   │   │   └── telegram.ts    # 텔레그램 알림
│   │   ├── models/
│   │   │   ├── user.ts
│   │   │   ├── wallet.ts
│   │   │   ├── transaction.ts
│   │   │   └── game_log.ts
│   │   ├── config/
│   │   │   └── index.ts   # 환경변수, DB 설정
│   │   └── utils/
│   │       └── index.ts   # 공통 유틸
│   ├── prisma/
│   │   └── schema.prisma  # DB 스키마 (Prisma ORM)
│   ├── tsconfig.json
│   └── package.json
│
└── docs/
    ├── aggregator-api.md  # 어그리게이터 API 문서 (받으면 여기)
    └── bipays-api.md      # BiPays 연동 가이드
```

---

## 3. 데이터베이스 스키마 (PostgreSQL + Prisma)

```prisma
model User {
  id          Int       @id @default(autoincrement())
  username    String    @unique
  password    String    // bcrypt 해시
  nickname    String
  phone       String?
  role        Role      @default(USER)  // USER, ADMIN
  status      Status    @default(ACTIVE) // ACTIVE, BLOCKED, DORMANT
  balance     Decimal   @default(0)     // 보유 잔액 (KRW 기준)
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt
  last_login  DateTime?

  transactions Transaction[]
  game_logs    GameLog[]
}

model Transaction {
  id          Int       @id @default(autoincrement())
  user_id     Int
  type        TxType    // DEPOSIT, WITHDRAW, BET, WIN, BONUS
  amount      Decimal
  balance_after Decimal // 트랜잭션 후 잔액
  method      String?   // USDT, BANK, GAME
  status      TxStatus  @default(PENDING) // PENDING, COMPLETED, FAILED, CANCELLED
  reference   String?   // 외부 참조 ID (BiPays tx_id, 게임 round_id 등)
  memo        String?
  created_at  DateTime  @default(now())

  user User @relation(fields: [user_id], references: [id])
}

model GameLog {
  id          Int       @id @default(autoincrement())
  user_id     Int
  game_id     String    // 어그리게이터 게임 ID
  game_name   String
  provider    String    // pragmatic, pgsoft, evolution 등
  round_id    String    // 게임 라운드 ID
  bet_amount  Decimal
  win_amount  Decimal
  created_at  DateTime  @default(now())

  user User @relation(fields: [user_id], references: [id])
}

enum Role {
  USER
  ADMIN
}

enum Status {
  ACTIVE
  BLOCKED
  DORMANT
}

enum TxType {
  DEPOSIT
  WITHDRAW
  BET
  WIN
  BONUS
}

enum TxStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## 4. API 엔드포인트 규칙

### 4.1 공통 규칙
- Base URL: `/api`
- 인증: Bearer JWT 토큰 (Authorization 헤더)
- 응답 형식: `{ success: boolean, data?: any, error?: string }`
- 에러 코드: 400 (입력오류), 401 (미인증), 403 (권한없음), 404 (없음), 500 (서버오류)

### 4.2 인증 API
| Method | Path | 설명 |
|--------|------|------|
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/login | 로그인 → JWT 발급 |
| POST | /api/auth/logout | 로그아웃 |
| GET | /api/auth/me | 내 정보 조회 |

### 4.3 지갑 API
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/wallet/balance | 잔액 조회 |
| POST | /api/wallet/deposit | 충전 요청 (BiPays 연동) |
| POST | /api/wallet/withdraw | 환전 요청 |
| GET | /api/wallet/history | 입출금 내역 |

### 4.4 게임 API
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/games | 게임 목록 (어그리게이터) |
| POST | /api/game/launch | 게임 실행 URL 요청 |
| POST | /api/game/callback | 배팅 콜백 (어그리게이터 → 우리서버) |

### 4.5 관리자 API
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/admin/dashboard | 대시보드 통계 |
| GET | /api/admin/users | 회원 목록 |
| PUT | /api/admin/users/:id | 회원 정보 수정 |
| GET | /api/admin/transactions | 전체 입출금 내역 |
| GET | /api/admin/game-logs | 배팅 기록 |

---

## 5. 프론트엔드 디자인 규칙

### 5.1 색상 팔레트
```css
:root {
  --primary: #6C5CE7;       /* 메인 보라색 */
  --primary-dark: #5A4BD1;  /* 호버 */
  --accent: #FFC312;        /* 골드 강조 (잭팟, CTA) */
  --bg-dark: #0F0F1A;       /* 배경 (어두운 남색) */
  --bg-card: #1A1A2E;       /* 카드 배경 */
  --bg-input: #16213E;      /* 입력필드 배경 */
  --text-primary: #FFFFFF;
  --text-secondary: #A0A0B0;
  --success: #00D68F;
  --danger: #FF4757;
  --warning: #FFA502;
}
```

### 5.2 스타일 원칙
- **다크 테마 기본** (슬롯 사이트 표준)
- Tailwind CSS 사용
- 모바일 퍼스트 반응형 (모바일 유저가 80% 이상)
- 게임 카드: 둥근 모서리(12px), 호버 시 살짝 확대(scale 1.03)
- 폰트: Pretendard (한글) + Inter (영문)
- 최소 터치 영역: 44x44px (모바일)

### 5.3 컴포넌트 네이밍
- 파일명: PascalCase (GameCard.tsx, DepositForm.tsx)
- CSS 클래스: Tailwind 유틸리티 사용, 커스텀 클래스 최소화
- 상태관리: React useState/useContext (작은 규모), 필요시 Zustand

---

## 6. BiPays 결제 연동

### 6.1 충전 (Deposit) 플로우
1. 유저가 충전 금액 입력
2. 프론트 → 백엔드 POST /api/wallet/deposit
3. 백엔드 → BiPays API로 결제 주소/계좌 요청
4. BiPays가 USDT 주소 또는 입금 계좌번호 반환
5. 유저가 송금
6. BiPays → 백엔드 콜백 (입금 확인)
7. 백엔드에서 유저 잔액 증가

### 6.2 환전 (Withdraw) 플로우
1. 유저가 환전 금액 + 수신 정보 입력
2. 프론트 → 백엔드 POST /api/wallet/withdraw
3. 백엔드 검증 (잔액 체크, 최소금액 등)
4. 백엔드 → BiPays API로 출금 요청
5. BiPays 처리 후 콜백
6. 백엔드에서 유저 잔액 차감

### 6.3 BiPays 연동 설정
```env
BIPAYS_API_URL=https://bcgame.my
BIPAYS_API_KEY=발급받은_키
BIPAYS_SECRET=발급받은_시크릿
BIPAYS_CALLBACK_URL=https://슬롯사이트도메인/api/bipays/callback
```

---

## 7. 어그리게이터 연동 (TODO)

> ⚠️ API 문서 수령 후 작성 예정

### 7.1 기본 구조 (일반적인 어그리게이터 패턴)
```
[유저] → 게임실행 클릭
       → [백엔드] POST /api/game/launch {game_id, user_id}
       → [어그리게이터] 게임 URL 반환
       → [프론트] iframe 또는 새창으로 게임 로딩

[게임 중 배팅]
  → [어그리게이터] → [백엔드] POST /api/game/callback {bet/win}
  → [백엔드] 유저 잔액 차감/증가 + GameLog 기록
```

### 7.2 연동 시 필요한 정보 (업체에 요청할 것)
- API Base URL
- 인증 방식 (API Key? OAuth?)
- 게임 목록 조회 엔드포인트
- 게임 실행 URL 생성 엔드포인트
- 배팅 콜백 명세 (bet, win, refund 등)
- 테스트 환경 (Staging URL, 테스트 계정)

---

## 8. 보안 규칙

- 비밀번호: bcrypt 해시 (salt rounds: 12)
- JWT: RS256 또는 HS256, 만료 24시간, Refresh Token 7일
- API Rate Limit: 로그인 5회/분, 일반 API 60회/분
- CORS: 프론트엔드 도메인만 허용
- SQL Injection: Prisma ORM 사용 (파라미터 바인딩 자동)
- XSS: Next.js 기본 이스케이프 + DOMPurify
- 환전 시 관리자 승인 옵션 (설정 가능)

---

## 9. 배포 규칙

### Frontend (Vercel)
- GitHub 레포 연결 → main 브랜치 push 시 자동 배포
- 환경변수: NEXT_PUBLIC_API_URL 설정

### Backend (Railway)
- GitHub 레포 연결 → main 브랜치 push 시 자동 배포
- 환경변수: DATABASE_URL, JWT_SECRET, BIPAYS_* 설정
- PostgreSQL: Railway 플러그인으로 생성

---

## 10. 개발 순서 (체크리스트)

### Phase 1: 뼈대 (1-2일)
- [ ] 프로젝트 초기화 (Next.js + Express + Prisma)
- [ ] 폴더 구조 생성
- [ ] DB 스키마 마이그레이션
- [ ] 공통 레이아웃 (헤더, 푸터, 사이드바)
- [ ] 로그인/회원가입 페이지 + API

### Phase 2: 핵심 기능 (3-5일)
- [ ] 게임 로비 페이지 (목업 데이터)
- [ ] 지갑 페이지 (잔액, 입출금)
- [ ] BiPays 결제 연동
- [ ] 마이페이지

### Phase 3: 게임 연동 (API 문서 수령 후)
- [ ] 어그리게이터 API 연동
- [ ] 게임 실행 (iframe/팝업)
- [ ] 배팅 콜백 처리
- [ ] 게임 기록 페이지

### Phase 4: 관리자 (2-3일)
- [ ] 관리자 대시보드
- [ ] 회원관리
- [ ] 입출금 관리
- [ ] 배팅 기록 조회

### Phase 5: 마무리 (1-2일)
- [ ] 고객센터 페이지
- [ ] 텔레그램 알림 연동
- [ ] SEO 메타태그 최적화
- [ ] 모바일 테스트
- [ ] 배포 + 도메인 연결

---

## 11. AI 작업 규칙 (크롬오사장 + 터미널오)

### 공통
- 코드 수정 전 반드시 이 문서(CLAUDE.md) 확인
- 새 파일 생성 시 폴더 구조(섹션 2) 준수
- API 추가 시 엔드포인트 규칙(섹션 4) 준수
- 커밋 메시지: `[영역] 설명` 형식 (예: `[auth] 로그인 API 구현`, `[wallet] BiPays 연동`)

### 크롬오사장 (Chrome Claude)
- 설계, 코드 작성, git push 담당
- 작업 후 통합작업일지.md 업데이트
- push 전 우팀장 승인 필수

### 터미널오 (Claude Code)
- 로컬 파일 수정, 서버 실행, 테스트 담당
- CLAUDE.md 읽고 규칙 따르기
- 자율 모드 시에도 DB 마이그레이션은 확인 후 실행

---

## 12. 환경변수 템플릿

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SITE_NAME=SlotSite
```

### backend/.env
```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/slotsite
JWT_SECRET=랜덤시크릿키
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
BIPAYS_API_URL=https://bcgame.my
BIPAYS_API_KEY=
BIPAYS_SECRET=
BIPAYS_CALLBACK_URL=http://localhost:3000/api/bipays/callback
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
AGGREGATOR_API_URL=
AGGREGATOR_API_KEY=
```
