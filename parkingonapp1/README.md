# 파킹온 - 지역별 10개 실제 API 버전

이 버전은 GitHub Pages에서 `config.js`가 실행되지 않아
`API KEY가 설정되지 않아 데모 데이터를 사용합니다`라는 메시지가 나오던 문제를 수정한 버전입니다.

## 핵심 수정

- `config.js` 의존성 제거
- API 인증키를 `app.js`에서 직접 사용
- `index.html`에서 `app.js?v=20260831-region10-fixed`로 불러와 GitHub Pages/브라우저 캐시 방지
- 데모 데이터 자동 전환 제거
- 서울/부산/대전/광주/대구/인천 각각 최대 10개씩 실제 공공데이터 요청
- `rdnmadr`로 먼저 조회하고 결과가 없으면 `lnmadr`로 재조회
- API 오류가 발생하면 화면과 Console에 실제 오류 표시
- 각 지역별 API 원본 응답을 `console.log()`로 출력

## API

End Point:
`https://api.data.go.kr/openapi/tn_pubr_prkplce_info_api`

요청 예시 구조:

```js
`${API_URL}?serviceKey=${API_KEY}&pageNo=1&numOfRows=10&type=json&rdnmadr=${encodeURIComponent("서울특별시")}`
```

## GitHub에 다시 올릴 때

기존 `parkingonapp` 폴더의 파일을 전부 지운 뒤,
이번 ZIP 안 `parking-on-app` 폴더의 파일을 새로 업로드하는 것을 권장합니다.

최종 파일:
- index.html
- style.css
- app.js
- README.md

`config.js`는 사용하지 않습니다.

업로드 후 브라우저에서 강력 새로고침:
- Windows Chrome: `Ctrl + F5`
- 또는 개발자도구 Network 탭에서 Disable cache 체크 후 새로고침

Console에서 다음 로그가 나오면 정상입니다.

```text
[파킹온] API KEY 설정 여부: true
[파킹온] 서울 요청(rdnmadr): ...
[파킹온] 서울 서버 원본 응답: Object
[파킹온] 서울 API 완료: 10개
...
[파킹온] 실제 API 최종 데이터: Array(...)
```

주의: API 키가 프런트엔드 JavaScript에 들어 있으므로 공개 서비스용 보안 구조는 아닙니다.
이 과제의 브라우저 직접 API 호출 요구를 위한 제출용 구성입니다.
