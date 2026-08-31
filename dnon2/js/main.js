/* =========================================================
   동네ON - 실제 내 위치 기반 카카오 장소검색 버전

   핵심 기능
   1. Geolocation으로 사용자의 현재 위치 확인
   2. Kakao Maps services.Places로 실제 주변 장소 검색
   3. 거리순 정렬
   4. 실제 장소 데이터를 목록/마커/상세 화면에 출력
   5. 즐겨찾기, 후기 CRUD, 최근검색은 LocalStorage 저장
========================================================= */

// ---------------------------------------------------------
// 1. 카테고리 설정
// 카카오 카테고리 코드가 있는 항목은 categorySearch 사용,
// 없는 항목은 현재 위치 기반 keywordSearch 사용
// ---------------------------------------------------------
const categoryConfigs = {
  "약국": {
    type: "category",
    code: "PM9",
    image: "./images/pharmacy01.jpg"
  },
  "병원": {
    type: "category",
    code: "HP8",
    image: "./images/hospital01.jpg"
  },
  "편의점": {
    type: "category",
    code: "CS2",
    image: "./images/store01.jpg"
  },
  "주차장": {
    type: "category",
    code: "PK6",
    image: "./images/parking01.jpg"
  },
  "카페": {
    type: "category",
    code: "CE7",
    image: "./images/cafe01.jpg"
  },
  "공공화장실": {
    type: "keyword",
    keyword: "공공화장실",
    image: "./images/toilet01.jpg"
  },
  "세탁소": {
    type: "keyword",
    keyword: "세탁소",
    image: "./images/laundry01.jpg"
  },
  "ATM": {
    type: "keyword",
    keyword: "ATM",
    image: "./images/atm01.jpg"
  }
};

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

// 내 위치 주변 검색 반경(m)
const SEARCH_RADIUS = 3000;

// ---------------------------------------------------------
// 2. LocalStorage
// ---------------------------------------------------------
const STORAGE = {
  favorites: "dongneon_favorites",
  favoritePlaces: "dongneon_favorite_places",
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
let favoritePlaces = loadJSON(STORAGE.favoritePlaces, {});
let reviews = loadJSON(STORAGE.reviews, []);
let history = loadJSON(STORAGE.history, []);

// ---------------------------------------------------------
// 3. App 상태
// ---------------------------------------------------------
let facilities = [];
let currentScreen = "home";
let selectedCategory = "전체";
let currentQuery = "";
let selectedFacilityId = null;
let selectedRating = 0;
let editingReviewId = null;

let kakaoMap = null;
let placesService = null;
let mapMarkers = [];
let currentLocationMarker = null;
let infoWindow = null;

let hasUserLocation = false;
let currentCoords = {
  // 위치 권한을 받기 전 지도 기본 중심
  lat: 37.566826,
  lng: 126.9786567
};

// ---------------------------------------------------------
// 4. DOM
// ---------------------------------------------------------
const screens = [...document.querySelectorAll(".screen")];
const navButtons = [...document.querySelectorAll(".nav-btn")];
const backBtn = document.getElementById("backBtn");
const toast = document.getElementById("toast");

const homeCategories = document.getElementById("homeCategories");
const nearFacilityList = document.getElementById("nearFacilityList");
const homeNearbyEmpty = document.getElementById("homeNearbyEmpty");
const nearbyGuide = document.getElementById("nearbyGuide");
const refreshNearbyBtn = document.getElementById("refreshNearbyBtn");

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

// ---------------------------------------------------------
// 5. 공통
// ---------------------------------------------------------
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function navigate(screenName) {
  currentScreen = screenName;

  screens.forEach(screen => {
    screen.classList.toggle(
      "active",
      screen.dataset.screen === screenName
    );
  });

  navButtons.forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.go === screenName
    );
  });

  if (screenName === "detail") {
    navButtons.forEach(btn => btn.classList.remove("active"));
  }

  backBtn.style.display =
    screenName === "detail" ? "block" : "none";

  if (screenName === "nearby") {
    renderNearby();

    setTimeout(() => {
      if (kakaoMap) {
        kakaoMap.relayout();

        if (hasUserLocation) {
          kakaoMap.setCenter(
            new kakao.maps.LatLng(
              currentCoords.lat,
              currentCoords.lng
            )
          );
        }
      }
    }, 120);
  }

  if (screenName === "favorite") renderFavorites();
  if (screenName === "my") renderMy();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function safeText(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDistance(meters) {
  const distance = Number(meters || 0);

  if (!distance) return "거리 정보 없음";

  return distance < 1000
    ? `${distance}m`
    : `${(distance / 1000).toFixed(1)}km`;
}

function fallbackImage(img) {
  img.onerror = null;

  img.src =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
        <rect width="100%" height="100%" fill="#e9edf4"/>
        <text x="50%" y="48%" text-anchor="middle" font-size="32" fill="#687083">동네ON</text>
        <text x="50%" y="60%" text-anchor="middle" font-size="17" fill="#8b92a0">이미지를 images 폴더에 넣어주세요</text>
      </svg>
    `);
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

// ---------------------------------------------------------
// 6. 실제 카카오 장소 결과를 App 데이터로 변환
// ---------------------------------------------------------
function normalizePlace(place, categoryName) {
  const config = categoryConfigs[categoryName] || {};

  return {
    // 카카오 장소 id는 문자열로 보관
    id: String(place.id),
    name: place.place_name || "이름 없는 장소",
    category: categoryName,
    categoryName: place.category_name || "",
    address:
      place.road_address_name ||
      place.address_name ||
      "주소 정보 없음",
    distance: Number(place.distance || 0),
    phone: place.phone || "전화번호 정보 없음",
    image: config.image || "./images/store01.jpg",
    lat: Number(place.y),
    lng: Number(place.x),
    placeUrl: place.place_url || "",
    source: "kakao"
  };
}

function mergeUniquePlaces(placeGroups) {
  const map = new Map();

  placeGroups.flat().forEach(place => {
    if (!map.has(place.id)) {
      map.set(place.id, place);
    }
  });

  return [...map.values()]
    .sort((a, b) => {
      const da = a.distance || Number.MAX_SAFE_INTEGER;
      const db = b.distance || Number.MAX_SAFE_INTEGER;
      return da - db;
    });
}

// ---------------------------------------------------------
// 7. Kakao Maps 초기화
// ---------------------------------------------------------
function initKakaoMap() {
  if (
    typeof kakao === "undefined" ||
    !kakao.maps ||
    !kakao.maps.services
  ) {
    console.warn(
      "카카오맵 SDK 또는 services 라이브러리를 불러오지 못했습니다."
    );

    mapMessage.classList.add("show");
    return;
  }

  kakao.maps.load(() => {
    try {
      const container =
        document.getElementById("kakaoMap");

      kakaoMap = new kakao.maps.Map(
        container,
        {
          center: new kakao.maps.LatLng(
            currentCoords.lat,
            currentCoords.lng
          ),
          level: 4
        }
      );

      placesService =
        new kakao.maps.services.Places();

      infoWindow =
        new kakao.maps.InfoWindow({
          zIndex: 5
        });

      mapMessage.classList.remove("show");

    } catch (error) {
      console.error(
        "카카오맵 초기화 오류:",
        error
      );

      mapMessage.classList.add("show");
    }
  });
}

function clearMapMarkers() {
  mapMarkers.forEach(marker => {
    marker.setMap(null);
  });

  mapMarkers = [];

  if (infoWindow) {
    infoWindow.close();
  }
}

function renderKakaoMarkers(items) {
  if (!kakaoMap || typeof kakao === "undefined") {
    return;
  }

  clearMapMarkers();

  items.forEach(facility => {
    const position =
      new kakao.maps.LatLng(
        facility.lat,
        facility.lng
      );

    const marker =
      new kakao.maps.Marker({
        position,
        map: kakaoMap
      });

    kakao.maps.event.addListener(
      marker,
      "click",
      () => {
        infoWindow.setContent(`
          <div style="
            padding:8px 10px;
            min-width:120px;
            font-size:12px;
            line-height:1.5;
            white-space:nowrap;
          ">
            <strong>${safeText(facility.name)}</strong><br>
            ${safeText(facility.category)}
            · ${formatDistance(facility.distance)}
          </div>
        `);

        infoWindow.open(
          kakaoMap,
          marker
        );
      }
    );

    mapMarkers.push(marker);
  });
}

function renderCurrentLocationMarker() {
  if (!kakaoMap || !hasUserLocation) return;

  if (currentLocationMarker) {
    currentLocationMarker.setMap(null);
  }

  const position =
    new kakao.maps.LatLng(
      currentCoords.lat,
      currentCoords.lng
    );

  currentLocationMarker =
    new kakao.maps.Marker({
      position,
      map: kakaoMap
    });

  kakaoMap.setCenter(position);
}

function fitMapToPlaces(items) {
  if (
    !kakaoMap ||
    !hasUserLocation ||
    typeof kakao === "undefined"
  ) return;

  const bounds =
    new kakao.maps.LatLngBounds();

  bounds.extend(
    new kakao.maps.LatLng(
      currentCoords.lat,
      currentCoords.lng
    )
  );

  items.forEach(item => {
    bounds.extend(
      new kakao.maps.LatLng(
        item.lat,
        item.lng
      )
    );
  });

  if (items.length) {
    kakaoMap.setBounds(
      bounds,
      45,
      45,
      45,
      45
    );
  }
}

// ---------------------------------------------------------
// 8. 내 위치 확인
// ---------------------------------------------------------
function requestCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "이 브라우저는 위치 기능을 지원하지 않습니다."
        )
      );
      return;
    }

    const locationText =
      document.getElementById("locationText");

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

        hasUserLocation = true;

        locationText.textContent =
          `내 위치 기준 · ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        if (kakaoMap) {
          renderCurrentLocationMarker();
        }

        resolve(currentCoords);
      },

      error => {
        console.warn(
          "위치 확인 오류:",
          error
        );

        locationText.textContent =
          "위치 권한이 필요합니다.";

        reject(error);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

async function ensureCurrentLocation() {
  if (hasUserLocation) {
    return currentCoords;
  }

  try {
    return await requestCurrentLocation();
  } catch (error) {
    showToast(
      "주변 추천을 위해 위치 권한을 허용해주세요."
    );
    throw error;
  }
}

// ---------------------------------------------------------
// 9. Kakao Places 실제 검색
// ---------------------------------------------------------
function searchCategoryNearby(categoryName, size = 6) {
  return new Promise(resolve => {
    if (!placesService) {
      resolve([]);
      return;
    }

    const config =
      categoryConfigs[categoryName];

    if (!config) {
      resolve([]);
      return;
    }

    const location =
      new kakao.maps.LatLng(
        currentCoords.lat,
        currentCoords.lng
      );

    const options = {
      location,
      radius: SEARCH_RADIUS,
      size,
      sort: kakao.maps.services.SortBy.DISTANCE
    };

    const callback = (
      data,
      status
    ) => {
      if (
        status ===
        kakao.maps.services.Status.OK
      ) {
        resolve(
          data.map(place =>
            normalizePlace(
              place,
              categoryName
            )
          )
        );
        return;
      }

      if (
        status ===
        kakao.maps.services.Status.ZERO_RESULT
      ) {
        resolve([]);
        return;
      }

      console.error(
        `${categoryName} 검색 오류:`,
        status
      );

      resolve([]);
    };

    if (config.type === "category") {
      placesService.categorySearch(
        config.code,
        callback,
        options
      );
    } else {
      placesService.keywordSearch(
        config.keyword,
        callback,
        options
      );
    }
  });
}

function searchKeywordNearby(keyword, size = 15) {
  return new Promise(resolve => {
    if (!placesService) {
      resolve([]);
      return;
    }

    const location =
      new kakao.maps.LatLng(
        currentCoords.lat,
        currentCoords.lng
      );

    placesService.keywordSearch(
      keyword,
      (data, status) => {
        if (
          status ===
          kakao.maps.services.Status.OK
        ) {
          const normalized =
            data.map(place => {
              const inferredCategory =
                inferCategory(place);

              return normalizePlace(
                place,
                inferredCategory
              );
            });

          resolve(normalized);
          return;
        }

        if (
          status ===
          kakao.maps.services.Status.ZERO_RESULT
        ) {
          resolve([]);
          return;
        }

        console.error(
          "키워드 검색 오류:",
          status
        );

        resolve([]);
      },
      {
        location,
        radius: SEARCH_RADIUS,
        size,
        sort:
          kakao.maps.services.SortBy.DISTANCE
      }
    );
  });
}

function inferCategory(place) {
  const groupCode =
    place.category_group_code;

  const codeMap = {
    PM9: "약국",
    HP8: "병원",
    CS2: "편의점",
    PK6: "주차장",
    CE7: "카페"
  };

  if (codeMap[groupCode]) {
    return codeMap[groupCode];
  }

  const text =
    `${place.place_name} ${place.category_name}`;

  if (text.includes("화장실")) {
    return "공공화장실";
  }

  if (
    text.includes("세탁") ||
    text.includes("빨래")
  ) {
    return "세탁소";
  }

  if (
    text.includes("ATM") ||
    text.includes("현금자동")
  ) {
    return "ATM";
  }

  return "생활시설";
}

// 전체 생활시설을 여러 카테고리에서 모아서 거리순 추천
async function searchAllNearbyPlaces() {
  await ensureCurrentLocation();

  if (!placesService) {
    showToast(
      "카카오맵 Places 서비스를 불러오지 못했습니다."
    );
    return [];
  }

  const categoryNames =
    Object.keys(categoryConfigs);

  const results =
    await Promise.all(
      categoryNames.map(name =>
        searchCategoryNearby(name, 5)
      )
    );

  facilities =
    mergeUniquePlaces(results);

  selectedCategory = "전체";
  currentQuery = "";

  renderHomeNearby();
  renderNearby();
  renderKakaoMarkers(facilities);
  renderCurrentLocationMarker();
  fitMapToPlaces(
    facilities.slice(0, 15)
  );

  return facilities;
}

// 특정 카테고리를 내 위치 기준으로 검색
async function searchNearbyByCategory(categoryName) {
  await ensureCurrentLocation();

  const items =
    await searchCategoryNearby(
      categoryName,
      15
    );

  facilities = items;
  selectedCategory = categoryName;
  currentQuery = "";

  renderNearby();
  renderKakaoMarkers(items);
  renderCurrentLocationMarker();
  fitMapToPlaces(items);

  return items;
}

// 검색창 키워드를 내 위치 기준으로 검색
async function searchNearbyKeyword(keyword) {
  const value = keyword.trim();

  if (!value) {
    return searchAllNearbyPlaces();
  }

  await ensureCurrentLocation();

  addSearchHistory(value);

  const items =
    await searchKeywordNearby(
      value,
      15
    );

  facilities = items;
  selectedCategory = "전체";
  currentQuery = value;

  renderNearby();
  renderKakaoMarkers(items);
  renderCurrentLocationMarker();
  fitMapToPlaces(items);

  return items;
}

// ---------------------------------------------------------
// 10. 후기 / 평점
// ---------------------------------------------------------
function getFacilityReviews(facilityId) {
  return reviews.filter(
    review =>
      String(review.facilityId) ===
      String(facilityId)
  );
}

function getCalculatedRating(facility) {
  const facilityReviews =
    getFacilityReviews(facility.id);

  if (!facilityReviews.length) {
    return null;
  }

  const sum =
    facilityReviews.reduce(
      (acc, review) =>
        acc + review.rating,
      0
    );

  return Number(
    (
      sum /
      facilityReviews.length
    ).toFixed(1)
  );
}

// ---------------------------------------------------------
// 11. 즐겨찾기
// 동적 카카오 결과는 앱 재실행 후에도 표시할 수 있도록
// 장소 객체 자체도 favoritePlaces에 저장
// ---------------------------------------------------------
function isFavorite(id) {
  return favorites.includes(
    String(id)
  );
}

function getFacility(id) {
  const place =
    facilities.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (place) return place;

  return favoritePlaces[String(id)] || null;
}

function toggleFavorite(id, rerenderDetail = false) {
  const facilityId = String(id);
  const facility = getFacility(facilityId);

  if (isFavorite(facilityId)) {
    favorites =
      favorites.filter(
        item =>
          String(item) !== facilityId
      );

    delete favoritePlaces[facilityId];

    showToast(
      "즐겨찾기에서 삭제했습니다."
    );
  } else {
    if (!facility) {
      showToast(
        "시설 정보를 찾을 수 없습니다."
      );
      return;
    }

    favorites.unshift(facilityId);
    favoritePlaces[facilityId] = facility;

    showToast(
      "즐겨찾기에 저장했습니다."
    );
  }

  saveJSON(
    STORAGE.favorites,
    favorites
  );

  saveJSON(
    STORAGE.favoritePlaces,
    favoritePlaces
  );

  renderHomeNearby();

  if (currentScreen === "nearby") {
    renderNearby();
  }

  if (currentScreen === "favorite") {
    renderFavorites();
  }

  if (currentScreen === "my") {
    renderMy();
  }

  if (
    rerenderDetail &&
    selectedFacilityId
  ) {
    renderDetail(
      selectedFacilityId
    );
  }
}

// ---------------------------------------------------------
// 12. 시설 카드
// ---------------------------------------------------------
function facilityCardHTML(
  facility,
  removable = false
) {
  const rating =
    getCalculatedRating(facility);

  const ratingText =
    rating
      ? `★ ${rating}`
      : "내 후기 없음";

  return `
    <article
      class="facility-card"
      data-facility-id="${safeText(facility.id)}"
    >
      <img
        class="thumb"
        src="${facility.image}"
        alt="${safeText(facility.name)}"
        onerror="fallbackImage(this)"
      />

      <div class="facility-info">
        <h3>
          ${safeText(facility.name)}
          ${
            facility.source === "kakao"
              ? '<span class="real-place-badge">실제 장소</span>'
              : ""
          }
        </h3>

        <div class="meta">
          ${safeText(facility.category)}
          · ${formatDistance(facility.distance)}
          · ${ratingText}
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
              data-id="${safeText(facility.id)}"
              type="button"
              aria-label="즐겨찾기 삭제"
            >
              ×
            </button>
          `
          : `
            <button
              class="card-action quick-favorite"
              data-id="${safeText(facility.id)}"
              type="button"
              aria-label="즐겨찾기"
            >
              ${
                isFavorite(facility.id)
                  ? "♥"
                  : "♡"
              }
            </button>
          `
      }
    </article>
  `;
}

// ---------------------------------------------------------
// 13. 홈
// ---------------------------------------------------------
function renderHome() {
  homeCategories.innerHTML =
    categories
      .filter(
        ([name]) =>
          name !== "전체"
      )
      .map(
        ([name, icon]) => `
          <button
            class="category-btn home-category"
            type="button"
            data-category="${name}"
          >
            <span>${icon}</span>
            <b>${name}</b>
          </button>
        `
      )
      .join("");

  renderHomeNearby();
}

function renderHomeNearby() {
  const nearest =
    facilities
      .slice()
      .sort(
        (a, b) =>
          (a.distance || 999999) -
          (b.distance || 999999)
      )
      .slice(0, 3);

  nearFacilityList.innerHTML =
    nearest
      .map(item =>
        facilityCardHTML(item)
      )
      .join("");

  homeNearbyEmpty.style.display =
    nearest.length
      ? "none"
      : "block";

  if (nearest.length) {
    nearbyGuide.textContent =
      `현재 위치 기준 ${SEARCH_RADIUS / 1000}km 이내 실제 장소를 거리순으로 추천합니다.`;
  } else {
    nearbyGuide.textContent =
      "‘내 주변 추천’을 누르면 현재 위치를 기준으로 실제 주변 시설을 검색합니다.";
  }
}

// ---------------------------------------------------------
// 14. 주변시설
// ---------------------------------------------------------
function renderFilters() {
  filterRow.innerHTML =
    categories
      .map(
        ([name]) => `
          <button
            class="filter-chip ${
              selectedCategory === name
                ? "active"
                : ""
            }"
            type="button"
            data-filter="${name}"
          >
            ${name}
          </button>
        `
      )
      .join("");
}

function renderNearby() {
  renderFilters();

  resultTitle.textContent =
    currentQuery
      ? `“${currentQuery}” 검색 결과`
      : selectedCategory === "전체"
        ? "내 주변 추천"
        : `주변 ${selectedCategory}`;

  resultCount.textContent =
    `${facilities.length}개`;

  facilityList.innerHTML =
    facilities
      .map(item =>
        facilityCardHTML(item)
      )
      .join("");

  facilityEmpty.style.display =
    facilities.length
      ? "none"
      : "block";
}

// ---------------------------------------------------------
// 15. 상세
// ---------------------------------------------------------
function renderDetail(facilityId) {
  const facility =
    getFacility(facilityId);

  if (!facility) {
    showToast(
      "시설 정보를 찾을 수 없습니다."
    );
    return;
  }

  selectedFacilityId =
    String(facility.id);

  selectedRating = 0;
  editingReviewId = null;

  const facilityReviews =
    getFacilityReviews(
      facility.id
    );

  const rating =
    getCalculatedRating(
      facility
    );

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
          <h1>
            ${safeText(facility.name)}
          </h1>

          <p class="detail-meta">
            ${safeText(facility.category)}
            · ${formatDistance(facility.distance)}
            · ${
              rating
                ? `내 후기 평균 ★ ${rating}`
                : "아직 작성한 후기 없음"
            }
          </p>
        </div>

        <button
          class="favorite-large"
          id="detailFavoriteBtn"
          type="button"
          aria-label="즐겨찾기"
        >
          ${
            isFavorite(facility.id)
              ? "♥"
              : "♡"
          }
        </button>
      </div>

      <div class="info-box">
        <div class="info-row">
          <b>주소</b>
          <span>
            ${safeText(facility.address)}
          </span>
        </div>

        <div class="info-row">
          <b>전화번호</b>
          <span>
            ${safeText(facility.phone)}
          </span>
        </div>

        <div class="info-row">
          <b>거리</b>
          <span>
            내 위치에서 ${formatDistance(facility.distance)}
          </span>
        </div>

        <div class="info-row">
          <b>장소정보</b>
          <span>
            카카오 장소 검색 결과
          </span>
        </div>
      </div>

      <div class="action-row">
        <button
          class="primary-btn"
          id="routeBtn"
          type="button"
        >
          지도에서 보기
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

      ${
        facility.placeUrl
          ? `
            <div style="margin-top:10px;">
              <button
                class="outline-btn"
                id="kakaoPlaceBtn"
                type="button"
                style="width:100%;"
              >
                카카오맵 장소정보 열기
              </button>
            </div>
          `
          : ""
      }

      <section class="review-section">
        <h2>나의 이용 후기</h2>

        <form
          class="review-form"
          id="reviewForm"
        >
          <div
            class="rating-picker"
            id="ratingPicker"
          >
            ${[1, 2, 3, 4, 5]
              .map(
                num => `
                  <button
                    class="star-btn"
                    type="button"
                    data-rating="${num}"
                    aria-label="${num}점"
                  >
                    ★
                  </button>
                `
              )
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
          ${renderReviewCards(
            facilityReviews
          )}
        </div>

        <div
          class="empty small"
          id="reviewEmpty"
          style="display:${
            facilityReviews.length
              ? "none"
              : "block"
          };"
        >
          아직 작성한 후기가 없습니다.
        </div>
      </section>
    </div>
  `;

  bindDetailEvents(facility);
  navigate("detail");
}

function renderReviewCards(items) {
  return items
    .map(
      review => `
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
              <small>
                ${safeText(review.date)}
              </small>
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

          <p>
            ${safeText(review.text)}
          </p>
        </article>
      `
    )
    .join("");
}

function bindDetailEvents(facility) {
  document
    .getElementById(
      "detailFavoriteBtn"
    )
    .addEventListener(
      "click",
      () => {
        toggleFavorite(
          facility.id,
          true
        );
      }
    );

  document
    .getElementById(
      "detailFavoriteTextBtn"
    )
    .addEventListener(
      "click",
      () => {
        toggleFavorite(
          facility.id,
          true
        );
      }
    );

  document
    .getElementById("routeBtn")
    .addEventListener(
      "click",
      () => {
        navigate("nearby");

        setTimeout(() => {
          if (kakaoMap) {
            kakaoMap.panTo(
              new kakao.maps.LatLng(
                facility.lat,
                facility.lng
              )
            );
          }
        }, 180);

        showToast(
          `${facility.name} 위치로 이동했습니다.`
        );
      }
    );

  const kakaoPlaceBtn =
    document.getElementById(
      "kakaoPlaceBtn"
    );

  if (kakaoPlaceBtn) {
    kakaoPlaceBtn.addEventListener(
      "click",
      () => {
        window.open(
          facility.placeUrl,
          "_blank",
          "noopener,noreferrer"
        );
      }
    );
  }

  document
    .getElementById("ratingPicker")
    .addEventListener(
      "click",
      event => {
        const button =
          event.target.closest(
            "[data-rating]"
          );

        if (!button) return;

        selectedRating =
          Number(
            button.dataset.rating
          );

        updateRatingPicker();
      }
    );

  document
    .getElementById("reviewForm")
    .addEventListener(
      "submit",
      event => {
        event.preventDefault();
        saveReview(
          facility.id
        );
      }
    );

  document
    .getElementById("cancelEditBtn")
    .addEventListener(
      "click",
      resetReviewForm
    );

  document
    .getElementById("detailReviewList")
    .addEventListener(
      "click",
      event => {
        const editButton =
          event.target.closest(
            ".edit-review"
          );

        const deleteButton =
          event.target.closest(
            ".delete-review"
          );

        if (editButton) {
          startEditReview(
            Number(
              editButton.dataset.id
            )
          );
        }

        if (deleteButton) {
          deleteReview(
            Number(
              deleteButton.dataset.id
            ),
            facility.id
          );
        }
      }
    );
}

function updateRatingPicker() {
  document
    .querySelectorAll(".star-btn")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        Number(
          btn.dataset.rating
        ) <= selectedRating
      );
    });
}

function saveReview(facilityId) {
  const textInput =
    document.getElementById(
      "reviewText"
    );

  const text =
    textInput.value.trim();

  if (!selectedRating) {
    showToast(
      "별점을 선택해주세요."
    );
    return;
  }

  if (!text) {
    showToast(
      "후기 내용을 입력해주세요."
    );

    textInput.focus();
    return;
  }

  if (editingReviewId) {
    const target =
      reviews.find(
        item =>
          item.id ===
          editingReviewId
      );

    if (target) {
      target.rating =
        selectedRating;

      target.text =
        text;

      target.date =
        new Date()
          .toLocaleDateString(
            "ko-KR"
          );

      showToast(
        "후기가 수정되었습니다."
      );
    }
  } else {
    reviews.unshift({
      id: Date.now(),
      facilityId:
        String(facilityId),
      rating:
        selectedRating,
      text,
      date:
        new Date()
          .toLocaleDateString(
            "ko-KR"
          )
    });

    showToast(
      "후기가 등록되었습니다."
    );
  }

  saveJSON(
    STORAGE.reviews,
    reviews
  );

  renderDetail(
    facilityId
  );
}

function startEditReview(reviewId) {
  const review =
    reviews.find(
      item =>
        item.id === reviewId
    );

  if (!review) return;

  editingReviewId =
    review.id;

  selectedRating =
    review.rating;

  document
    .getElementById("reviewText")
    .value = review.text;

  document
    .getElementById(
      "reviewSubmitBtn"
    )
    .textContent = "수정 저장";

  document
    .getElementById(
      "cancelEditBtn"
    )
    .style.display =
      "inline-block";

  updateRatingPicker();

  document
    .getElementById("reviewText")
    .focus();
}

function resetReviewForm() {
  editingReviewId = null;
  selectedRating = 0;

  document
    .getElementById("reviewText")
    .value = "";

  document
    .getElementById(
      "reviewSubmitBtn"
    )
    .textContent = "후기 등록";

  document
    .getElementById(
      "cancelEditBtn"
    )
    .style.display = "none";

  updateRatingPicker();
}

function deleteReview(
  reviewId,
  facilityId
) {
  const ok =
    window.confirm(
      "이 후기를 삭제할까요?"
    );

  if (!ok) return;

  reviews =
    reviews.filter(
      item =>
        item.id !== reviewId
    );

  saveJSON(
    STORAGE.reviews,
    reviews
  );

  showToast(
    "후기가 삭제되었습니다."
  );

  renderDetail(
    facilityId
  );
}

// ---------------------------------------------------------
// 16. 즐겨찾기 / MY
// ---------------------------------------------------------
function renderFavorites() {
  const items =
    favorites
      .map(id =>
        favoritePlaces[
          String(id)
        ]
      )
      .filter(Boolean);

  favoriteList.innerHTML =
    items
      .map(item =>
        facilityCardHTML(
          item,
          true
        )
      )
      .join("");

  favoriteEmpty.style.display =
    items.length
      ? "none"
      : "block";
}

function renderMy() {
  favoriteCount.textContent =
    favorites.length;

  reviewCount.textContent =
    reviews.length;

  historyList.innerHTML =
    history
      .map(
        (keyword, index) => `
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
        `
      )
      .join("");

  historyEmpty.style.display =
    history.length
      ? "none"
      : "block";
}

// ---------------------------------------------------------
// 17. 이벤트
// ---------------------------------------------------------
refreshNearbyBtn.addEventListener(
  "click",
  async () => {
    refreshNearbyBtn.disabled = true;
    refreshNearbyBtn.textContent =
      "검색 중...";

    nearFacilityList.innerHTML =
      '<div class="loading-card">현재 위치 주변의 실제 생활시설을 찾고 있습니다.</div>';

    homeNearbyEmpty.style.display =
      "none";

    try {
      const items =
        await searchAllNearbyPlaces();

      if (!items.length) {
        showToast(
          "반경 3km 안에서 검색 결과를 찾지 못했습니다."
        );
      } else {
        showToast(
          `가까운 실제 시설 ${items.length}곳을 찾았습니다.`
        );
      }
    } catch (error) {
      renderHomeNearby();
    } finally {
      refreshNearbyBtn.disabled =
        false;

      refreshNearbyBtn.textContent =
        "내 주변 추천";
    }
  }
);

document
  .getElementById(
    "locationBtn"
  )
  .addEventListener(
    "click",
    async () => {
      try {
        await requestCurrentLocation();
        await searchAllNearbyPlaces();

        showToast(
          "현재 위치 기준으로 주변 시설을 갱신했습니다."
        );
      } catch (error) {
        showToast(
          "위치 권한을 허용해주세요."
        );
      }
    }
  );

document.addEventListener(
  "click",
  async event => {
    const goButton =
      event.target.closest(
        "[data-go]"
      );

    if (goButton) {
      const target =
        goButton.dataset.go;

      if (
        target === "nearby" &&
        !facilities.length
      ) {
        navigate("nearby");
      } else {
        navigate(target);
      }

      return;
    }

    const homeCategory =
      event.target.closest(
        ".home-category"
      );

    if (homeCategory) {
      const category =
        homeCategory.dataset.category;

      navigate("nearby");

      facilityList.innerHTML =
        '<div class="loading-card">현재 위치 주변 시설을 검색하고 있습니다.</div>';

      try {
        const items =
          await searchNearbyByCategory(
            category
          );

        if (!items.length) {
          showToast(
            `주변 ${category} 검색 결과가 없습니다.`
          );
        }
      } catch (error) {
        renderNearby();
      }

      return;
    }

    const filter =
      event.target.closest(
        "[data-filter]"
      );

    if (filter) {
      const category =
        filter.dataset.filter;

      if (category === "전체") {
        try {
          await searchAllNearbyPlaces();
        } catch (error) {}
      } else {
        try {
          await searchNearbyByCategory(
            category
          );
        } catch (error) {}
      }

      return;
    }

    const quickFavorite =
      event.target.closest(
        ".quick-favorite"
      );

    if (quickFavorite) {
      event.stopPropagation();

      toggleFavorite(
        quickFavorite.dataset.id
      );

      return;
    }

    const deleteFavoriteBtn =
      event.target.closest(
        ".delete-favorite"
      );

    if (deleteFavoriteBtn) {
      event.stopPropagation();

      toggleFavorite(
        deleteFavoriteBtn.dataset.id
      );

      return;
    }

    const facilityCard =
      event.target.closest(
        "[data-facility-id]"
      );

    if (facilityCard) {
      renderDetail(
        facilityCard.dataset.facilityId
      );
    }
  }
);

backBtn.addEventListener(
  "click",
  () => {
    navigate("nearby");
  }
);

document
  .getElementById(
    "homeSearchForm"
  )
  .addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      const keyword =
        document
          .getElementById(
            "homeSearchInput"
          )
          .value
          .trim();

      if (!keyword) {
        showToast(
          "검색어를 입력해주세요."
        );
        return;
      }

      navigate("nearby");

      facilityList.innerHTML =
        '<div class="loading-card">내 위치 주변에서 검색하고 있습니다.</div>';

      try {
        const items =
          await searchNearbyKeyword(
            keyword
          );

        document
          .getElementById(
            "nearbySearchInput"
          )
          .value = keyword;

        if (!items.length) {
          showToast(
            "주변 검색 결과가 없습니다."
          );
        }
      } catch (error) {
        renderNearby();
      }
    }
  );

document
  .getElementById(
    "nearbySearchForm"
  )
  .addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      const keyword =
        document
          .getElementById(
            "nearbySearchInput"
          )
          .value
          .trim();

      if (!keyword) {
        try {
          await searchAllNearbyPlaces();
        } catch (error) {}
        return;
      }

      try {
        const items =
          await searchNearbyKeyword(
            keyword
          );

        if (!items.length) {
          showToast(
            "주변 검색 결과가 없습니다."
          );
        }
      } catch (error) {}
    }
  );

document
  .getElementById(
    "favoriteList"
  )
  .addEventListener(
    "click",
    event => {
      const deleteButton =
        event.target.closest(
          ".delete-favorite"
        );

      if (deleteButton) {
        event.stopPropagation();

        toggleFavorite(
          deleteButton.dataset.id
        );
      }
    }
  );

document
  .getElementById(
    "clearHistoryBtn"
  )
  .addEventListener(
    "click",
    () => {
      history = [];

      saveJSON(
        STORAGE.history,
        history
      );

      renderMy();

      showToast(
        "검색 기록을 삭제했습니다."
      );
    }
  );

historyList.addEventListener(
  "click",
  async event => {
    const searchBtn =
      event.target.closest(
        ".history-search"
      );

    const deleteBtn =
      event.target.closest(
        ".history-delete"
      );

    if (searchBtn) {
      navigate("nearby");

      try {
        await searchNearbyKeyword(
          searchBtn.dataset.keyword
        );

        document
          .getElementById(
            "nearbySearchInput"
          )
          .value =
            searchBtn.dataset.keyword;
      } catch (error) {}
    }

    if (deleteBtn) {
      const index =
        Number(
          deleteBtn.dataset.index
        );

      history.splice(
        index,
        1
      );

      saveJSON(
        STORAGE.history,
        history
      );

      renderMy();
    }
  }
);

document
  .getElementById(
    "resetDataBtn"
  )
  .addEventListener(
    "click",
    () => {
      const ok =
        window.confirm(
          "즐겨찾기, 후기, 검색 기록을 모두 삭제할까요?"
        );

      if (!ok) return;

      favorites = [];
      favoritePlaces = {};
      reviews = [];
      history = [];

      Object
        .values(STORAGE)
        .forEach(key => {
          localStorage.removeItem(
            key
          );
        });

      renderHome();
      renderFavorites();
      renderMy();

      showToast(
        "사용자 데이터를 초기화했습니다."
      );
    }
  );

// ---------------------------------------------------------
// 18. 초기 실행
// ---------------------------------------------------------
renderHome();
renderNearby();
renderFavorites();
renderMy();
navigate("home");

window.addEventListener(
  "load",
  () => {
    initKakaoMap();
  }
);
