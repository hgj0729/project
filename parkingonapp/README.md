# 파킹온(Parking ON)

공공데이터포털의 **전국주차장정보표준데이터 Open API**를 활용하는 모바일 웹 App입니다.

## 구현 화면
1. 홈
2. 주차장 검색/필터
3. 검색 결과 목록
4. 주차장 상세
5. 즐겨찾기

## 과제 요구 기능
- JavaScript `fetch()` 공공데이터 API 호출
- 서버 응답 `console.log()` 확인
- 배열/객체 데이터 관리
- 필요한 데이터만 가공하여 출력
- 카드 목록 반복 출력
- 주차장명/주소 검색
- 지역/유형/요금 필터
- 상세보기
- 검색 결과 없음 메시지
- API/네트워크 오류 처리
- localStorage 즐겨찾기
- 메뉴/버튼을 통한 화면 이동

## 사용 공공데이터
- 데이터명: 전국주차장정보표준데이터
- 제공: 공공데이터포털
- 요청주소: https://api.data.go.kr/openapi/tn_pubr_prkplce_info_api
- 주요 파라미터: serviceKey, pageNo, numOfRows, type=json

## API 키 적용 방법
1. 공공데이터포털에서 `전국주차장정보표준데이터`를 검색합니다.
2. Open API 활용신청 후 인증키를 발급받습니다.
3. `config.js`를 열어 아래 부분을 수정합니다.

```js
window.PARKING_API_KEY = "YOUR_API_KEY";
```

위 `YOUR_API_KEY`를 실제 발급받은 키로 교체합니다.

API 키가 없는 상태에서도 제출물의 UI와 검색/필터/상세/즐겨찾기 기능을 확인할 수 있도록 데모 데이터가 자동으로 표시됩니다.

## 실행 방법
브라우저에서 `index.html`을 열어도 데모 기능은 실행됩니다.

실제 API 호출은 브라우저의 보안 정책 및 실행 환경에 따라 로컬 `file://`보다 웹 서버에서 실행하는 것을 권장합니다.

VS Code Live Server 예:
1. 프로젝트 폴더를 VS Code로 엽니다.
2. `index.html`을 Live Server로 실행합니다.
3. F12 → Console에서 다음 로그를 확인합니다.
   - API 요청
   - 서버 원본 응답
   - 화면용 가공 배열
   - 검색/필터 결과
   - 선택한 상세 데이터

## 파일
- `index.html` : 5개 화면 UI
- `style.css` : 모바일 UI 스타일
- `config.js` : API 키
- `app.js` : API/검색/필터/상세/즐겨찾기/화면이동


## Encoding 인증키 처리 방식

현재 버전은 공공데이터포털 화면에 표시되는 일반 인증키(Encoding)를
그대로 사용할 수 있도록 수정되어 있습니다.

인증키 안에 `%2F`, `%3D` 등이 포함되어 있을 경우 `URLSearchParams`나
`encodeURIComponent()`로 서비스키를 다시 인코딩하면 `%`가 `%25`로 변환되어
인증 오류가 발생할 수 있습니다.

따라서 현재 `app.js`에서는 다음 형태로 요청합니다.

```js
const requestUrl =
  `${API_URL}?serviceKey=${API_KEY}` +
  `&pageNo=1` +
  `&numOfRows=500` +
  `&type=json`;
```

개발자도구(F12) Console에서 다음 항목을 확인할 수 있습니다.

- API 요청 URL(키는 마스킹)
- 서버 원본 데이터
- 화면에 사용할 가공 데이터 배열
- 검색/필터 결과
- 상세 데이터

실제 키는 공개 저장소(GitHub 등)에 올리지 않는 것을 권장합니다.
