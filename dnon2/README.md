# 동네ON - 실제 내 위치 기반 카카오 주변시설 추천 버전

## 핵심 변경점

이 버전은 더 이상 예시 좌표의 시설을 추천하지 않습니다.

사용자가 `내 주변 추천` 또는 `내 위치` 버튼을 누르면:

1. 브라우저 Geolocation API로 현재 위치를 가져옵니다.
2. Kakao Maps `services.Places`로 현재 위치 주변의 실제 장소를 검색합니다.
3. 최대 반경 3km 안의 결과를 거리순으로 가져옵니다.
4. 결과를 홈 `가까운 시설`, 주변시설 목록, 카카오맵 마커에 출력합니다.
5. 시설을 누르면 실제 카카오 장소 데이터를 기반으로 상세 화면이 열립니다.

---

## 1. API 키 입력 위치

`index.html` 상단 `<head>`에 있습니다.

```html
<script
  type="text/javascript"
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_JAVASCRIPT_KEY&libraries=services&autoload=false"
></script>
```

`YOUR_KAKAO_JAVASCRIPT_KEY`를 본인의 **JavaScript 키**로 교체하세요.

중요: 이번 버전에서는 실제 장소 검색을 위해 반드시

```text
&libraries=services
```

가 포함되어 있어야 합니다.

---

## 2. 카카오 디벨로퍼스 설정

카카오 디벨로퍼스의 Web 플랫폼 사이트 도메인에 배포 주소를 등록하세요.

GitHub Pages 예:

```text
https://hgj0729.github.io
```

현재 프로젝트 주소:

```text
https://hgj0729.github.io/project/dnon/index.html
```

---

## 3. 지원하는 실제 주변시설

카카오 카테고리 검색:
- 약국
- 병원
- 편의점
- 주차장
- 카페

내 위치 기반 키워드 검색:
- 공공화장실
- 세탁소
- ATM

---

## 4. 검색 범위

`js/main.js` 상단:

```javascript
const SEARCH_RADIUS = 3000;
```

현재는 내 위치 기준 **반경 3km**입니다.

예를 들어 5km로 바꾸려면:

```javascript
const SEARCH_RADIUS = 5000;
```

---

## 5. 이미지

카카오 Places 검색 결과에는 시설 대표 이미지가 포함되지 않기 때문에
각 카테고리 기본 이미지를 아래 경로로 사용합니다.

```text
./images/pharmacy01.jpg
./images/hospital01.jpg
./images/store01.jpg
./images/parking01.jpg
./images/toilet01.jpg
./images/laundry01.jpg
./images/cafe01.jpg
./images/atm01.jpg
```

이미지가 없어도 App 기능은 실행되고 대체 이미지가 표시됩니다.

---

## 6. GitHub Pages에서 테스트하는 방법

1. 수정 파일을 GitHub의 `project/dnon/` 폴더에 업로드합니다.
2. 카카오 JavaScript 키가 index.html에 들어있는지 확인합니다.
3. 카카오 디벨로퍼스 Web 플랫폼에 `https://hgj0729.github.io`가 등록되어 있는지 확인합니다.
4. HTTPS 주소로 접속합니다.
5. `내 주변 추천` 버튼을 누릅니다.
6. 브라우저에서 위치 사용 권한을 허용합니다.
7. 실제 현재 위치 주변 시설이 거리순으로 표시됩니다.

---

## 7. 주요 파일

```text
index.html
css/style.css
js/main.js
images/
README.md
```
