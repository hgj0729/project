# STREAM TMDB 프로젝트

HTML, CSS, JavaScript만 사용한 반응형 OTT 스타일 웹 프로젝트입니다.

## 실행 방법

1. `js/main.js` 파일을 엽니다.
2. 아래 코드를 찾습니다.

```javascript
const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
```

3. `YOUR_TMDB_API_KEY`를 본인의 TMDB API Key로 변경합니다.
4. `index.html`을 브라우저에서 실행합니다.

## 폴더 구조

- `index.html`
- `css/style.css`
- `js/main.js`
- `images/profile.jpg`
- `images/main-banner.jpg`
- `images/no-image.jpg`

## 참고

이미지 3개는 빈 자리 안내용 파일이므로 실제 프로젝트 이미지로 교체해 주세요.
TMDB 데이터가 정상 호출되면 영화/시리즈 이미지는 TMDB 서버에서 자동으로 불러옵니다.


## 추가된 TMDB 장르 카테고리

- 액션 영화: `/discover/movie?with_genres=28`
- 코미디 영화: `/discover/movie?with_genres=35`
- Horror 공포 영화: `/discover/movie?with_genres=27`
- 로맨스 영화: `/discover/movie?with_genres=10749`
- 다큐멘터리 영화: `/discover/movie?with_genres=99`

각 카테고리는 기존 콘텐츠 슬라이드 UI를 그대로 사용하며 TMDB의 인기순(`popularity.desc`)으로 불러옵니다.
