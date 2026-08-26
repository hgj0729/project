/* =========================================
   모바일 청첩장 JavaScript
========================================= */


/* =========================================
   01. 환경 설정
========================================= */

/*
    Google Apps Script를 웹 앱으로 배포한 후
    생성되는 /exec 주소를 입력합니다.
*/
const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycby3GeGls3G4vEAa1tzl6gIV-FbzLGiE39XLFIo_lgvivtFIPOC9FbsFrTl_pWWDoDcQlQ/exec";


/*
    전화번호는 개인정보이므로
    사용자가 직접 수정해서 사용합니다.
*/
const PHONE = {
    groom: "01077778888",
    bride: "01033334444"
};


/* =========================================
   02. 실시간 Wedding Countdown
========================================= */

// 결혼식 날짜
const weddingDate =
    new Date("2026-09-01T12:00:00+09:00");

const daysElement =
    document.getElementById("days");

const hoursElement =
    document.getElementById("hours");

const minutesElement =
    document.getElementById("minutes");

const secondsElement =
    document.getElementById("seconds");

const dDayElement =
    document.getElementById("dDay");

const remainingText =
    document.getElementById("remainingText");


/*
    숫자를 두 자리로 표시
    ex)
    7 → 07
*/
function padNumber(number) {
    return String(number).padStart(2, "0");
}


/*
    숫자가 변경될 때
    짧게 애니메이션 적용
*/
function animateNumber(element) {

    element.classList.add("tick");

    setTimeout(() => {

        element.classList.remove("tick");

    }, 180);

}


/*
    Countdown 실행
*/
function updateCountdown() {

    const now = new Date();

    const difference =
        weddingDate.getTime() - now.getTime();


    /*
        결혼식 시간이 지난 경우
    */
    if (difference <= 0) {

        daysElement.textContent = "00";
        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";

        dDayElement.textContent = "D-DAY";

        remainingText.textContent =
            "우리의 소중한 날을 함께해 주셔서 감사합니다.";

        return;

    }


    /*
        남은 시간 계산
    */
    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );

    const hours =
        Math.floor(
            (difference /
            (1000 * 60 * 60)) % 24
        );

    const minutes =
        Math.floor(
            (difference /
            (1000 * 60)) % 60
        );

    const seconds =
        Math.floor(
            (difference / 1000) % 60
        );


    /*
        D-Day 표시
    */
    dDayElement.textContent =
        days === 0
            ? "D-DAY"
            : `D-${days}`;


    /*
        숫자가 변경됐다면 애니메이션
    */
    const newSeconds =
        padNumber(seconds);

    if (
        secondsElement.textContent !==
        newSeconds
    ) {

        animateNumber(secondsElement);

    }


    /*
        화면 업데이트
    */
    daysElement.textContent =
        padNumber(days);

    hoursElement.textContent =
        padNumber(hours);

    minutesElement.textContent =
        padNumber(minutes);

    secondsElement.textContent =
        newSeconds;

}


/*
    페이지 로딩 즉시 실행
*/
updateCountdown();


/*
    1초마다 업데이트
*/
setInterval(
    updateCountdown,
    1000
);



/* =========================================
   03. Scroll Fade Up
========================================= */

const fadeElements =
    document.querySelectorAll(".fade-up");


/*
    요소가 화면의 약 15% 이상 보이면
    show 클래스 추가
*/
const observer =
    new IntersectionObserver(

        (entries, observerInstance) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add(
                        "show"
                    );

                    /*
                        한 번 나타난 요소는
                        다시 감시하지 않음
                    */
                    observerInstance.unobserve(
                        entry.target
                    );

                }

            });

        },

        {
            threshold: 0.15,
            rootMargin:
                "0px 0px -30px 0px"
        }

    );


fadeElements.forEach((element) => {

    observer.observe(element);

});



/* =========================================
   04. 카카오 지도
========================================= */

/*
    index.html의
    YOUR_KAKAO_JAVASCRIPT_KEY 부분을
    실제 카카오 JavaScript 키로 교체해야 합니다.

    카카오 Developers에서
    웹 플랫폼 도메인도 함께 등록해주세요.
*/
function initKakaoMap() {

    const mapContainer =
        document.getElementById("map");

    const mapError =
        document.getElementById("mapError");


    /*
        지도 요소가 없는 경우
    */
    if (!mapContainer) {

        return;

    }


    /*
        카카오맵 SDK 또는 services 라이브러리가
        정상적으로 로드되지 않은 경우
    */
    if (
        typeof kakao === "undefined" ||
        !kakao.maps ||
        !kakao.maps.services
    ) {

        console.error(
            "카카오맵 JavaScript API를 불러오지 못했습니다."
        );

        mapContainer.style.display =
            "none";

        if (mapError) {

            mapError.hidden = false;

        }

        return;

    }


    /*
        주소 검색 전 임시 지도 중심
        서울 중구 인근
    */
    const mapOption = {

        center:
            new kakao.maps.LatLng(
                37.5580,
                127.0050
            ),

        level: 4

    };


    /*
        지도 생성
    */
    const map =
        new kakao.maps.Map(
            mapContainer,
            mapOption
        );


    /*
        주소 -> 좌표 변환 객체
    */
    const geocoder =
        new kakao.maps.services.Geocoder();


    /*
        예식장 주소
    */
    const weddingAddress =
        "서울특별시 중구 동호로 249";


    /*
        주소 검색
    */
    geocoder.addressSearch(

        weddingAddress,

        function(result, status) {

            if (
                status ===
                kakao.maps.services.Status.OK
            ) {

                /*
                    검색 결과 좌표 생성
                */
                const weddingPosition =
                    new kakao.maps.LatLng(
                        Number(result[0].y),
                        Number(result[0].x)
                    );


                /*
                    지도 중심 이동
                */
                map.setCenter(
                    weddingPosition
                );


                /*
                    예식장 마커
                */
                const marker =
                    new kakao.maps.Marker({

                        map: map,

                        position:
                            weddingPosition,

                        title:
                            "서울 신라호텔 영빈관"

                    });


                /*
                    마커 위 정보창
                */
                const infoContent = `
                    <div
                        style="
                            width:190px;
                            padding:12px 10px;
                            text-align:center;
                            font-family:Pretendard, Noto Sans KR, Arial, sans-serif;
                            line-height:1.5;
                        "
                    >
                        <strong
                            style="
                                display:block;
                                margin-bottom:5px;
                                font-size:13px;
                                color:#333;
                            "
                        >
                            서울 신라호텔 영빈관
                        </strong>

                        <span
                            style="
                                display:block;
                                font-size:11px;
                                color:#777;
                            "
                        >
                            영빈관 1층 · 낮 12시
                        </span>
                    </div>
                `;


                const infoWindow =
                    new kakao.maps.InfoWindow({

                        content:
                            infoContent

                    });


                /*
                    처음부터 정보창 표시
                */
                infoWindow.open(
                    map,
                    marker
                );


                /*
                    마커 클릭 시 정보창 표시
                */
                kakao.maps.event.addListener(

                    marker,

                    "click",

                    function() {

                        infoWindow.open(
                            map,
                            marker
                        );

                    }

                );


                /*
                    모바일 화면 회전이나 크기 변경 시
                    지도 중심을 다시 예식장 위치로 맞춤
                */
                window.addEventListener(
                    "resize",
                    function() {

                        map.relayout();

                        map.setCenter(
                            weddingPosition
                        );

                    }
                );

            } else {

                console.error(
                    "서울 신라호텔 영빈관 주소를 찾지 못했습니다."
                );

                mapContainer.style.display =
                    "none";

                if (mapError) {

                    mapError.hidden = false;

                }

            }

        }

    );

}


/*
    모든 페이지 리소스와 카카오맵 SDK가
    준비된 뒤 지도 실행
*/
window.addEventListener(
    "load",
    initKakaoMap
);



/* =========================================
   05. 신랑 · 신부 전화 버튼
========================================= */

const callButtons =
    document.querySelectorAll(".call-button");


callButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const person =
                button.dataset.person;

            const phoneNumber =
                PHONE[person];


            /*
                전화번호가 입력되지 않은 경우
            */
            if (!phoneNumber) {

                alert(
                    person === "groom"
                        ? "main.js에서 신랑 전화번호를 입력해주세요."
                        : "main.js에서 신부 전화번호를 입력해주세요."
                );

                return;

            }


            /*
                스마트폰 전화 실행
            */
            window.location.href =
                `tel:${phoneNumber}`;

        }
    );

});



/* =========================================
   06. 계좌번호 복사
========================================= */

const copyButtons =
    document.querySelectorAll(
        ".copy-button"
    );

const toast =
    document.getElementById("toast");

let toastTimer;


/*
    Toast 표시
*/
function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2000);

}


copyButtons.forEach((button) => {

    button.addEventListener(
        "click",
        async () => {

            const account =
                button.dataset.account;

            try {

                /*
                    Clipboard API
                */
                await navigator.clipboard.writeText(
                    account
                );

                showToast(
                    "계좌번호가 복사되었습니다."
                );

            } catch (error) {

                /*
                    Clipboard API 사용 불가능 시
                    fallback
                */
                const input =
                    document.createElement(
                        "input"
                    );

                input.value =
                    account;

                document.body.appendChild(
                    input
                );

                input.select();

                document.execCommand(
                    "copy"
                );

                input.remove();

                showToast(
                    "계좌번호가 복사되었습니다."
                );

            }

        }
    );

});



/* =========================================
   07. Wedding Gallery Modal
========================================= */

const galleryItems =
    document.querySelectorAll(
        ".gallery-item"
    );

const modal =
    document.getElementById(
        "galleryModal"
    );

const modalImage =
    document.getElementById(
        "modalImage"
    );

const modalClose =
    document.getElementById(
        "modalClose"
    );

const modalPrev =
    document.getElementById(
        "modalPrev"
    );

const modalNext =
    document.getElementById(
        "modalNext"
    );


const galleryImages =
    Array.from(galleryItems).map(
        item => item.dataset.image
    );

let currentImageIndex = 0;


/*
    특정 이미지 열기
*/
function openGallery(index) {

    currentImageIndex = index;

    modalImage.src =
        galleryImages[
            currentImageIndex
        ];

    modal.classList.add(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


/*
    Modal 닫기
*/
function closeGallery() {

    modal.classList.remove(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


/*
    이전 사진
*/
function showPreviousImage() {

    currentImageIndex =
        (
            currentImageIndex -
            1 +
            galleryImages.length
        ) %
        galleryImages.length;

    modalImage.src =
        galleryImages[
            currentImageIndex
        ];

}


/*
    다음 사진
*/
function showNextImage() {

    currentImageIndex =
        (
            currentImageIndex + 1
        ) %
        galleryImages.length;

    modalImage.src =
        galleryImages[
            currentImageIndex
        ];

}


/*
    갤러리 클릭 이벤트
*/
galleryItems.forEach(
    (item, index) => {

        item.addEventListener(
            "click",
            () => {

                openGallery(index);

            }
        );

    }
);


modalClose.addEventListener(
    "click",
    closeGallery
);

modalPrev.addEventListener(
    "click",
    showPreviousImage
);

modalNext.addEventListener(
    "click",
    showNextImage
);


/*
    검은 배경 터치 시 닫기
*/
modal.addEventListener(
    "click",
    (event) => {

        if (event.target === modal) {

            closeGallery();

        }

    }
);


/*
    키보드 제어
*/
document.addEventListener(
    "keydown",
    (event) => {

        if (
            !modal.classList.contains(
                "active"
            )
        ) {
            return;
        }

        if (event.key === "Escape") {

            closeGallery();

        }

        if (event.key === "ArrowLeft") {

            showPreviousImage();

        }

        if (event.key === "ArrowRight") {

            showNextImage();

        }

    }
);


/* =========================================
   모바일 Swipe
========================================= */

let touchStartX = 0;

let touchEndX = 0;


modal.addEventListener(
    "touchstart",
    (event) => {

        touchStartX =
            event.changedTouches[0]
                .screenX;

    },

    {
        passive: true
    }
);


modal.addEventListener(
    "touchend",
    (event) => {

        touchEndX =
            event.changedTouches[0]
                .screenX;

        const distance =
            touchEndX -
            touchStartX;

        /*
            오른쪽 Swipe
        */
        if (distance > 50) {

            showPreviousImage();

        }

        /*
            왼쪽 Swipe
        */
        if (distance < -50) {

            showNextImage();

        }

    },

    {
        passive: true
    }
);



/* =========================================
   08. 방명록 Google Sheets 연동
========================================= */

const guestbookForm =
    document.getElementById(
        "guestbookForm"
    );

const submitButton =
    document.getElementById(
        "submitGuestbook"
    );

const guestbookItems =
    document.getElementById(
        "guestbookItems"
    );

const refreshGuestbook =
    document.getElementById(
        "refreshGuestbook"
    );


/*
    Google Script URL이 등록되어 있는지
    확인하는 함수
*/
function isScriptConfigured() {

    return (
        GOOGLE_SCRIPT_URL &&
        GOOGLE_SCRIPT_URL.startsWith(
            "https://script.google.com/"
        )
    );

}


/*
    이름 마스킹
    홍길동 → 홍*동
*/
function maskName(name) {

    if (!name) {
        return "익명";
    }

    if (name.length === 1) {
        return name;
    }

    if (name.length === 2) {

        return (
            name[0] +
            "*"
        );

    }

    return (
        name[0] +
        "*" +
        name[name.length - 1]
    );

}


/*
    방명록 HTML 생성
*/
function renderGuestbook(data) {

    guestbookItems.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        guestbookItems.innerHTML =
            `
            <p class="empty-message">
                아직 등록된 축하 메시지가 없습니다.<br>
                첫 번째 축하 메시지를 남겨주세요.
            </p>
            `;

        return;

    }


    data.forEach((item) => {

        const article =
            document.createElement(
                "article"
            );

        article.className =
            "guestbook-item";


        /*
            XSS 방지를 위해
            innerHTML로 사용자 메시지를
            직접 삽입하지 않음
        */
        const head =
            document.createElement(
                "div"
            );

        head.className =
            "guestbook-item-head";


        const name =
            document.createElement(
                "strong"
            );

        name.textContent =
            maskName(item.name);


        const time =
            document.createElement(
                "time"
            );

        time.textContent =
            item.date || "";


        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            item.message;


        head.appendChild(name);
        head.appendChild(time);

        article.appendChild(head);
        article.appendChild(message);

        guestbookItems.appendChild(
            article
        );

    });

}


/*
    Google Sheets에서
    방명록 불러오기
*/
async function loadGuestbook() {

    if (!isScriptConfigured()) {

        guestbookItems.innerHTML =
            `
            <p class="empty-message">
                Google Apps Script URL을<br>
                main.js에 입력하면 방명록이 표시됩니다.
            </p>
            `;

        return;

    }


    guestbookItems.innerHTML =
        `
        <p class="empty-message">
            방명록을 불러오는 중입니다.
        </p>
        `;


    try {

        const response =
            await fetch(
                `${GOOGLE_SCRIPT_URL}?action=list`
            );

        if (!response.ok) {

            throw new Error(
                "방명록 요청 실패"
            );

        }

        const result =
            await response.json();


        if (result.success) {

            renderGuestbook(
                result.data
            );

        } else {

            throw new Error(
                result.message
            );

        }

    } catch (error) {

        console.error(error);

        guestbookItems.innerHTML =
            `
            <p class="empty-message">
                방명록을 불러오지 못했습니다.
            </p>
            `;

    }

}


/*
    방명록 등록
*/
guestbookForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        /*
            Apps Script 주소 미설정
        */
        if (!isScriptConfigured()) {

            alert(
                "main.js의 GOOGLE_SCRIPT_URL에 Google Apps Script 주소를 입력해주세요."
            );

            return;

        }


        const name =
            document
                .getElementById(
                    "guestName"
                )
                .value
                .trim();

        const password =
            document
                .getElementById(
                    "guestPassword"
                )
                .value
                .trim();

        const message =
            document
                .getElementById(
                    "guestMessage"
                )
                .value
                .trim();


        /*
            Validation
        */
        if (!name) {

            alert(
                "이름을 입력해주세요."
            );

            return;

        }


        if (!message) {

            alert(
                "축하 메시지를 입력해주세요."
            );

            return;

        }


        /*
            버튼 중복 클릭 방지
        */
        submitButton.disabled =
            true;

        submitButton.textContent =
            "등록 중...";


        try {

            const formData =
                new FormData();

            formData.append(
                "action",
                "create"
            );

            formData.append(
                "name",
                name
            );

            formData.append(
                "password",
                password
            );

            formData.append(
                "message",
                message
            );


            /*
                Apps Script에 POST 전송
            */
            const response =
                await fetch(
                    GOOGLE_SCRIPT_URL,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const result =
                await response.json();


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "저장 실패"
                );

            }


            /*
                등록 성공
            */
            showToast(
                "축하 메시지가 등록되었습니다."
            );

            guestbookForm.reset();


            /*
                방명록 다시 불러오기
            */
            await loadGuestbook();


        } catch (error) {

            console.error(error);

            alert(
                "메시지 등록에 실패했습니다. 잠시 후 다시 시도해주세요."
            );

        } finally {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "축하 메시지 남기기";

        }

    }
);


/*
    새로고침 버튼
*/
refreshGuestbook.addEventListener(
    "click",
    loadGuestbook
);


/*
    페이지 시작 시
    방명록 조회
*/
loadGuestbook();