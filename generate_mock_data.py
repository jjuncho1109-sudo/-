import json
import random
import os

# 진주시청 중심 좌표
BASE_LAT = 35.1802
BASE_LNG = 128.1076

spots = []

# 가로등 데이터 300개 임의 생성 (시청 주변에 밀집되도록)
for _ in range(300):
    lat = BASE_LAT + random.uniform(-0.025, 0.025)
    lng = BASE_LNG + random.uniform(-0.025, 0.025)
    spots.append({"type": "light", "coords": [lat, lng]})

# 방범용 CCTV 100개 임의 생성
for _ in range(100):
    lat = BASE_LAT + random.uniform(-0.025, 0.025)
    lng = BASE_LNG + random.uniform(-0.025, 0.025)
    spots.append({"type": "cctv", "coords": [lat, lng]})

# JSON 파일로 저장
out_path = os.path.join(os.path.dirname(__file__), 'safe_spots.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump({"spots": spots}, f, ensure_ascii=False)

print(f"완벽하게 현실적인 진주시 가상 데이터 {len(spots)}개가 생성되어 {out_path} 에 저장되었습니다.")
