# Hero Video Setup Guide

## 비디오 배경 설정 방법

히어로 섹션에 사용할 크루즈 비디오를 추가하세요.

### 1. 비디오 파일 추가

다음 파일을 이 디렉토리에 추가하세요:
- `cruise-hero.mp4` - 메인 비디오 (권장)
- `cruise-hero.webm` - WebM 포맷 (옵션, 브라우저 호환성)

### 2. 비디오 권장 사양

**해상도:**
- 최소: 1920x1080 (Full HD)
- 권장: 3840x2160 (4K)

**파일 크기:**
- 최대: 5MB (성능 최적화)
- 권장: 2-3MB

**길이:**
- 10-30초 (루프 재생)

**포맷:**
- MP4 (H.264 코덱) - 필수
- WebM (VP9 코덱) - 옵션

### 3. 비디오 최적화 팁

#### FFmpeg를 사용한 압축:

```bash
# MP4 압축 (고품질, 작은 용량)
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -vf scale=1920:1080 -c:a aac -b:a 128k cruise-hero.mp4

# WebM 변환
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -vf scale=1920:1080 cruise-hero.webm
```

### 4. 추천 비디오 소스

**무료 스톡 비디오:**
- Pexels: https://www.pexels.com/search/videos/cruise/
- Pixabay: https://pixabay.com/videos/search/cruise%20ship/
- Unsplash (Moovie): https://unsplash.com/

**키워드:**
- cruise ship ocean
- luxury cruise sailing
- cruise ship sunset
- mediterranean cruise

### 5. 현재 상태

현재 비디오가 없는 경우 **자동으로 포스터 이미지**로 대체됩니다.

포스터 이미지:
- URL: `https://images.unsplash.com/photo-1567899378494-47b22a2ae96a`
- 출처: Unsplash

### 6. 성능 최적화

비디오를 추가한 후 다음을 확인하세요:

✅ Core Web Vitals:
- LCP (Largest Contentful Paint) < 2.5s
- CLS (Cumulative Layout Shift) < 0.1
- FID (First Input Delay) < 100ms

✅ 모바일 대역폭:
- 모바일에서는 포스터 이미지만 표시 (비디오 비활성화)
- `prefers-reduced-motion` 설정 존중

### 7. 라이선스 주의사항

⚠️ 상업적 사용 가능한 비디오인지 확인하세요.
⚠️ 크레딧이 필요한 경우 footer에 추가하세요.

---

**업데이트:** 2025-11-03
