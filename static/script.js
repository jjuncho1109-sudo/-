document.addEventListener('DOMContentLoaded', () => {

    // 기본 좌표: 진주시청
    let startLatLng = L.latLng(35.1802, 128.1076);
    let endLatLng   = L.latLng(35.1669, 128.1132);
    let activeSearchTarget = null; // 'start' or 'end'

    const map = L.map('map').setView(startLatLng, 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // ─── 안전 데이터 뿌리기 ─────────────────────────────────────────
    fetch('/api/safety_data').then(r => r.json()).then(data => {
        (data.spots || []).forEach(spot => {
            const isCCTV = spot.type === 'cctv';
            L.circle(spot.coords, {
                color: isCCTV ? '#00E5FF' : '#FFEB3B',
                fillColor: isCCTV ? '#00E5FF' : '#FFEB3B',
                fillOpacity: 0.25, radius: isCCTV ? 20 : 50, weight: 0
            }).addTo(map);
        });
    });

    // ─── 드래그 가능한 커스텀 마커 ─────────────────────────────────
    const startIcon = L.divIcon({ className: '', html: '<div style="font-size:28px;filter:drop-shadow(0 0 6px #FFEB3B)">📍</div>', iconAnchor:[14,28] });
    const endIcon   = L.divIcon({ className: '', html: '<div style="font-size:28px;filter:drop-shadow(0 0 6px #FF00FF)">🏁</div>', iconAnchor:[14,28] });
    const carIcon   = L.divIcon({ className: '', html: '<div id="car-icon" style="font-size:26px">🚗</div>', iconAnchor:[13,13] });

    const startMarker = L.marker(startLatLng, { icon: startIcon, draggable: true }).addTo(map).bindPopup('출발');
    const endMarker   = L.marker(endLatLng,   { icon: endIcon,   draggable: true }).addTo(map).bindPopup('도착');

    startMarker.on('dragend', () => { startLatLng = startMarker.getLatLng(); });
    endMarker.on('dragend',   () => { endLatLng   = endMarker.getLatLng(); });

    // ─── 주소 검색 (Nominatim 무료 API) ────────────────────────────
    const resultsBox = document.getElementById('search-results');

    async function searchAddress(query) {
        if (!query.trim()) return;
        // 진주 지역으로 검색 범위를 좁힘
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' 진주')}&format=json&limit=5&accept-language=ko`;
        try {
            const res = await fetch(url, { headers: { 'Accept-Language': 'ko' } });
            const data = await res.json();
            showResults(data);
        } catch(e) {
            console.error('주소 검색 실패:', e);
        }
    }

    function showResults(data) {
        resultsBox.innerHTML = '';
        if (!data.length) {
            resultsBox.innerHTML = '<div class="result-item">검색 결과 없음</div>';
            resultsBox.classList.remove('hidden');
            return;
        }
        data.forEach(item => {
            const el = document.createElement('div');
            el.className = 'result-item';
            // 주소를 짧게 표시
            const shortName = item.display_name.split(',').slice(0, 3).join(', ');
            el.textContent = shortName;
            el.addEventListener('click', () => {
                const latlng = L.latLng(parseFloat(item.lat), parseFloat(item.lon));
                if (activeSearchTarget === 'start') {
                    startLatLng = latlng;
                    startMarker.setLatLng(latlng);
                    document.getElementById('input-start').value = shortName;
                    map.panTo(latlng);
                } else {
                    endLatLng = latlng;
                    endMarker.setLatLng(latlng);
                    document.getElementById('input-end').value = shortName;
                    map.panTo(latlng);
                }
                resultsBox.classList.add('hidden');
            });
            resultsBox.appendChild(el);
        });
        resultsBox.classList.remove('hidden');
    }

    // 검색 입력창 이벤트
    document.getElementById('input-start').addEventListener('focus', () => { activeSearchTarget = 'start'; });
    document.getElementById('input-end').addEventListener('focus',   () => { activeSearchTarget = 'end'; });

    document.getElementById('input-start').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchAddress(e.target.value);
    });
    document.getElementById('input-end').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchAddress(e.target.value);
    });
    document.getElementById('btn-search-end').addEventListener('click', () => {
        activeSearchTarget = 'end';
        searchAddress(document.getElementById('input-end').value);
    });

    // 검색창 외부 클릭 시 결과 닫기
    document.addEventListener('click', (e) => {
        if (!resultsBox.contains(e.target) && e.target.tagName !== 'INPUT') {
            resultsBox.classList.add('hidden');
        }
    });

    // ─── 📡 현재 위치 가져오기 ──────────────────────────────────────
    document.getElementById('btn-gps').addEventListener('click', () => {
        const btn = document.getElementById('btn-gps');
        btn.textContent = '⏳ 위치 확인 중...';
        btn.disabled = true;

        if (!navigator.geolocation) {
            alert('이 브라우저에서는 위치 정보를 사용할 수 없습니다.');
            btn.textContent = '📡 현위치'; btn.disabled = false;
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                startLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
                startMarker.setLatLng(startLatLng);
                map.panTo(startLatLng);
                document.getElementById('input-start').value = '📍 현재 위치';
                btn.textContent = '✅ 위치 설정됨'; btn.disabled = false;
            },
            (err) => {
                alert('위치 정보를 가져올 수 없습니다. 브라우저 권한을 확인해주세요.');
                btn.textContent = '📡 현위치'; btn.disabled = false;
            }
        );
    });

    // ─── 라우팅 + 자동차 애니메이션 ─────────────────────────────────
    let routingControl = null;
    let carMarker      = null;
    let animFrame      = null;

    function updateRoute() {
        if (routingControl) map.removeControl(routingControl);
        if (carMarker) { map.removeLayer(carMarker); carMarker = null; }
        if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }

        routingControl = L.Routing.control({
            waypoints: [ startMarker.getLatLng(), endMarker.getLatLng() ],
            lineOptions: { styles: [{ color: '#FF00FF', opacity: 0.9, weight: 6 }] },
            show: true,
            addWaypoints: false,
            routeWhileDragging: false,
            createMarker: () => null,
            fitSelectedRoutes: true
        }).addTo(map);

        routingControl.on('routesfound', (e) => {
            animateCar(e.routes[0].coordinates);
        });
    }

    function animateCar(coords) {
        if (coords.length < 2) return;
        if (carMarker) map.removeLayer(carMarker);
        carMarker = L.marker(coords[0], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);

        let idx = 0;
        const SPEED = 8;

        function step() {
            idx += SPEED;
            if (idx >= coords.length) {
                carMarker.setLatLng([coords[coords.length-1].lat, coords[coords.length-1].lng]);
                return;
            }
            const cur  = coords[idx];
            const prev = coords[idx - SPEED] || coords[0];
            const angle = Math.atan2(cur.lng - prev.lng, cur.lat - prev.lat) * (180 / Math.PI);
            const carEl = document.getElementById('car-icon');
            if (carEl) carEl.style.transform = `rotate(${angle}deg)`;
            carMarker.setLatLng([cur.lat, cur.lng]);
            animFrame = requestAnimationFrame(step);
        }
        animFrame = requestAnimationFrame(step);
    }

    document.getElementById('btn-navigate').addEventListener('click', updateRoute);
});
