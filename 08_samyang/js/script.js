$(function () {

  const $header = $("#header");
  const $gnb = $(".gnb");
  const $depth2 = $(".depth2");
  const $depth2Bg = $(".depth2-bg");


  /* =========================
     전체 2단 메뉴 OPEN
  ========================== */
  function openMenu() {

    /*
      반복 hover 시
      애니메이션이 겹치는 현상 방지
    */
    $depth2.stop(true, true);
    $depth2Bg.stop(true, true);


    $header.addClass("menu-open");


    /*
      전체 배경이 위 -> 아래로 내려옴
    */
    $depth2Bg.slideDown(350);


    /*
      모든 2단 메뉴를 동시에 표시
    */
    $depth2.slideDown(350);

  }


  /* =========================
     전체 2단 메뉴 CLOSE
  ========================== */
  function closeMenu() {

    $depth2.stop(true, true);
    $depth2Bg.stop(true, true);


    /*
      전체 서브메뉴를 위로 닫음
    */
    $depth2.slideUp(250);

    $depth2Bg.slideUp(250, function () {
      $header.removeClass("menu-open");
    });

  }


  /* =========================
     GNB Hover
  ========================== */
  $gnb.on("mouseenter", function () {
    openMenu();
  });


  /*
    header 전체를 벗어날 때 닫기

    서브메뉴로 마우스를 이동해도
    header 영역 안에 있기 때문에
    메뉴가 닫히지 않습니다.
  */
  $header.on("mouseleave", function () {
    closeMenu();
  });


  /* =========================
     Keyboard Accessibility
  ========================== */

  $(".gnb-link").on("focus", function () {
    openMenu();
  });


  $("#header a").last().on("blur", function () {
    closeMenu();
  });
   



});

/* ========================================
   Main Visual Swiper
======================================== */

const mainSwiper = new Swiper(".mainSwiper", {

  /* ------------------------------------
     슬라이드 방향
     가로 방향으로 이동
  ------------------------------------ */
  direction: "horizontal",


  /* ------------------------------------
     무한 반복
  ------------------------------------ */
  loop: true,


  /* ------------------------------------
     슬라이드 이동 속도
     800ms
  ------------------------------------ */
  speed: 800,


  /* ------------------------------------
     자동 슬라이드

     페이지가 로딩되면 자동 시작
     3초마다 다음 슬라이드로 이동
  ------------------------------------ */
  autoplay: {
    delay: 3000,

    /*
      사용자가 버튼을 클릭한 후에도
      자동 슬라이드 계속 실행
    */
    disableOnInteraction: false,

    /*
      마우스를 올려도 자동재생 유지
    */
    pauseOnMouseEnter: false
  },


  /* ------------------------------------
     좌우 Navigation
  ------------------------------------ */
  navigation: {
    nextEl: ".custom-next",
    prevEl: ".custom-prev"
  },


  /* ------------------------------------
     Pagination
     1 / 3 형태
  ------------------------------------ */
  pagination: {
    el: ".swiper-pagination",
    type: "fraction",

    /*
      기본 1 / 3 형태로 출력
    */
    renderFraction: function (currentClass, totalClass) {
      return `
        <span class="${currentClass}"></span>
        <span class="page-divider"> / </span>
        <span class="${totalClass}"></span>
      `;
    }
  }

});
/* ==========================================
   BRAND TAB 기능
========================================== */

$(function () {

    /* ----------------------------------------
       탭 버튼 클릭 이벤트
    ----------------------------------------- */
    $(".tab-btn").click(function () {

        /* 클릭한 버튼의 data-tab 값 가져오기 */
        const tabId = $(this).data("tab");


        /* ----------------------------------------
           모든 탭의 active 제거
        ----------------------------------------- */
        $(".tab-btn").removeClass("active");


        /* ----------------------------------------
           클릭한 탭 버튼에 active 추가
        ----------------------------------------- */
        $(this).addClass("active");


        /* ----------------------------------------
           모든 상품 콘텐츠 숨기기
        ----------------------------------------- */
        $(".brand-content")
            .removeClass("active")
            .hide();


        /* ----------------------------------------
           선택한 탭 콘텐츠만 부드럽게 표시
        ----------------------------------------- */
        $("#" + tabId)
            .addClass("active")
            .fadeIn(300);

    });

});
/* =========================================
   FAMILY SITE slideToggle 기능
========================================= */
$(function () {

    /* -----------------------------------------
       FamilySite 버튼 클릭 이벤트
    ------------------------------------------ */
    $(".family-btn").click(function () {

        /*
            FamilySite 목록을
            한 번 클릭하면 보여주고
            다시 클릭하면 숨김
        */
        $(".family-list").stop().slideToggle(300);


        /* -------------------------------------
           화살표 방향 변경
        -------------------------------------- */
        $(".family-arrow").text(
            $(".family-list").is(":visible")
                ? "▲"
                : "▼"
        );

    });


    /* -----------------------------------------
       FamilySite 영역 외부 클릭 시 목록 닫기
    ------------------------------------------ */
    $(document).click(function (e) {

        /*
            클릭한 대상이 family-wrap 내부가 아닐 경우
            목록을 닫음
        */
        if (!$(e.target).closest(".family-wrap").length) {

            $(".family-list")
                .stop()
                .slideUp(300);

            $(".family-arrow").text("▼");

        }

    });

});
// ================================
// 팝업창 관련 요소 가져오기
// ================================
const popup = document.getElementById("popup");
const closeBtn = document.getElementById("closeBtn");
const todayClose = document.getElementById("todayClose");


// ================================
// 오늘 날짜를 만드는 함수
// 예: 2026-08-21
// ================================
function getToday() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}


// ================================
// 페이지가 로딩되었을 때 실행
// ================================
window.addEventListener("DOMContentLoaded", function () {

  // localStorage에 저장되어 있는 날짜 가져오기
  const popupCloseDate = localStorage.getItem("popupCloseDate");

  // 오늘 날짜 가져오기
  const today = getToday();


  // 저장된 날짜가 오늘과 같으면
  // 팝업창을 표시하지 않습니다.
  if (popupCloseDate === today) {

    popup.style.display = "none";

  } else {

    // 오늘 닫은 기록이 없으면
    // 팝업창을 화면 중앙에 표시
    popup.style.display = "flex";
  }

});


// ================================
// [닫기] 버튼 클릭 이벤트
// ================================
closeBtn.addEventListener("click", function () {

  // '오늘 하루 이 창을 열지 않음'이
  // 체크되어 있는지 확인
  if (todayClose.checked) {

    // 오늘 날짜를 저장합니다.
    // 브라우저를 새로고침해도 오늘은 팝업이 뜨지 않습니다.
    localStorage.setItem(
      "popupCloseDate",
      getToday()
    );
  }


  // 팝업창 닫기
  popup.style.display = "none";

});
/* =========================================
   TOP 버튼 기능
========================================= */

$(function () {

  /* -----------------------------------------
     TOP 버튼 가져오기
  ------------------------------------------ */
  const $topBtn = $("#topBtn");


  /* -----------------------------------------
     스크롤 이벤트

     페이지가 일정 거리 이상 내려가면
     TOP 버튼을 보여줍니다.
  ------------------------------------------ */
  $(window).on("scroll", function () {

    /* 현재 스크롤 위치 */
    const scrollTop = $(window).scrollTop();


    /* 300px 이상 스크롤 되었을 때 */
    if (scrollTop > 300) {

      $topBtn.addClass("show");

    } else {

      /* 상단에 가까우면 버튼 숨기기 */
      $topBtn.removeClass("show");

    }

  });


  /* -----------------------------------------
     TOP 버튼 클릭 이벤트
  ------------------------------------------ */
  $topBtn.on("click", function () {

    /* 
       html, body를 맨 위로 이동
       700ms 동안 부드럽게 애니메이션
    */
    $("html, body")
      .stop()
      .animate(
        {
          scrollTop: 0
        },
        700
      );

  });

});