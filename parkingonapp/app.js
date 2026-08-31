(() => {
  "use strict";

  // ------------------------------------------------------------
  // 1. API 및 앱 상태 설정
  // ------------------------------------------------------------
  const API_URL = "https://api.data.go.kr/openapi/tn_pubr_prkplce_info_api";
  const API_KEY = (window.PARKING_API_KEY || "").trim();

  const state = {
    parkingData: [],
    filteredData: [],
    selectedParkingId: null,
    filters: {
      keyword: "",
      region: "전체",
      type: "전체",
      fee: "전체"
    },
    favorites: loadFavorites(),
    currentScreen: "home",
    previousScreen: "home",
    dataMode: "loading"
  };

  // API 키가 없을 때에도 모든 기능을 테스트할 수 있는 데모 데이터
  const demoParkingData = [
    {
      id: "DEMO-001",
      name: "서울역 서부 공영주차장",
      category: "공영",
      type: "노외",
      roadAddress: "서울특별시 중구 한강대로 405",
      address: "서울특별시 중구 봉래동2가",
      spaces: 120,
      days: "평일+토요일+공휴일",
      weekdayOpen: "00:00",
      weekdayClose: "23:59",
      saturdayOpen: "00:00",
      saturdayClose: "23:59",
      holidayOpen: "00:00",
      holidayClose: "23:59",
      feeInfo: "유료",
      basicTime: "30",
      basicCharge: "1000",
      addUnitTime: "10",
      addUnitCharge: "500",
      payment: "현금+카드",
      institution: "서울특별시",
      phone: "02-000-0001",
      latitude: "37.5556",
      longitude: "126.9707",
      referenceDate: "2026-08-01"
    },
    {
      id: "DEMO-002",
      name: "강남대로 공영주차장",
      category: "공영",
      type: "노상",
      roadAddress: "서울특별시 강남구 강남대로",
      address: "서울특별시 강남구 역삼동",
      spaces: 68,
      days: "평일+토요일",
      weekdayOpen: "09:00",
      weekdayClose: "22:00",
      saturdayOpen: "09:00",
      saturdayClose: "18:00",
      holidayOpen: "",
      holidayClose: "",
      feeInfo: "유료",
      basicTime: "10",
      basicCharge: "500",
      addUnitTime: "10",
      addUnitCharge: "500",
      payment: "카드",
      institution: "강남구",
      phone: "02-000-0002",
      latitude: "37.4979",
      longitude: "127.0276",
      referenceDate: "2026-08-01"
    },
    {
      id: "DEMO-003",
      name: "부산시청 공영주차장",
      category: "공영",
      type: "부설",
      roadAddress: "부산광역시 연제구 중앙대로 1001",
      address: "부산광역시 연제구 연산동",
      spaces: 240,
      days: "평일+토요일+공휴일",
      weekdayOpen: "08:00",
      weekdayClose: "23:00",
      saturdayOpen: "09:00",
      saturdayClose: "22:00",
      holidayOpen: "09:00",
      holidayClose: "22:00",
      feeInfo: "유료",
      basicTime: "10",
      basicCharge: "300",
      addUnitTime: "10",
      addUnitCharge: "300",
      payment: "카드",
      institution: "부산광역시",
      phone: "051-000-0003",
      latitude: "35.1798",
      longitude: "129.0750",
      referenceDate: "2026-08-01"
    },
    {
      id: "DEMO-004",
      name: "광주문화광장 주차장",
      category: "공영",
      type: "노외",
      roadAddress: "광주광역시 동구 문화전당로",
      address: "광주광역시 동구 광산동",
      spaces: 96,
      days: "매일",
      weekdayOpen: "00:00",
      weekdayClose: "23:59",
      saturdayOpen: "00:00",
      saturdayClose: "23:59",
      holidayOpen: "00:00",
      holidayClose: "23:59",
      feeInfo: "무료",
      basicTime: "",
      basicCharge: "0",
      addUnitTime: "",
      addUnitCharge: "0",
      payment: "-",
      institution: "광주광역시",
      phone: "062-000-0004",
      latitude: "35.1469",
      longitude: "126.9200",
      referenceDate: "2026-08-01"
    },
    {
      id: "DEMO-005",
      name: "대전역 동광장 주차장",
      category: "공영",
      type: "노외",
      roadAddress: "대전광역시 동구 중앙로",
      address: "대전광역시 동구 정동",
      spaces: 155,
      days: "매일",
      weekdayOpen: "00:00",
      weekdayClose: "23:59",
      saturdayOpen: "00:00",
      saturdayClose: "23:59",
      holidayOpen: "00:00",
      holidayClose: "23:59",
      feeInfo: "유료",
      basicTime: "30",
      basicCharge: "1200",
      addUnitTime: "10",
      addUnitCharge: "300",
      payment: "현금+카드",
      institution: "대전광역시",
      phone: "042-000-0005",
      latitude: "36.3320",
      longitude: "127.4342",
      referenceDate: "2026-08-01"
    },
    {
      id: "DEMO-006",
      name: "대구시민회관 공영주차장",
      category: "공영",
      type: "노외",
      roadAddress: "대구광역시 중구 태평로",
      address: "대구광역시 중구 태평로1가",
      spaces: 82,
      days: "평일+토요일",
      weekdayOpen: "08:00",
      weekdayClose: "22:00",
      saturdayOpen: "09:00",
      saturdayClose: "20:00",
      holidayOpen: "",
      holidayClose: "",
      feeInfo: "유료",
      basicTime: "30",
      basicCharge: "1000",
      addUnitTime: "10",
      addUnitCharge: "500",
      payment: "카드",
      institution: "대구광역시",
      phone: "053-000-0006",
      latitude: "35.8760",
      longitude: "128.5920",
      referenceDate: "2026-08-01"
    },
    {
      id: "DEMO-007",
      name: "인천종합문화예술회관 주차장",
      category: "공영",
      type: "부설",
      roadAddress: "인천광역시 남동구 예술로 149",
      address: "인천광역시 남동구 구월동",
      spaces: 320,
      days: "매일",
      weekdayOpen: "06:00",
      weekdayClose: "23:00",
      saturdayOpen: "06:00",
      saturdayClose: "23:00",
      holidayOpen: "06:00",
      holidayClose: "23:00",
      feeInfo: "유료",
      basicTime: "30",
      basicCharge: "600",
      addUnitTime: "15",
      addUnitCharge: "300",
      payment: "카드",
      institution: "인천광역시",
      phone: "032-000-0007",
      latitude: "37.4470",
      longitude: "126.7000",
      referenceDate: "2026-08-01"
    },
    {
      id: "DEMO-008",
      name: "서울숲 공영주차장",
      category: "공영",
      type: "노외",
      roadAddress: "서울특별시 성동구 뚝섬로 273",
      address: "서울특별시 성동구 성수동1가",
      spaces: 180,
      days: "매일",
      weekdayOpen: "00:00",
      weekdayClose: "23:59",
      saturdayOpen: "00:00",
      saturdayClose: "23:59",
      holidayOpen: "00:00",
      holidayClose: "23:59",
      feeInfo: "유료",
      basicTime: "5",
      basicCharge: "150",
      addUnitTime: "5",
      addUnitCharge: "150",
      payment: "카드",
      institution: "서울특별시",
      phone: "02-000-0008",
      latitude: "37.5444",
      longitude: "127.0374",
      referenceDate: "2026-08-01"
    }
  ];

  // ------------------------------------------------------------
  // 2. DOM 요소
  // ------------------------------------------------------------
  const screens = {
    home: document.querySelector("#homeScreen"),
    search: document.querySelector("#searchScreen"),
    list: document.querySelector("#listScreen"),
    detail: document.querySelector("#detailScreen"),
    favorite: document.querySelector("#favoriteScreen")
  };

  const headerTitle = document.querySelector("#headerTitle");
  const backButton = document.querySelector("#backButton");
  const refreshButton = document.querySelector("#refreshButton");
  const homeParkingList = document.querySelector("#homeParkingList");
  const parkingList = document.querySelector("#parkingList");
  const favoriteList = document.querySelector("#favoriteList");
  const resultCount = document.querySelector("#resultCount");
  const emptyState = document.querySelector("#emptyState");
  const favoriteEmptyState = document.querySelector("#favoriteEmptyState");
  const favoriteCount = document.querySelector("#favoriteCount");
  const searchInput = document.querySelector("#searchInput");
  const sortSelect = document.querySelector("#sortSelect");
  const currentFilterText = document.querySelector("#currentFilterText");
  const toast = document.querySelector("#toast");

  // ------------------------------------------------------------
  // 3. 공공데이터 API 호출
  // ------------------------------------------------------------
  async function fetchParkingData() {
    setApiStatus("loading", "공공데이터를 불러오는 중입니다.");

    // 키가 없으면 데모 데이터로 실행
    if (!API_KEY || API_KEY === "YOUR_API_KEY") {
      console.warn("[파킹온] API KEY가 설정되지 않아 데모 데이터를 사용합니다.");
      useDemoData("API 키를 config.js에 입력하면 실제 공공데이터를 불러옵니다.");
      return;
    }

    try {
      /*
       * 공공데이터포털에서 제공하는 Encoding 인증키는
       * 이미 %2F, %3D 등의 형태로 URL 인코딩되어 있습니다.
       *
       * URLSearchParams에 serviceKey를 넣으면 '%'가 '%25'로 다시
       * 인코딩되어 인증 오류가 발생할 수 있으므로 serviceKey는
       * URL에 직접 연결합니다.
       */
      const requestUrl =
        `${API_URL}?serviceKey=${API_KEY}` +
        `&pageNo=1` +
        `&numOfRows=500` +
        `&type=json`;

      console.log(
        "[파킹온] API 요청 URL:",
        requestUrl.replace(API_KEY, "***ENCODING_SERVICE_KEY***")
      );

      const response = await fetch(requestUrl);

      if (!response.ok) {
        throw new Error(`HTTP 오류: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("[파킹온] JSON 변환 실패. 서버 원문:", responseText);
        throw new Error("서버 응답이 JSON 형식이 아닙니다.");
      }

      // 요구사항: 서버에서 받은 데이터를 Console.log()로 확인
      console.log("[파킹온] 서버에서 받은 원본 데이터:", data);

      const header = data?.response?.header;
      if (header && header.resultCode && header.resultCode !== "00") {
        throw new Error(`${header.resultCode}: ${header.resultMsg || "API 응답 오류"}`);
      }

      const items = normalizeItems(data?.response?.body?.items);

      if (items.length === 0) {
        throw new Error("API 응답에 주차장 데이터가 없습니다.");
      }

      // 배열의 각 객체에서 필요한 항목만 선택하여 새로운 배열로 관리
      state.parkingData = items.map(convertApiItem).filter(item => item.name);
      state.filteredData = [...state.parkingData];
      state.dataMode = "api";

      console.log("[파킹온] 화면에 사용할 가공 데이터:", state.parkingData);

      setApiStatus("success", `실제 공공데이터 ${state.parkingData.length}건을 불러왔습니다.`);
      renderAll();
    } catch (error) {
      // 요구사항: API/네트워크 오류 처리
      console.error("[파킹온] API 또는 네트워크 오류:", error);
      useDemoData(`API 연결 오류로 데모 데이터를 표시합니다. (${error.message})`, true);
      showToast("API 연결 오류가 발생해 데모 데이터로 전환했습니다.");
    }
  }

  function normalizeItems(items) {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (Array.isArray(items.item)) return items.item;
    if (items.item) return [items.item];
    return [];
  }

  // 공공데이터의 긴 필드 구조를 앱에서 사용할 객체 구조로 변환
  function convertApiItem(item, index) {
    return {
      id: item.prkplceNo || `API-${index}`,
      name: item.prkplceNm || "",
      category: item.prkplceSe || "정보없음",
      type: item.prkplceType || "정보없음",
      roadAddress: item.rdnmadr || "",
      address: item.lnmadr || "",
      spaces: toNumber(item.prkcmprt),
      days: item.operDay || "정보없음",
      weekdayOpen: item.weekdayOperOpenHhmm || "",
      weekdayClose: item.weekdayOperColseHhmm || "",
      saturdayOpen: item.satOperOperOpenHhmm || "",
      saturdayClose: item.satOperCloseHhmm || "",
      holidayOpen: item.holidayOperOpenHhmm || "",
      holidayClose: item.holidayCloseOpenHhmm || "",
      feeInfo: item.parkingchrgeInfo || "정보없음",
      basicTime: item.basicTime || "",
      basicCharge: item.basicCharge || "",
      addUnitTime: item.addUnitTime || "",
      addUnitCharge: item.addUnitCharge || "",
      payment: item.metpay || "정보없음",
      institution: item.institutionNm || item.instt_nm || "정보없음",
      phone: item.phoneNumber || "정보없음",
      latitude: item.latitude || "",
      longitude: item.longitude || "",
      referenceDate: item.referenceDate || "정보없음"
    };
  }

  function useDemoData(description, isError = false) {
    state.parkingData = [...demoParkingData];
    state.filteredData = [...demoParkingData];
    state.dataMode = "demo";
    setApiStatus(isError ? "error" : "success", description);
    console.log("[파킹온] 현재 사용 중인 데모 데이터:", state.parkingData);
    renderAll();
  }

  // ------------------------------------------------------------
  // 4. 검색 및 필터
  // ------------------------------------------------------------
  function applyFilters() {
    const keyword = state.filters.keyword.trim().toLowerCase();

    state.filteredData = state.parkingData.filter(parking => {
      const searchableText = `${parking.name} ${parking.roadAddress} ${parking.address}`.toLowerCase();

      const matchKeyword = !keyword || searchableText.includes(keyword);
      const matchRegion = state.filters.region === "전체"
        || searchableText.includes(state.filters.region.toLowerCase());
      const matchType = state.filters.type === "전체"
        || parking.type.includes(state.filters.type);
      const matchFee = state.filters.fee === "전체"
        || parking.feeInfo.includes(state.filters.fee);

      return matchKeyword && matchRegion && matchType && matchFee;
    });

    sortFilteredData();
    console.log("[파킹온] 검색/필터 결과:", state.filteredData);
    renderParkingList();
    navigate("list");
  }

  function sortFilteredData() {
    const sortValue = sortSelect.value;

    state.filteredData.sort((a, b) => {
      if (sortValue === "spaces") {
        return b.spaces - a.spaces;
      }

      return a.name.localeCompare(b.name, "ko");
    });
  }

  function resetFilters() {
    state.filters = {
      keyword: "",
      region: "전체",
      type: "전체",
      fee: "전체"
    };

    searchInput.value = "";
    setActiveChip("#regionFilter", "전체");
    setActiveChip("#typeFilter", "전체");
    setActiveChip("#feeFilter", "전체");
    showToast("검색 조건을 초기화했습니다.");
  }

  // ------------------------------------------------------------
  // 5. 화면 렌더링
  // ------------------------------------------------------------
  function renderAll() {
    renderHomeList();
    renderParkingList();
    renderFavoriteList();
  }

  function renderHomeList() {
    homeParkingList.innerHTML = "";
    state.parkingData.slice(0, 3).forEach(parking => {
      homeParkingList.appendChild(createParkingCard(parking));
    });
  }

  function renderParkingList() {
    parkingList.innerHTML = "";
    resultCount.textContent = `${state.filteredData.length}개`;

    const filterLabels = [];
    if (state.filters.keyword) filterLabels.push(`검색: ${state.filters.keyword}`);
    if (state.filters.region !== "전체") filterLabels.push(`지역: ${state.filters.region}`);
    if (state.filters.type !== "전체") filterLabels.push(`유형: ${state.filters.type}`);
    if (state.filters.fee !== "전체") filterLabels.push(`요금: ${state.filters.fee}`);

    currentFilterText.textContent = filterLabels.length
      ? filterLabels.join(" · ")
      : "전체 데이터";

    if (state.filteredData.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    state.filteredData.forEach(parking => {
      parkingList.appendChild(createParkingCard(parking));
    });
  }

  function renderFavoriteList() {
    favoriteList.innerHTML = "";

    const favoriteParkings = state.parkingData.filter(parking =>
      state.favorites.includes(parking.id)
    );

    favoriteCount.textContent = `${favoriteParkings.length}개`;

    if (favoriteParkings.length === 0) {
      favoriteEmptyState.classList.remove("hidden");
      return;
    }

    favoriteEmptyState.classList.add("hidden");
    favoriteParkings.forEach(parking => {
      favoriteList.appendChild(createParkingCard(parking));
    });
  }

  function createParkingCard(parking) {
    const card = document.createElement("article");
    card.className = "parking-card";

    const saved = state.favorites.includes(parking.id);
    const address = parking.roadAddress || parking.address || "주소 정보 없음";

    card.innerHTML = `
      <div class="card-top">
        <div>
          <div class="badge-row">
            <span class="badge">${escapeHtml(parking.category)}</span>
            <span class="badge gray">${escapeHtml(parking.type)}</span>
            <span class="badge ${parking.feeInfo.includes("무료") ? "green" : ""}">
              ${escapeHtml(parking.feeInfo)}
            </span>
          </div>
          <h3 class="card-title">${escapeHtml(parking.name)}</h3>
          <p class="card-address">${escapeHtml(address)}</p>
        </div>
        <button class="favorite-mini ${saved ? "saved" : ""}" type="button"
          data-favorite-id="${escapeAttribute(parking.id)}"
          aria-label="즐겨찾기">
          ${saved ? "★" : "☆"}
        </button>
      </div>

      <div class="card-meta">
        <div class="meta-item">
          <span>주차면수</span>
          <strong>${parking.spaces ? `${parking.spaces}면` : "정보없음"}</strong>
        </div>
        <div class="meta-item">
          <span>평일 운영</span>
          <strong>${escapeHtml(formatTimeRange(parking.weekdayOpen, parking.weekdayClose))}</strong>
        </div>
      </div>

      <button class="card-detail-button" type="button"
        data-detail-id="${escapeAttribute(parking.id)}">
        상세정보 보기
      </button>
    `;

    return card;
  }

  function renderDetail(parking) {
    if (!parking) return;

    state.selectedParkingId = parking.id;

    document.querySelector("#detailName").textContent = parking.name;
    document.querySelector("#detailAddress").textContent =
      parking.roadAddress || parking.address || "주소 정보 없음";

    document.querySelector("#detailBadges").innerHTML = `
      <span class="badge">${escapeHtml(parking.category)}</span>
      <span class="badge gray">${escapeHtml(parking.type)}</span>
    `;

    document.querySelector("#detailSpaces").textContent =
      parking.spaces ? `${parking.spaces}면` : "정보없음";
    document.querySelector("#detailFee").textContent = parking.feeInfo || "정보없음";
    document.querySelector("#detailDays").textContent = parking.days || "정보없음";
    document.querySelector("#detailWeekday").textContent =
      formatTimeRange(parking.weekdayOpen, parking.weekdayClose);
    document.querySelector("#detailSaturday").textContent =
      formatTimeRange(parking.saturdayOpen, parking.saturdayClose);
    document.querySelector("#detailHoliday").textContent =
      formatTimeRange(parking.holidayOpen, parking.holidayClose);
    document.querySelector("#detailBasicFee").textContent =
      formatCharge(parking.basicTime, parking.basicCharge);
    document.querySelector("#detailExtraFee").textContent =
      formatCharge(parking.addUnitTime, parking.addUnitCharge);
    document.querySelector("#detailPayment").textContent = parking.payment || "정보없음";
    document.querySelector("#detailInstitution").textContent = parking.institution || "정보없음";
    document.querySelector("#detailPhone").textContent = parking.phone || "정보없음";
    document.querySelector("#detailDate").textContent = parking.referenceDate || "정보없음";

    const favoriteButton = document.querySelector("#detailFavoriteButton");
    const saved = state.favorites.includes(parking.id);
    favoriteButton.classList.toggle("saved", saved);
    favoriteButton.textContent = saved ? "★" : "☆";

    const address = parking.roadAddress || parking.address || parking.name;
    const mapLink = document.querySelector("#mapLink");

    // 별도 지도 API 키 없이 확인할 수 있도록 카카오맵 검색 링크 사용
    mapLink.href = `https://map.kakao.com/?q=${encodeURIComponent(address)}`;
  }

  // ------------------------------------------------------------
  // 6. 화면 이동
  // ------------------------------------------------------------
  function navigate(screenName) {
    if (!screens[screenName]) return;

    state.previousScreen = state.currentScreen;
    state.currentScreen = screenName;

    Object.entries(screens).forEach(([name, element]) => {
      element.classList.toggle("active", name === screenName);
    });

    document.querySelectorAll(".nav-item").forEach(button => {
      button.classList.toggle("active", button.dataset.go === screenName);
    });

    headerTitle.textContent = screens[screenName].dataset.title;
    backButton.classList.toggle("hidden", screenName === "home");

    window.scrollTo({ top: 0, behavior: "instant" });
    window.location.hash = screenName;
  }

  function openDetail(id) {
    const parking = state.parkingData.find(item => String(item.id) === String(id));

    if (!parking) {
      showToast("선택한 주차장 정보를 찾을 수 없습니다.");
      return;
    }

    console.log("[파킹온] 선택한 상세 데이터:", parking);
    renderDetail(parking);
    navigate("detail");
  }

  // ------------------------------------------------------------
  // 7. 즐겨찾기
  // ------------------------------------------------------------
  function toggleFavorite(id) {
    const idText = String(id);
    const index = state.favorites.indexOf(idText);

    if (index >= 0) {
      state.favorites.splice(index, 1);
      showToast("즐겨찾기에서 삭제했습니다.");
    } else {
      state.favorites.push(idText);
      showToast("즐겨찾기에 저장했습니다.");
    }

    saveFavorites();
    renderAll();

    if (state.currentScreen === "detail") {
      const parking = state.parkingData.find(item => String(item.id) === idText);
      if (parking) renderDetail(parking);
    }
  }

  function loadFavorites() {
    try {
      const saved = JSON.parse(localStorage.getItem("parkingOnFavorites")) || [];
      return saved.map(String);
    } catch (error) {
      console.error("[파킹온] 즐겨찾기 불러오기 오류:", error);
      return [];
    }
  }

  function saveFavorites() {
    localStorage.setItem("parkingOnFavorites", JSON.stringify(state.favorites));
  }

  // ------------------------------------------------------------
  // 8. 이벤트
  // ------------------------------------------------------------
  document.addEventListener("click", event => {
    const goButton = event.target.closest("[data-go]");
    if (goButton) {
      navigate(goButton.dataset.go);
      return;
    }

    const detailButton = event.target.closest("[data-detail-id]");
    if (detailButton) {
      openDetail(detailButton.dataset.detailId);
      return;
    }

    const favoriteButton = event.target.closest("[data-favorite-id]");
    if (favoriteButton) {
      toggleFavorite(favoriteButton.dataset.favoriteId);
      return;
    }

    const regionButton = event.target.closest("[data-region]");
    if (regionButton) {
      state.filters.region = regionButton.dataset.region;
      state.filters.keyword = "";
      searchInput.value = "";
      setActiveChip("#regionFilter", state.filters.region);
      applyFilters();
    }
  });

  document.querySelectorAll(".chip-group").forEach(group => {
    group.addEventListener("click", event => {
      const chip = event.target.closest(".chip");
      if (!chip) return;

      group.querySelectorAll(".chip").forEach(item => item.classList.remove("active"));
      chip.classList.add("active");

      if (group.id === "regionFilter") state.filters.region = chip.dataset.value;
      if (group.id === "typeFilter") state.filters.type = chip.dataset.value;
      if (group.id === "feeFilter") state.filters.fee = chip.dataset.value;
    });
  });

  document.querySelector("#searchSubmitButton").addEventListener("click", () => {
    state.filters.keyword = searchInput.value;
    applyFilters();
  });

  searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      state.filters.keyword = searchInput.value;
      applyFilters();
    }
  });

  document.querySelector("#applyFilterButton").addEventListener("click", () => {
    state.filters.keyword = searchInput.value;
    applyFilters();
  });

  document.querySelector("#resetFilterButton").addEventListener("click", resetFilters);

  sortSelect.addEventListener("change", () => {
    sortFilteredData();
    renderParkingList();
  });

  document.querySelector("#detailFavoriteButton").addEventListener("click", () => {
    if (state.selectedParkingId !== null) {
      toggleFavorite(state.selectedParkingId);
    }
  });

  backButton.addEventListener("click", () => {
    const target = state.currentScreen === "detail" ? "list" : "home";
    navigate(target);
  });

  refreshButton.addEventListener("click", () => {
    showToast("데이터를 다시 불러옵니다.");
    fetchParkingData();
  });

  window.addEventListener("hashchange", () => {
    const screenName = location.hash.replace("#", "");
    if (screens[screenName] && screenName !== state.currentScreen) {
      navigate(screenName);
    }
  });

  // ------------------------------------------------------------
  // 9. 공통 유틸리티
  // ------------------------------------------------------------
  function setActiveChip(groupSelector, value) {
    const group = document.querySelector(groupSelector);
    group.querySelectorAll(".chip").forEach(chip => {
      chip.classList.toggle("active", chip.dataset.value === value);
    });
  }

  function setApiStatus(type, description) {
    const dot = document.querySelector("#apiStatusDot");
    const title = document.querySelector("#apiStatusText");
    const desc = document.querySelector("#apiStatusDescription");

    dot.className = "status-dot";
    if (type === "success") dot.classList.add("success");
    if (type === "error") dot.classList.add("error");

    const titles = {
      loading: "데이터 준비 중",
      success: "데이터 연결 완료",
      error: "API 연결 오류"
    };

    title.textContent = titles[type] || "데이터 상태";
    desc.textContent = description;
  }

  function formatTimeRange(open, close) {
    if (!open && !close) return "정보없음";
    return `${open || "-"} ~ ${close || "-"}`;
  }

  function formatCharge(time, charge) {
    if (!time && (charge === "" || charge === undefined)) return "정보없음";

    const chargeNumber = Number(String(charge).replace(/,/g, ""));
    const formattedCharge = Number.isFinite(chargeNumber)
      ? `${chargeNumber.toLocaleString("ko-KR")}원`
      : `${charge || "정보없음"}`;

    return time ? `${time}분 / ${formattedCharge}` : formattedCharge;
  }

  function toNumber(value) {
    const number = Number(String(value ?? "").replace(/,/g, ""));
    return Number.isFinite(number) ? number : 0;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  // ------------------------------------------------------------
  // 10. 앱 시작
  // ------------------------------------------------------------
  function init() {
    const initialScreen = location.hash.replace("#", "");
    navigate(screens[initialScreen] ? initialScreen : "home");
    fetchParkingData();
  }

  init();
})();
