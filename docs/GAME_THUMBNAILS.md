# 게임 썸네일 CDN 가이드

## CDN 주소 (전체 공통)
```
https://fan-cdn.nolimitcity.com/
```

## 이미지 사이즈
| 사이즈 | Prefix | 해상도 |
|--------|--------|--------|
| 원본 | (없음) | 512x512 |
| Small | `small_` | 256x256 |
| XSmall | `xsmall_` | 128x128 |

## 스튜디오별 파일명 패턴

### Nolimit City
```
Website_Icon_{게임명}_{해시}.jpg
```

### NetEnt
```
{게임명}_playin_ne_logo_thumbnail_512x512_{해시}.png
```

### Red Tiger
```
{게임명}_playin_rt_logo_thumbnail_512x512_{해시}.png
```

### Big Time Gaming
```
BTG_{게임명}_Icon_{해시}.png
```

### Sneaky Slots
```
Website_Icon_{게임명}_{해시}.png
```

## 사용법
- 원본(512px): `https://fan-cdn.nolimitcity.com/{파일명}`
- 작은 버전: `https://fan-cdn.nolimitcity.com/small_{파일명}`
- 아주 작은: `https://fan-cdn.nolimitcity.com/xsmall_{파일명}`
