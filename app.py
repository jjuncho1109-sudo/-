import json
import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/safety_data')
def get_safety_data():
    # 저장된 가상 안전 데이터 읽어오기
    data_path = os.path.join(os.path.dirname(__file__), 'safe_spots.json')
    if os.path.exists(data_path):
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify(data)
    
    return jsonify({"spots": []})

if __name__ == '__main__':
    # Flask 웹 서버 실행
    app.run(debug=True, port=5000)
