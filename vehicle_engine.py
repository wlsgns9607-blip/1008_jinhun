#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CarSync Vehicle Data Engine (Python)
- 차량 번호 정밀 유효성 검사 및 정규화 (12가 3456 / 123가 4567 / 외교 / 임시 번호판)
- 차량 설정 데이터 영구 저장 / 로드 (SQLite & JSON 백업)
- 차종별 맞춤형 소모품 교체 주기 및 위험도 산출
"""

import sys
import json
import os
import re
import sqlite3
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "carsync_vehicles.db")
JSON_STORE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vehicle_store.json")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_vehicles (
        user_email TEXT PRIMARY KEY,
        brand TEXT,
        model TEXT,
        year INTEGER,
        powertrain TEXT,
        transmission TEXT,
        plate_number TEXT,
        mileage INTEGER,
        updated_at TEXT,
        raw_json TEXT
    )
    """)
    conn.commit()
    conn.close()

def validate_and_normalize_plate_number(plate: str) -> dict:
    """
    대한민국 차량 번호판 표준 규격 정밀 검증
    1) 구형/신형 7자리: 두자리숫자 + 한글1자 + 네자리숫자 (예: 12가 3456)
    2) 신형 8자리: 세자리숫자 + 한글1자 + 네자리숫자 (예: 123가 4567)
    3) 영업용: 서울/경기 등 지역명 + 두자리숫자 + 바/사/아/자 + 네자리숫자 (예: 서울31바 1234)
    4) 친환경 번호판 (파란색)
    """
    if not plate:
        return {"valid": False, "normalized": "", "message": "차량 번호를 입력해주세요."}

    # 공백 제거 및 대문자화
    cleaned = re.sub(r"\s+", "", plate.strip())

    # 허용 한글 기호
    # 일반: 가~마, 거~저, 고~조, 구~주
    # 렌터카: 하, 허, 호
    # 택배/영업용: 바, 사, 아, 자, 배
    hangul_pattern = r"[가-힣]"

    # 패턴 1: 3자리 숫자 + 한글 + 4자리 숫자 (신형 8자리: 123가4567)
    p1 = re.compile(r"^(\d{3})([가-힣])(\d{4})$")
    # 패턴 2: 2자리 숫자 + 한글 + 4자리 숫자 (기존 7자리: 12가3456)
    p2 = re.compile(r"^(\d{2})([가-힣])(\d{4})$")
    # 패턴 3: 지역명 + 2자리 숫자 + 한글 + 4자리 숫자 (영업용: 서울31바1234)
    p3 = re.compile(r"^([가-힣]{2})(\d{2})([가-힣])(\d{4})$")

    m1 = p1.match(cleaned)
    if m1:
        normalized = f"{m1.group(1)}{m1.group(2)} {m1.group(3)}"
        return {
            "valid": True,
            "normalized": normalized,
            "plateType": "신형 8자리 번호판",
            "message": "정상 승인된 8자리 번호판입니다.",
        }

    m2 = p2.match(cleaned)
    if m2:
        normalized = f"{m2.group(1)}{m2.group(2)} {m2.group(3)}"
        return {
            "valid": True,
            "normalized": normalized,
            "plateType": "표준 7자리 번호판",
            "message": "정상 승인된 7자리 번호판입니다.",
        }

    m3 = p3.match(cleaned)
    if m3:
        normalized = f"{m3.group(1)} {m3.group(2)}{m3.group(3)} {m3.group(4)}"
        return {
            "valid": True,
            "normalized": normalized,
            "plateType": "영업용/지역 번호판",
            "message": "정상 승인된 영업용 번호판입니다.",
        }

    # 기본 포맷에는 안 맞지만 한글과 숫자가 섞여 있는 경우 정규화 허용
    if re.search(r"\d", cleaned) and re.search(r"[가-힣]", cleaned):
        return {
            "valid": True,
            "normalized": plate.strip(),
            "plateType": "사용자 지정 번호판",
            "message": "입력하신 형식으로 저장됩니다.",
        }

    return {
        "valid": False,
        "normalized": plate.strip(),
        "message": "올바른 차량번호 형식이 아닙니다 (예: 12가 3456 또는 123가 4567).",
    }

def calculate_engine_oil_spec(model: str = "", powertrain: str = "") -> dict:
    """
    현대/기아/제네시스 차종 및 파워트레인별 엔진오일 권장 교체 주기(km) 및 규격 판정
    """
    m = (model or "").lower()
    p = (powertrain or "").lower()
    combined = f"{m} {p}"

    # 1. 전기차
    if any(k in combined for k in ["ev", "전기차", "아이오닉", "electric", "gv60"]):
        return {
            "cycleKm": 100000,
            "severeKm": 60000,
            "viscosity": "감속기 전용 오일 (엔진오일 없음)",
            "guidance": "순수 전기차(EV)는 내연기관 엔진오일이 없습니다. 감속기 오일 10만km 점검 대상입니다.",
            "category": "electric"
        }

    # 2. 고성능 N 모델
    if "아반떼 n" in combined or "벨로스터 n" in combined or "코나 n" in combined or combined.endswith(" n"):
        return {
            "cycleKm": 6000,
            "severeKm": 4000,
            "viscosity": "0W-30 ACEA C2 / API SP",
            "guidance": "고출력 터보 및 트랙/스포츠 주행 환경 특성상 5,000~6,000km 주기로 오일을 교체해야 엔진 마모를 방지합니다.",
            "category": "high_performance"
        }

    # 3. 경차 (캐스퍼, 모닝, 레이)
    if any(k in combined for k in ["캐스퍼", "모닝", "레이", "casper"]):
        if any(k in combined for k in ["터보", "t-gdi"]):
            return {
                "cycleKm": 7000,
                "severeKm": 5000,
                "viscosity": "0W-20 API SP / ILSAC GF-6",
                "guidance": "1.0 카파 T-GDi 고회전 터보엔진으로 오일 열화가 빠르므로 5,000~7,000km 교체를 적극 권장합니다.",
                "category": "turbo"
            }
        return {
            "cycleKm": 8000,
            "severeKm": 7500,
            "viscosity": "0W-20 API SP",
            "guidance": "작은 배기량으로 고RPM을 빈번히 사용하므로 7,500~8,000km 주기로 교체하는 것이 최상입니다.",
            "category": "naturally_aspirated"
        }

    # 4. 하이브리드
    if any(k in combined for k in ["하이브리드", "hev", "hybrid", "니로"]):
        return {
            "cycleKm": 8000,
            "severeKm": 5000,
            "viscosity": "0W-16 또는 0W-20 API SP / GF-6",
            "guidance": "하이브리드는 잦은 엔진 ON/OFF로 엔진 유온이 낮아 엔진오일에 연료/수분이 희석되기 쉬우므로 8,000km 교체를 권장합니다.",
            "category": "hybrid"
        }

    # 5. 디젤
    if any(k in combined for k in ["디젤", "diesel", "crdi", "vgt", "r엔진", "모하비"]):
        return {
            "cycleKm": 10000,
            "severeKm": 7500,
            "viscosity": "5W-30 또는 0W-30 ACEA C2/C3 (DPF 전용 Low SAPS)",
            "guidance": "DPF(매연저감장치) 후분사로 인한 경유 유입 및 오일 증가 현상을 막기 위해 10,000km(가혹 7,500km) 교체를 권장합니다.",
            "category": "diesel"
        }

    # 6. 가솔린 터보 (T-GDi)
    if any(k in combined for k in ["터보", "turbo", "t-gdi", "2.5t", "3.3t", "3.5t", "1.6t", "n라인", "스팅어", "g70", "gv70", "gv80", "g80"]):
        is_genesis = any(k in combined for k in ["제네시스", "genesis", "g70", "g80", "gv"])
        return {
            "cycleKm": 8000 if is_genesis else 7500,
            "severeKm": 5000,
            "viscosity": "0W-30 API SP / ACEA C2" if is_genesis else "0W-20 API SP",
            "guidance": "터보차저 고열 윤활 및 카본 슬러지 방지를 위해 7,500~8,000km(도심 가혹조건 5,000km) 교체가 필수적입니다.",
            "category": "turbo"
        }

    # 7. LPi
    if any(k in combined for k in ["lpi", "lpg"]):
        return {
            "cycleKm": 10000,
            "severeKm": 7500,
            "viscosity": "0W-20 또는 5W-20 API SP",
            "guidance": "LPG 연료 특성상 오일 오염은 적으나 연소실 열부하가 크므로 10,000km 교체 주기가 이상적입니다.",
            "category": "lpi"
        }

    # 8. 자연흡기 일반
    return {
        "cycleKm": 10000,
        "severeKm": 7500,
        "viscosity": "0W-20 API SP / ILSAC GF-6",
        "guidance": "제조사 가혹조건 7,500km, 일반조건 15,000km 사이인 10,000km 주기가 엔진 청결도와 수명 유지에 가장 안전합니다.",
        "category": "naturally_aspirated"
    }

def save_vehicle_data(payload: dict) -> dict:
    init_db()
    email = payload.get("userEmail", "driver.kim@carsync.kr")
    vehicle = payload.get("vehicle", {})

    brand = payload.get("brand", "")
    model = vehicle.get("model", "")
    year = int(vehicle.get("year", 2021))
    powertrain = vehicle.get("engineType", "")
    transmission = vehicle.get("transmission", "자동변속기")
    plate_raw = vehicle.get("plateNumber", "")
    mileage = int(vehicle.get("mileage", 64000))

    # 파이썬 차량 번호 검증 및 정규화
    plate_res = validate_and_normalize_plate_number(plate_raw)
    normalized_plate = plate_res.get("normalized", plate_raw) if plate_res.get("valid") else plate_raw

    # 엔진오일 교체 주기 자동 산출 및 보강
    oil_spec = calculate_engine_oil_spec(model, powertrain)
    if "engineOilCycleKm" not in vehicle or not vehicle.get("engineOilCycleKm"):
        vehicle["engineOilCycleKm"] = oil_spec["cycleKm"]
        vehicle["engineOilSevereKm"] = oil_spec["severeKm"]
        vehicle["engineOilViscosity"] = oil_spec["viscosity"]
        vehicle["engineOilGuidance"] = oil_spec["guidance"]

    # 차량 정보 갱신
    vehicle["plateNumber"] = normalized_plate
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 1. SQLite 저장
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO user_vehicles 
    (user_email, brand, model, year, powertrain, transmission, plate_number, mileage, updated_at, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        email,
        brand,
        model,
        year,
        powertrain,
        transmission,
        normalized_plate,
        mileage,
        now_str,
        json.dumps(vehicle, ensure_ascii=False)
    ))
    conn.commit()
    conn.close()

    # 2. JSON 파일 저장
    data_store = {}
    if os.path.exists(JSON_STORE_PATH):
        try:
            with open(JSON_STORE_PATH, "r", encoding="utf-8") as f:
                data_store = json.load(f)
        except Exception:
            data_store = {}

    data_store[email] = {
        "vehicle": vehicle,
        "brand": brand,
        "updatedAt": now_str,
        "engineProcessedBy": "Python 3.10 Engine",
        "plateValidation": plate_res
    }

    with open(JSON_STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(data_store, f, ensure_ascii=False, indent=2)

    return {
        "success": True,
        "savedVehicle": vehicle,
        "plateValidation": plate_res,
        "storage": "SQLite + JSON Store",
        "savedAt": now_str,
        "pythonVersion": sys.version.split()[0]
    }

def get_vehicle_data(email: str) -> dict:
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT raw_json, updated_at FROM user_vehicles WHERE user_email = ?", (email,))
    row = cursor.fetchone()
    conn.close()

    if row and row[0]:
        try:
            veh = json.loads(row[0])
            return {"found": True, "vehicle": veh, "updatedAt": row[1]}
        except Exception:
            pass

    # JSON fallback
    if os.path.exists(JSON_STORE_PATH):
        try:
            with open(JSON_STORE_PATH, "r", encoding="utf-8") as f:
                data_store = json.load(f)
                if email in data_store:
                    return {"found": True, "vehicle": data_store[email]["vehicle"], "updatedAt": data_store[email].get("updatedAt")}
        except Exception:
            pass

    return {"found": False}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action provided"}))
        sys.exit(1)

    action = sys.argv[1]

    if action == "validate_plate":
        plate = sys.argv[2] if len(sys.argv) > 2 else ""
        result = validate_and_normalize_plate_number(plate)
        print(json.dumps(result, ensure_ascii=False))

    elif action == "save":
        input_data = sys.stdin.read()
        try:
            payload = json.loads(input_data)
            result = save_vehicle_data(payload)
            print(json.dumps(result, ensure_ascii=False))
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False))

    elif action == "get":
        email = sys.argv[2] if len(sys.argv) > 2 else "driver.kim@carsync.kr"
        result = get_vehicle_data(email)
        print(json.dumps(result, ensure_ascii=False))

    elif action == "oil_spec":
        model = sys.argv[2] if len(sys.argv) > 2 else ""
        powertrain = sys.argv[3] if len(sys.argv) > 3 else ""
        result = calculate_engine_oil_spec(model, powertrain)
        print(json.dumps(result, ensure_ascii=False))

    else:
        print(json.dumps({"error": f"Unknown action: {action}"}))

if __name__ == "__main__":
    main()
