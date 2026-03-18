# 보너스/쿠폰 시스템 설계서 (CLAUDE.md 섹션 13)

---

## 13. 보너스/쿠폰 시스템

### 13.1 핵심 개념

```
[보너스 템플릿] → 관리자가 만드는 "쿠폰 종류" (15% 카지노 보너스 등)
[유저 보너스]   → 유저가 쿠폰을 "사용(활성화)"한 상태
[보너스 지갑]   → 보너스 잔액 (실잔액과 완전 분리)
```

잔액은 2개로 분리:
- balance = 실잔액 (입금한 돈, 매출에 잡힘)
- bonus_balance = 보너스 잔액 (매출에 안 잡힘)

게임 배팅 시: bonus_balance 먼저 소진 → balance 소진
게임 승리 시: 활성 보너스가 있으면 → bonus_balance로 적립
웨이저 달성 시: bonus_balance → balance로 전환 (최대전환금액 제한)

### 13.2 DB 스키마 추가

```prisma
// 보너스 템플릿 (관리자가 생성하는 쿠폰 종류)
model BonusTemplate {
  id              Int       @id @default(autoincrement())
  name            String
  description     String?
  status          BonusTemplateStatus @default(ACTIVE)

  // 입금 조건
  deposit_type    DepositType  @default(ALL)    // ALL, CRYPTO, BANK
  min_deposit     Decimal      @default(0)
  max_deposit     Decimal      @default(0)      // 0=무제한

  // 보너스 지급
  bonus_percent   Decimal                       // 15 = 15%
  max_bonus       Decimal      @default(0)      // 0=무제한

  // 웨이저(롤링) 조건
  wager_multiplier Decimal                      // 7 = 700%
  wager_base      WagerBase    @default(DEPOSIT_PLUS_BONUS)

  // 전환 제한
  max_conversion  Decimal      @default(0)      // 0=무제한

  // 사용 가능 게임
  allowed_games   GameCategory[]

  // 시간 제한
  validity_days   Int          @default(7)
  daily_limit     Int          @default(0)      // 0=무제한
  total_limit     Int          @default(0)

  priority        Int          @default(0)
  created_at      DateTime     @default(now())
  updated_at      DateTime     @updatedAt

  user_bonuses    UserBonus[]
}

// 유저 보너스 (활성화된 보너스)
model UserBonus {
  id              Int       @id @default(autoincrement())
  user_id         Int
  template_id     Int
  status          UserBonusStatus @default(ACTIVE)

  deposit_amount  Decimal
  bonus_amount    Decimal
  current_bonus   Decimal

  wager_required  Decimal
  wager_completed Decimal   @default(0)
  wager_percent   Decimal   @default(0)

  converted_amount Decimal  @default(0)
  max_conversion   Decimal

  activated_at    DateTime  @default(now())
  expires_at      DateTime
  completed_at    DateTime?
  cancelled_at    DateTime?

  user            User         @relation(fields: [user_id], references: [id])
  template        BonusTemplate @relation(fields: [template_id], references: [id])
  wager_logs      WagerLog[]

  @@index([user_id, status])
  @@index([expires_at])
}

// 웨이저 로그
model WagerLog {
  id              Int       @id @default(autoincrement())
  user_bonus_id   Int
  game_id         String
  game_category   GameCategory
  bet_amount      Decimal
  wager_counted   Decimal
  win_amount      Decimal
  created_at      DateTime  @default(now())

  user_bonus      UserBonus @relation(fields: [user_bonus_id], references: [id])
  @@index([user_bonus_id])
}

// 보너스 트랜잭션
model BonusTransaction {
  id              Int       @id @default(autoincrement())
  user_id         Int
  user_bonus_id   Int?
  type            BonusTxType
  amount          Decimal
  balance_after   Decimal
  memo            String?
  created_at      DateTime  @default(now())

  user            User      @relation(fields: [user_id], references: [id])
  @@index([user_id])
  @@index([user_bonus_id])
}

enum BonusTemplateStatus { ACTIVE INACTIVE ARCHIVED }
enum UserBonusStatus { ACTIVE COMPLETED CONVERTED EXPIRED CANCELLED }
enum DepositType { ALL CRYPTO BANK }
enum WagerBase { DEPOSIT_ONLY BONUS_ONLY DEPOSIT_PLUS_BONUS }
enum GameCategory { SLOT LIVE_CASINO SPORTS MINI_GAME ALL }
enum BonusTxType { GRANT BET WIN CONVERT EXPIRE CANCEL }
```

### 13.3 User 모델 수정

balance (실잔액, 매출O) + bonus_balance (보너스잔액, 매출X)

### 13.4 충돌 방지 규칙

1. 동시 활성 보너스 1개만 허용
2. 배팅 전 반드시 게임 카테고리 체크 (allowed_games)
3. 입금 타입 체크 (CRYPTO/BANK/ALL)
4. 웨이저 이중 카운트 방지 (WagerLog로 추적)
5. 만료 후 배팅 차단 (expires_at 체크)
6. 전환 후 재사용 불가 (CONVERTED → 추가배팅 불가)
7. 취소 시 잔액 처리 (bonus_balance = 0)

### 13.5 매출 회계 분리

매출 = 입금 총액 - 출금 총액 (보너스 무관)
보너스 비용 = 전환된 보너스 총액 (실제 돈 나간 것)
보너스 비율 = 지급 총액 / 입금 총액 × 100

### 13.6 보너스 API

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/bonus/templates | 보너스 목록 |
| POST | /api/bonus/activate | 보너스 활성화 |
| GET | /api/bonus/active | 내 활성 보너스 |
| POST | /api/bonus/convert | 전환 |
| GET | /api/bonus/history | 이력 |
| GET | /api/admin/bonus/stats | 통계 |
| POST | /api/admin/bonus/templates | 생성 |
| PUT | /api/admin/bonus/templates/:id | 수정 |
| POST | /api/admin/bonus/cancel/:id | 강제 취소 |
