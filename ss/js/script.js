const storeListScreen = document.getElementById("storeListScreen");
const mapScreen = document.getElementById("mapScreen");

const mapBackButton = document.getElementById("mapBackButton");
const mapTabButton = document.getElementById("mapTabButton");
const currentLocationButton = document.getElementById("currentLocationButton");

const selectedStoreImage = document.getElementById("selectedStoreImage");
const selectedStoreName = document.getElementById("selectedStoreName");
const selectedStoreAddress = document.getElementById("selectedStoreAddress");
const selectedStoreStatus = document.getElementById("selectedStoreStatus");
const selectedStoreMachines = document.getElementById("selectedStoreMachines");
const selectedStoreDistance = document.getElementById("selectedStoreDistance");

let kakaoMap = null;
let storeMarker = null;
let selectedStoreId = "gangnam";


/* 매장 데이터 */

const stores = {
    gangnam: {
        name: "워셔타운 강남점",
        address: "서울 강남구 강남대로 382",
        status: "운영중",
        machines: "6대",
        distance: "50m",
        image: "./images/store01.png",
        latitude: 37.49808633653005,
        longitude: 127.02800140627488
    },

    yeoksam: {
        name: "클린업 역삼점",
        address: "서울 강남구 테헤란로 152",
        status: "운영중",
        machines: "3대",
        distance: "800m",
        image: "./images/store02.png",
        latitude: 37.50070,
        longitude: 127.03650
    },

    seolleung: {
        name: "워시프렌즈 선릉점",
        address: "서울 강남구 선릉로 428",
        status: "운영중",
        machines: "1대",
        distance: "1.2km",
        image: "./images/store03.png",
        latitude: 37.50452,
        longitude: 127.04902
    }
};


/* 화면 전환 */

function showMapScreen(storeId) {
    selectedStoreId = storeId;

    const store = stores[storeId];

    if (!store) {
        console.error("매장 정보를 찾을 수 없습니다.");
        return;
    }

    updateStoreSheet(store);

    storeListScreen.classList.remove("active");
    mapScreen.classList.add("active");

    initializeKakaoMap(store);
}


function showListScreen() {
    mapScreen.classList.remove("active");
    storeListScreen.classList.add("active");
}


/* 하단 매장 정보 변경 */

function updateStoreSheet(store) {
    selectedStoreImage.src = store.image;
    selectedStoreImage.alt = store.name;

    selectedStoreName.textContent = store.name;
    selectedStoreAddress.textContent = store.address;
    selectedStoreStatus.textContent = store.status;
    selectedStoreMachines.textContent = store.machines;
    selectedStoreDistance.textContent = store.distance;
}


/* 카카오 지도 생성 */

function initializeKakaoMap(store) {
    if (
        typeof kakao === "undefined" ||
        !kakao.maps
    ) {
        console.error(
            "카카오 지도 API를 불러오지 못했습니다. API 키와 등록 도메인을 확인하세요."
        );

        return;
    }

    kakao.maps.load(function () {
        const mapContainer = document.getElementById("kakaoMap");

        const storePosition = new kakao.maps.LatLng(
            store.latitude,
            store.longitude
        );

        if (!kakaoMap) {
            const mapOptions = {
                center: storePosition,
                level: 4
            };

            kakaoMap = new kakao.maps.Map(
                mapContainer,
                mapOptions
            );
        } else {
            kakaoMap.setCenter(storePosition);
            kakaoMap.setLevel(4);
        }

        createStoreMarker(storePosition);

        setTimeout(function () {
            kakaoMap.relayout();
            kakaoMap.setCenter(storePosition);
        }, 50);
    });
}


/* 커스텀 매장 마커 */

function createStoreMarker(position) {
    if (storeMarker) {
        storeMarker.setMap(null);
    }

    const markerImageSrc = "./images/icon_map_marker.png";

    const markerImageSize = new kakao.maps.Size(
        52,
        65
    );

    const markerImageOption = {
        offset: new kakao.maps.Point(
            26,
            65
        )
    };

    const markerImage = new kakao.maps.MarkerImage(
        markerImageSrc,
        markerImageSize,
        markerImageOption
    );

    storeMarker = new kakao.maps.Marker({
        position: position,
        image: markerImage,
        clickable: true
    });

    storeMarker.setMap(kakaoMap);
}


/* 현재 위치 이동 */

function moveToCurrentLocation() {
    if (!navigator.geolocation) {
        alert("현재 기기에서 위치 정보를 사용할 수 없습니다.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            if (!kakaoMap) {
                return;
            }

            const currentPosition = new kakao.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
            );

            kakaoMap.panTo(currentPosition);
        },

        function () {
            alert("현재 위치를 불러오지 못했습니다.");
        },

        {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 30000
        }
    );
}


/* 카드 클릭 */

document.querySelectorAll(".store-card").forEach(function (card) {
    card.addEventListener("click", function (event) {
        if (event.target.closest("[data-stop-card='true']")) {
            return;
        }

        const storeId = card.dataset.storeId;

        showMapScreen(storeId);
    });


    card.addEventListener("keydown", function (event) {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();

            const storeId = card.dataset.storeId;

            showMapScreen(storeId);
        }
    });
});


/* 버튼 이벤트 */

mapBackButton.addEventListener("click", showListScreen);

mapTabButton.addEventListener("click", function () {
    showMapScreen(selectedStoreId);
});

currentLocationButton.addEventListener(
    "click",
    moveToCurrentLocation
);