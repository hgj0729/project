/* =========================================
   Store Location Section
========================================= */

/*
  예시 좌표입니다.
  실제 카페온24 매장 좌표로 수정하세요.
*/

const storeLat = 37.498095;
const storeLng = 127.027610;


/* =========================================
   Kakao Map Section
========================================= */

const mapContainer = document.getElementById("map");

const mapOptions = {

  center: new kakao.maps.LatLng(
    storeLat,
    storeLng
  ),

  level: 4

};


/* 지도 생성 */

const map = new kakao.maps.Map(
  mapContainer,
  mapOptions
);


/* =========================================
   Kakao Map Marker Section
========================================= */

const markerPosition = new kakao.maps.LatLng(
  storeLat,
  storeLng
);


const marker = new kakao.maps.Marker({

  position: markerPosition

});


marker.setMap(map);


/* =========================================
   Kakao Map Control Section
========================================= */

/* 확대 / 축소 컨트롤 */

const zoomControl =
  new kakao.maps.ZoomControl();


map.addControl(
  zoomControl,
  kakao.maps.ControlPosition.RIGHT
);

/* responsive map relayout */
window.addEventListener("resize", function () {
  map.relayout();
  map.setCenter(markerPosition);
});
