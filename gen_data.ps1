# UTF-8 Safe Data Generator for Jinju Safety Grid
$districts = @(
    @{ name = "가좌동/호탄동"; prefix="가좌"; center = @(35.1555, 128.1065); rLat = 0.012; rLng = 0.015; light = 350; cctv = 200; store = 95 },
    @{ name = "칠암동/강남동"; prefix="칠암"; center = @(35.1795, 128.0935); rLat = 0.010; rLng = 0.013; light = 300; cctv = 180; store = 80 },
    @{ name = "상대동/상평동"; prefix="상대"; center = @(35.1810, 128.1120); rLat = 0.012; rLng = 0.015; light = 320; cctv = 190; store = 85 },
    @{ name = "하대동"; prefix="하대"; center = @(35.1925, 128.1195); rLat = 0.011; rLng = 0.014; light = 330; cctv = 185; store = 90 },
    @{ name = "평거동/신안동"; prefix="평거"; center = @(35.1765, 128.0645); rLat = 0.013; rLng = 0.016; light = 360; cctv = 210; store = 100 },
    @{ name = "초전동"; prefix="초전"; center = @(35.2050, 128.1260); rLat = 0.013; rLng = 0.016; light = 310; cctv = 170; store = 75 },
    @{ name = "충무공동 혁신도시"; prefix="혁신"; center = @(35.1720, 128.1450); rLat = 0.015; rLng = 0.018; light = 380; cctv = 220; store = 90 },
    @{ name = "중앙동/성북동"; prefix="중앙"; center = @(35.1940, 128.0830); rLat = 0.012; rLng = 0.014; light = 340; cctv = 195; store = 95 },
    @{ name = "이현동/판문동"; prefix="이현"; center = @(35.1980, 128.0550); rLat = 0.012; rLng = 0.014; light = 240; cctv = 130; store = 55 }
)

$cctvSpecs = @(
    @{ type_id = "ptz_360"; name = "360도 회전형 스마트 방범 CCTV"; fov = 360; range_m = 45; desc = "진주시 도시관제센터 24시간 실시간 모니터링 및 AI 이상행동 감지" },
    @{ type_id = "fixed_wide"; name = "초광각 고정형 골목 방범 CCTV"; fov = 120; range_m = 35; desc = "골목 교차로 집중 감시 및 양방향 안심 비상벨 연동" },
    @{ type_id = "smart_pole"; name = "다기능 스마트 안심폴 (CCTV+비상벨+LED)"; fov = 180; range_m = 40; desc = "위급상황 원터치 SOS 비상벨 및 경찰 즉시 출동 연계" },
    @{ type_id = "kids_zone"; name = "어린이 및 여성 안심 귀가구역 CCTV"; fov = 140; range_m = 30; desc = "안심 귀가구역 집중 감시 및 고출력 경광등 작동" }
)

$lightSpecs = @(
    @{ type_id = "smart_led"; name = "스마트 디밍 고조도 LED 보안등"; lux = "150 Lux"; radius_m = 25; desc = "보행자 감지 시 100% 밝기 자동 점등 센서" },
    @{ type_id = "solar_safe"; name = "태양광 독립형 안심 가로등"; lux = "120 Lux"; radius_m = 20; desc = "정전 시에도 24시간 상시 점등 보장" },
    @{ type_id = "catenary_lamp"; name = "골목길 벽면 브라켓 안심등"; lux = "100 Lux"; radius_m = 18; desc = "주택가 사각지대 해소용 고효율 조명" }
)

$storeSpecs = @(
    @{ brand = "GS25"; type = "편의점"; icon = "🏪"; open = "24시간 영업" },
    @{ brand = "CU"; type = "편의점"; icon = "🏪"; open = "24시간 영업" },
    @{ brand = "세븐일레븐"; type = "편의점"; icon = "🏪"; open = "24시간 영업" },
    @{ brand = "이마트24"; type = "편의점"; icon = "🏪"; open = "24시간 영업" },
    @{ brand = "진주 안심약국"; type = "심야약국"; icon = "💊"; open = "심야(02시까지) 운영" },
    @{ brand = "24시 무인카페"; type = "카페/휴식"; icon = "☕"; open = "24시간 상시점등" },
    @{ brand = "여성안심지킴이집"; type = "안심지킴이"; icon = "🛡️"; open = "24시간 긴급대피소" }
)

$rnd = [System.Random]::new(1234)
function Get-RndNorm([double]$m, [double]$s) {
    $u1 = [math]::Max(0.000001, 1.0 - $rnd.NextDouble())
    $u2 = [math]::Max(0.000001, 1.0 - $rnd.NextDouble())
    return $m + $s * ([math]::Sqrt(-2.0 * [math]::Log($u1)) * [math]::Sin(2.0 * [math]::PI * $u2))
}

$spots = [System.Collections.Generic.List[PSCustomObject]]::new()
$idCounter = 1

foreach ($d in $districts) {
    # 1. CCTV
    for ($i = 1; $i -le $d.cctv; $i++) {
        $spec = $cctvSpecs[$rnd.Next(0, $cctvSpecs.Length)]
        $lat = Get-RndNorm $d.center[0] ($d.rLat * 0.45)
        $lng = Get-RndNorm $d.center[1] ($d.rLng * 0.45)
        $dir = $rnd.Next(0, 360)
        
        $spots.Add([PSCustomObject]@{
            id = "cctv_$idCounter"
            type = "cctv"
            cctv_type = $spec.type_id
            name = "$($d.prefix) $($spec.name) #{0:D3}" -f $i
            coords = @([math]::Round($lat, 6), [math]::Round($lng, 6))
            direction = $dir
            fov = $spec.fov
            range_m = $spec.range_m
            has_bell = $true
            resolution = "4K Ultra-HD AI"
            control_center = "진주시 도시관제센터 24시간 실시간 연동"
            status = "active"
            district = $d.name
            desc = $spec.desc
        })
        $idCounter++
    }

    # 2. 가로등
    for ($i = 1; $i -le $d.light; $i++) {
        $spec = $lightSpecs[$rnd.Next(0, $lightSpecs.Length)]
        $lat = Get-RndNorm $d.center[0] ($d.rLat * 0.52)
        $lng = Get-RndNorm $d.center[1] ($d.rLng * 0.52)
        $pNum = $rnd.Next(10000, 99999)

        $spots.Add([PSCustomObject]@{
            id = "light_$idCounter"
            type = "light"
            light_type = $spec.type_id
            name = "$($d.prefix) $($spec.name) #{0:D3}" -f $i
            coords = @([math]::Round($lat, 6), [math]::Round($lng, 6))
            radius_m = $spec.radius_m
            lux = $spec.lux
            pole_id = "JJ-LIGHT-$pNum"
            status = "active"
            district = $d.name
            desc = $spec.desc
        })
        $idCounter++
    }

    # 3. 24시 상점
    for ($i = 1; $i -le $d.store; $i++) {
        $spec = $storeSpecs[$rnd.Next(0, $storeSpecs.Length)]
        $lat = Get-RndNorm $d.center[0] ($d.rLat * 0.42)
        $lng = Get-RndNorm $d.center[1] ($d.rLng * 0.42)
        $bNum = $rnd.Next(1, 20)

        $spots.Add([PSCustomObject]@{
            id = "store_$idCounter"
            type = "night_store"
            store_brand = $spec.brand
            store_type = $spec.type
            icon = $spec.icon
            name = "$($spec.brand) $($d.prefix) ${bNum}호점"
            coords = @([math]::Round($lat, 6), [math]::Round($lng, 6))
            radius_m = 35
            open_hours = $spec.open
            emergency_shelter = ($spec.type -eq "편의점" -or $spec.type -eq "안심지킴이")
            status = "active"
            district = $d.name
            desc = "야간 안심 대피 및 불 밝힘 상점 ($($spec.open))"
        })
        $idCounter++
    }
}

$cctvCnt = ($spots | Where-Object { $_.type -eq "cctv" }).Count
$lightCnt = ($spots | Where-Object { $_.type -eq "light" }).Count
$storeCnt = ($spots | Where-Object { $_.type -eq "night_store" }).Count

$outputData = [PSCustomObject]@{
    metadata = [PSCustomObject]@{
        region = "경상남도 진주시 전역 (15개 주요 행정 및 생활권)"
        total_spots = $spots.Count
        cctv_count = $cctvCnt
        light_count = $lightCnt
        store_count = $storeCnt
        version = "2.5.0"
        control_system = "진주시 스마트도시 통합플랫폼 연계"
        updated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    spots = $spots
}

$jsonStr = $outputData | ConvertTo-Json -Depth 6
$outPath = [System.IO.Path]::Combine($PSScriptRoot, "safe_spots.json")
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($outPath, $jsonStr, $utf8NoBom)

Write-Host "SUCCESS: Generated $($spots.Count) spots (Lights: $lightCnt, CCTV: $cctvCnt, Stores: $storeCnt)"
