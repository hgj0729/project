/* =========================
   동네ON JavaScript
   Kakao Map 연동 버전
========================= */

// -------------------------
// 1. 기본 시설 데이터
//    lat/lng 좌표는 예시값입니다.
// -------------------------
const facilities = [
  {
    id: 1,
    name: "행복약국",
    category: "약국",
    address: "서울시 마포구 월드컵로 18",
    distance: 350,
    rating: 4.7,
    open: true,
    hours: "09:00 ~ 21:00",
    phone: "02-1234-1001",
    image: "./images/pharmacy01.jpg",
    lat: 37.5562,
    lng: 126.9106
  },
  {
    id: 2,
    name: "중앙 공영주차장",
    category: "주차장",
    address: "서울시 마포구 성산로 25",
    distance: 520,
    rating: 4.4,
    open: true,
    hours: "24시간",
    phone: "02-1234-1002",
    image: "./images/parking01.jpg",
    lat: 37.5575,
    lng: 126.9127
  },
  {
    id: 3,
    name: "우리동네 편의점",
    category: "편의점",
    address: "서울시 마포구 모래내로 44",
    distance: 700,
    rating: 4.3,
    open: true,
    hours: "24시간",
    phone: "02-1234-1003",
    image: "./images/store01.jpg",
    lat: 37.5547,
    lng: 126.9142
  },
  {
    id: 4,
    name: "마포365의원",
    category: "병원",
    address: "서울시 마포구 월드컵북로 77",
    distance: 860,
    rating: 4.6,
    open: false,
    hours: "09:00 ~ 18:00",
    phone: "02-1234-1004",
    image: "./images/hospital01.jpg",
    lat: 37.5590,
    lng: 126.9090
  },
  {
    id: 5,
    name: "성산 공공화장실",
    category: "공공화장실",
    address: "서울시 마포구 성산공원길 12",
    distance: 920,
    rating: 4.1,
    open: true,
    hours: "06:00 ~ 23:00",
    phone: "시설 문의 없음",
    image: "./images/toilet01.jpg",
    lat: 37.5602,
    lng: 126.9134
  },
  {
    id: 6,
    name: "클린데이 세탁소",
    category: "세탁소",
    address: "서울시 마포구 월드컵로 101",
    distance: 1100,
    rating: 4.8,
    open: true,
    hours: "08:30 ~ 20:30",
    phone: "02-1234-1006",
    image: "./images/laundry01.jpg",
    lat: 37.5534,
    lng: 126.9083
  },
  {
    id: 7,
    name: "카페 모먼트",
    category: "카페",
    address: "서울시 마포구 성미산로 30",
    distance: 1280,
    rating: 4.9,
    open: true,
    hours: "08:00 ~ 22:00",
    phone: "02-1234-1007",
    image: "./images/cafe01.jpg",
    lat: 37.5580,
    lng: 126.9160
  },
  {
    id: 8,
    name: "우리은행 365 ATM",
    category: "ATM",
    address: "서울시 마포구 월드컵북로 201",
    distance: 1450,
    rating: 4.0,
    open: true,
    hours: "07:00 ~ 23:30",
    phone: "1588-5000",
    image: "./images/atm01.jpg",
    lat: 37.5519,
    lng: 126.9120
  }
];

const categories = [
  ["전체", "✨"],
  ["약국", "💊"],
  ["병원", "🏥"],
  ["편의점", "🏪"],
  ["주차장", "🅿️"],
  ["공공화장실", "🚻"],
  ["세탁소", "🧺"],
  ["카페", "☕"],
  ["ATM", "🏧"]
];

// -------------------------
// 2. LocalStorage
// -------------------------
const STORAGE = {
  favorites: "dongneon_favorites",
  reviews: "dongneon_reviews",
  history: "dongneon_history"
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error("LocalStorage 읽기 오류:", error);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("LocalStorage 저장 오류:", error);
    showToast("데이터 저장에 실패했습니다.");
    return false;
  }
}

let favorites = loadJSON(STORAGE.favorites, []);
let reviews = loadJSON(STORAGE.reviews, []);
let history = loadJSON(STORAGE.history, []);

// -------------------------
// 3. App 상태
// -------------------------
let currentScreen = "home";
let selectedCategory = "전체";
let currentQuery = "";
let selectedFacilityId = null;
let selectedRating = 0;
let editingReviewId = null;

// 카카오맵 상태
let kakaoMap = null;
let mapMarkers = [];
let currentLocationMarker = null;
let currentCoords = {
  lat: 37.5563,
  lng: 126.9108
};

// -------------------------
// 4. DOM
// -------------------------
const screens = [...document.querySelectorAll(".screen")];
const navButtons = [...document.querySelectorAll(".nav-btn")];
const backBtn = document.getElementById("backBtn");
const toast = document.getElementById("toast");

const homeCategories = document.getElementById("homeCategories");
const nearFacilityList = document.getElementById("nearFacilityList");
const filterRow = document.getElementById("filterRow");
const facilityList = document.getElementById("facilityList");
const facilityEmpty = document.getElementById("facilityEmpty");
const resultTitle = document.getElementById("resultTitle");
const resultCount = document.getElementById("resultCount");

const detailContent = document.getElementById("detailContent");
const favoriteList = document.getElementById("favoriteList");
const favoriteEmpty = document.getElementById("favoriteEmpty");

const favoriteCount = document.getElementById("favoriteCount");
const reviewCount = document.getElementById("reviewCount");
const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");

const mapMessage = document.getElementById("mapMessage");

// -------------------------
// 5. 공통 함수
// -------------------------
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function navigate(screenName) {
  currentScreen = screenName;

  screens.forEach(screen => {
    screen.classList.toggle("active", screen.dataset.screen === screenName);
  });

  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.go === screenName);
  });

  if (screenName === "detail") {
    navButtons.forEach(btn => btn.classList.remove("active"));
  }

  backBtn.style.display = screenName === "detail" ? "block" : "none";

  if (screenName === "nearby") {
    renderNearby();

    // display:none 상태에서 만들어진 지도는 크기 계산이 틀어질 수 있으므로 relayout 필요
    setTimeout(() => {
      if (kakaoMap) {
        kakaoMap.relayout();
        kakaoMap.setCenter(
          new kakao.maps.LatLng(currentCoords.lat, currentCoords.lng)
        );
      }
    }, 120);
  }

  if (screenName === "favorite") renderFavorites();
  if (screenName === "my") renderMy();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getFacility(id) {
  return facilities.find(item => item.id === Number(id));
}

function isFavorite(id) {
  return favorites.includes(Number(id));
}

function formatDistance(meters) {
  return meters < 1000
    ? `${meters}m`
    : `${(meters / 1000).toFixed(1)}km`;
}

function safeText(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFacilityReviews(facilityId) {
  return reviews.filter(review => review.facilityId === Number(facilityId));
}

function getCalculatedRating(facility) {
  const facilityReviews = getFacilityReviews(facility.id);

  if (!facilityReviews.length) return facility.rating;

  const sum = facilityReviews.reduce(
    (acc, review) => acc + review.rating,
    0
  );

  return Number((sum / facilityReviews.length).toFixed(1));
}

function addSearchHistory(keyword) {
  const value = keyword.trim();
  if (!value) return;

  history = [
    value,
    ...history.filter(item => item !== value)
  ].slice(0, 10);

  saveJSON(STORAGE.history, history);
}

function fallbackImage(img) {
  img.onerror = null;

  img.src =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
        <rect width="100%" height="100%" fill="#e9edf4"/>
        <text x="50%" y="48%" text-anchor="middle" font-size="32" fill="#687083">동네ON</text>
        <text x="50%" y="60%" text-anchor="middle" font-size="18" fill="#8b92a0">./images/이미지파일명</text>
      </svg>
    `);
}

// -------------------------
// 6. 카카오맵
// -------------------------
function initKakaoMap() {
  // 카카오 SDK 자체가 로드되지 않은 경우
  if (typeof kakao === "undefined" || !kakao.maps) {
    console.warn("카카오맵 SDK를 불러오지 못했습니다.");
    mapMessage.classList.add("show");
    return;
  }

  kakao.maps.load(() => {
    try {
      const container = document.getElementById("kakaoMap");

      const options = {
        center: new kakao.maps.LatLng(
          currentCoords.lat,
          currentCoords.lng
        ),
        level: 4
      };

      kakaoMap = new kakao.maps.Map(container, options);

      mapMessage.classList.remove("show");

      renderKakaoMarkers(getFilteredFacilities());
      renderCurrentLocationMarker();

    } catch (error) {
      console.error("카카오맵 초기화 오류:", error);
      mapMessage.classList.add("show");
    }
  });
}

function clearMapMarkers() {
  mapMarkers.forEach(marker => marker.setMap(null));
  mapMarkers = [];
}

function renderKakaoMarkers(items) {
  if (!kakaoMap || typeof kakao === "undefined") return;

  clearMapMarkers();

  items.forEach(facility => {
    const markerPosition = new kakao.maps.LatLng(
      facility.lat,
      facility.lng
    );

    const marker = new kakao.maps.Marker({
      position: markerPosition,
      map: kakaoMap
    });

    const infoWindow = new kakao.maps.InfoWindow({
      content: `
        <div style="
          padding:8px 10px;
          font-size:12px;
          white-space:nowrap;
          line-height:1.4;
        ">
          <strong>${safeText(facility.name)}</strong><br>
          ${safeText(facility.category)}
        </div>
      `
    });

    kakao.maps.event.addListener(marker, "click", () => {
      infoWindow.open(kakaoMap, marker);

      setTimeout(() => {
        renderDetail(facility.id);
      }, 250);
    });

    mapMarkers.push(marker);
  });
}

function renderCurrentLocationMarker() {
  if (!kakaoMap || typeof kakao === "undefined") return;

  if (currentLocationMarker) {
    currentLocationMarker.setMap(null);
  }

  const markerPosition = new kakao.maps.LatLng(
    currentCoords.lat,
    currentCoords.lng
  );

  currentLocationMarker = new kakao.maps.Marker({
    position: markerPosition,
    map: kakaoMap
  });

  kakaoMap.setCenter(markerPosition);
}

function moveMapToFacility(facility) {
  if (!kakaoMap || typeof kakao === "undefined") return;

  const moveLatLng = new kakao.maps.LatLng(
    facility.lat,
    facility.lng
  );

  kakaoMap.panTo(moveLatLng);
}

// -------------------------
// 7. 시설 카드
// -------------------------
function facilityCardHTML(facility, removable = false) {
  const rating = getCalculatedRating(facility);
  const fav = isFavorite(facility.id);

  return `
    <article class="facility-card" data-facility-id="${facility.id}">
      <img
        class="thumb"
        src="${facility.image}"
        alt="${safeText(facility.name)}"
        onerror="fallbackImage(this)"
      />

      <div class="facility-info">
        <h3>${safeText(facility.name)}</h3>

        <div class="meta">
          ${safeText(facility.category)}
          · ★ ${rating}
          · ${formatDistance(facility.distance)}
          · ${facility.open ? "영업중" : "영업종료"}
        </div>

        <div class="address">
          ${safeText(facility.address)}
        </div>
      </div>

      ${
        removable
          ? `
            <button
              class="card-action delete-favorite"
              data-id="${facility.id}"
              type="button"
              aria-label="즐겨찾기 삭제"
            >×</button>
          `
          : `
            <button
              class="card-action quick-favorite"
              data-id="${facility.id}"
              type="button"
              aria-label="즐겨찾기"
            >${fav ? "♥" : "♡"}</button>
          `
      }
    </article>
  `;
}

// -------------------------
// 8. 홈
// -------------------------
function renderHome() {
  homeCategories.innerHTML = categories
    .filter(([name]) => name !== "전체")
    .map(([name, icon]) => `
      <button
        class="category-btn home-category"
        type="button"
        data-category="${name}"
      >
        <span>${icon}</span>
        <b>${name}</b>
      </button>
    `)
    .join("");

  nearFacilityList.innerHTML = facilities
    .slice()
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(item => facilityCardHTML(item))
    .join("");
}

// -------------------------
// 9. 주변시설
// -------------------------
function getFilteredFacilities() {
  const query = currentQuery.trim().toLowerCase();

  return facilities
    .filter(item => {
      return selectedCategory === "전체"
        || item.category === selectedCategory;
    })
    .filter(item => {
      if (!query) return true;

      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.address.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a.distance - b.distance);
}

function renderFilters() {
  filterRow.innerHTML = categories
    .map(([name]) => `
      <button
        class="filter-chip ${selectedCategory === name ? "active" : ""}"
        type="button"
        data-filter="${name}"
      >
        ${name}
      </button>
    `)
    .join("");
}

function renderNearby() {
  renderFilters();

  const items = getFilteredFacilities();

  resultTitle.textContent =
    selectedCategory === "전체"
      ? "주변 시설"
      : `주변 ${selectedCategory}`;

  resultCount.textContent = `${items.length}개`;

  facilityList.innerHTML = items
    .map(item => facilityCardHTML(item))
    .join("");

  facilityEmpty.style.display =
    items.length ? "none" : "block";

  renderKakaoMarkers(items);
}

// -------------------------
// 10. 상세 + 후기 CRUD
// -------------------------
function renderDetail(facilityId) {
  const facility = getFacility(facilityId);

  if (!facility) {
    showToast("시설 정보를 찾을 수 없습니다.");
    navigate("nearby");
    return;
  }

  selectedFacilityId = facility.id;
  selectedRating = 0;
  editingReviewId = null;

  const facilityReviews = getFacilityReviews(facility.id);
  const rating = getCalculatedRating(facility);

  detailContent.innerHTML = `
    <div class="detail-visual">
      <img
        src="${facility.image}"
        alt="${safeText(facility.name)}"
        onerror="fallbackImage(this)"
      />
    </div>

    <div class="detail-body">
      <div class="detail-title-row">
        <div>
          <h1>${safeText(facility.name)}</h1>

          <p class="detail-meta">
            ${safeText(facility.category)}
            · ★ <span id="detailRating">${rating}</span>
            · ${formatDistance(facility.distance)}
          </p>
        </div>

        <button
          class="favorite-large"
          id="detailFavoriteBtn"
          type="button"
        >
          ${isFavorite(facility.id) ? "♥" : "♡"}
        </button>
      </div>

      <div class="info-box">
        <div class="info-row">
          <b>주소</b>
          <span>${safeText(facility.address)}</span>
        </div>

        <div class="info-row">
          <b>운영시간</b>
          <span>
            ${safeText(facility.hours)}
            · ${facility.open ? "현재 영업중" : "현재 영업종료"}
          </span>
        </div>

        <div class="info-row">
          <b>전화번호</b>
          <span>${safeText(facility.phone)}</span>
        </div>
      </div>

      <div class="action-row">
        <button
          class="primary-btn"
          id="routeBtn"
          type="button"
        >
          길찾기
        </button>

        <button
          class="outline-btn"
          id="detailFavoriteTextBtn"
          type="button"
        >
          ${
            isFavorite(facility.id)
              ? "즐겨찾기 해제"
              : "즐겨찾기 저장"
          }
        </button>
      </div>

      <section class="review-section">
        <h2>이용 후기</h2>

        <form
          class="review-form"
          id="reviewForm"
        >
          <div
            class="rating-picker"
            id="ratingPicker"
          >
            ${[1,2,3,4,5]
              .map(num => `
                <button
                  class="star-btn"
                  type="button"
                  data-rating="${num}"
                  aria-label="${num}점"
                >
                  ★
                </button>
              `)
              .join("")}
          </div>

          <textarea
            id="reviewText"
            maxlength="300"
            placeholder="이 시설은 어땠나요?"
          ></textarea>

          <div class="form-actions">
            <button
              class="outline-btn"
              id="cancelEditBtn"
              type="button"
              style="display:none;"
            >
              수정 취소
            </button>

            <button
              class="primary-btn"
              type="submit"
              id="reviewSubmitBtn"
            >
              후기 등록
            </button>
          </div>
        </form>

        <div
          class="review-list"
          id="detailReviewList"
        >
          ${renderReviewCards(facilityReviews)}
        </div>

        <div
          class="empty small"
          id="reviewEmpty"
          style="display:${facilityReviews.length ? "none" : "block"};"
        >
          아직 작성된 후기가 없습니다.
        </div>
      </section>
    </div>
  `;

  bindDetailEvents(facility);
  navigate("detail");
}

function renderReviewCards(items) {
  return items
    .map(review => `
      <article
        class="review-card"
        data-review-id="${review.id}"
      >
        <div class="review-card-head">
          <div>
            <b>
              ${"★".repeat(review.rating)}
              ${"☆".repeat(5 - review.rating)}
            </b>
            <small>${safeText(review.date)}</small>
          </div>

          <div class="review-actions">
            <button
              type="button"
              class="edit-review"
              data-id="${review.id}"
            >
              수정
            </button>

            <button
              type="button"
              class="delete delete-review"
              data-id="${review.id}"
            >
              삭제
            </button>
          </div>
        </div>

        <p>${safeText(review.text)}</p>
      </article>
    `)
    .join("");
}

function bindDetailEvents(facility) {
  document
    .getElementById("detailFavoriteBtn")
    .addEventListener("click", () => {
      toggleFavorite(facility.id, true);
    });

  document
    .getElementById("detailFavoriteTextBtn")
    .addEventListener("click", () => {
      toggleFavorite(facility.id, true);
    });

  document
    .getElementById("routeBtn")
    .addEventListener("click", () => {
      // 카카오맵으로 돌아가 해당 시설 위치로 이동
      navigate("nearby");

      setTimeout(() => {
        moveMapToFacility(facility);
      }, 180);

      showToast(`${facility.name} 위치로 지도를 이동했습니다.`);
    });

  const ratingPicker =
    document.getElementById("ratingPicker");

  ratingPicker.addEventListener("click", event => {
    const button =
      event.target.closest("[data-rating]");

    if (!button) return;

    selectedRating =
      Number(button.dataset.rating);

    updateRatingPicker();
  });

  document
    .getElementById("reviewForm")
    .addEventListener("submit", event => {
      event.preventDefault();
      saveReview(facility.id);
    });

  document
    .getElementById("cancelEditBtn")
    .addEventListener("click", resetReviewForm);

  document
    .getElementById("detailReviewList")
    .addEventListener("click", event => {
      const editButton =
        event.target.closest(".edit-review");

      const deleteButton =
        event.target.closest(".delete-review");

      if (editButton) {
        startEditReview(
          Number(editButton.dataset.id)
        );
      }

      if (deleteButton) {
        deleteReview(
          Number(deleteButton.dataset.id),
          facility.id
        );
      }
    });
}

function updateRatingPicker() {
  document
    .querySelectorAll(".star-btn")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        Number(btn.dataset.rating) <= selectedRating
      );
    });
}

function saveReview(facilityId) {
  const textInput =
    document.getElementById("reviewText");

  const text =
    textInput.value.trim();

  if (!selectedRating) {
    showToast("별점을 선택해주세요.");
    return;
  }

  if (!text) {
    showToast("후기 내용을 입력해주세요.");
    textInput.focus();
    return;
  }

  if (editingReviewId) {
    const target =
      reviews.find(item => item.id === editingReviewId);

    if (target) {
      target.rating = selectedRating;
      target.text = text;
      target.date =
        new Date().toLocaleDateString("ko-KR");

      showToast("후기가 수정되었습니다.");
    }
  } else {
    reviews.unshift({
      id: Date.now(),
      facilityId: Number(facilityId),
      rating: selectedRating,
      text,
      date: new Date().toLocaleDateString("ko-KR")
    });

    showToast("후기가 등록되었습니다.");
  }

  saveJSON(STORAGE.reviews, reviews);
  renderDetail(facilityId);
}

function startEditReview(reviewId) {
  const review =
    reviews.find(item => item.id === reviewId);

  if (!review) return;

  editingReviewId = review.id;
  selectedRating = review.rating;

  document.getElementById("reviewText").value =
    review.text;

  document.getElementById("reviewSubmitBtn").textContent =
    "수정 저장";

  document.getElementById("cancelEditBtn").style.display =
    "inline-block";

  updateRatingPicker();

  document.getElementById("reviewText").focus();
}

function resetReviewForm() {
  editingReviewId = null;
  selectedRating = 0;

  document.getElementById("reviewText").value =
    "";

  document.getElementById("reviewSubmitBtn").textContent =
    "후기 등록";

  document.getElementById("cancelEditBtn").style.display =
    "none";

  updateRatingPicker();
}

function deleteReview(reviewId, facilityId) {
  const ok =
    window.confirm("이 후기를 삭제할까요?");

  if (!ok) return;

  reviews =
    reviews.filter(item => item.id !== reviewId);

  saveJSON(STORAGE.reviews, reviews);

  showToast("후기가 삭제되었습니다.");

  renderDetail(facilityId);
}

// -------------------------
// 11. 즐겨찾기
// -------------------------
function toggleFavorite(id, rerenderDetail = false) {
  const facilityId = Number(id);

  if (isFavorite(facilityId)) {
    favorites =
      favorites.filter(item => item !== facilityId);

    showToast("즐겨찾기에서 삭제했습니다.");
  } else {
    favorites.unshift(facilityId);

    showToast("즐겨찾기에 저장했습니다.");
  }

  saveJSON(STORAGE.favorites, favorites);

  renderHome();

  if (currentScreen === "nearby") {
    renderNearby();
  }

  if (currentScreen === "favorite") {
    renderFavorites();
  }

  if (currentScreen === "my") {
    renderMy();
  }

  if (rerenderDetail && selectedFacilityId) {
    renderDetail(selectedFacilityId);
  }
}

function renderFavorites() {
  const items =
    favorites.map(getFacility).filter(Boolean);

  favoriteList.innerHTML =
    items.map(item =>
      facilityCardHTML(item, true)
    ).join("");

  favoriteEmpty.style.display =
    items.length ? "none" : "block";
}

// -------------------------
// 12. MY
// -------------------------
function renderMy() {
  favoriteCount.textContent =
    favorites.length;

  reviewCount.textContent =
    reviews.length;

  historyList.innerHTML =
    history
      .map((keyword, index) => `
        <div class="history-item">
          <button
            type="button"
            class="history-search"
            data-keyword="${safeText(keyword)}"
          >
            ${safeText(keyword)}
          </button>

          <button
            type="button"
            class="history-delete"
            data-index="${index}"
            aria-label="검색 기록 삭제"
          >
            ×
          </button>
        </div>
      `)
      .join("");

  historyEmpty.style.display =
    history.length ? "none" : "block";
}

// -------------------------
// 13. 검색
// -------------------------
function searchAndGo(keyword) {
  currentQuery = keyword.trim();
  selectedCategory = "전체";

  if (currentQuery) {
    addSearchHistory(currentQuery);
  }

  document
    .getElementById("nearbySearchInput")
    .value = currentQuery;

  navigate("nearby");
}

// -------------------------
// 14. 현재 위치
// -------------------------
document
  .getElementById("locationBtn")
  .addEventListener("click", () => {
    const locationText =
      document.getElementById("locationText");

    if (!navigator.geolocation) {
      showToast(
        "현재 브라우저에서 위치 기능을 지원하지 않습니다."
      );
      return;
    }

    locationText.textContent =
      "현재 위치를 확인하는 중...";

    navigator.geolocation.getCurrentPosition(
      position => {
        const {
          latitude,
          longitude
        } = position.coords;

        currentCoords = {
          lat: latitude,
          lng: longitude
        };

        locationText.textContent =
          `현재 위치 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        if (kakaoMap) {
          renderCurrentLocationMarker();
        }

        showToast("현재 위치를 확인했습니다.");
      },

      error => {
        console.warn(
          "위치 확인 오류:",
          error
        );

        locationText.textContent =
          "위치 권한이 필요합니다.";

        showToast(
          "위치 권한을 허용하거나 직접 검색해주세요."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 8000
      }
    );
  });

// -------------------------
// 15. 전역 이벤트
// -------------------------
document.addEventListener("click", event => {
  const goButton =
    event.target.closest("[data-go]");

  if (goButton) {
    navigate(goButton.dataset.go);
    return;
  }

  const homeCategory =
    event.target.closest(".home-category");

  if (homeCategory) {
    selectedCategory =
      homeCategory.dataset.category;

    currentQuery = "";

    document
      .getElementById("nearbySearchInput")
      .value = "";

    navigate("nearby");
    return;
  }

  const filter =
    event.target.closest("[data-filter]");

  if (filter) {
    selectedCategory =
      filter.dataset.filter;

    renderNearby();
    return;
  }

  const quickFavorite =
    event.target.closest(".quick-favorite");

  if (quickFavorite) {
    event.stopPropagation();

    toggleFavorite(
      quickFavorite.dataset.id
    );

    return;
  }

  const deleteFavoriteBtn =
    event.target.closest(".delete-favorite");

  if (deleteFavoriteBtn) {
    event.stopPropagation();

    toggleFavorite(
      deleteFavoriteBtn.dataset.id
    );

    return;
  }

  const facilityCard =
    event.target.closest("[data-facility-id]");

  if (facilityCard) {
    renderDetail(
      Number(facilityCard.dataset.facilityId)
    );
  }
});

backBtn.addEventListener("click", () => {
  navigate("nearby");
});

document
  .getElementById("homeSearchForm")
  .addEventListener("submit", event => {
    event.preventDefault();

    searchAndGo(
      document.getElementById("homeSearchInput").value
    );
  });

document
  .getElementById("nearbySearchForm")
  .addEventListener("submit", event => {
    event.preventDefault();

    currentQuery =
      document
        .getElementById("nearbySearchInput")
        .value
        .trim();

    if (currentQuery) {
      addSearchHistory(currentQuery);
    }

    renderNearby();
  });

document
  .getElementById("nearbySearchInput")
  .addEventListener("input", event => {
    currentQuery =
      event.target.value;

    renderNearby();
  });

document
  .getElementById("favoriteList")
  .addEventListener("click", event => {
    const deleteButton =
      event.target.closest(".delete-favorite");

    if (deleteButton) {
      event.stopPropagation();

      toggleFavorite(
        Number(deleteButton.dataset.id)
      );
    }
  });

document
  .getElementById("clearHistoryBtn")
  .addEventListener("click", () => {
    history = [];

    saveJSON(
      STORAGE.history,
      history
    );

    renderMy();

    showToast(
      "검색 기록을 삭제했습니다."
    );
  });

historyList.addEventListener("click", event => {
  const searchBtn =
    event.target.closest(".history-search");

  const deleteBtn =
    event.target.closest(".history-delete");

  if (searchBtn) {
    searchAndGo(
      searchBtn.dataset.keyword
    );
  }

  if (deleteBtn) {
    const index =
      Number(deleteBtn.dataset.index);

    history.splice(index, 1);

    saveJSON(
      STORAGE.history,
      history
    );

    renderMy();
  }
});

document
  .getElementById("resetDataBtn")
  .addEventListener("click", () => {
    const ok =
      window.confirm(
        "즐겨찾기, 후기, 검색 기록을 모두 삭제할까요?"
      );

    if (!ok) return;

    favorites = [];
    reviews = [];
    history = [];

    Object
      .values(STORAGE)
      .forEach(key => {
        localStorage.removeItem(key);
      });

    renderHome();
    renderNearby();
    renderFavorites();
    renderMy();

    showToast(
      "사용자 데이터를 초기화했습니다."
    );
  });

// -------------------------
// 16. 초기 실행
// -------------------------
renderHome();
renderNearby();
renderFavorites();
renderMy();
navigate("home");

// 카카오맵은 SDK 로드 상태 확인 후 초기화
window.addEventListener("load", () => {
  initKakaoMap();
});
