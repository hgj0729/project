/* =========================================
   TMDB API SETTING
   아래 YOUR_TMDB_API_KEY 부분에 자신의 TMDB API KEY를 입력하세요.
========================================= */

const TMDB_API_KEY = "fa0d93ed16dba8bd29a4c8adeb15a5c4";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/original";
const FALLBACK_IMAGE = "./images/no-image.jpg";

let currentHeroData = null;

document.addEventListener("DOMContentLoaded", function () {
  initHeader();
  initMobileMenu();
  initSearch();
  initLoginModal();
  initSliderButtons();
  initModal();
  initServiceCode();
  loadAllContent();
});



/* =========================================
   LOGIN MODAL
========================================= */
function initLoginModal() {
  const loginBtn = document.getElementById("loginBtn");
  const loginModal = document.getElementById("loginModal");
  const loginClose = document.getElementById("loginClose");
  const loginOverlay = document.getElementById("loginModalOverlay");
  const loginForm = document.getElementById("loginForm");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const passwordToggle = document.getElementById("passwordToggle");

  if (!loginBtn || !loginModal) return;

  function openLogin() {
    loginModal.classList.add("active");
    loginModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    setTimeout(function () {
      loginEmail.focus();
    }, 100);
  }

  function closeLogin() {
    loginModal.classList.remove("active");
    loginModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  loginBtn.addEventListener("click", openLogin);
  loginClose.addEventListener("click", closeLogin);
  loginOverlay.addEventListener("click", closeLogin);

  passwordToggle.addEventListener("click", function () {
    const showing = loginPassword.type === "text";

    loginPassword.type = showing ? "password" : "text";
    passwordToggle.textContent = showing ? "보기" : "숨기기";
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!loginEmail.value.trim() || !loginPassword.value.trim()) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    alert("로그인 UI가 정상적으로 동작합니다. 실제 로그인 인증은 서버 연동이 필요합니다.");
    loginForm.reset();
    loginPassword.type = "password";
    passwordToggle.textContent = "보기";
    closeLogin();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && loginModal.classList.contains("active")) {
      closeLogin();
    }
  });
}

async function loadAllContent() {
  await Promise.all([
    loadTrending(),
    loadPopularMovies(),
    loadPopularSeries(),
    loadNowPlaying(),
    loadActionMovies(),
    loadComedyMovies(),
    loadHorrorMovies(),
    loadRomanceMovies(),
    loadDocumentaryMovies()
  ]);
}

async function fetchTMDB(endpoint, params = {}) {
  const query = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "ko-KR",
    ...params
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${query}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB API 오류 : ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("TMDB 데이터를 불러오지 못했습니다.", error);
    return { results: [] };
  }
}

async function loadTrending() {
  const data = await fetchTMDB("/trending/all/week");

  const contents = data.results.filter(function (item) {
    return item.media_type === "movie" || item.media_type === "tv";
  });

  renderSlider("popularSlider", contents, { rank: true });

  if (contents.length > 0) {
    renderHero(contents[0]);
  }
}

async function loadPopularMovies() {
  const data = await fetchTMDB("/movie/popular", { page: 1 });

  const movies = data.results.map(function (item) {
    return { ...item, media_type: "movie" };
  });

  renderSlider("movieSlider", movies);
}

async function loadPopularSeries() {
  const data = await fetchTMDB("/tv/popular", { page: 1 });

  const series = data.results.map(function (item) {
    return { ...item, media_type: "tv" };
  });

  renderSlider("seriesSlider", series);
}

async function loadNowPlaying() {
  const data = await fetchTMDB("/movie/now_playing", {
    page: 1,
    region: "KR"
  });

  const movies = data.results.map(function (item) {
    return { ...item, media_type: "movie" };
  });

  renderSlider("newSlider", movies, { newBadge: true });
}


/* =========================================
   DISCOVER MOVIES BY GENRE
========================================= */

async function loadGenreMovies(sliderId, genreId) {
  const data = await fetchTMDB("/discover/movie", {
    with_genres: genreId,
    page: 1,
    region: "KR",
    sort_by: "popularity.desc"
  });

  const movies = data.results.map(function (item) {
    return { ...item, media_type: "movie" };
  });

  renderGenreSlider(sliderId, movies);
}

async function loadActionMovies() {
  await loadGenreMovies("actionGrid", 28);
}

async function loadComedyMovies() {
  await loadGenreMovies("comedyGrid", 35);
}

async function loadHorrorMovies() {
  await loadGenreMovies("horrorGrid", 27);
}

async function loadRomanceMovies() {
  await loadGenreMovies("romanceGrid", 10749);
}

async function loadDocumentaryMovies() {
  await loadGenreMovies("documentaryGrid", 99);
}

function renderHero(item) {
  currentHeroData = item;

  const heroImage = document.getElementById("heroImage");
  const heroTitle = document.getElementById("heroTitle");
  const heroRating = document.getElementById("heroRating");
  const heroDate = document.getElementById("heroDate");
  const heroDescription = document.getElementById("heroDescription");

  const title = getTitle(item);

  const backdrop = item.backdrop_path
    ? `${BACKDROP_BASE_URL}${item.backdrop_path}`
    : FALLBACK_IMAGE;

  heroImage.src = backdrop;
  heroImage.alt = title;
  heroTitle.textContent = title;
  heroRating.textContent = `★ ${formatRating(item.vote_average)}`;
  heroDate.textContent = getYear(item);
  heroDescription.textContent =
    item.overview || "등록된 콘텐츠 설명이 없습니다.";
}

function renderSlider(sliderId, contents, options = {}) {
  const slider = document.getElementById(sliderId);

  if (!slider) return;

  slider.innerHTML = "";

  if (!contents.length) {
    slider.innerHTML = `
      <div class="loading">
        콘텐츠를 불러오지 못했습니다.
        TMDB API KEY를 확인해주세요.
      </div>
    `;
    return;
  }

  contents.slice(0, 20).forEach(function (item, index) {
    const card = createContentCard(item, {
      rank: options.rank ? index + 1 : null,
      newBadge: options.newBadge
    });

    slider.appendChild(card);
  });
}


/* =========================================
   RENDER GENRE HORIZONTAL SLIDER
========================================= */

function renderGenreSlider(sliderId, contents) {
  const slider = document.getElementById(sliderId);

  if (!slider) return;

  slider.innerHTML = "";

  if (!contents.length) {
    slider.innerHTML = `
      <div class="loading">
        콘텐츠를 불러오지 못했습니다.
        TMDB API KEY를 확인해주세요.
      </div>
    `;
    return;
  }

  contents.slice(0, 10).forEach(function (item) {
    slider.appendChild(createContentCard(item));
  });
}


function createContentCard(item, options = {}) {
  const card = document.createElement("article");
  card.className = "content-card";

  const title = getTitle(item);

  const image = item.backdrop_path
    ? `${IMAGE_BASE_URL}${item.backdrop_path}`
    : item.poster_path
      ? `${IMAGE_BASE_URL}${item.poster_path}`
      : FALLBACK_IMAGE;

  const year = getYear(item);
  const rating = formatRating(item.vote_average);

  card.innerHTML = `
    <div class="card-image">
      <img
        src="${image}"
        alt="${escapeHTML(title)}"
        loading="lazy"
      >

      <div class="card-gradient"></div>

      ${
        options.rank
          ? `<span class="rank">${options.rank}</span>`
          : ""
      }

      ${
        options.newBadge
          ? `<span class="new-badge">NEW</span>`
          : ""
      }

      <span class="card-rating">
        ★ ${rating}
      </span>
    </div>

    <div class="card-info">
      <h3>${escapeHTML(title)}</h3>
      <p>${year}</p>
    </div>
  `;

  card.addEventListener("click", function () {
    openDetailModal(item);
  });

  return card;
}

function getTitle(item) {
  return (
    item.title ||
    item.name ||
    item.original_title ||
    item.original_name ||
    "제목 없음"
  );
}

function getYear(item) {
  const date = item.release_date || item.first_air_date;

  if (!date) {
    return "정보 없음";
  }

  return date.split("-")[0];
}

function formatRating(rating) {
  if (rating === undefined || rating === null) {
    return "0.0";
  }

  return Number(rating).toFixed(1);
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function initHeader() {
  const header = document.getElementById("header");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

function initMobileMenu() {
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  menuBtn.addEventListener("click", function () {
    mobileMenu.classList.toggle("active");
  });

  const links = mobileMenu.querySelectorAll("a");

  links.forEach(function (link) {
    link.addEventListener("click", function () {
      mobileMenu.classList.remove("active");
    });
  });
}

function initSliderButtons() {
  const wrappers = document.querySelectorAll(".slider-wrapper");

  wrappers.forEach(function (wrapper) {
    const slider = wrapper.querySelector(".content-slider");
    const prev = wrapper.querySelector(".prev-btn");
    const next = wrapper.querySelector(".next-btn");

    if (!slider || !prev || !next) {
      return;
    }

    next.addEventListener("click", function () {
      slider.scrollBy({
        left: slider.clientWidth * 0.8,
        behavior: "smooth"
      });
    });

    prev.addEventListener("click", function () {
      slider.scrollBy({
        left: -(slider.clientWidth * 0.8),
        behavior: "smooth"
      });
    });
  });
}

function initSearch() {
  const searchBtn = document.getElementById("searchBtn");
  const searchArea = document.getElementById("searchArea");
  const input = document.getElementById("searchInput");
  const submit = document.getElementById("searchSubmit");

  searchBtn.addEventListener("click", function () {
    searchArea.classList.toggle("active");

    if (searchArea.classList.contains("active")) {
      input.focus();
    }
  });

  submit.addEventListener("click", searchContent);

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchContent();
    }
  });
}

async function searchContent() {
  const input = document.getElementById("searchInput");
  const keyword = input.value.trim();

  if (!keyword) {
    alert("검색어를 입력해주세요.");
    return;
  }

  const resultSection = document.getElementById("searchResultSection");
  const result = document.getElementById("searchResult");
  const title = document.getElementById("searchResultTitle");

  resultSection.classList.add("active");
  title.textContent = `"${keyword}" 검색 결과`;

  result.innerHTML = `
    <div class="loading">
      검색 중입니다.
    </div>
  `;

  const data = await fetchTMDB("/search/multi", {
    query: keyword,
    page: 1,
    include_adult: false
  });

  const filtered = data.results.filter(function (item) {
    return item.media_type === "movie" || item.media_type === "tv";
  });

  result.innerHTML = "";

  if (!filtered.length) {
    result.innerHTML = `
      <div class="loading">
        검색 결과가 없습니다.
      </div>
    `;
  } else {
    filtered.slice(0, 20).forEach(function (item) {
      result.appendChild(createContentCard(item));
    });
  }

  resultSection.scrollIntoView({
    behavior: "smooth"
  });
}

function initModal() {
  const modal = document.getElementById("detailModal");
  const close = document.getElementById("modalClose");
  const overlay = modal.querySelector(".modal-overlay");
  const infoBtn = document.getElementById("infoBtn");
  const playBtn = document.getElementById("playBtn");

  close.addEventListener("click", closeDetailModal);
  overlay.addEventListener("click", closeDetailModal);

  infoBtn.addEventListener("click", function () {
    if (currentHeroData) {
      openDetailModal(currentHeroData);
    }
  });

  playBtn.addEventListener("click", function () {
    if (currentHeroData) {
      openDetailModal(currentHeroData);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDetailModal();
    }
  });
}

function openDetailModal(item) {
  const modal = document.getElementById("detailModal");
  const image = document.getElementById("modalImage");
  const title = document.getElementById("modalTitle");
  const rating = document.getElementById("modalRating");
  const date = document.getElementById("modalDate");
  const description = document.getElementById("modalDescription");

  const contentTitle = getTitle(item);

  image.src = item.backdrop_path
    ? `${BACKDROP_BASE_URL}${item.backdrop_path}`
    : FALLBACK_IMAGE;

  image.alt = contentTitle;
  title.textContent = contentTitle;
  rating.textContent = `★ ${formatRating(item.vote_average)}`;
  date.textContent = getYear(item);
  description.textContent =
    item.overview || "등록된 콘텐츠 설명이 없습니다.";

  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

function closeDetailModal() {
  const modal = document.getElementById("detailModal");
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

function initServiceCode() {
  const button = document.querySelector(".service-code");

  button.addEventListener("click", function () {
    alert("서비스 코드 : STREAM-2026");
  });
}
