'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const menuButton = document.querySelector('.mobile-menu-btn');
  const searchForm = document.querySelector('.search-form');
  const searchInput = document.querySelector('.search-input');
  const toast = document.querySelector('.site-toast');

  let cartCount = 0;
  let toastTimer;

  /* =========================
     공통 Toast 알림
  ========================= */
  const showToast = (message) => {
    if (!toast) return;

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');

    toastTimer = window.setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  };

  /* =========================
     모바일 메뉴 열기 / 닫기
  ========================= */
  if (header && menuButton) {
    menuButton.addEventListener('click', () => {
      const isOpen = header.classList.toggle('menu-open');

      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('menu-open')) {
        header.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', '메뉴 열기');
        menuButton.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        header.classList.remove('menu-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', '메뉴 열기');
      }
    });
  }

  /* =========================
     장바구니 개수 표시 생성
  ========================= */
  const utilityLinks = [...document.querySelectorAll('.utility-menu a')];
  const headerCartLink = utilityLinks.find((link) =>
    link.textContent.replace(/\s/g, '').includes('장바구니')
  );

  let cartCountElement = null;

  if (headerCartLink) {
    headerCartLink.classList.add('header-cart-link');

    cartCountElement = document.createElement('span');
    cartCountElement.className = 'cart-count';
    cartCountElement.textContent = '0';
    cartCountElement.setAttribute('aria-label', '장바구니 상품 0개');

    headerCartLink.appendChild(cartCountElement);
  }

  const updateCart = (amount = 1) => {
    cartCount += amount;

    if (cartCountElement) {
      cartCountElement.textContent = String(cartCount);
      cartCountElement.setAttribute('aria-label', `장바구니 상품 ${cartCount}개`);
    }

    showToast(`${amount}개 상품을 장바구니에 담았습니다. 현재 ${cartCount}개입니다.`);
  };

  /* =========================
     개별 장바구니 버튼 동작
  ========================= */
  document.querySelectorAll('.cart-icon, .recommend-cart-icon').forEach((button) => {
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');

    const activateCart = (event) => {
      event.preventDefault();
      event.stopPropagation();
      updateCart(1);
    };

    button.addEventListener('click', activateCart);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        activateCart(event);
      }
    });
  });

  /* =========================
     추천 상품 한번에 담기
  ========================= */
  const allRecommendCartButton = document.querySelector('.recommend-cart-button');

  if (allRecommendCartButton) {
    allRecommendCartButton.addEventListener('click', (event) => {
      event.preventDefault();

      const amount = document.querySelectorAll('.recommend-product-card').length || 1;
      updateCart(amount);
    });
  }

  /* =========================
     추천 탭 / MD 탭 활성화
  ========================= */
  const setupTabs = (selector) => {
    document.querySelectorAll(selector).forEach((tab) => {
      tab.addEventListener('click', () => {
        const parent = tab.parentElement;

        if (parent) {
          parent.querySelectorAll(selector).forEach((item) => {
            item.classList.remove('active');
            item.setAttribute('aria-selected', 'false');
          });
        }

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        showToast(`${tab.textContent.trim()} 메뉴를 선택했습니다.`);
      });
    });
  };

  setupTabs('.recommend-tab');
  setupTabs('.md-tab');

  /* =========================
     검색 기능
     - 상품명을 기준으로 첫 번째 일치 상품으로 이동
     - 일치 상품을 잠시 강조
  ========================= */
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const keyword = searchInput.value.trim().toLowerCase();

      document.querySelectorAll('.search-highlight').forEach((item) => {
        item.classList.remove('search-highlight');
      });

      if (!keyword) {
        showToast('검색할 반찬 이름을 입력해주세요.');
        searchInput.focus();
        return;
      }

      const cards = [
        ...document.querySelectorAll(
          '.product-card, .home-meal-card, .recommend-product-card, .md-product-card'
        ),
      ];

      const matchedCard = cards.find((card) => {
        const name = card.querySelector(
          '.product-name, .home-meal-name, .recommend-product-name, .md-product-name'
        );

        return name && name.textContent.trim().toLowerCase().includes(keyword);
      });

      if (!matchedCard) {
        showToast(`“${searchInput.value.trim()}” 검색 결과가 없습니다.`);
        return;
      }

      matchedCard.classList.add('search-highlight');
      matchedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      showToast(`“${searchInput.value.trim()}” 상품을 찾았습니다.`);

      window.setTimeout(() => {
        matchedCard.classList.remove('search-highlight');
      }, 2600);
    });
  }

  /* =========================
     빈 링크(#) 클릭 시 화면 상단 이동 방지
  ========================= */
  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (
        link.classList.contains('recommend-cart-button') ||
        link.closest('.cart-icon') ||
        link.closest('.recommend-cart-icon')
      ) {
        return;
      }

      event.preventDefault();
    });
  });
});
