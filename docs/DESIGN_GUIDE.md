# SlotSite Design Guide - Luxury Black

## Design Philosophy (5 Principles)

1. **Black Texture** - 단일 #000000 금지. #0A0A0A ~ #222222 사이의 미세한 그라디언트로 깊이감 표현. matte-black, glossy-black, pearl-black 3가지 질감 활용.

2. **White Typography** - 본문은 #FFFFFF (font-weight 300~400). 강조는 font-weight 500~600까지만. 700 이상 절대 금지. Poppins + Pretendard 조합.

3. **Gold Restraint** - 골드(#C9A94E, #D4AF37)는 CTA, 활성 탭, 주요 강조에만 사용. 과도한 사용 금지. 한 화면에 골드 요소 3개 이내 권장.

4. **No Excessive Effects** - 네온/형광 glow 전면 금지. box-shadow는 rgba(201,169,78,0.15) 수준으로 절제. 애니메이션은 0.2~0.3s ease, 과한 bounce/spring 금지.

5. **Mobile First** - 모든 컴포넌트는 모바일(360px)부터 설계. 최소 터치 영역 44x44px. safe-area 대응 필수.

---

## Color Palette

### Backgrounds
| Token | Value | Usage |
|-------|-------|-------|
| --bg-primary | #0A0A0A | 페이지 배경 |
| --bg-secondary | #111111 | 카드, 패널 |
| --bg-tertiary | #1A1A1A | 입력 필드 |
| --bg-elevated | #222222 | 떠있는 요소 |
| --bg-surface | #161616 | 헤더, 사이드바, 푸터 |

### Accents
| Token | Value | Usage |
|-------|-------|-------|
| --accent-primary | #C9A94E | CTA, 활성 탭, 주요 강조 |
| --accent-gold | #D4AF37 | 골드 뱃지, 프로그레스 |
| --accent-secondary | #FFFFFF | 보조 강조 (화이트) |

### Text
| Token | Value | Usage |
|-------|-------|-------|
| --text-primary | #FFFFFF | 주요 텍스트 |
| --text-secondary | #888888 | 보조 텍스트 |
| --text-muted | #555555 | 비활성, 힌트 |
| --text-accent | #C9A94E | 강조 텍스트 |

### Status
| Token | Value |
|-------|-------|
| --success | #4CAF50 |
| --danger | #E53935 |
| --warning | #FFB300 |
| --info | #42A5F5 |

### Borders
| Token | Value |
|-------|-------|
| --border-default | rgba(255,255,255,0.06) |
| --border-hover | rgba(255,255,255,0.12) |
| --border-gold | rgba(201,169,78,0.3) |

---

## Font Rules

- **Font Stack**: Poppins (영문), Pretendard Variable (한글), sans-serif
- **Weight 200**: 장식적 숫자 (잔액 표시)
- **Weight 300**: 본문, 설명 (기본값)
- **Weight 400**: 레이블, 부제목
- **Weight 500**: CTA 버튼, 강조 텍스트
- **Weight 600**: 최대 허용 (페이지 타이틀 등). 700 이상 사용 금지.
- **Letter-spacing**: 본문 0.01em, CTA 버튼 0.05em

---

## Card Styles

### matte-black
```css
background: #0A0A0A;
```
단색 배경. 가장 가벼운 카드.

### glossy-black
```css
background: linear-gradient(135deg, #111111 0%, #1A1A1A 50%, #111111 100%);
```
미세한 광택감. 일반 콘텐츠 카드에 사용.

### pearl-black
```css
background: linear-gradient(135deg, #111111 0%, #1C1C1C 30%, #141414 70%, #111111 100%);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(255,255,255,0.01);
```
프리미엄 카드. VIP, 그레이드 혜택 등 특별 영역.

---

## Button Styles

### btn-cta (Primary)
- 기본: 투명 배경 + 골드 보더 + 골드 텍스트
- 호버: 골드 배경 + 다크 텍스트
- border-radius: 10px
- letter-spacing: 0.05em

### btn-outline (Secondary)
- 기본: rgba(255,255,255,0.05) 배경 + 화이트 텍스트
- 호버: 보더 밝아짐
- 텍스트 색상 변경 없음 (화이트 유지)

---

## Tab Styles

### Sidebar (Desktop)
- 활성: 좌측 골드 바 (3px) + 골드 텍스트 + 골드 배경 10%
- 비활성: #888888 텍스트

### Mobile Bottom Nav
- 활성: 골드 아이콘 + 상단 골드 닷
- 비활성: #555555 아이콘

---

## Responsive Rules

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | 단일 컬럼, 하단 네비게이션, 풀와이드 카드 |
| Tablet | 768px ~ 1024px | 2열 그리드, 사이드바 숨김 |
| Desktop | > 1024px | 사이드바 표시, 4~5열 게임 그리드 |

- 게임 카드: 모바일 2열, 태블릿 3열, 데스크톱 4~5열
- 보너스 카드: 모바일 풀와이드, 데스크톱 2열
- 패딩: 모바일 px-4, 데스크톱 max-w-7xl mx-auto

---

## Forbidden

- font-weight: 700 이상
- 형광색 (#00E701, #00D4AA, #00FF00 등)
- 네온 glow (box-shadow에 높은 opacity 형광색)
- 하드코딩된 색상 (CSS 변수 또는 tailwind 토큰 사용)
- 불필요한 이모지 아이콘 (데이터 표시용 제외)
