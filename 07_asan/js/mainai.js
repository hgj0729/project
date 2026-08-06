"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const mainVisualSwiper = new Swiper(".main-visual-swiper", {
    // 기본 설정
    direction: "horizontal",
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 700,
    loop: true,

    // 마우스 및 터치
    allowTouchMove: true,
    grabCursor: true,
    simulateTouch: true,
    touchRatio: 1,

    // 자동 재생
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    },

    // 페이지 표시
    pagination: {
      el: ".main-visual-swiper .swiper-pagination",
      clickable: true
    },

    // 좌우 버튼
    navigation: {
      nextEl: ".main-visual-swiper .swiper-button-next",
      prevEl: ".main-visual-swiper .swiper-button-prev"
    },

    // 접근성
    a11y: {
      enabled: true,
      prevSlideMessage: "이전 배너",
      nextSlideMessage: "다음 배너",
      firstSlideMessage: "첫 번째 배너입니다",
      lastSlideMessage: "마지막 배너입니다",
      paginationBulletMessage: "{{index}}번째 배너로 이동"
    },

    // 키보드 조작
    keyboard: {
      enabled: true,
      onlyInViewport: true
    }
  });

  const menuButton = document.querySelector(".menu-button");
  const searchButton = document.querySelector(".search-button");

  menuButton.addEventListener("click", function () {
    console.log("전체 메뉴 버튼 클릭");
  });

  searchButton.addEventListener("click", function () {
    console.log("검색 버튼 클릭");
  });

  // 페이지가 다시 활성화되었을 때 자동 재생 복구
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      mainVisualSwiper.autoplay.stop();
    } else {
      mainVisualSwiper.autoplay.start();
    }
  });
});