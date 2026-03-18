# SlotSite 디자인 가이드 (Stake.com + BC.Game 스타일)

> 터미널오가 프론트엔드 작업 시 반드시 참고할 디자인 규칙

---

## 1. 전체 레이아웃 (3단 구조)

```
┌─────────────────────────────────────────────────┐
│  HEADER: 로고 | 검색바 | [잔액 ₩0] [프로필]     │
├────────┬────────────────────────────────────────┤
│        │                                         │
│ SIDE   │   MAIN CONTENT                         │
│ BAR    │   - 배너 슬라이더                        │
│        │   - 게임 카테고리 탭                     │
│ 카지노  │   - 게임 그리드 (4-5열)                 │
│ 슬롯    │                                         │
│ 라이브   │                                         │
│ 스포츠   │                                         │
│ 보너스   │                                         │
│        │                                         │
├────────┴────────────────────────────────────────┤
│  MOBILE BOTTOM NAV: 홈 | 게임 | 보너스 | 지갑 | 메뉴 │
└─────────────────────────────────────────────────┘
```

### 사이드바 규칙
- 데스크톱: 왼쪽 고정, 너비 240px, 접으면 아이콘만 (60px)
- 모바일: 숨김 → 햄버거 메뉴로 슬라이드 인
- 구성: 게임 카테고리 (슬롯, 라이브, 테이블, 미니게임) + 프로바이더 목록 + 보너스/이벤트 링크
- 아이콘 + 텍스트 조합, 활성 항목에 포인트 색상 배경

### 헤더 규칙
- 높이: 60px, 배경 #1A1D29 (메인 배경보다 살짝 밝게)
- 왼쪽: 로고
- 가운데: 검색바 (아이콘 + input, 둥근 모서리)
- 오른쪽: 잔액 표시 (클릭 시 지갑), 알림 아이콘, 프로필 아바타
- 로그아웃 상태: [로그인] [회원가입] 버튼

### 모바일 하단 네비
- 높이: 60px, 배경 #1A1D29
- 5개 탭: 홈, 게임(로비), 보너스, 지갑, 더보기
- 활성 탭: 포인트 색상 아이콘 + 도트 표시
- safe area 고려 (아이폰 하단 여백)

---

## 2. 색상 팔레트 (Stake + BC.Game 하이브리드)

```css
:root {
  /* 배경 계열 - Stake 스타일 어두운 청록/남색 */
  --bg-primary: #0F1923;      /* 메인 배경 (가장 어두움) */
  --bg-secondary: #1A2C38;    /* 사이드바, 카드 배경 */
  --bg-tertiary: #213743;     /* 입력 필드, 호버 배경 */
  --bg-elevated: #2F4553;     /* 모달, 드롭다운 배경 */
  
  /* 포인트 컬러 - BC.Game 스타일 */
  --accent-primary: #00E701;  /* 네온 그린 (CTA 버튼, 승리) */
  --accent-gold: #FFD700;     /* 골드 (잭팟, VIP, 보너스) */
  --accent-blue: #1475E1;     /* 블루 (링크, 정보) */
  --accent-purple: #8B5CF6;   /* 퍼플 (특별 이벤트) */
  
  /* 텍스트 */
  --text-primary: #FFFFFF;
  --text-secondary: #B1BAD3;  /* Stake 스타일 회색 */
  --text-muted: #557086;      /* 아주 연한 텍스트 */
  
  /* 상태 */
  --success: #00E701;
  --danger: #F0443C;
  --warning: #FFB800;
  --info: #1475E1;
  
  /* 보더 */
  --border-default: rgba(255,255,255,0.05);
  --border-hover: rgba(255,255,255,0.1);
}
```

---

## 3. 게임 카드 디자인

### 카드 구조
```
┌─────────────────┐
│                  │  ← 썸네일 (aspect-ratio 3:4 or 4:3)
│    GAME IMAGE    │     호버 시 scale(1.05) + 오버레이
│                  │
│  [HOT] [x5000]  │  ← 좌상단: 배지, 우상단: 최대배수
│                  │
│  ▶ 지금 플레이   │  ← 호버 시 나타나는 CTA
│                  │
├─────────────────┤
│ Game Name        │  ← 게임명 (white, 14px, bold)
│ Provider   96.5% │  ← 프로바이더 + RTP (muted)
└─────────────────┘
```

### 카드 CSS 규칙
- border-radius: 12px
- background: var(--bg-secondary)
- border: 1px solid var(--border-default)
- 호버: border-color var(--accent-primary)/30, shadow 0 8px 32px rgba(0,231,1,0.1)
- 호버 시 썸네일 scale(1.05), transition 0.3s ease
- 호버 시 오버레이: 반투명 검정 + "지금 플레이 ▶" 버튼
- 카드 내부 패딩: 이미지는 패딩 없이 꽉 채움, 텍스트 영역만 p-3

### 그리드
- 모바일 2열 (gap: 8px)
- 태블릿 3열 (gap: 12px)  
- 데스크톱 4열 (gap: 16px)
- 와이드 5열 (gap: 16px)

---

## 4. 배너 슬라이더

### 메인 페이지 상단
- 높이: 200px (모바일) / 280px (데스크톱)
- 자동 슬라이드 (5초 간격)
- 좌우 화살표 + 하단 도트 인디케이터
- 배너 내용: 보너스 프로모션, 신규 게임, 이벤트
- 배경: 그라디언트 + 게임 이미지 조합
- border-radius: 16px

---

## 5. 게임 카테고리 탭

### 로비 페이지 상단
```
[🔥 인기] [⭐ 신규] [🎰 슬롯] [🎲 라이브] [🏆 잭팟] [🎯 미니게임]
```
- 가로 스크롤 (모바일)
- 활성 탭: bg var(--accent-primary), text black, font-bold
- 비활성: bg transparent, text var(--text-secondary), border-bottom 2px
- 아이콘 + 텍스트 조합
- 탭 전환 시 게임 그리드 필터링 (애니메이션)

---

## 6. 프로바이더 필터

### 사이드바 또는 로비 하단
- 프로바이더 로고 가로 스크롤
- 클릭 시 해당 프로바이더 게임만 필터
- 활성: border-color var(--accent-primary), opacity 1
- 비활성: opacity 0.5, grayscale

---

## 7. 지갑 페이지

### 충전/환전 UI (Stake 스타일)
```
┌────────────────────────────────────┐
│  [충전]  [환전]  ← 탭 전환          │
├────────────────────────────────────┤
│                                     │
│  코인 선택:                         │
│  [USDT ✓] [LTC] [SOL] [BTC]       │
│                                     │
│  금액 입력:                         │
│  ┌─────────────────────────┐       │
│  │ 0.00 USDT               │       │
│  └─────────────────────────┘       │
│  [10] [50] [100] [500] [MAX]       │
│                                     │
│  입금 주소:                         │
│  ┌─────────────────────────┐       │
│  │ TKcBQGRA44HC... [복사]   │       │
│  └─────────────────────────┘       │
│  [QR 코드 보기]                     │
│                                     │
│  최소 입금: 5 USDT                  │
│  예상 도착: ~3분                    │
│                                     │
│  [충전 요청하기]  ← 네온 그린 버튼   │
│                                     │
└────────────────────────────────────┘
```

---

## 8. 버튼 스타일

### Primary (CTA)
- background: var(--accent-primary) (#00E701)
- color: #000000 (검정 텍스트)
- border-radius: 8px
- font-weight: 700
- 호버: brightness(1.1), shadow
- 예: "지금 플레이", "충전하기", "회원가입"

### Secondary
- background: transparent
- border: 1px solid var(--accent-primary)
- color: var(--accent-primary)
- 호버: bg var(--accent-primary)/10

### Ghost
- background: var(--bg-tertiary)
- color: var(--text-primary)
- 호버: bg var(--bg-elevated)
- 예: 필터 버튼, 정렬 버튼

### Danger
- background: var(--danger)
- color: white
- 예: 취소, 삭제

---

## 9. 타이포그래피

- 폰트: Inter (영문) + Pretendard (한글)
- h1: 28px bold (페이지 타이틀)
- h2: 22px bold (섹션 타이틀)  
- h3: 18px semibold (카드 타이틀)
- body: 14px regular
- caption: 12px regular (var(--text-secondary))
- small: 11px (배지, 태그)

---

## 10. 애니메이션

- 페이지 전환: fade 0.2s
- 카드 호버: transform 0.3s ease
- 모달: slide-up 0.3s ease-out
- 사이드바 토글: width 0.2s ease
- 로딩: skeleton pulse (bg-tertiary → bg-elevated)
- 승리 알림: shake + glow 효과

---

## 11. 반응형 브레이크포인트

- sm: 640px (모바일 가로)
- md: 768px (태블릿)
- lg: 1024px (작은 데스크톱)
- xl: 1280px (데스크톱)
- 2xl: 1536px (와이드)

---

## 12. 핵심 원칙

1. **콘텐츠가 왕**: 게임 이미지가 제일 크게, 텍스트는 최소화
2. **어둡고 깊게**: 배경은 깊은 남색/청록, 절대 순수 검정(#000) 사용 금지
3. **네온 포인트**: CTA와 승리/보너스에만 밝은 색상 사용
4. **그라디언트 절제**: 배너에만 사용, 카드/버튼은 플랫
5. **모바일 우선**: 모든 UI를 모바일에서 먼저 확인
6. **빠른 로딩**: 이미지 lazy load, skeleton UI 필수
