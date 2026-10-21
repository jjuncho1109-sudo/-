import json
import os
from flask import Flask, render_template, jsonify, send_from_directory

app = Flask(__name__)

BASE_DIR = os.path.dirname(__file__)

@app.route('/')
def index():
    return render_template('index.html')

# 루트 정적 파일 서빙 (manifest.json, sw.js, favicon.ico 등)
@app.route('/<path:filename>')
def root_static(filename):
    # 허용된 루트 정적 파일만 서빙
    allowed = {'manifest.json', 'sw.js', 'favicon.ico', 'qr.html', 'robots.txt'}
    if filename in allowed and os.path.exists(os.path.join(BASE_DIR, filename)):
        return send_from_directory(BASE_DIR, filename)
    from flask import abort
    abort(404)

@app.route('/api/safety_data')
def get_safety_data():
    # 저장된 가상 안전 데이터 읽어오기
    data_path = os.path.join(BASE_DIR, 'safe_spots.json')
    if os.path.exists(data_path):
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify(data)
    
    return jsonify({"spots": []})


if __name__ == '__main__':
    # Flask 웹 서버 실행 (macOS 5000번 AirPlay 충돌 방지를 위해 기본 5001번 포트 사용)
    port = int(os.environ.get('PORT', 5001))
    print(f"🌟 [빛으로] 로컬 서버 구동 중: http://localhost:{port}")
    app.run(debug=True, host='0.0.0.0', port=port)
