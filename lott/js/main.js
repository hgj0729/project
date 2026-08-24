/* =====================================
   LOTTE Eatz HEADER 전체메뉴 동작
===================================== */


/* 메인 헤더 영역 */
const headerMain = document.querySelector(".header-main");


/* 메인 메뉴 */
const gnb = document.querySelector(".gnb");


/* 메인메뉴 각각의 링크 */
const mainMenuLinks = document.querySelectorAll(".gnb-list > li > a");


/* 전체 서브메뉴 */
const megaMenu = document.querySelector(".mega-menu");


/* =====================================
   메인메뉴에 마우스를 올렸을 때
   전체 서브메뉴 표시
===================================== */

gnb.addEventListener("mouseenter", function () {

    /* menu-open 클래스 추가 */
    headerMain.classList.add("menu-open");

});


/* =====================================
   서브메뉴 위에서도 메뉴 유지
===================================== */

megaMenu.addEventListener("mouseenter", function () {

    headerMain.classList.add("menu-open");

});


/* =====================================
   Header 영역을 벗어나면
   서브메뉴 숨기기
===================================== */

headerMain.addEventListener("mouseleave", function () {

    /* menu-open 클래스 제거 */
    headerMain.classList.remove("menu-open");


    /* 활성화된 메인 메뉴 글자색 제거 */
    mainMenuLinks.forEach(function (menu) {

        menu.classList.remove("active");

    });

});


/* =====================================
   현재 마우스가 올라간 메인 메뉴
   글자색 변경
===================================== */

mainMenuLinks.forEach(function (menu) {

    menu.addEventListener("mouseenter", function () {

        /* 모든 메뉴 active 제거 */
        mainMenuLinks.forEach(function (item) {

            item.classList.remove("active");

        });


        /* 현재 메뉴에만 active 적용 */
        this.classList.add("active");

    });

});
/* =========================================
   LOTTE EATZ MAIN BANNER SWIPER
========================================= */


/* =========================================
   요소 선택
========================================= */

/* 현재 슬라이드 번호 */
const currentSlide =
    document.querySelector(".current-slide");


/* 전체 슬라이드 번호 */
const totalSlide =
    document.querySelector(".total-slide");


/* 자동재생 정지 버튼 */
const pauseButton =
    document.querySelector(".slide-pause");


/* 자동재생 시작 버튼 */
const playButton =
    document.querySelector(".slide-play");


/* =========================================
   Swiper 생성
========================================= */

const mainSwiper = new Swiper(
    ".main-banner-swiper",
    {

        /*
            한 화면에 보여줄 슬라이드 개수
            요청사항 : 1개
        */
        slidesPerView: 1,


        /*
            한 번 이동할 슬라이드 개수
            요청사항 : 1개
        */
        slidesPerGroup: 1,


        /*
            마지막 슬라이드 이후
            첫 슬라이드로 연결
        */
        loop: true,


        /*
            슬라이드 전환 시간
        */
        speed: 700,


        /*
            자동 재생
        */
        autoplay: {

            /*
                요청사항
                2초마다 자동으로 이동
            */
            delay: 2000,

            /*
                사용자가 클릭한 후에도
                자동재생을 유지
            */
            disableOnInteraction: false
        },


        /*
            좌우 버튼
        */
        navigation: {

            nextEl: ".slide-next",

            prevEl: ".slide-prev"
        },


        /*
            슬라이드 이벤트
        */
        on: {

            /*
                Swiper 최초 실행
            */
            init: function () {

                /*
                    실제 슬라이드 번호 표시
                */
                currentSlide.textContent =
                    this.realIndex + 1;


                /*
                    전체 개수 15 표시
                */
                totalSlide.textContent = 3;

            },


            /*
                슬라이드가 변경될 때
            */
            slideChange: function () {

                /*
                    loop 사용 시
                    activeIndex가 아닌 realIndex 사용
                */
                currentSlide.textContent =
                    this.realIndex + 1;

            }

        }

    }
);


/* =========================================
   자동재생 정지
========================================= */

pauseButton.addEventListener(
    "click",
    function () {

        /*
            Swiper 자동재생 정지
        */
        mainSwiper.autoplay.stop();


        /*
            정지 버튼 숨김
        */
        pauseButton.style.display = "none";


        /*
            재생 버튼 표시
        */
        playButton.style.display = "flex";

    }
);


/* =========================================
   자동재생 시작
========================================= */

playButton.addEventListener(
    "click",
    function () {

        /*
            Swiper 자동재생 시작
        */
        mainSwiper.autoplay.start();


        /*
            재생 버튼 숨김
        */
        playButton.style.display = "none";


        /*
            정지 버튼 표시
        */
        pauseButton.style.display = "flex";

    }
);
/* =========================================
   COUPON SWIPER
========================================= */

const couponSwiper =
    new Swiper(
        ".coupon-swiper",
        {

            /*
                요청사항:
                한 화면에 총 4개 표시
            */
            slidesPerView: 4,


            /*
                275px 카드 4개 =
                1100px

                inner 1150px 안에서
                카드 사이 간격 설정
            */
            spaceBetween: 16.6,


            /*
                요청사항:
                버튼 클릭 시
                한 번에 1개씩 이동
            */
            slidesPerGroup: 1,


            /*
                첫 번째와 마지막에서
                무한 반복하지 않음
            */
            loop: false,


            /*
                슬라이드 이동 속도
            */
            speed: 500,


            /*
                이전 / 다음 버튼
            */
            navigation: {

                nextEl:
                    ".coupon-next",

                prevEl:
                    ".coupon-prev"

            }

        }
    );
    /* =========================================
   이달의 핫메뉴 TAB
========================================= */


/* 모든 탭 버튼 가져오기 */
const hotTabs =
    document.querySelectorAll(
        ".hot-tab"
    );


/* 모든 탭 콘텐츠 가져오기 */
const hotPanels =
    document.querySelectorAll(
        ".hot-panel"
    );


/* =========================================
   각각의 탭 버튼에 클릭 이벤트 적용
========================================= */

hotTabs.forEach(
    function (tab) {


        tab.addEventListener(
            "click",
            function () {


                /* =================================
                   클릭한 버튼의 data-tab 값
                ================================= */
                const target =
                    this.dataset.tab;


                /* =================================
                   모든 탭 active 제거
                ================================= */
                hotTabs.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                /* =================================
                   모든 콘텐츠 숨기기
                ================================= */
                hotPanels.forEach(
                    function (panel) {

                        panel.classList.remove(
                            "active"
                        );

                    }
                );


                /* =================================
                   현재 클릭한 탭 활성화
                ================================= */
                this.classList.add(
                    "active"
                );


                /* =================================
                   클릭한 탭과 일치하는
                   콘텐츠 표시
                ================================= */
                const targetPanel =
                    document.getElementById(
                        target
                    );


                if (targetPanel) {

                    targetPanel.classList.add(
                        "active"
                    );

                }


            }
        );


    }
);