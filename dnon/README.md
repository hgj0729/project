# 동네ON - 카카오맵 연동 버전

## 1. 카카오맵 API 키 입력 위치

`index.html` 상단 `<head>` 안에 아래 코드가 있습니다.

```html
<script
  type="text/javascript"
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_JAVASCRIPT_KEY&autoload=false"
></script>
```

`YOUR_KAKAO_JAVASCRIPT_KEY` 부분만
카카오 디벨로퍼스에서 발급받은 **JavaScript 키**로 교체하세요.

예:

```html
<script
  type="text/javascript"
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=1234567890abcdef1234567890abcdef&autoload=false"
></script>
```

주의:
- REST API 키가 아니라 **JavaScript 키** 사용
- 카카오 디벨로퍼스 > 내 애플리케이션 > 앱 키 > JavaScript 키
- 카카오 디벨로퍼스 > 플랫폼 > Web에 사이트 도메인 등록 필요

## 2. 로컬 실행 시 주의

카카오맵 JavaScript API는 `file://`로 직접 열면 정상 동작하지 않을 수 있습니다.

VS Code를 사용하는 경우 Live Server로 실행하는 것을 권장합니다.

예:
- http://127.0.0.1:5500
- http://localhost:5500

그리고 사용하는 주소를 카카오 디벨로퍼스 Web 플랫폼에 등록하세요.

## 3. 구현된 카카오맵 기능

- 지도 표시
- 시설 마커 표시
- 마커 클릭 시 시설 상세 이동
- 현재 위치 확인
- 현재 위치 기준 지도 중심 이동
- 카테고리 필터 시 마커 변경
- 검색 시 지도 마커 변경
- 상세 화면의 길찾기 버튼 클릭 시 지도 화면으로 돌아가 해당 시설 위치로 이동

## 4. 이미지 파일 경로

모든 이미지는 아래 형식을 사용합니다.

- `./images/pharmacy01.jpg`
- `./images/parking01.jpg`
- `./images/store01.jpg`
- `./images/hospital01.jpg`
- `./images/toilet01.jpg`
- `./images/laundry01.jpg`
- `./images/cafe01.jpg`
- `./images/atm01.jpg`

이미지가 없어도 기본 대체 이미지가 표시됩니다.

## 5. 주요 화면

1. 홈
2. 주변시설
3. 시설 상세
4. 즐겨찾기
5. MY

## 6. 데이터 처리

- 즐겨찾기 추가/삭제
- 후기 등록/수정/삭제
- 평균 별점 계산
- 최근 검색 기록
- LocalStorage 저장
- DOM 실시간 변경
