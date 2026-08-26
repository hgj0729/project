# 모바일 청첩장 Google Sheets 방명록 연결 README

이 문서는 모바일 청첩장의 방명록을 새 Google Spreadsheet에 처음부터
연결하는 순서입니다.

## 1. Google Spreadsheet 만들기

새 Google Spreadsheet를 만든 뒤 아래쪽 **시트 탭 이름**을 정확히
`guestbook`으로 변경합니다.

1행은 다음과 같이 만듭니다.

  A      B      C          D
  ------ ------ ---------- ---------
  date   name   password   message

즉 `A1=date`, `B1=name`, `C1=password`, `D1=message`입니다.

## 2. Spreadsheet ID 복사

스프레드시트 주소가 아래와 같다면:

``` text
https://docs.google.com/spreadsheets/d/ABCDEFGHIJK123456789/edit
```

Spreadsheet ID는 `/d/`와 `/edit` 사이의 `ABCDEFGHIJK123456789`입니다. 이
값만 복사합니다.

## 3. Apps Script 열기

스프레드시트에서 **확장 프로그램 → Apps Script**를 누릅니다. `Code.gs`의
기존 내용을 지우고 아래 코드를 전체 붙여 넣습니다.

``` javascript
const SPREADSHEET_ID = "여기에_본인의_SPREADSHEET_ID";
const SHEET_NAME = "guestbook";

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error("guestbook 시트를 찾을 수 없습니다.");
  }

  return sheet;
}

function doGet(e) {
  try {
    const action =
      (e && e.parameter && e.parameter.action)
        ? e.parameter.action
        : "list";

    if (action === "list") {
      return getGuestbook();
    }

    return jsonResponse({
      success: false,
      message: "잘못된 요청입니다."
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message
    });
  }
}

function doPost(e) {
  try {
    const action = e.parameter.action || "";

    if (action !== "create") {
      return jsonResponse({
        success: false,
        message: "잘못된 요청입니다."
      });
    }

    const name = String(e.parameter.name || "").trim();
    const password = String(e.parameter.password || "").trim();
    const message = String(e.parameter.message || "").trim();

    if (!name) {
      return jsonResponse({
        success: false,
        message: "이름을 입력해주세요."
      });
    }

    if (!message) {
      return jsonResponse({
        success: false,
        message: "축하 메시지를 입력해주세요."
      });
    }

    const sheet = getSheet();

    const now = Utilities.formatDate(
      new Date(),
      "Asia/Seoul",
      "yyyy-MM-dd HH:mm:ss"
    );

    sheet.appendRow([
      now,
      name,
      password,
      message
    ]);

    return jsonResponse({
      success: true,
      message: "방명록이 등록되었습니다."
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message
    });
  }
}

function getGuestbook() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return jsonResponse({
      success: true,
      data: []
    });
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, 4)
    .getValues();

  const data = values
    .map(function(row) {
      return {
        date: String(row[0] || ""),
        name: String(row[1] || ""),
        message: String(row[3] || "")
      };
    })
    .reverse();

  return jsonResponse({
    success: true,
    data: data
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/* 배포 전에 반드시 실행할 연결 테스트 */
function testGuestbook() {
  const sheet = getSheet();

  sheet.appendRow([
    Utilities.formatDate(
      new Date(),
      "Asia/Seoul",
      "yyyy-MM-dd HH:mm:ss"
    ),
    "연결테스트",
    "",
    "Google Apps Script 연결 성공"
  ]);
}
```

`SPREADSHEET_ID`에 2단계에서 복사한 실제 ID를 넣고 저장합니다.

## 4. Spreadsheet 연결 먼저 테스트

Apps Script 상단의 함수 선택 메뉴에서 `testGuestbook`을 선택하고
**실행**합니다. 처음 실행하면 Google 권한 승인이 필요할 수 있습니다.

정상이라면 Google Sheet의 2행에 다음과 비슷한 값이 들어옵니다.

``` text
현재시간 | 연결테스트 | | Google Apps Script 연결 성공
```

이 테스트가 실패하면 웹 앱을 배포하기 전에 `SPREADSHEET_ID`와 시트 탭
이름 `guestbook`을 다시 확인합니다.

## 5. 웹 앱으로 배포

Apps Script에서 **배포 → 새 배포 → 유형 선택 → 웹 앱**으로 이동합니다.

설정은 다음과 같이 합니다.

``` text
다음 사용자로 실행: 나
액세스 권한: 공개 청첩장 방문자가 실행할 수 있는 사용자 범위
```

배포 후 `/exec`로 끝나는 웹 앱 URL을 복사합니다.

``` text
https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec
```

`/dev` 주소가 아니라 `/exec` 주소를 사용합니다.

## 6. GET 테스트

브라우저에서 다음처럼 접속합니다.

``` text
웹앱URL?action=list
```

정상이라면 데이터가 없을 때 다음과 같은 JSON이 나옵니다.

``` json
{"success":true,"data":[]}
```

테스트 데이터가 있다면 `data` 배열에 테스트 메시지가 표시됩니다. 로그인
화면이나 권한 오류가 나오면 웹 앱 배포/접근 설정을 다시 확인합니다.

## 7. 모바일 청첩장의 main.js 연결

`main.js` 위쪽에서 다음 부분을 찾습니다.

``` javascript
const GOOGLE_SCRIPT_URL =
    "기존_URL";
```

5단계에서 받은 새 `/exec` 주소로 교체합니다.

``` javascript
const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/여기에_새_배포주소/exec";
```

현재 방명록 프런트엔드는 다음 형태로 Apps Script에 데이터를 보내야
합니다.

``` javascript
const formData = new FormData();

formData.append("action", "create");
formData.append("name", name);
formData.append("password", password);
formData.append("message", message);

const response = await fetch(
    GOOGLE_SCRIPT_URL,
    {
        method: "POST",
        body: formData
    }
);

const result = await response.json();
```

## 8. GitHub Pages에 반영

`main.js`를 수정했다면 GitHub 저장소의 실제 프로젝트에 수정된 파일을
다시 업로드합니다.

예:

``` text
project/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/
```

GitHub Pages 반영 후 Windows Chrome에서는 `Ctrl + Shift + R`로 강력
새로고침하여 이전 JavaScript 캐시를 제거합니다.

## 9. 최종 등록 테스트

청첩장에서 다음과 같이 테스트합니다.

``` text
이름: 홍길동
비밀번호: 1234
축하 메시지: 결혼 진심으로 축하드립니다!
```

등록 후 Google Sheet에 아래와 같은 새 행이 추가되어야 합니다.

``` text
2026-08-26 12:40:00 | 홍길동 | 1234 | 결혼 진심으로 축하드립니다!
```

그 후 웹페이지의 방명록 목록에도 작성한 메시지가 나타나는지 확인합니다.

## 10. 실패할 때 확인하는 순서

1.  Apps Script에서 `testGuestbook()` 실행 → 시트에 행이 추가되는지
    확인합니다.
2.  `/exec?action=list` 접속 → JSON이 나오는지 확인합니다.
3.  `main.js`의 `GOOGLE_SCRIPT_URL`이 방금 배포한 `/exec` 주소와 같은지
    확인합니다.
4.  수정한 `main.js`가 GitHub에 실제 업로드되었는지 확인합니다.
5.  GitHub Pages를 강력 새로고침합니다.
6.  `F12 → Network`에서 `script.google.com` 요청의 상태와 응답을
    확인합니다.

## 11. Apps Script 코드를 수정한 뒤

Apps Script 코드를 변경한 경우 **배포 → 배포 관리 → 기존 웹 앱 수정 → 새
버전 → 배포** 순서로 최신 코드를 다시 배포합니다. 배포 후 사용하는
`/exec` URL도 다시 확인합니다.

## 12. 최종 체크리스트

-   [ ] 새 Google Spreadsheet를 만들었다.
-   [ ] 시트 탭 이름이 정확히 `guestbook`이다.
-   [ ] A1 `date`, B1 `name`, C1 `password`, D1 `message`를 입력했다.
-   [ ] Spreadsheet ID를 정확하게 복사했다.
-   [ ] `Code.gs`의 `SPREADSHEET_ID`를 수정했다.
-   [ ] `testGuestbook()` 실행 시 테스트 행이 저장된다.
-   [ ] Apps Script를 웹 앱으로 배포했다.
-   [ ] 공개 청첩장 방문자가 웹 앱을 실행할 수 있는 접근 권한으로
    배포했다.
-   [ ] `/exec?action=list`에서 JSON 응답을 확인했다.
-   [ ] `main.js`의 `GOOGLE_SCRIPT_URL`을 새 `/exec` 주소로 변경했다.
-   [ ] 수정된 `main.js`를 GitHub에 업로드했다.
-   [ ] GitHub Pages에서 강력 새로고침했다.
-   [ ] 실제 방명록 작성 후 Google Sheet에 새 행이 생성된다.

## 보안 참고

현재 예제는 기존 청첩장 코드와 쉽게 연결하기 위해 `password` 값을 시트에
그대로 저장합니다. 공개 서비스에서 이 값을 삭제 인증 등에 사용할
계획이라면 평문 저장 대신 서버 측 해시 처리를 권장합니다.
