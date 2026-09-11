using System;
using System.IO;
using System.Text;

public class JinjuSpotGenerator {
    public static void Main(string[] args) {
        Run("safe_spots.json");
    }

    public static void Run(string targetPath) {
        var rnd = new Random(42);
        var sb = new StringBuilder();
        sb.Append("{\n  \"spots\": [\n");

        var districts = new [] {
            new { name = "가좌동/호탄동", prefix = "가좌", cLat = 35.1555, cLng = 128.1065, rLat = 0.013, rLng = 0.016, light = 380, cctv = 220, store = 95 },
            new { name = "칠암동/강남동", prefix = "칠암", cLat = 35.1795, cLng = 128.0935, rLat = 0.011, rLng = 0.014, light = 320, cctv = 190, store = 80 },
            new { name = "상대동/상평동", prefix = "상대", cLat = 35.1810, cLng = 128.1120, rLat = 0.013, rLng = 0.016, light = 340, cctv = 200, store = 85 },
            new { name = "하대동", prefix = "하대", cLat = 35.1925, cLng = 128.1195, rLat = 0.012, rLng = 0.015, light = 350, cctv = 195, store = 90 },
            new { name = "평거동/신안동", prefix = "평거", cLat = 35.1765, cLng = 128.0645, rLat = 0.014, rLng = 0.017, light = 390, cctv = 230, store = 100 },
            new { name = "초전동", prefix = "초전", cLat = 35.2050, cLng = 128.1260, rLat = 0.014, rLng = 0.017, light = 330, cctv = 180, store = 75 },
            new { name = "충무공동 혁신도시", prefix = "혁신", cLat = 35.1720, cLng = 128.1450, rLat = 0.016, rLng = 0.019, light = 410, cctv = 240, store = 95 },
            new { name = "중앙동/성북동", prefix = "중앙", cLat = 35.1940, cLng = 128.0830, rLat = 0.013, rLng = 0.015, light = 360, cctv = 210, store = 95 },
            new { name = "이현동/판문동", prefix = "이현", cLat = 35.1980, cLng = 128.0550, rLat = 0.013, rLng = 0.015, light = 260, cctv = 140, store = 60 }
        };

        var cctvTypes = new [] {
            new { type_id = "ptz_360", name = "360도 회전형 스마트 방범 CCTV", fov = 360, range_m = 45, desc = "진주시 도시관제센터 24시 실시간 모니터링 & AI 이상감지" },
            new { type_id = "fixed_wide", name = "초광각 고정형 골목 방범 CCTV", fov = 120, range_m = 35, desc = "골목 교차로 집중 감시 & 양방향 안심 비상벨 연동" },
            new { type_id = "smart_pole", name = "다기능 스마트 안심폴 (CCTV+비상벨+LED)", fov = 180, range_m = 40, desc = "위급상황 원터치 SOS 비상벨 & 경찰 즉시 출동 연계" },
            new { type_id = "kids_zone", name = "어린이/여성 안심 귀가구역 CCTV", fov = 140, range_m = 30, desc = "안심 귀가구역 집중 감시 및 고출력 경광등 작동" }
        };

        var lightTypes = new [] {
            new { type_id = "smart_led", name = "스마트 디밍 고조도 LED 보안등", lux = "150 Lux", radius_m = 25, desc = "보행자 감지 시 100% 밝기 자동 점등 센서" },
            new { type_id = "solar_safe", name = "태양광 독립형 안심 가로등", lux = "120 Lux", radius_m = 20, desc = "정전 시에도 24시간 상시 점등 보장" },
            new { type_id = "catenary_lamp", name = "골목길 벽면 브라켓 안심등", lux = "100 Lux", radius_m = 18, desc = "주택가 사각지대 해소용 고효율 조명" }
        };

        var storeTypes = new [] {
            new { brand = "GS25", type = "편의점", icon = "🏪", open = "24시간 영업" },
            new { brand = "CU", type = "편의점", icon = "🏪", open = "24시간 영업" },
            new { brand = "세븐일레븐", type = "편의점", icon = "🏪", open = "24시간 영업" },
            new { brand = "이마트24", type = "편의점", icon = "🏪", open = "24시간 영업" },
            new { brand = "진주 안심약국", type = "심야약국", icon = "💊", open = "심야(02시까지) 운영" },
            new { brand = "24시 무인카페", type = "카페/휴식", icon = "☕", open = "24시간 상시점등" },
            new { brand = "여성안심지킴이집", type = "안심지킴이", icon = "🛡️", open = "24시간 긴급대피소" }
        };

        int idCounter = 1;
        bool first = true;

        foreach (var d in districts) {
            // 1. CCTV (화각, 감시방향, 비상벨, 실시간 상태)
            for (int i = 1; i <= d.cctv; i++) {
                var spec = cctvTypes[rnd.Next(cctvTypes.Length)];
                double u1 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                double u2 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                double lat = Math.Round(d.cLat + Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2) * (d.rLat * 0.45), 6);

                u1 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                u2 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                double lng = Math.Round(d.cLng + Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2) * (d.rLng * 0.45), 6);

                int dir = rnd.Next(360);
                if (!first) sb.Append(",\n");
                first = false;
                sb.Append(string.Format("    {{\"id\":\"cctv_{0}\",\"type\":\"cctv\",\"cctv_type\":\"{1}\",\"name\":\"{2} {3} #{4:D3}\",\"coords\":[{5},{6}],\"direction\":{7},\"fov\":{8},\"range_m\":{9},\"has_bell\":true,\"resolution\":\"4K AI 실시간 감시중\",\"control_center\":\"진주시 도시관제센터 24시 연동\",\"status\":\"active\",\"district\":\"{10}\",\"desc\":\"{11}\"}}",
                    idCounter++, spec.type_id, d.prefix, spec.name, i, lat, lng, dir, spec.fov, spec.range_m, d.name, spec.desc));
            }

            // 2. 가로등
            for (int i = 1; i <= d.light; i++) {
                var spec = lightTypes[rnd.Next(lightTypes.Length)];
                double u1 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                double u2 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                double lat = Math.Round(d.cLat + Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2) * (d.rLat * 0.52), 6);

                u1 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                u2 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                double lng = Math.Round(d.cLng + Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2) * (d.rLng * 0.52), 6);

                int pNum = rnd.Next(10000, 99999);
                if (!first) sb.Append(",\n");
                first = false;
                sb.Append(string.Format("    {{\"id\":\"light_{0}\",\"type\":\"light\",\"light_type\":\"{1}\",\"name\":\"{2} {3} #{4:D3}\",\"coords\":[{5},{6}],\"radius_m\":{7},\"lux\":\"{8}\",\"pole_id\":\"JJ-LIGHT-{9}\",\"status\":\"active\",\"district\":\"{10}\",\"desc\":\"{11}\"}}",
                    idCounter++, spec.type_id, d.prefix, spec.name, i, lat, lng, spec.radius_m, spec.lux, pNum, d.name, spec.desc));
            }

            // 3. 24시 상점
            for (int i = 1; i <= d.store; i++) {
                var spec = storeTypes[rnd.Next(storeTypes.Length)];
                double u1 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                double u2 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                double lat = Math.Round(d.cLat + Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2) * (d.rLat * 0.42), 6);

                u1 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                u2 = Math.Max(0.00001, 1.0 - rnd.NextDouble());
                double lng = Math.Round(d.cLng + Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2) * (d.rLng * 0.42), 6);

                int bNum = rnd.Next(1, 20);
                if (!first) sb.Append(",\n");
                first = false;
                sb.Append(string.Format("    {{\"id\":\"store_{0}\",\"type\":\"night_store\",\"store_brand\":\"{1}\",\"store_type\":\"{2}\",\"icon\":\"{3}\",\"name\":\"{1} {4} {5}호점\",\"coords\":[{6},{7}],\"radius_m\":35,\"open_hours\":\"{8}\",\"emergency_shelter\":true,\"status\":\"active\",\"district\":\"{9}\",\"desc\":\"야간 안심 대피 및 불 밝힘 상점 ({8})\"}}",
                    idCounter++, spec.brand, spec.type, spec.icon, d.prefix, bNum, lat, lng, spec.open, d.name));
            }
        }

        sb.Append("\n  ]\n}");
        File.WriteAllText(targetPath, sb.ToString(), Encoding.UTF8);
        Console.WriteLine("SUCCESS_SPOTS_COUNT:" + (idCounter - 1));
    }
}
