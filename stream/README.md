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


## 영상 미리보기 실행 주의사항

YouTube 영상 미리보기는 브라우저에서 `index.html`을 직접 더블클릭한 `file://` 환경에서는
YouTube 오류 153이 발생할 수 있습니다. VS Code Live Server, localhost 서버 또는 GitHub Pages처럼
`http://` 또는 `https://` 주소에서 실행하면 자동 재생되도록 구성되어 있습니다.


## 최종 기능 추가

- 사이트 접속 및 새로고침 시 YouTube Trailer/Teaser가 존재하는 인기 콘텐츠 중 하나를 랜덤 메인 배너로 선택합니다.
- 선택된 콘텐츠의 YouTube 미리보기는 음소거 상태로 자동 재생됩니다.
- TMDB 서버 응답 데이터는 브라우저 개발자 도구의 Console에 출력됩니다.
- 콘텐츠 카드에 마우스를 올리면 TMDB `overview` 줄거리가 이미지 위에 표시됩니다.
- 콘텐츠 카드를 클릭하면 기존 상세정보 모달이 열립니다.
- YouTube 자동재생은 `file://`가 아니라 Live Server/localhost/GitHub Pages 등의 http(s) 환경에서 확인해야 합니다.
