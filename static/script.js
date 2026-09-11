document.addEventListener('DOMContentLoaded', () => {

    // ─── 초기 좌표 (진주시 중심) 및 전역 상태 ────────────────────────
    let startLatLng = L.latLng(35.1802, 128.1076); // 진주시청
    let endLatLng   = L.latLng(35.1780, 128.0940); // 칠암동 대학로 안심길
    let activeSearchTarget = null;
    let isFpvMode = false;
    let currentBearing = 0;
    
    let allSafeSpots = [];

    // ─── 🏛️ 진주시 주요 랜드마크 & POI 데이터베이스 (정밀 위경도 매핑) ───
    const JINJU_LANDMARKS = [
        // 🏫 초전동 학교 및 주요 시설
        { name: '진주동명고등학교', aliases: ['동명고', '동명고등학교', '진주동명고', '동명고정문'], addr: '초전동 461-1 (대신로 454-25 정문 진입로)', icon: '🏫', lat: 35.2008, lng: 128.1198 },
        { name: '동명중학교', aliases: ['동명중', '진주동명중학교', '동명중정문'], addr: '초전동 461-1 (대신로 454-25 정문)', icon: '🏫', lat: 35.2012, lng: 128.1198 },
        { name: '명신고등학교', aliases: ['명신고', '명신고등학교'], addr: '초전동 124 (대신로 614)', icon: '🏫', lat: 35.2045, lng: 128.1255 },
        { name: '초전공원', aliases: ['초전생태공원', '초전체육공원'], addr: '초전동 1100', icon: '🌳', lat: 35.2072, lng: 128.1215 },
        { name: '초전동 주민센터', aliases: ['초전동행정복지센터', '초전동'], addr: '초전동 677-1', icon: '🏢', lat: 35.2052, lng: 128.1224 },

        // 🏢 초전동 대표 아파트 단지 (정밀 좌표)
        { name: '초전 해모로 4단지', aliases: ['해모로4단지', '해모로 4단지', '초전해모로4단지', '초전해모로루비채4단지', '해모로루비채4단지', '해모로4차', '해모로4', '초북로 55'], addr: '초전동 1642 (초북로 55)', icon: '🏢', lat: 35.2085, lng: 128.1275 },
        { name: '초전 해모로 2단지', aliases: ['해모로2단지', '해모로 2단지', '초전해모로2단지', '초전해모로루비채2단지', '해모로루비채2단지', '해모로2차', '해모로2', '초북로 56'], addr: '초전동 1643 (초북로 56)', icon: '🏢', lat: 35.2075, lng: 128.1260 },
        { name: '초전 푸르지오', aliases: ['초전푸르지오', '초전푸르지오1단지', '초전푸르지오2단지', '푸르지오'], addr: '초전동 초전북로 61', icon: '🏢', lat: 35.2095, lng: 128.1245 },
        { name: '초전 엠코타운 더 프라하', aliases: ['엠코타운', '엠코타운더프라하', '초전엠코', '엠코'], addr: '초전동 초전북로 39', icon: '🏢', lat: 35.2065, lng: 128.1235 },
        { name: '초전 힐스테이트', aliases: ['힐스테이트초전', '초전힐스테이트', '힐스테이트'], addr: '초전동 초전북로 21', icon: '🏢', lat: 35.2045, lng: 128.1230 },
        { name: '초전 이지더원', aliases: ['이지더원', '초전이지더원'], addr: '초전동 1658', icon: '🏢', lat: 35.2100, lng: 128.1290 },

        // 🏫 진주시 주요 고등학교 및 대학교
        { name: '진주고등학교', aliases: ['진주고', '진주고교'], addr: '인사동 1-1', icon: '🏫', lat: 35.1983, lng: 128.0776 },
        { name: '진주여자고등학교', aliases: ['진주여고'], addr: '상봉동 984', icon: '🏫', lat: 35.2023, lng: 128.0834 },
        { name: '대아고등학교', aliases: ['대아고'], addr: '이현동 17-1', icon: '🏫', lat: 35.2014, lng: 128.0642 },
        { name: '경남예술고등학교', aliases: ['경남예고'], addr: '이현동', icon: '🏫', lat: 35.1905, lng: 128.0650 },
        { name: '경상국립대학교', aliases: ['경상대', '경상국립대', '가좌캠퍼스'], addr: '가좌동 501번지', icon: '🏫', lat: 35.1522, lng: 128.1008 },
        { name: '경상국립대 칠암캠퍼스', aliases: ['경남과기대', '과기대', '칠암캠퍼스'], addr: '칠암동 33', icon: '🏫', lat: 35.1804, lng: 128.0942 },

        // 🏛️ 진주시 주요 관공서 및 교통
        { name: '진주시청', aliases: ['시청', '진주시청본관'], addr: '상대동 520-2', icon: '🏛️', lat: 35.1802, lng: 128.1076 },
        { name: '진주고속버스터미널', aliases: ['고속터미널', '고속버스터미널'], addr: '칠암동 489-60', icon: '🚌', lat: 35.1788, lng: 128.0924 },
        { name: '진주시외버스터미널', aliases: ['시외터미널', '시외버스터미널'], addr: '장대동 96-1', icon: '🚌', lat: 35.1906, lng: 128.0888 },
        { name: '진주역', aliases: ['진주역KTX', '신진주역', '개좌동역'], addr: '가좌동 1238', icon: '🚉', lat: 35.1540, lng: 128.1180 },
        { name: '진주성', aliases: ['촉석루', '진주성공원'], addr: '남성동 170', icon: '🏯', lat: 35.1935, lng: 128.0811 },
        { name: '국립진주박물관', aliases: ['진주박물관'], addr: '남성동 169-17 (진주성 내)', icon: '🏛️', lat: 35.1940, lng: 128.0808 },

        // 🏥 의료 및 대형 상권
        { name: '경상국립대학교병원', aliases: ['경상대병원', '진주경상대병원'], addr: '칠암동 90', icon: '🏥', lat: 35.1854, lng: 128.0875 },
        { name: '진주 고려병원', aliases: ['고려병원'], addr: '칠암동 485-2', icon: '🏥', lat: 35.1812, lng: 128.0931 },
        { name: '진주 제일병원', aliases: ['제일병원'], addr: '강남동 181-1', icon: '🏥', lat: 35.1866, lng: 128.0855 },
        { name: '진주 롯데시네마', aliases: ['롯데시네마', '진주롯데시네마', '롯데시네마진주', '롯데시네마혁신', '롯데몰시네마'], addr: '충무공동 롯데몰 4F', icon: '🎬', lat: 35.1725, lng: 128.1448 },
        { name: '롯데시네마 프리미엄진주', aliases: ['프리미엄진주', '대안동롯데시네마', '시내롯데시네마'], addr: '대안동 13-11', icon: '🎬', lat: 35.1950, lng: 128.0837 },
        { name: '롯데시네마 엠비씨네', aliases: ['엠비씨네', 'MBC시네마', '가좌동롯데시네마'], addr: '가좌동 MBC경남', icon: '🎬', lat: 35.1610, lng: 128.1070 },
        { name: '진주 이마트', aliases: ['이마트', '이마트진주점'], addr: '인사동 8-1', icon: '🛒', lat: 35.1945, lng: 128.0754 },
        { name: '진주 홈플러스', aliases: ['홈플러스', '홈플러스진주점'], addr: '상대동 300-11', icon: '🛒', lat: 35.1782, lng: 128.1143 },
        { name: '진주 롯데마트', aliases: ['롯데마트', '롯데몰', '롯데몰진주점'], addr: '충무공동 35', icon: '🛒', lat: 35.1723, lng: 128.1445 },
        { name: '하대 탑마트', aliases: ['탑마트', '하대동탑마트'], addr: '하대동 315-1', icon: '🛒', lat: 35.1932, lng: 128.1156 },
        { name: 'CGV 진주', aliases: ['진주CGV', 'CGV'], addr: '대안동 11-1', icon: '🎬', lat: 35.1938, lng: 128.0845 },
        { name: '진주 중앙시장', aliases: ['중앙시장'], addr: '대안동 8-54', icon: '🛍️', lat: 35.1934, lng: 128.0858 },

        // 🏙️ 충무공동 혁신도시 및 평거/신안/하대동 주요 거점
        { name: '진주 혁신도시 LH본사', aliases: ['혁신도시', 'LH본사', '충무공동'], addr: '충무공동 LH본사', icon: '🏙️', lat: 35.1710, lng: 128.1440 },
        { name: '진주종합경기장', aliases: ['종합경기장', '혁신도시경기장'], addr: '충무공동 8', icon: '🏟️', lat: 35.1795, lng: 128.1408 },
        { name: '평거동 공설운동장', aliases: ['신안공설운동장', '공설운동장'], addr: '평거동 455', icon: '⚽', lat: 35.1843, lng: 128.0701 },
        { name: '칠암동 대학로 안심길', aliases: ['칠암동안심길', '칠암동대학로', '칠암동'], addr: '칠암동 485', icon: '🛡️', lat: 35.1780, lng: 128.0940 },
        { name: '하대동 주민센터', aliases: ['하대동행정복지센터', '하대동'], addr: '하대동 1089-1', icon: '🏢', lat: 35.1924, lng: 128.1201 },
        { name: '상대동 주민센터', aliases: ['상대동행정복지센터', '상대동'], addr: '상대동 297-15', icon: '🏢', lat: 35.1820, lng: 128.1105 },
        { name: '평거동 행정복지센터', aliases: ['평거동주민센터', '평거동'], addr: '평거동 916', icon: '🏢', lat: 35.1740, lng: 128.0620 },
        { name: '가좌동 주공아파트', aliases: ['가좌주공', '가좌동'], addr: '가좌동 660', icon: '🏠', lat: 35.1580, lng: 128.1060 },
        { name: '신진주역 시티프라디움', aliases: ['시티프라디움', '신진주시티프라디움'], addr: '가좌동 1928', icon: '🏢', lat: 35.1505, lng: 128.1140 },
        { name: '신진주역 센트럴자이', aliases: ['센트럴자이', '신진주자이'], addr: '가좌동 1929', icon: '🏢', lat: 35.1495, lng: 128.1155 }
    ];

    // ─── 시간 기반 가로등 점등 여부 판단 ────────────────────────────────
    // 실제 가로등은 일몰(18:00)~일출(06:00)에만 점등. 낮에는 꺼져 있음.
    function isLightActive(spot) {
        if (spot.type !== 'light') return spot.status === 'active';
        if (spot.status === 'out') return false; // 고장/신고 처리된 경우
        const hour = new Date().getHours();
        // 06:00 ~ 18:00 는 낮 → 가로등 꺼짐 (귀갓길 위험도 반영 불필요)
        // 18:00 ~ 06:00 는 밤 → 가로등 켜짐 (안심 경로 점수 반영)
        return hour >= 18 || hour < 6;
    }

    // 경로 위 조명 밀도 점수 계산 (0.0 ~ 1.0, 높을수록 밝음)
    function calcRouteLightingScore(routeCoords) {
        if (!routeCoords || routeCoords.length === 0) return 1;
        const sampleCount = Math.min(15, routeCoords.length);
        const step = Math.floor(routeCoords.length / sampleCount);
        let totalLit = 0;
        let totalChecked = 0;
        for (let i = 0; i < routeCoords.length; i += step) {
            const pt = routeCoords[i];
            const nearby = allSafeSpots.filter(s =>
                (s.type === 'light' || s.type === 'cctv') &&
                getDistance(pt.lat, pt.lng, s.coords[0], s.coords[1]) < 50
            );
            const lit = nearby.filter(s => isLightActive(s)).length;
            totalLit += lit;
            totalChecked += nearby.length;
        }
        if (totalChecked === 0) return 0;
        return totalLit / totalChecked;
    }
    let spotLayers = new Map();
    let currentRouteCoords = [];
    let currentRouteStats = null;
    
    // 차단/우회 상태 관리
    let originalMasterRoute = [];
    let previousBlockedCoords = [];
    let blockedPolyline = null;
    let currentPolyline = null;
    let currentPolylineGlow = null;
    let currentPolylineCore = null;
    let passedPolyline = null;
    let heatmapLayerGroup = null;
    let isHeatmapActive = false;
    
    // GPS 실시간 추적 상태
    let liveWatchId = null;
    let isLiveGpsActive = false;
    let lastGpsPosition = null;

    // 카메라 추적 상태 관리 (사용자가 드래그 시 자유 이동 허용)
    let isCameraFollow = true;

    // ─── 고해상도 상세 지도 타일 레이어 정의 (API 키 제약 및 워터마크 없음) ────
    const tileLayers = {
        detailed_streets: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }),
        dark_neon: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            className: 'dark-neon-tiles',
            attribution: '&copy; OpenStreetMap contributors'
        }),
        voyager: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            className: 'voyager-clean-tiles',
            attribution: '&copy; OpenStreetMap contributors'
        }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: '&copy; Esri'
        })
    };

    // ─── Leaflet 지도 초기화 (초고성능 Canvas 렌더러 활성화) ───────────
    const canvasRenderer = L.canvas({ padding: 0.5, tolerance: 5 });

    const map = L.map('map', {
        preferCanvas: true,
        renderer: canvasRenderer,
        zoomControl: true,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
        inertia: true
    }).setView(startLatLng, 15);

    let activeTileLayer = tileLayers.detailed_streets;
    activeTileLayer.addTo(map);

    const mapStyleSelect = document.getElementById('map-style-select');
    mapStyleSelect.addEventListener('change', (e) => {
        const styleKey = e.target.value;
        if (tileLayers[styleKey]) {
            map.removeLayer(activeTileLayer);
            activeTileLayer = tileLayers[styleKey];
            activeTileLayer.addTo(map);
        }
    });

    // ─── 사용자가 마우스로 지도 드래그/줌할 때 카메라 팔로우 일시 해제 ──
    const btnRecenter = document.getElementById('btn-recenter-walker');

    map.on('dragstart', () => {
        if (isSimRunning || isLiveGpsActive || isFpvMode) {
            isCameraFollow = false;
            btnRecenter.classList.remove('hidden');
        }
    });

    map.on('zoomstart', (e) => {
        // 사용자 인터랙션 줌일 경우
        if (e.originalEvent) {
            isCameraFollow = false;
            btnRecenter.classList.remove('hidden');
        }
    });

    btnRecenter.addEventListener('click', () => {
        isCameraFollow = true;
        btnRecenter.classList.add('hidden');
        const pos = walkerMarker ? walkerMarker.getLatLng() : startMarker.getLatLng();
        map.panTo(pos, { animate: true, duration: 0.5 });
    });

    // ─── 마커 아이콘 정의 ─────────────────────────────────────────────
    const startIcon = L.divIcon({
        className: 'custom-pin',
        html: '<div style="font-size:26px; filter:drop-shadow(0 0 10px #FFD600); transform:translate(-13px,-26px);">📍</div>',
        iconAnchor: [13, 26]
    });

    const endIcon = L.divIcon({
        className: 'custom-pin',
        html: '<div style="font-size:26px; filter:drop-shadow(0 0 10px #FF2A85); transform:translate(-13px,-26px);">🏁</div>',
        iconAnchor: [13, 26]
    });

    const walkerIcon = L.divIcon({
        className: 'walker-pin',
        html: '<div class="character-avatar" id="walker-avatar">🚶</div>',
        iconAnchor: [17, 17]
    });

    const startMarker = L.marker(startLatLng, { icon: startIcon, draggable: true }).addTo(map).bindPopup('<b>출발지</b>');
    const endMarker   = L.marker(endLatLng,   { icon: endIcon,   draggable: true }).addTo(map).bindPopup('<b>도착지</b>');

    startMarker.on('dragend', () => {
        startLatLng = startMarker.getLatLng();
        document.getElementById('input-start').value = `📍 [위치] ${startLatLng.lat.toFixed(4)}, ${startLatLng.lng.toFixed(4)}`;
        calculateSafeRoute(false, true); // 신규 탐색 → 위치 리셋
    });

    endMarker.on('dragend', () => {
        endLatLng = endMarker.getLatLng();
        document.getElementById('input-end').value = `🏁 [위치] ${endLatLng.lat.toFixed(4)}, ${endLatLng.lng.toFixed(4)}`;
        calculateSafeRoute(false, true); // 신규 탐색 → 위치 리셋
    });

    // ─── 📍 지도 클릭 시 즉시 출발지/도착지 선택 미니 팝업 ─────────────
    let clickPickerPopup = null;
    map.on('click', (e) => {
        if (isSimRunning || isLiveGpsActive) return;

        const content = document.createElement('div');
        content.className = 'map-quick-picker-box';
        content.style.cssText = 'font-family:Pretendard,sans-serif; text-align:center; padding:4px 2px; min-width:140px;';
        content.innerHTML = `
            <div style="font-weight:800; font-size:12px; margin-bottom:8px; color:#1a1d24;">📍 선택한 위치 지정</div>
            <div style="display:flex; gap:6px; justify-content:center;">
                <button id="btn-quick-set-start" style="padding:6px 10px; background:#00FF90; color:#0A101D; border:none; border-radius:6px; font-weight:800; font-size:11px; cursor:pointer; box-shadow:0 2px 6px rgba(0,255,144,0.4);">📍 출발지</button>
                <button id="btn-quick-set-end" style="padding:6px 10px; background:#FF2A85; color:#FFFFFF; border:none; border-radius:6px; font-weight:800; font-size:11px; cursor:pointer; box-shadow:0 2px 6px rgba(255,42,133,0.4);">🏁 도착지</button>
            </div>
        `;

        if (clickPickerPopup) map.closePopup(clickPickerPopup);
        clickPickerPopup = L.popup({ closeButton: false, offset: [0, -10] })
            .setLatLng(e.latlng)
            .setContent(content)
            .openOn(map);

        content.querySelector('#btn-quick-set-start').addEventListener('click', () => {
            startLatLng = e.latlng;
            startMarker.setLatLng(startLatLng);
            document.getElementById('input-start').value = `📍 지도 지정 위치 (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`;
            map.closePopup(clickPickerPopup);
            calculateSafeRoute(false, true);
        });

        content.querySelector('#btn-quick-set-end').addEventListener('click', () => {
            endLatLng = e.latlng;
            endMarker.setLatLng(endLatLng);
            document.getElementById('input-end').value = `🏁 지도 지정 위치 (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`;
            map.closePopup(clickPickerPopup);
            calculateSafeRoute(false, true);
        });
    });

    // ─── 인프라 필터링 상태 ──────────────────────────────────────────
    let activeInfraFilter = 'all'; // 'all', 'cctv', 'light', 'night_store'
    const spotLayerGroup = L.layerGroup().addTo(map);
    heatmapLayerGroup = L.layerGroup().addTo(map);

    // ─── 🌟 야간 조도 히트맵 (Luminescence Heatmap & Ambient Halo) ───
    function renderHeatmapOverlay() {
        if (!heatmapLayerGroup) return;
        heatmapLayerGroup.clearLayers();
        if (!isHeatmapActive) return;

        const bounds = map.getBounds().pad(0.25);
        const visibleSpots = allSafeSpots.filter(s =>
            s.status === 'active' && bounds.contains(L.latLng(s.coords[0], s.coords[1]))
        );

        visibleSpots.forEach(spot => {
            if (spot.type === 'light') {
                const rad = spot.radius_m || 25;
                L.circle(spot.coords, {
                    renderer: canvasRenderer,
                    radius: rad * 1.5,
                    fillColor: '#FFD600',
                    fillOpacity: 0.18,
                    stroke: false
                }).addTo(heatmapLayerGroup);
                L.circle(spot.coords, {
                    renderer: canvasRenderer,
                    radius: rad * 3.2,
                    fillColor: '#FFAA00',
                    fillOpacity: 0.07,
                    stroke: false
                }).addTo(heatmapLayerGroup);
            } else if (spot.type === 'night_store') {
                L.circle(spot.coords, {
                    renderer: canvasRenderer,
                    radius: 55,
                    fillColor: '#00FFA3',
                    fillOpacity: 0.22,
                    stroke: false
                }).addTo(heatmapLayerGroup);
                L.circle(spot.coords, {
                    renderer: canvasRenderer,
                    radius: 110,
                    fillColor: '#00F0FF',
                    fillOpacity: 0.08,
                    stroke: false
                }).addTo(heatmapLayerGroup);
            } else if (spot.type === 'cctv') {
                L.circle(spot.coords, {
                    renderer: canvasRenderer,
                    radius: 42,
                    fillColor: '#00E5FF',
                    fillOpacity: 0.11,
                    stroke: false
                }).addTo(heatmapLayerGroup);
            }
        });
    }

    // 필터 버튼 이벤트 바인딩
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetType = e.currentTarget.getAttribute('data-type');
            document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            activeInfraFilter = targetType;
            renderSafetySpots();
            if (isHeatmapActive) renderHeatmapOverlay();
        });
    });

    // ─── CCTV 감시 화각 (FOV Sector Cone) 지오메트리 계산 함수 ──────────
    function createFovSectorPoints(centerLat, centerLng, directionDeg, fovDeg, rangeMeters) {
        const points = [[centerLat, centerLng]];
        const halfFov = fovDeg / 2;
        const startAngle = directionDeg - halfFov;
        const endAngle = directionDeg + halfFov;
        const steps = 14; // 부드러운 호를 위한 분할 수
        
        const latRad = centerLat * Math.PI / 180;
        const metersPerLat = 111320;
        const metersPerLng = 111320 * Math.cos(latRad);

        for (let i = 0; i <= steps; i++) {
            const angle = startAngle + (i / steps) * (endAngle - startAngle);
            const rad = (90 - angle) * Math.PI / 180; // 지도 기준(0=북, 90=동)
            const dLat = (rangeMeters * Math.sin(rad)) / metersPerLat;
            const dLng = (rangeMeters * Math.cos(rad)) / metersPerLng;
            points.push([centerLat + dLat, centerLng + dLng]);
        }
        points.push([centerLat, centerLng]);
        return points;
    }

    // ─── 🔤 인코딩 깨짐 감지 (EUC-KR 오류 문자 포함 여부) ────────────────
    function isGarbledName(name) {
        if (!name || typeof name !== 'string') return true;
        // 깨진 문자(대체 문자 등) 비율이 높으면 깨진 것으로 판단
        const garbledPattern = /[\uFFFD\u00C2-\u00FF]{2,}|[\x80-\xBF]{2,}/;
        if (garbledPattern.test(name)) return true;
        // 한글·영어·숫자·공백·특수문자 아닌 문자 비율이 40% 초과 시 깨진 것으로 판단
        const validChars = (name.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF\w\s\.,!\?\-\(\)]/g) || []).length;
        return validChars / name.length < 0.6;
    }

    function cleanSpotName(spot) {
        if (isGarbledName(spot.name)) {
            if (spot.type === 'night_store') return '안심 업소';
            if (spot.type === 'cctv') return '방범 CCTV';
            if (spot.type === 'light') return '안심 가로등';
            return '안심 시설';
        }
        return spot.name;
    }

    // ─── 진주시 유효 경계 (이 범위 밖 데이터는 오류 데이터로 무시) ───────
    const JINJU_BOUNDS = {
        minLat: 34.90, maxLat: 35.35,
        minLng: 127.85, maxLng: 128.30
    };
    function isValidJinjuCoord(coords) {
        if (!Array.isArray(coords) || coords.length < 2) return false;
        const [lat, lng] = coords;
        return lat >= JINJU_BOUNDS.minLat && lat <= JINJU_BOUNDS.maxLat &&
               lng >= JINJU_BOUNDS.minLng && lng <= JINJU_BOUNDS.maxLng;
    }

    // ─── 실제 진주시 안심 데이터 로드 및 렌더링 ────────────────────────
    async function loadSafetySpots() {
        try {
            let res = await fetch('/api/safety_data');
            let data = null;
            if (res.ok) {
                data = await res.json();
            } else {
                let fbRes = await fetch('safe_spots.json');
                data = await fbRes.json();
            }
            if (data && data.spots) {
                // 진주시 경계 밖 오류 데이터 필터링
                allSafeSpots = data.spots.filter(s => isValidJinjuCoord(s.coords));
                renderSafetySpots();
                const totalBadge = document.getElementById('total-spots-badge');
                if (totalBadge) totalBadge.textContent = `${allSafeSpots.length.toLocaleString()}개 연동`;
            }
        } catch (e) {
            try {
                let fbRes = await fetch('safe_spots.json');
                let data = await fbRes.json();
                allSafeSpots = (data.spots || []).filter(s => isValidJinjuCoord(s.coords));
                renderSafetySpots();
                const totalBadge = document.getElementById('total-spots-badge');
                if (totalBadge) totalBadge.textContent = `${allSafeSpots.length.toLocaleString()}개 연동`;
            } catch (err) {
                console.error('데이터 로드 실패:', err);
            }
        }
    }

    // 지도 줌/이동 시 디바운스 최적화
    let renderDebounceTimer = null;
    map.on('moveend', () => {
        if (renderDebounceTimer) clearTimeout(renderDebounceTimer);
        renderDebounceTimer = setTimeout(() => {
            renderSafetySpots();
            if (isHeatmapActive) renderHeatmapOverlay();
        }, 80);
    });

    function renderSafetySpots() {
        spotLayerGroup.clearLayers();
        spotLayers.clear();

        const zoom = map.getZoom();
        const bounds = map.getBounds();
        const padBounds = bounds.pad(0.2); // 뷰포트 근접 영역만 계산
        const center = map.getCenter();

        // 1. 현재 화면 영역 안의 스팟 필터링
        let visibleSpots = allSafeSpots.filter(spot => {
            if (activeInfraFilter !== 'all' && spot.type !== activeInfraFilter) {
                return false;
            }
            return padBounds.contains(L.latLng(spot.coords[0], spot.coords[1]));
        });

        // 중심에서 가까운 순으로 정렬하여 최대 120개까지만 상세 렌더링 (렉 완벽 방지)
        if (visibleSpots.length > 150) {
            visibleSpots.sort((a, b) => {
                const da = Math.pow(a.coords[0] - center.lat, 2) + Math.pow(a.coords[1] - center.lng, 2);
                const db = Math.pow(b.coords[0] - center.lat, 2) + Math.pow(b.coords[1] - center.lng, 2);
                return da - db;
            });
            visibleSpots = visibleSpots.slice(0, 150);
        }

        visibleSpots.forEach(spot => {
            const isOut = (spot.status === 'out');
            const subLayers = [];

            if (spot.type === 'cctv') {
                const fov = spot.fov || 120;
                const rangeM = spot.range_m || 38;
                const dir = spot.direction || 0;

                // 1. CCTV 감시 화각 (Canvas 가속 렌더링)
                let fovLayer = null;
                if (fov >= 360) {
                    fovLayer = L.circle(spot.coords, {
                        renderer: canvasRenderer,
                        color: isOut ? '#FF3B30' : '#00E5FF',
                        fillColor: isOut ? '#FF3B30' : '#00E5FF',
                        fillOpacity: isOut ? 0.08 : 0.16,
                        radius: rangeM,
                        weight: isOut ? 1 : 1.5,
                        dashArray: isOut ? '3, 3' : '4, 2'
                    });
                } else {
                    const sectorPts = createFovSectorPoints(spot.coords[0], spot.coords[1], dir, fov, rangeM);
                    fovLayer = L.polygon(sectorPts, {
                        renderer: canvasRenderer,
                        color: isOut ? '#FF3B30' : '#00E5FF',
                        fillColor: isOut ? '#FF3B30' : '#00E5FF',
                        fillOpacity: isOut ? 0.10 : 0.22,
                        weight: isOut ? 1 : 1.5,
                        dashArray: isOut ? '3, 3' : null
                    });
                }
                fovLayer.addTo(spotLayerGroup);
                subLayers.push(fovLayer);

                // 2. 고배율 줌 시 상세 카메라 핀
                if (zoom >= 14) {
                    const cctvIcon = L.divIcon({
                        className: 'cctv-div-icon',
                        html: `
                            <div class="cctv-marker-container">
                                <div class="cctv-cam-pin ${isOut ? 'out' : ''}">
                                    <span>📹</span>
                                </div>
                                ${!isOut ? '<span class="rec-dot"></span>' : ''}
                                ${spot.has_bell ? '<span class="cctv-bell-badge">🚨</span>' : ''}
                            </div>
                        `,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    });

                    const marker = L.marker(spot.coords, { icon: cctvIcon }).addTo(spotLayerGroup);
                    subLayers.push(marker);
                    bindRichPopup(marker, spot, '📹', '방범 CCTV & 안심비상벨');
                }
                bindRichPopup(fovLayer, spot, '📹', '방범 CCTV & 안심비상벨');

            } else if (spot.type === 'light') {
                const lightRadius = spot.radius_m || 22;
                const halo = L.circle(spot.coords, {
                    renderer: canvasRenderer,
                    color: isOut ? '#FF3B30' : '#FFD600',
                    fillColor: isOut ? '#FF3B30' : '#FFD600',
                    fillOpacity: isOut ? 0.08 : 0.22,
                    radius: isOut ? lightRadius * 0.8 : lightRadius,
                    weight: isOut ? 1 : 0,
                    dashArray: isOut ? '3, 3' : null
                }).addTo(spotLayerGroup);
                subLayers.push(halo);

                if (zoom >= 15) {
                    const lightIcon = L.divIcon({
                        className: 'light-div-icon',
                        html: `<div class="light-marker-pin ${isOut ? 'out' : ''}">💡</div>`,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });
                    const marker = L.marker(spot.coords, { icon: lightIcon }).addTo(spotLayerGroup);
                    subLayers.push(marker);
                    bindRichPopup(marker, spot, '💡', '스마트 안심 가로등');
                }
                bindRichPopup(halo, spot, '💡', '스마트 안심 가로등');

            } else if (spot.type === 'night_store') {
                const storeRadius = spot.radius_m || 35;
                const storeCircle = L.circle(spot.coords, {
                    renderer: canvasRenderer,
                    color: isOut ? '#FF3B30' : '#00FFA3',
                    fillColor: isOut ? '#FF3B30' : '#00FFA3',
                    fillOpacity: isOut ? 0.08 : 0.25,
                    radius: storeRadius,
                    weight: 1.5,
                    dashArray: isOut ? '3, 3' : null
                }).addTo(spotLayerGroup);
                subLayers.push(storeCircle);

                if (zoom >= 14) {
                    const displayName = cleanSpotName(spot);
                    const storeIcon = L.divIcon({
                        className: 'store-div-icon',
                        html: `<div class="store-marker-pin ${isOut ? 'out' : ''}">${spot.icon || '🏪'} ${displayName}</div>`,
                        iconSize: [80, 22],
                        iconAnchor: [40, 11]
                    });
                    const marker = L.marker(spot.coords, { icon: storeIcon }).addTo(spotLayerGroup);
                    subLayers.push(marker);
                    bindRichPopup(marker, spot, '🏪', '야간 불 켜진 상점');
                }
                bindRichPopup(storeCircle, spot, '🏪', '야간 불 켜진 상점');
            }

            spotLayers.set(spot.id, subLayers);
        });
    }

    // ─── 상세하고 직관적인 인프라 팝업 바인딩 ─────────────────────────
    function bindRichPopup(layer, spot, iconEmoji, typeTitle) {
        const isOut = (spot.status === 'out');
        const popupEl = document.createElement('div');
        popupEl.className = 'spot-popup';

        let metaHtml = '';
        if (spot.type === 'cctv') {
            metaHtml = `
                <div class="spot-meta-tags">
                    <span class="meta-pill cyan">🔴 4K AI 감시중</span>
                    <span class="meta-pill cyan">화각: ${spot.fov || 120}° (${spot.range_m || 38}m)</span>
                    <span class="meta-pill emerald">🚨 긴급 비상벨</span>
                </div>
                <div class="spot-desc-text">
                    <b>관제:</b> ${spot.control_center || '진주시 도시관제센터 24시 실시간 연동'}<br>
                    <b>특징:</b> ${spot.desc || 'AI 이상행동 감지 및 골목 집중 방범'}
                </div>
            `;
        } else if (spot.type === 'light') {
            metaHtml = `
                <div class="spot-meta-tags">
                    <span class="meta-pill yellow">조도: ${spot.lux || '150 Lux'}</span>
                    <span class="meta-pill yellow">반경: ${spot.radius_m || 25}m</span>
                    <span class="meta-pill">${spot.pole_id || 'JJ-LIGHT'}</span>
                </div>
                <div class="spot-desc-text">
                    <b>기능:</b> ${spot.desc || '보행자 감지 자동 스마트 점등 고효율 LED'}
                </div>
            `;
        } else if (spot.type === 'night_store') {
            metaHtml = `
                <div class="spot-meta-tags">
                    <span class="meta-pill emerald">영업: ${spot.open_hours || '24시간'}</span>
                    <span class="meta-pill emerald">🛡️ 여성안심지킴이집</span>
                </div>
                <div class="spot-desc-text">
                    <b>대피:</b> ${spot.desc || '야간 긴급 대피소 및 밝은 보행로 제공'}
                </div>
            `;
        }

        popupEl.innerHTML = `
            <div class="spot-popup-title">
                <span>${iconEmoji}</span>
                <span>${cleanSpotName(spot)}</span>
            </div>
            ${metaHtml}
            <div class="spot-status-badge ${spot.status}">
                ${isOut ? '❌ 현재 소등/위험 상태 (우회 대상)' : '✨ 정상 가동 중 (안심 귀가 구역)'}
            </div>
            <div style="margin-top:8px;">
                <button class="btn-popup-toggle ${isOut ? 'turn-on' : ''}" style="width:100%;">
                    ${isOut ? '✨ 점등/복구' : '💥 소등(시험)'}
                </button>
            </div>
        `;

        popupEl.querySelector('.btn-popup-toggle').addEventListener('click', () => {
            toggleSpotStatus(spot.id);
        });

        layer.bindPopup(popupEl);
    }

    // ─── 스팟 소등/점등 토글 & 스마트 우회 판단 ─────────────────────
    function toggleSpotStatus(spotId) {
        const spot = allSafeSpots.find(s => s.id === spotId);
        if (!spot) return;

        spot.status = (spot.status === 'active') ? 'out' : 'active';
        renderSafetySpots();
        if (isHeatmapActive) renderHeatmapOverlay();
        map.closePopup();

        const base = (originalMasterRoute && originalMasterRoute.length > 0) ? originalMasterRoute : currentRouteCoords;
        const isOnPath = base.some(pt => getDistance(pt.lat, pt.lng, spot.coords[0], spot.coords[1]) < 65);

        if (spot.status === 'out') {
            if (isOnPath) {
                showDetourAlert(
                    `⚫ [${spot.name || '가로등'}] 암흑 구간 감지!`,
                    `진행 경로 상의 가로등 소등을 감지하여 불 켜진 상점가 대체 안전로로 우회합니다.`
                );
                calculateSafeRoute(true, false);
            }
        } else {
            // 점등 복구 확인: 원본 경로 상에 꺼진 등이 모두 사라졌는지 체크
            const hasOutOnRoute = allSafeSpots.some(s => 
                s.status === 'out' && 
                base.some(pt => getDistance(pt.lat, pt.lng, s.coords[0], s.coords[1]) < 65)
            );
            if (!hasOutOnRoute && blockedPolyline) {
                restoreOriginalRoute();
                showDetourAlert('✨ 조명 정상 복구됨', '경로 상의 모든 안심 가로등이 켜져 본래의 최단 안전로로 복귀합니다.');
            } else if (hasOutOnRoute && blockedPolyline) {
                // 다른 등이 여전히 꺼져있으면 우회로 최신화
                calculateSafeRoute(true, false);
            }
        }
    }

    function restoreOriginalRoute() {
        if (blockedPolyline) {
            map.removeLayer(blockedPolyline);
            blockedPolyline = null;
        }
        if (originalMasterRoute && originalMasterRoute.length > 0) {
            currentRouteCoords = [...originalMasterRoute];
            buildRouteDistanceTable(false);
            const estDurationSec = Math.round(totalRouteDistanceMeters / 1.25);
            drawSafeRoute(currentRouteCoords, totalRouteDistanceMeters, estDurationSec, false);
        }
        document.getElementById('route-type-tag').textContent = '✨ 최적 안전 귀가로';
        document.getElementById('route-type-tag').classList.remove('detour');
        updateSafetyScoreUI();
    }

    function showDetourAlert(title, desc) {
        const banner = document.getElementById('detour-alert');
        if (!banner) return;
        document.getElementById('detour-title').textContent = title;
        document.getElementById('detour-desc').textContent = desc;
        banner.classList.remove('hidden');

        setTimeout(() => {
            banner.classList.add('hidden');
        }, 7000);
    }

    document.getElementById('btn-close-detour')?.addEventListener('click', () => {
        document.getElementById('detour-alert')?.classList.add('hidden');
    });

    // ─── 💥 경로 상 소등 시험 (앞 전등 80% 소등 시 즉각 대체 우회로 제공) ───
    document.getElementById('btn-test-blackout')?.addEventListener('click', () => {
        if (!currentRouteCoords.length) {
            alert('경로를 먼저 검색해 주세요!');
            return;
        }

        const currentDist = simCurrentDistanceMeters || 0;
        const searchStartDist = Math.max(0, currentDist + 15);
        const searchEndDist = searchStartDist + 180;

        // 진행 방향 바로 앞쪽(15m ~ 180m)에 위치한 가로등 2~4개 연속 소등
        let targets = [];
        for (let d = searchStartDist; d <= searchEndDist; d += 15) {
            const pt = getInterpolatedPointAtDistance(d);
            for (const spot of allSafeSpots) {
                if (spot.status === 'active' && !targets.some(t => t.id === spot.id)) {
                    const dist = getDistance(pt.lat, pt.lng, spot.coords[0], spot.coords[1]);
                    if (dist < 55) {
                        targets.push(spot);
                        if (targets.length >= 4) break;
                    }
                }
            }
            if (targets.length >= 4) break;
        }

        if (targets.length === 0) {
            targets = allSafeSpots.filter(s => s.status === 'active' && currentRouteCoords.some(pt => getDistance(pt.lat, pt.lng, s.coords[0], s.coords[1]) < 60)).slice(0, 3);
        }

        if (targets.length > 0) {
            targets.forEach(s => { s.status = 'out'; });
            renderSafetySpots();
            if (isHeatmapActive) renderHeatmapOverlay();

            showDetourAlert(
                `⚫ [${targets[0].name || '진주 가로등'}] 앞쪽 80% 암흑 구간 감지!`,
                `진행 경로 전방 가로등 다수 소등으로 시야가 차단되었습니다. 밝은 대체 안전로(우회로)로 즉시 안내합니다.`
            );
            calculateSafeRoute(true, false);
            map.panTo(targets[0].coords, { animate: true, duration: 0.8 });
        } else {
            alert('경로 상에서 소등할 수 있는 스팟을 찾지 못했습니다.');
        }
    });

    // ─── 동서남북 나침반 및 진행방향 각도 제어 ─────────────────────────
    const btnCompassMode = document.getElementById('btn-compass-mode');
    const compassIcon = document.getElementById('compass-icon');
    const compassModeTxt = document.getElementById('compass-mode-txt');
    let isHeadingCompassActive = true;

    btnCompassMode.addEventListener('click', () => {
        isHeadingCompassActive = !isHeadingCompassActive;
        if (isHeadingCompassActive) {
            btnCompassMode.classList.add('active');
            compassModeTxt.textContent = '진행방향(앞) 고정';
            applyHeadingIndicator(currentBearing);
        } else {
            btnCompassMode.classList.remove('active');
            compassModeTxt.textContent = '북쪽(정상) 고정';
            applyHeadingIndicator(0);
        }
    });

    function applyHeadingIndicator(angleDeg) {
        currentBearing = angleDeg;
        compassIcon.style.transform = `rotate(${angleDeg}deg)`;

        const walkerEl = document.getElementById('walker-avatar');
        if (walkerEl) {
            walkerEl.style.transform = `rotate(${angleDeg}deg)`;
        }

        const fpvHeadingTxt = document.getElementById('fpv-heading-txt');
        if (fpvHeadingTxt) {
            const compassDir = getCompassDirection(angleDeg);
            fpvHeadingTxt.textContent = `⬆️ ${compassDir} 방향 전진 중`;
        }

        const arrowEl = document.getElementById('fpv-arrow');
        if (arrowEl) {
            arrowEl.style.transform = `rotate(${angleDeg}deg)`;
        }
    }

    function getCompassDirection(deg) {
        const normalized = (deg % 360 + 360) % 360;
        if (normalized >= 337.5 || normalized < 22.5) return '북(N)';
        if (normalized >= 22.5 && normalized < 67.5) return '북동(NE)';
        if (normalized >= 67.5 && normalized < 112.5) return '동(E)';
        if (normalized >= 112.5 && normalized < 157.5) return '남동(SE)';
        if (normalized >= 157.5 && normalized < 202.5) return '남(S)';
        if (normalized >= 202.5 && normalized < 247.5) return '남서(SW)';
        if (normalized >= 247.5 && normalized < 292.5) return '서(W)';
        return '북서(NW)';
    }

    // ─── 주소 텍스트 초정밀 지능형 Geocoding 해석 함수 ──────────────────
    async function geocodeAddress(query) {
        if (!query || !query.trim()) return null;
        const cleanQuery = query.replace(/^📍|🏁|\[위치\]/g, '').trim();
        if (!cleanQuery) return null;

        // 1. 위경도 직접 입력 매칭 (예: 35.1802, 128.1076)
        const coordMatch = cleanQuery.match(/([0-9]+\.[0-9]+)\s*,\s*([0-9]+\.[0-9]+)/);
        if (coordMatch) {
            return L.latLng(parseFloat(coordMatch[1]), parseFloat(coordMatch[2]));
        }

        // 정규화 (공백, 하이픈 제거, 소문자화)
        const norm = cleanQuery.replace(/[\s\-_]+/g, '').toLowerCase();

        // 2. JINJU_LANDMARKS 우선 정밀 매칭 (완전일치 -> 주요키워드 일치 -> 별칭 일치 -> 부분포함)
        let match = JINJU_LANDMARKS.find(lm => {
            const nameNorm = lm.name.replace(/[\s\-_]+/g, '').toLowerCase();
            if (nameNorm === norm) return true;
            if (lm.aliases && lm.aliases.some(a => a.replace(/[\s\-_]+/g, '').toLowerCase() === norm)) return true;
            return false;
        });

        // 2-2. 주요 키워드 조합 매칭 (예: '해모로' + '4', '동명고', '푸르지오' 등)
        if (!match) {
            match = JINJU_LANDMARKS.find(lm => {
                const nameNorm = lm.name.replace(/[\s\-_]+/g, '').toLowerCase();
                const addrNorm = (lm.addr || '').replace(/[\s\-_]+/g, '').toLowerCase();

                if (norm.includes('해모로') && (norm.includes('4') || norm.includes('사')) && nameNorm.includes('4단지')) return true;
                if (norm.includes('해모로') && (norm.includes('2') || norm.includes('이')) && nameNorm.includes('2단지')) return true;
                if (norm.includes('동명고') && nameNorm.includes('동명고')) return true;
                if (norm.includes('동명중') && nameNorm.includes('동명중')) return true;

                const aliasMatch = lm.aliases && lm.aliases.some(a => {
                    const an = a.replace(/[\s\-_]+/g, '').toLowerCase();
                    return norm.includes(an) || an.includes(norm);
                });
                return nameNorm.includes(norm) || norm.includes(nameNorm) || addrNorm.includes(norm) || aliasMatch;
            });
        }

        if (match) {
            console.log(`🎯 [정밀 매칭 성공] "${cleanQuery}" -> ${match.name} (${match.lat}, ${match.lng})`);
            return L.latLng(match.lat, match.lng);
        }

        // 3. 등록된 진주 안심 스팟(가로등, 상점, CCTV) 이름 매칭
        if (allSafeSpots && allSafeSpots.length > 0) {
            const spotMatch = allSafeSpots.find(s => {
                const sn = (s.name || '').replace(/[\s\-_]+/g, '').toLowerCase();
                return sn.includes(norm) || norm.includes(sn);
            });
            if (spotMatch) {
                console.log(`🎯 [스팟 매칭 성공] "${cleanQuery}" -> ${spotMatch.name} (${spotMatch.coords})`);
                return L.latLng(spotMatch.coords[0], spotMatch.coords[1]);
            }
        }

        // 4. OpenStreetMap Nominatim 외부 지오코딩 (진주시 영역 보장)
        try {
            const searchQ = cleanQuery.includes('진주') ? cleanQuery : `진주시 ${cleanQuery}`;
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQ)}&format=json&limit=3&accept-language=ko`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'ko' } });
            const data = await res.json();
            if (data && data.length > 0) {
                // 진주시 인근(위도 35.0~35.4, 경도 128.0~128.3) 결과 우선 필터링
                const jinjuTarget = data.find(d => {
                    const lat = parseFloat(d.lat);
                    const lon = parseFloat(d.lon);
                    return lat >= 35.05 && lat <= 35.35 && lon >= 127.95 && lon <= 128.30;
                }) || data[0];

                console.log(`🌐 [외부 Geocoding 성공] "${cleanQuery}" -> (${jinjuTarget.lat}, ${jinjuTarget.lon})`);
                return L.latLng(parseFloat(jinjuTarget.lat), parseFloat(jinjuTarget.lon));
            }
        } catch (e) {
            console.warn('Geocoding 실패:', e);
        }

        return null;
    }

    // ─── 경로 탐색 메인 핸들러 ────────────────────────────────────────
    async function handleNavigateClick() {
        const btnNav = document.getElementById('btn-navigate');
        const origText = btnNav.innerHTML;
        btnNav.innerHTML = '<span class="btn-icon">⏳</span> 최적 안전 경로 분석 중...';
        btnNav.disabled = true;

        try {
            const startInputVal = document.getElementById('input-start').value.trim();
            const endInputVal = document.getElementById('input-end').value.trim();

            if (startInputVal && !startInputVal.includes('현재 내 위치')) {
                const resolvedStart = await geocodeAddress(startInputVal);
                if (resolvedStart) {
                    startLatLng = resolvedStart;
                    startMarker.setLatLng(startLatLng);
                }
            }

            if (endInputVal) {
                const resolvedEnd = await geocodeAddress(endInputVal);
                if (resolvedEnd) {
                    endLatLng = resolvedEnd;
                    endMarker.setLatLng(endLatLng);
                    endMarker.bindPopup(`<b>🏁 도착지: ${endInputVal}</b>`);
                    saveRecentSearch(endInputVal, endLatLng.lat, endLatLng.lng);
                }
            }

            await calculateSafeRoute(false, true); // 신규 탐색 → 위치 리셋
        } catch (err) {
            console.error('안전 경로 탐색 에러:', err);
        } finally {
            btnNav.innerHTML = origText;
            btnNav.disabled = false;
        }
    }

    // ─── 최단 OSRM 경로 엔진 ──────────────────────────────────────────
    // isDetour: 소등 우회 여부
    // isNewNavigation: true = 신규탐색(위치 0 리셋), false = 토글(현재 위치 유지)
    async function calculateSafeRoute(isDetour = false, isNewNavigation = true) {
        if (isDetour && currentRouteCoords.length > 0) {
            previousBlockedCoords = [...currentRouteCoords];
            drawBlockedRoute(previousBlockedCoords);
            document.getElementById('route-type-tag').textContent = '🛡️ 어두운 길 우회 안전로';
            document.getElementById('route-type-tag').classList.add('detour');
        }

        const sLat = startMarker.getLatLng().lat;
        const sLng = startMarker.getLatLng().lng;
        const eLat = endMarker.getLatLng().lat;
        const eLng = endMarker.getLatLng().lng;

        // 우회 여부는 경로 조명 밀도 점수 기준 (단순 out 개수가 아님)
        // 밀도가 낮은 쪽 → 더 밝은 우회 웨이포인트를 자동 선택
        const outOnRoute = allSafeSpots.filter(s =>
            s.status === 'out' &&
            currentRouteCoords.length > 0 &&
            currentRouteCoords.some(pt => getDistance(pt.lat, pt.lng, s.coords[0], s.coords[1]) < 60)
        );

        let osrmUrl;
        if (isDetour && outOnRoute.length > 0) {
            // 경로 위에 꺼진 조명이 있을 때만 우회점 삽입
            const out = outOnRoute[0];
            const dLat = eLat - sLat;
            const dLng = eLng - sLng;
            const len = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
            const normLat = -dLng / len;
            const normLng = dLat / len;
            const d1 = [out.coords[0] + normLat * 0.0022, out.coords[1] + normLng * 0.0022];
            const d2 = [out.coords[0] - normLat * 0.0022, out.coords[1] - normLng * 0.0022];
            // 두 우회 후보 중 주변 활성 조명이 더 많은 쪽 선택
            const cnt1 = allSafeSpots.filter(s => isLightActive(s) && getDistance(d1[0], d1[1], s.coords[0], s.coords[1]) < 120).length;
            const cnt2 = allSafeSpots.filter(s => isLightActive(s) && getDistance(d2[0], d2[1], s.coords[0], s.coords[1]) < 120).length;
            const wp = cnt1 >= cnt2 ? d1 : d2;
            osrmUrl = `https://router.project-osrm.org/route/v1/foot/${sLng},${sLat};${wp[1]},${wp[0]};${eLng},${eLat}?overview=full&geometries=geojson`;
        } else {
            osrmUrl = `https://router.project-osrm.org/route/v1/foot/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson`;
        }

        try {
            const res = await fetch(osrmUrl);
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
                const r = data.routes[0];
                currentRouteCoords = r.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] }));
                buildRouteDistanceTable(isNewNavigation);
                drawSafeRoute(currentRouteCoords, r.distance, r.duration, isNewNavigation);
            } else {
                generateDirectInterpolatedRoute(sLat, sLng, eLat, eLng, isDetour, isNewNavigation);
            }
        } catch (err) {
            console.warn('OSRM 요청 오류:', err);
            generateDirectInterpolatedRoute(sLat, sLng, eLat, eLng, isDetour, isNewNavigation);
        }
    }

    // 직선 기반 군더더기 없는 도보 경로 보간
    function generateDirectInterpolatedRoute(sLat, sLng, eLat, eLng, isDetour, isNewNavigation = true) {
        currentRouteCoords = [];
        const steps = 30;
        const offset = isDetour ? 0.0025 : 0;
        for (let i = 0; i <= steps; i++) {
            const r = i / steps;
            const curve = Math.sin(r * Math.PI) * offset;
            currentRouteCoords.push({
                lat: sLat + (eLat - sLat) * r + curve,
                lng: sLng + (eLng - sLng) * r - curve
            });
        }
        buildRouteDistanceTable(isNewNavigation);
        const estDurationSec = Math.round(totalRouteDistanceMeters / 1.25);
        drawSafeRoute(currentRouteCoords, totalRouteDistanceMeters, estDurationSec, isNewNavigation);
    }

    // ─── 경로 거리 누적 테이블 구축 ──────────────────────────────────
    let routeDistanceTable = [];
    let totalRouteDistanceMeters = 0;

    // isNewNavigation=true: 신규 경로 탐색 → simDist 0으로 리셋
    // isNewNavigation=false: 소등/점등 토글 → 현재 simDist 그대로 유지(순간이동 없음)
    function buildRouteDistanceTable(isNewNavigation = true) {
        const savedDist = simCurrentDistanceMeters; // 현재 거리 보존

        routeDistanceTable = [0];
        totalRouteDistanceMeters = 0;

        for (let i = 1; i < currentRouteCoords.length; i++) {
            const d = getDistance(
                currentRouteCoords[i - 1].lat, currentRouteCoords[i - 1].lng,
                currentRouteCoords[i].lat, currentRouteCoords[i].lng
            );
            totalRouteDistanceMeters += d;
            routeDistanceTable.push(totalRouteDistanceMeters);
        }

        if (isNewNavigation) {
            simCurrentDistanceMeters = 0; // 신규 탐색 시만 리셋
        } else {
            // 토글 시: 현재 진행 거리 유지 (새 경로 길이 초과 시 끝 지점으로 클램프)
            simCurrentDistanceMeters = Math.min(savedDist, totalRouteDistanceMeters);
        }
    }

    function getInterpolatedPointAtDistance(distMeters) {
        if (!currentRouteCoords.length) return startLatLng;
        if (distMeters <= 0) return currentRouteCoords[0];
        if (distMeters >= totalRouteDistanceMeters) return currentRouteCoords[currentRouteCoords.length - 1];

        let idx = 0;
        while (idx < routeDistanceTable.length - 1 && routeDistanceTable[idx + 1] < distMeters) {
            idx++;
        }

        const d1 = routeDistanceTable[idx];
        const d2 = routeDistanceTable[idx + 1];
        const segDist = d2 - d1;
        const ratio = segDist > 0 ? (distMeters - d1) / segDist : 0;

        const p1 = currentRouteCoords[idx];
        const p2 = currentRouteCoords[idx + 1];

        return {
            lat: p1.lat + (p2.lat - p1.lat) * ratio,
            lng: p1.lng + (p2.lng - p1.lng) * ratio
        };
    }

    // ─── 차단된 위험로 그리기 ──────────────────────────────────────────
    function drawBlockedRoute(coords) {
        if (blockedPolyline) map.removeLayer(blockedPolyline);

        const latLngs = coords.map(c => [c.lat, c.lng]);
        blockedPolyline = L.polyline(latLngs, {
            color: '#FF3B30',
            weight: 5,
            opacity: 0.75,
            dashArray: '8, 8',
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(map);
    }

    // ─── 추천 안전 귀가 경로 그리기 (프리미엄 듀얼 네온 라인) ──────────
    function drawSafeRoute(coords, distMeters, durationSec, isNewNavigation = true) {
        if (currentPolylineGlow) map.removeLayer(currentPolylineGlow);
        if (currentPolylineCore) map.removeLayer(currentPolylineCore);
        if (passedPolyline) map.removeLayer(passedPolyline);
        if (currentPolyline) map.removeLayer(currentPolyline);

        const latLngs = coords.map(c => [c.lat, c.lng]);

        // 🗺️ 신규 탐색 시에만 원본 마스터 경로 저장 (우회 복원용)
        if (isNewNavigation) {
            originalMasterRoute = [...coords];
        }

        // 1. 외곽 발광 네온 글로우 (Neon Glow Layer)
        currentPolylineGlow = L.polyline(latLngs, {
            color: '#00FFA3',
            weight: 12,
            opacity: 0.4,
            lineCap: 'round',
            lineJoin: 'round',
            className: 'neon-route-glow'
        }).addTo(map);

        // 2. 중앙 고휘도 코어 라인 (Core Neon Layer)
        currentPolylineCore = L.polyline(latLngs, {
            color: '#FFFFFF',
            weight: 4,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
            className: 'neon-route-core'
        }).addTo(map);

        currentPolyline = currentPolylineCore; // 기존 코드 호환

        // 신규 탐색 시에만 전체 경로가 보이도록 fitBounds
        if (!isFpvMode && isNewNavigation) {
            map.fitBounds(currentPolylineGlow.getBounds(), { padding: [50, 50] });
        }

        calculateRouteSafetyStats(coords, distMeters, durationSec);

        // 신규 탐색 시에만 bearing 초기화
        if (isNewNavigation && coords.length > 1) {
            const angle = Math.atan2(coords[1].lng - coords[0].lng, coords[1].lat - coords[0].lat) * (180 / Math.PI);
            applyHeadingIndicator(angle);
        }
    }

    // ─── ✂️ 실시간 지나간 네온 지우기 (남은 구간만 네온 유지) ─────────
    function updateRouteVisualProgress(currentPos, currentDist = null) {
        if (!currentRouteCoords || currentRouteCoords.length < 2) return;

        let remaining = [];

        // 1. 시뮬레이터처럼 누적 거리가 명확할 때
        if (currentDist !== null && routeDistanceTable.length === currentRouteCoords.length) {
            let idx = 0;
            while (idx < routeDistanceTable.length - 1 && routeDistanceTable[idx + 1] <= currentDist) {
                idx++;
            }
            remaining = [currentPos];
            for (let i = idx + 1; i < currentRouteCoords.length; i++) {
                remaining.push(currentRouteCoords[i]);
            }
        } else {
            // 2. 실시간 GPS 좌표 기반일 때: 가장 가까운 경로 점 이후만 남김
            let closestIdx = 0;
            let minDist = Infinity;
            for (let i = 0; i < currentRouteCoords.length; i++) {
                const d = getDistance(currentPos.lat, currentPos.lng, currentRouteCoords[i].lat, currentRouteCoords[i].lng);
                if (d < minDist) {
                    minDist = d;
                    closestIdx = i;
                }
            }
            remaining = [currentPos];
            for (let i = closestIdx + 1; i < currentRouteCoords.length; i++) {
                remaining.push(currentRouteCoords[i]);
            }
        }

        const latLngs = remaining.map(c => [c.lat, c.lng]);

        if (remaining.length >= 2) {
            if (currentPolylineGlow) currentPolylineGlow.setLatLngs(latLngs);
            if (currentPolylineCore) currentPolylineCore.setLatLngs(latLngs);
        } else {
            // 도착 완료 시 네온 제거
            if (currentPolylineGlow) currentPolylineGlow.setLatLngs([]);
            if (currentPolylineCore) currentPolylineCore.setLatLngs([]);
        }
    }

    function calculateRouteSafetyStats(coords, distMeters, durationSec) {
        let nearbyLights = 0;
        let nearbyStores = 0;
        let nearbyCctv   = 0;
        let nearbyOut    = 0;

        const countedSpotIds = new Set();

        coords.forEach(pt => {
            allSafeSpots.forEach(spot => {
                if (countedSpotIds.has(spot.id)) return;
                const d = getDistance(pt.lat, pt.lng, spot.coords[0], spot.coords[1]);

                if (d <= 50) {
                    countedSpotIds.add(spot.id);
                    if (spot.status === 'out') {
                        nearbyOut++;
                    } else if (spot.type === 'light') {
                        nearbyLights++;
                    } else if (spot.type === 'night_store') {
                        nearbyStores++;
                    } else if (spot.type === 'cctv') {
                        nearbyCctv++;
                    }
                }
            });
        });

        let score = 78 + (nearbyStores * 3) + (nearbyLights * 1) + (nearbyCctv * 1.5) - (nearbyOut * 18);
        if (score > 99) score = 99;
        if (score < 45) score = 45;

        const distanceKm = (distMeters / 1000).toFixed(1);

        document.getElementById('hud-score').textContent = Math.round(score);
        document.getElementById('stat-lights').textContent = `${nearbyLights}개`;
        document.getElementById('stat-stores').textContent = `${nearbyStores}곳`;
        document.getElementById('stat-cctv').textContent = `${nearbyCctv}대`;

        // ⏱️ 이동 수단별 예상 소요 시간 정밀 계산 (도보, 자전거, 자동차)
        updateTransitTimes(distMeters);

        document.getElementById('safety-card').classList.remove('hidden');
        currentRouteStats = { score, nearbyLights, nearbyStores, nearbyCctv, nearbyOut };
    }

    // ─── ⏱️ 이동 수단별 정밀 예상 시간 계산기 ────────────────────────────
    function updateTransitTimes(distMeters) {
        if (!distMeters || distMeters <= 0) {
            distMeters = 50; // 최소치
        }

        // 1. 도보: 평균 성인 4.2 km/h (분당 약 70m)
        const walkMin = Math.max(1, Math.round(distMeters / 70));

        // 2. 자전거: 도심 평균 14 km/h (분당 약 233m)
        const bikeMin = Math.max(1, Math.round(distMeters / 233));

        // 3. 자동차: 도심 평균 30 km/h (분당 약 500m) + 기본 신호대기 1분
        const carMin = Math.max(1, Math.round((distMeters / 500) + 1));

        const formatTime = (min) => {
            if (min >= 60) {
                const h = Math.floor(min / 60);
                const m = min % 60;
                return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
            }
            return `${min}분`;
        };

        const distKm = (distMeters / 1000).toFixed(1);

        // UI 반영
        const elDist = document.getElementById('transit-total-dist');
        if (elDist) elDist.textContent = `${distKm} km`;

        const elWalk = document.getElementById('eta-walk-time');
        if (elWalk) elWalk.textContent = formatTime(walkMin);

        const elBike = document.getElementById('eta-bike-time');
        if (elBike) elBike.textContent = formatTime(bikeMin);

        const elCar = document.getElementById('eta-car-time');
        if (elCar) elCar.textContent = formatTime(carMin);

        // 기존 4분할 HUD stat 박스도 연동
        const elStatTime = document.getElementById('stat-time');
        if (elStatTime) elStatTime.textContent = formatTime(walkMin);

        const elStatDist = document.getElementById('stat-dist');
        if (elStatDist) elStatDist.textContent = `${distKm} km`;
    }

    // ─── 🚶 1인칭 네비게이션 시점 토글 ────────────────────────────────
    const btnToggleFpv = document.getElementById('btn-toggle-fpv');
    const fpvOverlay = document.getElementById('fpv-overlay');

    btnToggleFpv.addEventListener('click', () => {
        isFpvMode = !isFpvMode;
        isCameraFollow = true;
        btnRecenter.classList.add('hidden');
        updateFpvState();
    });

    function updateFpvState() {
        if (!currentRouteCoords.length) {
            buildRouteDistanceTable();
        }

        const currentPos = getInterpolatedPointAtDistance(simCurrentDistanceMeters);

        if (!walkerMarker) {
            walkerMarker = L.marker(currentPos, {
                icon: walkerIcon,
                zIndexOffset: 2500
            }).addTo(map);
        }

        if (isFpvMode) {
            btnToggleFpv.classList.add('active');
            btnToggleFpv.querySelector('.txt').textContent = '전체 지도';
            fpvOverlay.classList.remove('hidden');

            map.setView(currentPos, 18, { animate: true });
            showFpvHud(currentPos, null, simCurrentDistanceMeters >= totalRouteDistanceMeters);
        } else {
            btnToggleFpv.classList.remove('active');
            btnToggleFpv.querySelector('.txt').textContent = '1인칭 시점';
            fpvOverlay.classList.add('hidden');

            if (currentPolyline) {
                map.fitBounds(currentPolyline.getBounds(), { padding: [50, 50] });
            } else {
                map.setView(startMarker.getLatLng(), 15);
            }
        }
    }

    // ─── 🔴 실시간 GPS 주행 추적 ──────────────────────────────────────
    const btnLiveGps = document.getElementById('btn-live-gps');
    const btnLiveGpsTxt = document.getElementById('btn-live-gps-txt');
    const gpsStatusBadge = document.getElementById('gps-status-badge');

    btnLiveGps.addEventListener('click', () => {
        if (isLiveGpsActive) {
            stopLiveGpsTracking();
        } else {
            startLiveGpsTracking();
        }
    });

    function startLiveGpsTracking() {
        if (!navigator.geolocation) {
            alert('이 브라우저/기기는 실시간 GPS를 지원하지 않습니다.');
            return;
        }

        stopSimulation();

        isLiveGpsActive = true;
        isCameraFollow = true;
        btnRecenter.classList.add('hidden');
        btnLiveGps.classList.add('tracking');
        btnLiveGpsTxt.textContent = '⏹️ 실시간 GPS 주행 중지';
        gpsStatusBadge.textContent = '🟢 GPS 수신 중';
        gpsStatusBadge.classList.add('active');

        if (!isFpvMode) {
            isFpvMode = true;
            updateFpvState();
        }

        liveWatchId = navigator.geolocation.watchPosition(
            (pos) => {
                const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
                handleLiveGpsUpdate(userLatLng, pos.coords.heading, pos.coords.speed);
            },
            (err) => {
                console.warn('GPS 실시간 수신 오류:', err);
                gpsStatusBadge.textContent = '⚠️ 신호 약함';
            },
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 10000
            }
        );
    }

    function stopLiveGpsTracking() {
        if (liveWatchId !== null) {
            navigator.geolocation.clearWatch(liveWatchId);
            liveWatchId = null;
        }
        isLiveGpsActive = false;
        btnLiveGps.classList.remove('tracking');
        btnLiveGpsTxt.textContent = '🔴 실시간 GPS 주행 시작';
        gpsStatusBadge.textContent = '대기 중';
        gpsStatusBadge.classList.remove('active');
    }

    // ─── 🧭 실시간 잔여 거리 계산 (경로 세그먼트 투영 기반) ─────────
    function calcRemainingDistance(currentPos) {
        if (!currentRouteCoords || currentRouteCoords.length === 0) {
            const straight = getDistance(currentPos.lat, currentPos.lng, endLatLng.lat, endLatLng.lng);
            return Math.round(straight * 1.25); // 도심 실제 보행로 굴곡 보정 계수
        }

        // 현재 위치에서 가장 가까운 경로 세그먼트 찾기
        let closestIdx = 0;
        let minDist = Infinity;
        for (let i = 0; i < currentRouteCoords.length; i++) {
            const d = getDistance(currentPos.lat, currentPos.lng, currentRouteCoords[i].lat, currentRouteCoords[i].lng);
            if (d < minDist) {
                minDist = d;
                closestIdx = i;
            }
        }

        // 남은 경로 누적 거리 합산
        let remaining = getDistance(currentPos.lat, currentPos.lng, currentRouteCoords[closestIdx].lat, currentRouteCoords[closestIdx].lng);
        for (let i = closestIdx; i < currentRouteCoords.length - 1; i++) {
            remaining += getDistance(
                currentRouteCoords[i].lat, currentRouteCoords[i].lng,
                currentRouteCoords[i + 1].lat, currentRouteCoords[i + 1].lng
            );
        }
        return Math.max(0, Math.round(remaining));
    }

    function handleLiveGpsUpdate(currentPos, headingFromGps, speed) {
        // GPS 튐(Jitter) 보정: 비정상적 순간 점프(100m 초과) 시 가중 이동평균(EMA) 필터 적용
        if (lastGpsPosition) {
            const jumpDist = getDistance(currentPos.lat, currentPos.lng, lastGpsPosition.lat, lastGpsPosition.lng);
            if (jumpDist > 120) {
                currentPos = L.latLng(
                    lastGpsPosition.lat + (currentPos.lat - lastGpsPosition.lat) * 0.35,
                    lastGpsPosition.lng + (currentPos.lng - lastGpsPosition.lng) * 0.35
                );
            }
        }

        if (!walkerMarker) {
            walkerMarker = L.marker(currentPos, {
                icon: walkerIcon,
                zIndexOffset: 2500
            }).addTo(map);
        } else {
            walkerMarker.setLatLng(currentPos);
        }

        let calcHeading = headingFromGps;
        if (calcHeading === null || isNaN(calcHeading)) {
            if (lastGpsPosition) {
                calcHeading = Math.atan2(currentPos.lng - lastGpsPosition.lng, currentPos.lat - lastGpsPosition.lat) * (180 / Math.PI);
            } else {
                calcHeading = currentBearing;
            }
        }
        lastGpsPosition = currentPos;

        applyHeadingIndicator(calcHeading);

        if (isCameraFollow && isFpvMode) {
            map.panTo(currentPos, { animate: true, duration: 0.5 });
        }

        // ⏱️ 실시간 잔여 거리 및 도보/자전거/자동차 소요 시간 즉각 갱신
        const remDist = calcRemainingDistance(currentPos);
        updateTransitTimes(remDist);

        // ✂️ 지나간 네온 경로 실시간 삭제 (남은 경로만 네온 유지)
        updateRouteVisualProgress(currentPos, null);

        const walkRemainMin = Math.max(1, Math.round(remDist / 70));
        const currentSpeedKmh = (speed && !isNaN(speed) && speed > 0.3) ? (speed * 3.6).toFixed(1) + ' km/h' : '보행 속도';
        gpsStatusBadge.textContent = `🟢 ${remDist}m (${walkRemainMin}분)`;
        simStatusTxt.textContent = `실시간 GPS 주행 중: ${remDist}m 남음 (${currentSpeedKmh})`;

        // 목적지 25m 이내 도착 판정
        const isArrived = (remDist <= 25);
        showFpvHud(currentPos, null, isArrived);

        if (isArrived) {
            gpsStatusBadge.textContent = '🎉 목적지 도착';
            showDetourAlert('🎉 목적지 안전 도착!', '안전하게 목적지에 도착하셨습니다. 편안한 밤 되세요!');
        }
    }

    // ─── 🚶 실제 체감 도보 시뮬레이터 ─────────────────────────────────
    let walkerMarker = null;
    let simAnimFrame = null;
    let simCurrentDistanceMeters = 0;
    let lastSimTimestamp = null;
    let isSimRunning = false;

    const btnSimPlay = document.getElementById('btn-sim-play');
    const btnSimReset = document.getElementById('btn-sim-reset');
    const btnStepForward = document.getElementById('btn-step-forward');
    const simStatusTxt = document.getElementById('sim-status-txt');
    const speedSelect = document.getElementById('sim-speed-select');

    btnSimPlay.addEventListener('click', () => {
        if (isLiveGpsActive) stopLiveGpsTracking();
        if (isSimRunning) {
            pauseSimulation();
        } else {
            startSimulation();
        }
    });

    btnStepForward.addEventListener('click', () => {
        if (isLiveGpsActive) stopLiveGpsTracking();
        if (!currentRouteCoords.length || totalRouteDistanceMeters === 0) {
            alert('경로를 먼저 검색해 주세요!');
            return;
        }

        simCurrentDistanceMeters = Math.min(totalRouteDistanceMeters, simCurrentDistanceMeters + 15);
        const currentPos = getInterpolatedPointAtDistance(simCurrentDistanceMeters);
        const nextPos = getInterpolatedPointAtDistance(Math.min(totalRouteDistanceMeters, simCurrentDistanceMeters + 10));

        if (!walkerMarker) {
            walkerMarker = L.marker(currentPos, { icon: walkerIcon, zIndexOffset: 2500 }).addTo(map);
        } else {
            walkerMarker.setLatLng(currentPos);
        }

        if (nextPos) {
            const angle = Math.atan2(nextPos.lng - currentPos.lng, nextPos.lat - currentPos.lat) * (180 / Math.PI);
            applyHeadingIndicator(angle);
        }

        // ✂️ 지나간 네온 경로 실시간 삭제 (남은 경로만 네온 유지)
        updateRouteVisualProgress(currentPos, simCurrentDistanceMeters);

        if (isCameraFollow && isFpvMode) map.panTo(currentPos, { animate: false });
        showFpvHud(currentPos, nextPos, simCurrentDistanceMeters >= totalRouteDistanceMeters);
        
        // 잔여 거리 실시간 소요 시간 반영
        const remDist = Math.max(0, totalRouteDistanceMeters - simCurrentDistanceMeters);
        updateTransitTimes(remDist);
        simStatusTxt.textContent = `1걸음 이동 (잔여: ${Math.round(remDist)}m / 총 ${Math.round(totalRouteDistanceMeters)}m)`;
    });

    btnSimReset.addEventListener('click', () => {
        stopSimulation();
        simCurrentDistanceMeters = 0;
        if (currentRouteCoords.length > 0) {
            const startPos = currentRouteCoords[0];
            if (walkerMarker) walkerMarker.setLatLng(startPos);
            if (isFpvMode) map.panTo(startPos);

            // 🌟 리셋 시 전체 네온 경로 다시 복원
            const latLngs = currentRouteCoords.map(c => [c.lat, c.lng]);
            if (currentPolylineGlow) currentPolylineGlow.setLatLngs(latLngs);
            if (currentPolylineCore) currentPolylineCore.setLatLngs(latLngs);
        }
        simStatusTxt.textContent = '준비됨';
        btnSimPlay.textContent = '▶️ 천천히 걷기';
        applyHeadingIndicator(0);
        isCameraFollow = true;
        btnRecenter.classList.add('hidden');
        updateTransitTimes(totalRouteDistanceMeters);
    });

    function startSimulation() {
        if (!currentRouteCoords.length || totalRouteDistanceMeters === 0) {
            alert('경로를 먼저 검색해주세요!');
            return;
        }

        isSimRunning = true;
        lastSimTimestamp = performance.now();
        btnSimPlay.textContent = '⏸️ 일시정지';
        simStatusTxt.textContent = '안전 귀가 도보 이동 중...';

        const currentPos = getInterpolatedPointAtDistance(simCurrentDistanceMeters);
        if (!walkerMarker) {
            walkerMarker = L.marker(currentPos, {
                icon: walkerIcon,
                zIndexOffset: 2500
            }).addTo(map);
        }

        if (!isFpvMode) {
            isFpvMode = true;
            updateFpvState();
        }

        simAnimFrame = requestAnimationFrame(stepSimulation);
    }

    function pauseSimulation() {
        isSimRunning = false;
        if (simAnimFrame) cancelAnimationFrame(simAnimFrame);
        btnSimPlay.textContent = '▶️ 다시 걷기';
        simStatusTxt.textContent = '일시 정지됨';
    }

    function stopSimulation() {
        isSimRunning = false;
        if (simAnimFrame) cancelAnimationFrame(simAnimFrame);
        if (walkerMarker && !isLiveGpsActive) {
            map.removeLayer(walkerMarker);
            walkerMarker = null;
        }
    }

    function stepSimulation(timestamp) {
        if (!isSimRunning) return;

        if (!lastSimTimestamp) lastSimTimestamp = timestamp;
        const deltaSec = Math.min(0.1, (timestamp - lastSimTimestamp) / 1000);
        lastSimTimestamp = timestamp;

        // 현실적인 실제 도보 속도: 기본 2.5 m/s (약 9 km/h 체감), 배속 곱연산
        const speedMultiplier = parseFloat(speedSelect.value) || 1.0;
        const speedMetersPerSec = 2.5 * speedMultiplier;

        simCurrentDistanceMeters += speedMetersPerSec * deltaSec;

        // 잔여 소요 시간 실시간 연동
        const remDist = Math.max(0, totalRouteDistanceMeters - simCurrentDistanceMeters);
        updateTransitTimes(remDist);

        if (simCurrentDistanceMeters >= totalRouteDistanceMeters) {
            simCurrentDistanceMeters = totalRouteDistanceMeters;
            const finalPos = currentRouteCoords[currentRouteCoords.length - 1];
            if (walkerMarker) walkerMarker.setLatLng(finalPos);
            if (isCameraFollow && isFpvMode) map.panTo(finalPos, { animate: false });

            // 도착 시 네온 완전 완료
            updateRouteVisualProgress(finalPos, totalRouteDistanceMeters);

            isSimRunning = false;
            btnSimPlay.textContent = '🎉 안전 귀가 완료';
            simStatusTxt.textContent = '목적지 안전 도착!';
            updateTransitTimes(0);
            showFpvHud(finalPos, null, true);
            return;
        }

        const currentPos = getInterpolatedPointAtDistance(simCurrentDistanceMeters);
        const lookAheadDist = Math.min(totalRouteDistanceMeters, simCurrentDistanceMeters + 8);
        const nextPos = getInterpolatedPointAtDistance(lookAheadDist);

        if (walkerMarker) walkerMarker.setLatLng(currentPos);

        if (nextPos) {
            const angle = Math.atan2(nextPos.lng - currentPos.lng, nextPos.lat - currentPos.lat) * (180 / Math.PI);
            applyHeadingIndicator(angle);
        }

        // ✂️ 지나간 네온 경로 실시간 삭제 (남은 경로만 네온 유지)
        updateRouteVisualProgress(currentPos, simCurrentDistanceMeters);

        // 사용자가 자유 이동 중이 아닐 때만 카메라를 캐릭터로 추적
        if (isCameraFollow && isFpvMode) {
            map.panTo(currentPos, { animate: false });
        }

        showFpvHud(currentPos, nextPos, false);
        simStatusTxt.textContent = `도보 진행 중: 잔여 ${Math.round(remDist)}m / 총 ${Math.round(totalRouteDistanceMeters)}m`;

        simAnimFrame = requestAnimationFrame(stepSimulation);
    }

    // ─── 1인칭 HUD 안내 업데이트 ──────────────────────────────────────
    function showFpvHud(currentPos, nextPos, isFinished) {
        if (isFinished) {
            document.getElementById('fpv-next-spot').textContent = '🏁 목적지 안전 도착';
            document.getElementById('fpv-route-hint').textContent = '무사히 귀가하였습니다. 편안한 밤 되세요!';
            document.getElementById('fpv-arrow').textContent = '🎉';
            return;
        }

        let closestSafeSpot = null;
        let minDist = Infinity;

        allSafeSpots.forEach(spot => {
            if (spot.status === 'active') {
                const d = getDistance(currentPos.lat, currentPos.lng, spot.coords[0], spot.coords[1]);
                if (d < minDist) {
                    minDist = d;
                    closestSafeSpot = spot;
                }
            }
        });

        if (closestSafeSpot && minDist < 50) {
            const spotTypeIcon = closestSafeSpot.type === 'night_store' ? '🏪' : (closestSafeSpot.type === 'cctv' ? '📹' : '💡');
            document.getElementById('fpv-next-spot').textContent = `${Math.round(minDist)}m 앞 ${spotTypeIcon} ${closestSafeSpot.name}`;
            document.getElementById('fpv-route-hint').textContent = '환하게 밝혀진 안심 귀가 구간을 통과하고 있습니다.';
            document.getElementById('fpv-brightness').textContent = '🟢 안전 밝기: 매우 우수';
        } else {
            document.getElementById('fpv-next-spot').textContent = '안심 가로등 보도 따라 직진 중';
            document.getElementById('fpv-route-hint').textContent = '다음 안심 스팟으로 이동 중입니다.';
            document.getElementById('fpv-brightness').textContent = '🟡 보통 밝기 구간';
        }
    }

    // ─── 주소 검색 (Nominatim 무료 API) ──────────────────────────────
    const resultsBox = document.getElementById('search-results');
    const inputStart = document.getElementById('input-start');
    const inputEnd   = document.getElementById('input-end');

    async function searchAddress(query) {
        if (!query || !query.trim()) return;
        const clean = query.replace(/^📍|🏁|\[위치\]/g, '').trim();
        const norm = clean.replace(/[\s\-_]+/g, '').toLowerCase();

        // 1. 랜드마크 우선 검색
        const localMatches = JINJU_LANDMARKS.filter(lm => {
            const ln = lm.name.replace(/[\s\-_]+/g, '').toLowerCase();
            const an = (lm.addr || '').replace(/[\s\-_]+/g, '').toLowerCase();
            const aliasMatch = lm.aliases && lm.aliases.some(a => a.replace(/[\s\-_]+/g, '').toLowerCase().includes(norm));
            return ln.includes(norm) || an.includes(norm) || aliasMatch;
        }).map(lm => ({
            display_name: `${lm.name}, ${lm.addr}`,
            lat: lm.lat,
            lon: lm.lng
        }));

        // 2. 외부 Nominatim 검색
        let externalMatches = [];
        try {
            const searchQ = clean.includes('진주') ? clean : `진주시 ${clean}`;
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQ)}&format=json&limit=4&accept-language=ko`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'ko' } });
            const data = await res.json();
            externalMatches = data || [];
        } catch (e) {
            console.warn('주소 검색 실패:', e);
        }

        showSearchResults([...localMatches, ...externalMatches]);
    }

    function showSearchResults(data) {
        resultsBox.innerHTML = '';
        if (!data || !data.length) {
            resultsBox.innerHTML = '<div class="result-item">검색 결과가 없습니다.</div>';
            resultsBox.classList.remove('hidden');
            return;
        }

        data.forEach(item => {
            const el = document.createElement('div');
            el.className = 'result-item';
            const shortName = item.display_name.split(',').slice(0, 3).join(', ');
            el.textContent = shortName;

            el.addEventListener('click', () => {
                const latlng = L.latLng(parseFloat(item.lat), parseFloat(item.lon));
                if (activeSearchTarget === 'start') {
                    startLatLng = latlng;
                    startMarker.setLatLng(latlng);
                    inputStart.value = shortName;
                } else {
                    endLatLng = latlng;
                    endMarker.setLatLng(latlng);
                    inputEnd.value = shortName;
                    saveRecentSearch(shortName, item.lat, item.lon);
                }
                map.panTo(latlng);
                resultsBox.classList.add('hidden');
                calculateSafeRoute(false, true);
            });
            resultsBox.appendChild(el);
        });
        resultsBox.classList.remove('hidden');
    }

    inputStart.addEventListener('focus', () => { activeSearchTarget = 'start'; });
    inputEnd.addEventListener('focus',   () => { activeSearchTarget = 'end'; });

    inputStart.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') {
            activeSearchTarget = 'start';
            handleNavigateClick();
        }
    });
    inputEnd.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') {
            activeSearchTarget = 'end';
            handleNavigateClick();
        }
    });

    document.getElementById('btn-search-end').addEventListener('click', () => {
        activeSearchTarget = 'end';
        handleNavigateClick();
    });

    // 출발지 / 도착지 스왑(맞바꾸기) 핸들러
    document.getElementById('btn-swap-locations')?.addEventListener('click', () => {
        const tmpVal = inputStart.value;
        inputStart.value = inputEnd.value;
        inputEnd.value = tmpVal;

        const tmpLatLng = startLatLng;
        startLatLng = endLatLng;
        endLatLng = tmpLatLng;

        startMarker.setLatLng(startLatLng);
        endMarker.setLatLng(endLatLng);

        calculateSafeRoute(false, true);
    });

    document.addEventListener('click', (e) => {
        if (!resultsBox.contains(e.target) && e.target.tagName !== 'INPUT') {
            resultsBox.classList.add('hidden');
        }
    });

    // ─── GPS 현재 위치 1회 설정 ───────────────────────────────────────
    document.getElementById('btn-gps').addEventListener('click', () => {
        const btn = document.getElementById('btn-gps');
        btn.textContent = '⏳ 확인 중...';
        btn.disabled = true;

        if (!navigator.geolocation) {
            alert('이 브라우저에서는 GPS를 지원하지 않습니다.');
            btn.textContent = '📡 내위치'; btn.disabled = false;
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const acc = pos.coords.accuracy || 0;
                startLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
                startMarker.setLatLng(startLatLng);
                inputStart.value = '📍 현재 내 위치';
                map.setView(startLatLng, 16);
                btn.textContent = '✅ 설정됨'; btn.disabled = false;
                updateSosLocationDisplay(pos.coords.latitude, pos.coords.longitude);
                calculateSafeRoute(false);

                // PC 유선망 IP 측위(오차 300m 이상)일 경우 친절한 안내
                if (acc > 300) {
                    showDetourAlert('📡 데스크탑 위치 안내', `현재 PC 인터넷망(IP) 기반 측위(오차 약 ${Math.round(acc)}m)로 인해 실제 위치와 다를 수 있습니다. 지도에서 📍 마커를 원하는 곳으로 드래그하거나 아파트/주소를 입력하시면 훨씬 정확합니다.`);
                }
            },
            (err) => {
                alert('위치 정보를 가져올 수 없습니다. 브라우저 위치 권한을 확인해 주세요.');
                btn.textContent = '📡 내위치'; btn.disabled = false;
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    });

    // ─── 거리 계산 유틸리티 함수 (Haversine Formula - meters) ─────────
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // ═══════════════════════════════════════════════════════════════════
    // ① 실시간 GPS 추적 + ② 경로 이탈 감지 & 자동 재탐색
    // ═══════════════════════════════════════════════════════════════════
    let gpsWatchId = null;
    let isGpsTracking = false;
    let deviationTimer = null;
    const DEVIATION_THRESHOLD_M = 40; // 40m 이탈 시 경고

    function isOnRoute(lat, lng) {
        if (!currentRouteCoords || currentRouteCoords.length === 0) return true;
        for (const pt of currentRouteCoords) {
            if (getDistance(lat, lng, pt.lat, pt.lng) < DEVIATION_THRESHOLD_M) return true;
        }
        return false;
    }

    function startRealGpsTracking() {
        if (!navigator.geolocation) {
            alert('이 기기에서는 GPS를 지원하지 않습니다.');
            return;
        }

        isGpsTracking = true;
        document.getElementById('btn-live-gps-txt').textContent = '🟢 실시간 GPS 추적 중 (중지하려면 탭)';
        document.getElementById('gps-status-badge').textContent = '추적 중';
        document.getElementById('gps-status-badge').style.background = 'rgba(0,255,163,0.3)';
        document.getElementById('gps-status-badge').style.color = '#00FFA3';

        gpsWatchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude: lat, longitude: lng, accuracy } = pos.coords;
                lastGpsPosition = pos;

                // 마커 이동 (실제 GPS 위치)
                if (walkerMarker) walkerMarker.setLatLng([lat, lng]);
                if (isCameraFollow) map.panTo([lat, lng], { animate: true, duration: 0.4 });

                // SOS 위치 정보 갱신
                updateSosLocationDisplay(lat, lng);

                // 경로 이탈 감지
                if (currentRouteCoords.length > 0 && !isOnRoute(lat, lng)) {
                    document.getElementById('route-deviation-alert').classList.remove('hidden');
                    if (!deviationTimer) {
                        deviationTimer = setTimeout(() => {
                            // 이탈 3초 후 자동 재탐색
                            startLatLng = L.latLng(lat, lng);
                            startMarker.setLatLng(startLatLng);
                            calculateSafeRoute(false, false);
                            document.getElementById('route-deviation-alert').classList.add('hidden');
                            deviationTimer = null;
                        }, 3000);
                    }
                } else {
                    document.getElementById('route-deviation-alert').classList.add('hidden');
                    if (deviationTimer) { clearTimeout(deviationTimer); deviationTimer = null; }
                }

                // 정확도 표시
                document.getElementById('gps-status-badge').textContent = `±${Math.round(accuracy)}m`;
            },
            (err) => {
                console.warn('GPS 오류:', err);
                document.getElementById('gps-status-badge').textContent = 'GPS 오류';
            },
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
    }

    function stopRealGpsTracking() {
        if (gpsWatchId !== null) {
            navigator.geolocation.clearWatch(gpsWatchId);
            gpsWatchId = null;
        }
        isGpsTracking = false;
        document.getElementById('btn-live-gps-txt').textContent = '🔴 실시간 GPS 주행 시작';
        document.getElementById('gps-status-badge').textContent = '대기 중';
        document.getElementById('gps-status-badge').style.background = '';
        document.getElementById('gps-status-badge').style.color = '';
        document.getElementById('route-deviation-alert').classList.add('hidden');
    }

    document.getElementById('btn-live-gps').addEventListener('click', () => {
        if (isGpsTracking) {
            stopRealGpsTracking();
        } else {
            startRealGpsTracking();
        }
    });

    // ═══════════════════════════════════════════════════════════════════
    // ③ 오프라인 감지
    // ═══════════════════════════════════════════════════════════════════
    function updateOnlineStatus() {
        const banner = document.getElementById('offline-banner');
        if (!navigator.onLine) {
            banner.classList.remove('hidden');
        } else {
            banner.classList.add('hidden');
        }
    }
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // ═══════════════════════════════════════════════════════════════════
    // ④ 검색 자동완성 + 최근 검색 저장
    // ═══════════════════════════════════════════════════════════════════
    let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

    function saveRecentSearch(name, lat, lng) {
        recentSearches = recentSearches.filter(r => r.name !== name);
        recentSearches.unshift({ name, lat, lng, icon: '🕐' });
        if (recentSearches.length > 6) recentSearches = recentSearches.slice(0, 6);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        renderRecentSearches();
    }

    function renderRecentSearches() {
        const box = document.getElementById('recent-searches-box');
        const list = document.getElementById('recent-searches-list');
        if (recentSearches.length === 0) { box.classList.add('hidden'); return; }
        box.classList.remove('hidden');
        list.innerHTML = recentSearches.map((r, i) =>
            `<div class="recent-item" data-idx="${i}">
                <span class="recent-icon">🕐</span>
                <span>${r.name}</span>
            </div>`
        ).join('');
        list.querySelectorAll('.recent-item').forEach(el => {
            el.addEventListener('click', async () => {
                const r = recentSearches[parseInt(el.dataset.idx)];
                
                // 🎯 랜드마크 최신 교정 위경도 재확인
                let targetLatLng = L.latLng(r.lat, r.lng);
                const lm = JINJU_LANDMARKS.find(l => 
                    l.name === r.name || 
                    (l.aliases && l.aliases.includes(r.name.replace(/[\s\-_]+/g, '').toLowerCase()))
                );
                if (lm) {
                    targetLatLng = L.latLng(lm.lat, lm.lng);
                    r.lat = lm.lat;
                    r.lng = lm.lng;
                    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
                }

                endLatLng = targetLatLng;
                endMarker.setLatLng(endLatLng);
                endMarker.bindPopup(`<b>🏁 도착지: ${r.name}</b>`);
                document.getElementById('input-end').value = r.name;
                map.panTo(endLatLng);
                calculateSafeRoute(false, true);
            });
        });
    }

    document.getElementById('btn-clear-recent').addEventListener('click', () => {
        recentSearches = [];
        localStorage.removeItem('recentSearches');
        renderRecentSearches();
    });

    function setupAutocomplete(inputId, dropdownId, isStart) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);
        let debounceTimer = null;

        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                const q = input.value.trim();
                if (q.length < 1) { dropdown.classList.add('hidden'); return; }

                const qNorm = q.replace(/[\s\-_]+/g, '').toLowerCase();

                // 1. 로컬 랜드마크 즉시 매칭 (이름, 주소, 별칭, 스마트 키워드)
                const localMatches = JINJU_LANDMARKS.filter(lm => {
                    const ln = lm.name.replace(/[\s\-_]+/g, '').toLowerCase();
                    const an = (lm.addr || '').replace(/[\s\-_]+/g, '').toLowerCase();
                    if (qNorm.includes('해모로') && (qNorm.includes('4') || qNorm.includes('사')) && ln.includes('4단지')) return true;
                    if (qNorm.includes('해모로') && (qNorm.includes('2') || qNorm.includes('이')) && ln.includes('2단지')) return true;
                    if (qNorm.includes('동명고') && ln.includes('동명고')) return true;
                    if (qNorm.includes('동명중') && ln.includes('동명중')) return true;

                    const aliasMatch = lm.aliases && lm.aliases.some(a => a.replace(/[\s\-_]+/g, '').toLowerCase().includes(qNorm));
                    return ln.includes(qNorm) || an.includes(qNorm) || aliasMatch;
                }).map(lm => ({
                    name: lm.name,
                    addr: lm.addr,
                    icon: lm.icon || '📍',
                    lat: lm.lat,
                    lng: lm.lng
                }));

                // 2. Nominatim 검색 (보조)
                let nominatimResults = [];
                if (q.length >= 2 && localMatches.length < 4) {
                    try {
                        const searchQ = q.includes('진주') ? q : `진주시 ${q}`;
                        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQ)}&format=json&limit=3&accept-language=ko`);
                        const data = await res.json();
                        nominatimResults = (data || []).map(d => ({
                            name: d.display_name.split(',')[0],
                            addr: d.display_name.split(',').slice(1, 3).join(', '),
                            icon: '📍',
                            lat: parseFloat(d.lat),
                            lng: parseFloat(d.lon)
                        }));
                    } catch(e) {}
                }

                const combined = [...localMatches, ...nominatimResults].slice(0, 6);
                if (combined.length === 0) { dropdown.classList.add('hidden'); return; }

                dropdown.innerHTML = combined.map((item, i) =>
                    `<div class="autocomplete-item" data-idx="${i}" data-lat="${item.lat}" data-lng="${item.lng}" data-name="${item.name}">
                        <span class="item-icon">${item.icon}</span>
                        <div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-addr">${item.addr || ''}</div>
                        </div>
                    </div>`
                ).join('');
                dropdown.classList.remove('hidden');

                dropdown.querySelectorAll('.autocomplete-item').forEach(el => {
                    el.addEventListener('click', () => {
                        const lat = parseFloat(el.dataset.lat);
                        const lng = parseFloat(el.dataset.lng);
                        const name = el.dataset.name;
                        input.value = name;
                        dropdown.classList.add('hidden');
                        if (isStart) {
                            startLatLng = L.latLng(lat, lng);
                            startMarker.setLatLng(startLatLng);
                        } else {
                            endLatLng = L.latLng(lat, lng);
                            endMarker.setLatLng(endLatLng);
                            saveRecentSearch(name, lat, lng);
                        }
                        map.panTo([lat, lng]);
                        calculateSafeRoute(false, true);
                    });
                });
            }, 180);
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    setupAutocomplete('input-start', 'autocomplete-start', true);
    setupAutocomplete('input-end', 'autocomplete-end', false);
    renderRecentSearches();

    // ═══════════════════════════════════════════════════════════════════
    // ⑤ 야간 자동 다크모드
    // ═══════════════════════════════════════════════════════════════════
    let isNightModeManual = false;
    let nightModeEnabled = false;

    function applyNightMode(enabled) {
        nightModeEnabled = enabled;
        document.documentElement.setAttribute('data-theme', enabled ? 'night' : 'auto');
        const btn = document.getElementById('btn-night-mode');
        const icon = document.getElementById('night-mode-icon');
        const txt = document.getElementById('night-mode-txt');
        if (enabled) {
            btn.classList.add('active');
            icon.textContent = '🌙';
            txt.textContent = '야간모드 ON';
            // 지도 타일도 다크 네온으로 자동 전환
            const sel = document.getElementById('map-style-select');
            if (sel.value !== 'dark_neon') {
                sel.value = 'dark_neon';
                sel.dispatchEvent(new Event('change'));
            }
        } else {
            btn.classList.remove('active');
            icon.textContent = '☀️';
            txt.textContent = '주간모드';
        }
    }

    function checkAutoNightMode() {
        if (isNightModeManual) return;
        const hour = new Date().getHours();
        const shouldBeNight = hour >= 18 || hour < 6;
        if (shouldBeNight !== nightModeEnabled) applyNightMode(shouldBeNight);
    }

    document.getElementById('btn-night-mode').addEventListener('click', () => {
        isNightModeManual = true;
        applyNightMode(!nightModeEnabled);
    });

    checkAutoNightMode();
    setInterval(checkAutoNightMode, 60000); // 1분마다 시간 체크

    // ═══════════════════════════════════════════════════════════════════
    // ⑥ 경로 안전 점수 실시간 표시
    // ═══════════════════════════════════════════════════════════════════
    function updateSafetyScoreUI() {
        const score = calcRouteLightingScore(currentRouteCoords);
        const pct = Math.round(score * 100);
        const bar = document.getElementById('safety-score-bar');
        const label = document.getElementById('safety-score-label');
        const hudScore = document.getElementById('hud-score');

        if (!bar) return;

        bar.style.width = pct + '%';

        let color, text, hudVal;
        if (pct >= 80) {
            color = '#00FFA3';
            text = `안전도 ${pct}% — 🟢 매우 안전한 귀가 경로`;
            hudVal = Math.round(70 + pct * 0.3);
        } else if (pct >= 50) {
            color = '#FFD600';
            text = `안전도 ${pct}% — 🟡 양호 (주의 권장)`;
            hudVal = Math.round(50 + pct * 0.4);
        } else if (pct >= 20) {
            color = '#FF9500';
            text = `안전도 ${pct}% — 🟠 위험 구간 존재`;
            hudVal = Math.round(30 + pct * 0.4);
        } else {
            color = '#FF3B30';
            text = `안전도 ${pct}% — 🔴 심각한 암흑 구간`;
            hudVal = Math.max(10, pct);
        }

        bar.style.background = `linear-gradient(90deg, ${color}80, ${color})`;
        if (label) label.textContent = text;
        if (hudScore) hudScore.textContent = hudVal;
    }

    // 경로가 그려질 때마다 안전 점수 갱신
    const _origDrawSafeRoute = window._drawSafeRouteHook;
    const _safeScoreInterval = setInterval(() => {
        if (currentRouteCoords && currentRouteCoords.length > 0) {
            updateSafetyScoreUI();
        }
    }, 5000); // 5초마다 갱신 (가로등 점등 시간 변화 반영)

    // ═══════════════════════════════════════════════════════════════════
    // ⑦ SOS 긴급 버튼
    // ═══════════════════════════════════════════════════════════════════
    let currentGpsForSos = null;
    let sosFlashActive = false;
    let sosFlashTimer = null;

    function updateSosLocationDisplay(lat, lng) {
        currentGpsForSos = { lat, lng };
        const el = document.getElementById('sos-location-text');
        if (el) el.textContent = `📍 현재 위치: ${lat.toFixed(5)}, ${lng.toFixed(5)} (정확도 확인 중...)`;
    }

    document.getElementById('btn-sos-float')?.addEventListener('click', () => {
        const panel = document.getElementById('sos-panel');
        if (!panel) return;
        panel.classList.remove('hidden');
        setTimeout(() => panel.classList.add('visible'), 10);

        // 현재 GPS 위치 취득 시도
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                updateSosLocationDisplay(pos.coords.latitude, pos.coords.longitude);
            }, () => {}, { timeout: 3000 });
        }
    });

    document.getElementById('btn-close-sos')?.addEventListener('click', () => {
        const panel = document.getElementById('sos-panel');
        if (panel) {
            panel.classList.remove('visible');
            setTimeout(() => panel.classList.add('hidden'), 350);
        }
        // 점멸 중이면 중지
        if (sosFlashActive) {
            clearInterval(sosFlashTimer);
            document.body.classList.remove('sos-flashing');
            sosFlashActive = false;
        }
    });

    // 위치 공유 버튼
    document.getElementById('btn-share-location')?.addEventListener('click', () => {
        const pos = currentGpsForSos || { lat: startLatLng.lat, lng: startLatLng.lng };
        const mapUrl = `https://maps.google.com/maps?q=${pos.lat},${pos.lng}`;
        const msg = `🆘 [빛으로] 긴급 위치 공유\n현재 위치: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}\n구글맵 링크: ${mapUrl}`;

        if (navigator.share) {
            navigator.share({
                title: '🆘 긴급 위치 공유 — 빛으로',
                text: msg,
                url: mapUrl
            }).catch(() => {});
        } else {
            // 복사 fallback
            navigator.clipboard.writeText(msg).then(() => {
                alert('위치 정보가 클립보드에 복사되었습니다!\n문자/카카오톡에 붙여넣기 하세요.');
            });
        }
    });

    // SOS 화면 점멸
    document.getElementById('btn-flash-sos')?.addEventListener('click', () => {
        if (sosFlashActive) {
            clearInterval(sosFlashTimer);
            document.body.classList.remove('sos-flashing');
            sosFlashActive = false;
            const lbl = document.getElementById('btn-flash-sos')?.querySelector('.sos-label');
            if (lbl) lbl.textContent = 'SOS 신호';
        } else {
            sosFlashActive = true;
            const lbl = document.getElementById('btn-flash-sos')?.querySelector('.sos-label');
            if (lbl) lbl.textContent = '중지';
            document.body.classList.add('sos-flashing');
            // 30초 후 자동 중지
            sosFlashTimer = setTimeout(() => {
                document.body.classList.remove('sos-flashing');
                sosFlashActive = false;
            }, 30000);
        }
    });



    // 앱 시작 시 이전 신고 기록 복원
    (function loadPreviousReports() {
        const reports = JSON.parse(localStorage.getItem('userReports') || '[]');
        reports.forEach(r => {
            const nearbySpot = allSafeSpots.find(s =>
                getDistance(r.lat, r.lng, s.coords[0], s.coords[1]) < 30
            );
            if (nearbySpot && nearbySpot.status !== 'out') {
                nearbySpot.status = 'out';
            }
        });
    })();

    // ─── 이벤트 바인딩 및 초기화 ──────────────────────────────────────
    document.getElementById('btn-navigate').addEventListener('click', handleNavigateClick);

    // ⏱️ 이동 수단(도보/자전거/자동차) 칩 탭 인터랙션
    document.querySelectorAll('.transit-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.transit-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // 🌟 야간 조도 히트맵 토글 버튼
    // ══════════════════════════════════════════════════════════════════
    document.getElementById('btn-heatmap-toggle')?.addEventListener('click', () => {
        isHeatmapActive = !isHeatmapActive;
        const btn = document.getElementById('btn-heatmap-toggle');
        if (isHeatmapActive) {
            btn.classList.add('active');
            btn.querySelector('.txt').textContent = '조도 ON';
            renderHeatmapOverlay();
        } else {
            btn.classList.remove('active');
            btn.querySelector('.txt').textContent = '조도 히트맵';
            if (heatmapLayerGroup) heatmapLayerGroup.clearLayers();
        }
    });

    // ══════════════════════════════════════════════════════════════════
    // 🛡️ 보호자 실시간 안심 동행 모달
    // ══════════════════════════════════════════════════════════════════
    document.getElementById('btn-guardian-share')?.addEventListener('click', () => {
        const modal = document.getElementById('guardian-modal');
        if (!modal) return;

        // 실시간 정보 채우기
        const destEl = document.getElementById('guardian-dest-name');
        if (destEl) {
            const endInput = document.getElementById('input-end')?.value || '목적지 설정 중';
            destEl.textContent = endInput;
        }

        const etaEl = document.getElementById('guardian-eta-time');
        if (etaEl) {
            const remDist = Math.max(0, totalRouteDistanceMeters - simCurrentDistanceMeters);
            const remMin = Math.max(1, Math.round(remDist / 70));
            const distKm = (remDist / 1000).toFixed(1);
            etaEl.textContent = `도보 ${remMin}분 (${distKm} km)`;
        }

        const locEl = document.getElementById('guardian-current-loc');
        if (locEl) {
            const pos = walkerMarker ? walkerMarker.getLatLng() : startMarker.getLatLng();
            locEl.textContent = `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)} (이동 중)`;
        }

        // 배터리 정보 취득 시도
        if (navigator.getBattery) {
            navigator.getBattery().then(bat => {
                const pct = Math.round(bat.level * 100);
                const icon = pct > 60 ? '🔋' : pct > 20 ? '🪫' : '🪫';
                const el = document.getElementById('guardian-battery-val');
                if (el) el.textContent = `${icon} 배터리 ${pct}%`;
            }).catch(() => {});
        }

        // 1회용 토큰 URL 생성
        const token = 'jj' + Math.random().toString(36).slice(2, 9);
        const pos = walkerMarker ? walkerMarker.getLatLng() : startMarker.getLatLng();
        const shareUrl = `https://safejinju.app/track/live?token=${token}&lat=${pos.lat.toFixed(5)}&lng=${pos.lng.toFixed(5)}`;
        const urlInput = document.getElementById('guardian-share-url-input');
        if (urlInput) urlInput.value = shareUrl;

        modal.classList.remove('hidden');
    });

    document.getElementById('btn-close-guardian')?.addEventListener('click', () => {
        document.getElementById('guardian-modal')?.classList.add('hidden');
    });

    document.getElementById('guardian-modal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
    });

    document.getElementById('btn-copy-guardian-url')?.addEventListener('click', () => {
        const urlInput = document.getElementById('guardian-share-url-input');
        if (!urlInput) return;
        urlInput.select();
        try {
            navigator.clipboard.writeText(urlInput.value).then(() => {
                const btn = document.getElementById('btn-copy-guardian-url');
                const orig = btn.textContent;
                btn.textContent = '✅ 복사됨!';
                btn.style.background = 'rgba(0,255,163,0.3)';
                setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2000);
            });
        } catch (e) {
            document.execCommand('copy');
        }
    });

    document.getElementById('btn-kakao-guardian-share')?.addEventListener('click', () => {
        const urlInput = document.getElementById('guardian-share-url-input');
        const url = urlInput ? urlInput.value : 'https://safejinju.app';
        const msg = `🛡️ [빛으로 안심귀가] 실시간 동행 링크\n보호자 전용 위치 확인:\n${url}`;
        if (navigator.share) {
            navigator.share({ title: '🛡️ 빛으로 안심귀가', text: msg, url })
                .catch(() => navigator.clipboard.writeText(msg));
        } else {
            navigator.clipboard.writeText(msg).then(() => {
                alert('📋 카카오 공유 링크가 클립보드에 복사되었습니다! 카카오톡에 붙여넣기 하세요.');
            });
        }
    });

    loadSafetySpots().then(() => {
        calculateSafeRoute(false);
        setTimeout(updateSafetyScoreUI, 2000);
    });
});

