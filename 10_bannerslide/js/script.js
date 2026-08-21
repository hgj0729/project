/* =========================================
   상품 Swiper Slide
========================================= */


/* =========================================
   전체 상품 개수
========================================= */
const TOTAL_SLIDES = 6;


/* =========================================
   진행 막대 요소
   Swiper보다 먼저 선언해야 합니다.
========================================= */
const progressBar =
  document.getElementById("progressBar");


/* =========================================
   진행 막대 업데이트 함수
========================================= */
function updateProgress(realIndex) {

  // 현재 슬라이드 번호
  const current = realIndex + 1;

  // 진행률 계산
  const progress =
    (current / TOTAL_SLIDES) * 100;

  // 진행 막대 너비 변경
  progressBar.style.width =
    progress + "%";
}


/* =========================================
   Swiper 생성
========================================= */
const productSwiper = new Swiper(
  ".productSwiper",
  {

    /* 한 화면에 3개 표시 */
    slidesPerView: 3,

    /* 슬라이드 사이 간격 */
    spaceBetween: 25,

    /* 한 번에 1개씩 이동 */
    slidesPerGroup: 1,

    /* 무한 반복 */
    loop: true,

    /* 이동 속도 */
    speed: 700,

    /* =====================================
       3초 자동재생
    ====================================== */
    autoplay: {

      delay: 3000,

      disableOnInteraction: false

    },


    /* =====================================
       좌우 버튼
    ====================================== */
    navigation: {

      nextEl: ".custom-next",

      prevEl: ".custom-prev"

    },


    /* =====================================
       슬라이드 이벤트
    ====================================== */
    on: {

      /* Swiper가 처음 실행될 때 */
      init: function () {

        updateProgress(
          this.realIndex
        );

      },


      /* 슬라이드가 변경될 때 */
      slideChange: function () {

        updateProgress(
          this.realIndex
        );

      }

    }

  }
);


/* =========================================
   일시정지 / 재생 버튼
========================================= */
const playControl =
  document.getElementById(
    "playControl"
  );


const playControlImage =
  document.getElementById(
    "playControlImage"
  );


/* =========================================
   자동재생 상태
========================================= */
let isPlaying = true;


/* =========================================
   일시정지 / 재생 버튼 클릭
========================================= */
playControl.addEventListener(
  "click",
  function () {

    /* 현재 재생 중이라면 */
    if (isPlaying) {

      /* 자동재생 정지 */
      productSwiper.autoplay.stop();


      /* 재생 이미지로 변경 */
      playControlImage.src =
        "./images/play.svg";


      playControlImage.alt =
        "재생";


      playControl.setAttribute(
        "aria-label",
        "슬라이드 재생"
      );


      isPlaying = false;

    } else {

      /* 자동재생 다시 시작 */
      productSwiper.autoplay.start();


      /* 일시정지 이미지로 변경 */
      playControlImage.src =
        "./images/pause.svg";


      playControlImage.alt =
        "일시정지";


      playControl.setAttribute(
        "aria-label",
        "슬라이드 일시정지"
      );


      isPlaying = true;
    }

  }
);