document.addEventListener("DOMContentLoaded", function () {
    const mainSwiper = new Swiper(".main-swiper", {
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 700,
        loop: true,

        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },

        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },

        pagination: {
            el: ".swiper-pagination",
            clickable: true
        },

        keyboard: {
            enabled: true
        },

        a11y: {
            enabled: true,
            prevSlideMessage: "이전 슬라이드",
            nextSlideMessage: "다음 슬라이드",
            firstSlideMessage: "첫 번째 슬라이드입니다",
            lastSlideMessage: "마지막 슬라이드입니다"
        }
    });
});