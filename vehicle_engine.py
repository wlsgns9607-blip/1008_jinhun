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

def diagnose_vehicle_technical(symptom: str, vehicle_info: dict) -> dict:
    """
    대한민국 1위 모빌리티 정비 OS '카싱크' 수석 테크니컬 어드바이저 AI 진단 엔진
    - [가솔린/디젤 vs 4단/6단/8단 AT vs DCT(건식/습식) vs CVT/IVT vs HEV vs EV] 파워트레인 강제 분기
    - 차종(레이, 모닝, 아반떼, 그랜저, 쏘렌토 등)별 맞춤형 기계 메커니즘 & 파워트레인 특이점 앵커링
    - 자동차정비조합 표준 작업시간(FRT 공수) 및 모비스 순정품 부품대 산출
    - 카싱크 STOP & HOLD 현장 안전망 및 현장 정비사용 3초 문진표 카드 생성
    """
    s = (symptom or "").lower()
    model = vehicle_info.get("model", "레이") if vehicle_info else "레이"
    engine_type = vehicle_info.get("engineType", "가솔린 1.0") if vehicle_info else "가솔린 1.0"
    trans = vehicle_info.get("transmission", "4단 자동변속기") if vehicle_info else "4단 자동변속기"
    mileage = int(vehicle_info.get("mileage", 85000)) if vehicle_info else 85000
    mileage_man = f"{mileage // 10000}만km" if mileage >= 10000 else f"{mileage}km"

    # 구동계 및 파워트레인 유형 정밀 판별 플래그
    is_ev = any(k in model.lower() for k in ["아이오닉", "ev3", "ev4", "ev5", "ev6", "ev9", "electric", "gv60", "e-gv70", "e-g80", "포터 ev", "봉고 ev"]) or any(k in engine_type.lower() for k in ["ev", "전기", "electric", "모터"])
    is_hev = any(k in model.lower() for k in ["하이브리드", "hev", "hybrid"]) or any(k in engine_type.lower() for k in ["하이브리드", "hev", "hybrid"])
    is_diesel = any(k in engine_type.lower() for k in ["디젤", "diesel", "crdi", "e-vgt", "r2.2", "2.2d", "2.0d", "1.7d", "1.6d"]) or "디젤" in model
    is_wet_dct = any(k in trans.lower() for k in ["습식 dct", "8단 dct", "습식 8단", "wet dct", "wdct"]) or (("2.5t" in engine_type or "아반떼 n" in model.lower() or "벨로스터 n" in model.lower()) and "dct" in trans.lower())
    is_dry_dct = (any(k in trans.lower() for k in ["7단 dct", "건식 dct", "dry dct"]) or ("dct" in trans.lower() and not is_wet_dct)) and not is_wet_dct
    is_cvt = any(k in trans.lower() for k in ["ivt", "cvt", "무단", "스마트스트림 ivt"])
    is_ray_or_morning = any(k in model for k in ["레이", "모닝", "캐스퍼", "ray", "morning", "casper"])
    is_large_suv_or_rear = any(k in model for k in ["팰리세이드", "카니발", "모하비", "g70", "g80", "g90", "gv70", "gv80", "k9", "스팅어", "렉스턴", "타호"])

    # 1. 동 겉벨트 세트
    if any(k in s for k in ["1.", "1번", "겉벨트", "구동벨트", "텐셔너", "벨트", "귀뚜라미", "끼익", "삐걱"]):
        if is_ev:
            pt_note = f"{model} [{engine_type}] 순수 전기차(EV)는 내연기관 엔진 구동벨트(겉벨트/오토텐셔너)가 적용되지 않는 구조입니다. 워터펌프 및 에어컨 컴프레서가 고전압 전동 모터(E-Compressor)로 직접 구동되므로 일반 구동벨트 장력 문제는 해당사항이 없습니다."
            parts_price = "해당 없음 (EV 전동 컴프레서 직결 구동)"
            frt = "해당 없음 (전동 모터 구동계)"
            briefing_symptom = f"{mileage_man} 주행 후 전기차 모터 보기류 및 에어컨 인버터 컴프레서 가동 소음 점검"
            check2 = "고전압 E-Compressor 및 냉각수 전동 워터펌프(EWP) 작동 상태 점검"
        elif is_hev:
            pt_note = f"{model} [{engine_type}] 파워트레인은 일반 알터네이터 대신 고전압 하이브리드 스타터 제너레이터(HSG) 구동벨트가 적용됩니다. 8~10만km 경과 시 벨트 장력이 이완되면 시동 불가 및 하이브리드 경고등 점등으로 150만~250만 원 상당의 HSG 앗세이 고장 견적을 받게 됩니다."
            parts_price = "약 75,000원 ~ 110,000원 선 (모비스 순정 HSG 고장력 전용 벨트 + 오토텐셔너 키트)"
            frt = "약 1.0 ~ 1.4 시간"
            briefing_symptom = f"{mileage_man} 주행 후 HSG 구동벨트 장력 및 텐셔너 베어링 소음 점검"
            check2 = "스캐너 HSG 벨트 슬립율 및 고전압 충전 전류 파형 점검"
        elif is_diesel:
            pt_note = f"{model} [{engine_type}] 디젤 엔진은 고토크 폭발 압력으로 크랭크샤프트 '댐퍼 풀리(Damper Pulley)'의 방진 고무가 10만km 전후로 피로 파열되는 고질병이 있습니다. 댐퍼풀리 고무가 터지면 벨트가 튕겨나가며 조향 상실과 타이밍 커버 파손으로 150만~250만 원 상당의 연쇄 파손이 발생합니다."
            parts_price = "약 120,000원 ~ 170,000원 선 (모비스 순정 댐퍼풀리 + 겉벨트 + 오토텐셔너 세트)"
            frt = "약 1.2 ~ 1.6 시간"
            briefing_symptom = f"{mileage_man} 주행 후 디젤 크랭크 댐퍼풀리 크랙 및 겉벨트 슬립 소음 점검"
            check2 = "크랭크 댐퍼풀리 방진 고무 균열·비틀림 및 아이들러 유격 육안 점검"
        elif is_ray_or_morning:
            pt_note = f"{model}의 1.0 카파 3기통 엔진은 홀수 실린더 특성상 상하 맥동 진동이 심하여 구동벨트 장력 이완 및 텐셔너 베어링 마모가 4기통보다 빠르게 진행됩니다. 방치 시 워터펌프 정지로 좁은 엔진룸에서 냉각수가 끓어넘쳐 150만~250만 원 상당의 엔진 헤드 가스켓 및 실린더 헤드 교체로 번집니다."
            parts_price = "약 55,000원 ~ 85,000원 선 (기아 순정 벨트+오토텐셔너 키트)"
            frt = "약 0.9 ~ 1.3 시간"
            briefing_symptom = f"{mileage_man} 주행 후 3기통 구동벨트 귀뚜라미 소음 및 텐셔너 점검"
            check2 = "오토텐셔너 인디케이터 장력 마킹 위치 및 아이들 풀리 유격 확인"
        else:
            pt_note = f"{model} [{engine_type}] 파워트레인은 보조기기 구동 풀리 부하가 집중되어 10만km 도달 시 벨트 크랙 및 텐셔너 유격이 급증하며, 방치 시 발전기/워터펌프 정지로 300만~500만 원 상당의 엔진 헤드 변형(엔진 사망)으로 번집니다."
            parts_price = "약 70,000원 ~ 110,000원 선 (모비스 순정 구동벨트+오토텐셔너 베어링 키트)"
            frt = "약 1.0 ~ 1.5 시간"
            briefing_symptom = f"{mileage_man} 주행 후 구동벨트 슬립 귀뚜라미 소음 및 텐셔너 유격 점검"
            check2 = "오토텐셔너 인디케이터 장력 마킹 위치 및 아이들 풀리 유격 확인"

        return {
            "summary": "겉벨트 장력 저하 및 오토텐셔너 베어링 마모 전조증상" if not is_ev else "EV 보기류 전동 컴프레서 구동계 상태 양호",
            "matchedPartIndex": 1,
            "matchedPartName": "동 겉벨트 세트 (구동벨트 / 텐셔너)" if not is_ev else "EV 전동 구동계 (엔진 겉벨트 미적용 차종)",
            "urgency": "주의 (점검필요)" if not is_ev else "양호 (점검불필요)",
            "urgencyLevel": "warning" if not is_ev else "safe",
            "highwayRisk": "장시간 고속 주행 시 벨트 이탈로 인한 발전기 동력 상실 및 엔진 오버히트 2차 사고 위험이 있습니다." if not is_ev else "전기차는 전동 구동계로 벨트 단선 위험이 없습니다.",
            "analysis": "에어컨 컴프레서 가동 부하나 냉간 시동 시 벨트 슬립(미끄러짐) 현상과 텐셔너 내부 스프링 피로로 인해 쇳소리/귀뚜라미 소음이 발생합니다." if not is_ev else "순수 전기차는 내연기관 겉벨트 시스템이 없으므로 해당 증상은 공조기 블로워 모터 등을 점검해야 합니다.",
            "powertrainAnalysis": pt_note,
            "actionGuide": "비 오는 날이나 시동 직후 소음이 커진다면 텐셔너 장력 및 벨트 리브 균열 상태를 즉시 점검받으세요." if not is_ev else "순수 전기차는 엔진 겉벨트 정비가 필요하지 않습니다.",
            "unreplacedRisk": "🚨 이 부품을 안 갈고 방치하면: 고속 주행 중 벨트가 끊어지며 워터펌프와 발전기가 동시 정지합니다. 1~2분 만에 냉각수가 끓어넘쳐 실린더 헤드가 뒤틀리고 핸들이 돌처럼 굳어 대형 연쇄 추돌을 유발하며, 단순 벨트 교체로 막을 일이 엔진 전손 교체로 이어집니다." if not is_ev else "해당사항 없음",
            "frtHours": f"{frt} (구동벨트, 오토텐셔너, 아이들러 풀리 탈부착 및 장력 세팅 기준)" if not is_ev else "해당 없음",
            "partsPriceRange": parts_price,
            "fieldVariables": "차량 하부 언더커버 볼트 고착, 댐퍼 풀리 부식 및 알터네이터 OAP 풀리 고착 여부에 따라 현장 공임이 일부 가감될 수 있습니다." if not is_ev else "특이사항 없음",
            "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
            "mechanicBriefing": {
                "symptomSummary": briefing_symptom,
                "checkPoints": [
                    "구동벨트 리브(V홈) 미세 크랙 발생률 및 OAP 풀리 원웨이 클러치 고착 점검" if not is_ev else "전동 컴프레서 구동음 점검",
                    check2
                ],
                "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
            },
            "soundOrSmell": "소리"
        }

    # 2. 미션오일 (트랜스미션 / 감속기)
    if any(k in s for k in ["2.", "2번", "미션오일", "미션", "트랜스미션", "변속", "토크컨버터", "감속기", "오징어", "쿵", "충격"]):
        if is_ev:
            pt_note = f"{model} [{engine_type}] 순수 전기차(EV)는 다단 변속기 대신 1단 [EV 감속기(Reducer)]가 탑재되어 15,000rpm 이상의 초고회전 모터 동력을 바퀴로 전달합니다. 10~12만km 도달 시 감속기 오일 점도가 깨지면 감속 기어 마모와 고주파 윙 소음이 발생하며, 방치 시 200만~350만 원 상당의 감속기 어셈블리 통교체 견적을 받게 됩니다."
            parts_price = "약 45,000원 ~ 70,000원 선 (현대/기아 순정 EV 감속기 오일 GL-4 70W 규격 1.5~2L 기준)"
            frt = "약 0.5 ~ 0.8 시간"
            briefing_symptom = f"{mileage_man} 주행 후 EV 감속기 고주파 기어 회전음 및 감속기 오일 열화 점검"
            check2 = "감속기 드레인 마그네틱 코크 쇳가루 흡착량 및 레벨링 홀 유량 확인"
            part_name = "EV 감속기 오일 (감속기 기어 윤활 유체)"
        elif is_wet_dct:
            pt_note = f"{model}의 [{trans}] 파워트레인은 고토크 대응 8단 습식 듀얼 클러치(WDCT)로 오일 냉각 다판 클러치팩과 고압 전동식 오일펌프(EOP)를 사용합니다. 열화된 오일을 방치하면 클러치팩 슬립과 유압 밸브바디 고착으로 300만~450만 원 상당의 습식 DCT 미션 앗세이 통교체 견적을 받게 됩니다."
            parts_price = "약 120,000원 ~ 180,000원 선 (모비스 순정 8단 습식 DCT 전용 오일 4.5~5.5L 기준)"
            frt = "약 1.0 ~ 1.4 시간"
            briefing_symptom = f"{mileage_man} 주행 후 8단 습식 DCT 변속 충격 및 전동 오일펌프(EOP) 유압 점검"
            check2 = "전용 스캐너로 습식 DCT 유압 압력 센서값 및 짝수/홀수 클러치 체결 학습값 초기화"
            part_name = "미션오일 (8단 습식 DCT 전용 유체)"
        elif is_dry_dct:
            pt_note = f"{model}의 [{trans}] 파워트레인은 7단 건식 듀얼 클러치(Dry DCT) 구조로 시내 저속 정체 구간에서 반클러치 슬립 열화가 집중됩니다. 미션오일 산화 및 클러치 마모 슬러지 방치 시 홀수/짝수 기어 액추에이터 고착으로 180만~250만 원 상당의 더블 클러치 세트 교체 견적을 받게 됩니다."
            parts_price = "약 75,000원 ~ 110,000원 선 (모비스 순정 7단 건식 DCT 전용 오일 2L 기준)"
            frt = "약 0.8 ~ 1.1 시간"
            briefing_symptom = f"{mileage_man} 주행 후 7단 건식 DCT 저속 덜컥거림 및 미션오일 점검"
            check2 = "전용 스캐너로 듀얼클러치 마모량 밀리미터(mm) 데이터 및 액추에이터 학습값 점검"
            part_name = "미션오일 (7단 건식 DCT 전용 기어유)"
        elif is_cvt:
            pt_note = f"{model}의 [{trans}] 파워트레인은 금속 스틸 체인 벨트와 구동 풀리 간 고압 마찰 전단력으로 동력을 전달합니다. 8~10만km 도달 시 오일 전단 안정성이 무너지면 풀리 표면 스크래치로 단순 오일 교체가 250만~350만 원 상당의 무단변속기 앗세이 통교체로 번집니다."
            parts_price = "약 90,000원 ~ 130,000원 선 (현대/기아 순정 SP-CVT1 규격 6~8L 기준)"
            frt = "약 0.8 ~ 1.2 시간"
            briefing_symptom = f"{mileage_man} 주행 후 무단변속기 풀리 슬립 의심 및 오일 점검"
            check2 = "전용 스캐너 물려 무단변속기 유온 기준 레벨링 및 유압 학습값 리셋 확인"
            part_name = "미션오일 (스마트스트림 IVT/CVT 무단변속기)"
        elif is_hev:
            pt_note = f"{model} [{engine_type}] 하이브리드는 6단 자동변속기 내부에 전기 구동 모터와 엔진 클러치 유압 제어 블록이 통합된 구조(TMED)입니다. 8~10만km 경과 시 오일 산화로 유압 응답성이 저하되면 EV-HEV 동력 전환 충격(울컥거림)이 발생하며, 방치 시 250만~400만 원 상당의 하이브리드 미션 통교체 견적을 받게 됩니다."
            parts_price = "약 85,000원 ~ 125,000원 선 (현대/기아 순정 하이브리드 전용 ATF SP-IV-M 기준)"
            frt = "약 0.8 ~ 1.2 시간"
            briefing_symptom = f"{mileage_man} 주행 후 하이브리드 모터-엔진 전환 충격 및 미션오일 점검"
            check2 = "하이브리드 엔진 클러치 유압 보정값 및 규정 유온(55℃) 기준 오버플로우 레벨링"
            part_name = "미션오일 (하이브리드 TMED 변속기)"
        elif is_ray_or_morning and ("4단" in trans or "자동" in trans):
            pt_note = f"{model}의 [4단 자동변속기(4AT)]는 차체 중량(박스카 1톤 초과) 대비 1.0L 자연흡기 저배기량 엔진 특성상 시내 주행 시 잦은 킥다운과 2~3단 고부하 변속을 반복합니다. 8~10만km 경과 시 오일 산화 슬러지가 밸브바디 솔레노이드를 막아 2단 쿵 충격이 발생하며, 방치 시 다판 클러치 디스크 소착으로 단순 오일 교체(10만 원대)가 120만~180만 원 상당의 4단 재생/앗세이 미션 통교체로 번집니다."
            parts_price = "약 55,000원 ~ 85,000원 선 (기아 순정 SP-4M/ATF 규격 4~6L 기준)"
            frt = "약 0.7 ~ 1.0 시간"
            briefing_symptom = f"{mileage_man} 주행 후 4단 자동변속기 변속 충격 및 미션오일 산화 상태 점검"
            check2 = "전용 스캐너 물려 4단 자동변속기 오일 온도(50~60℃) 기준 레벨링 및 변속 학습값 초기화 확인"
            part_name = "미션오일 (트랜스미션 / 토크컨버터)"
        else:
            pt_note = f"{model}의 [{trans}] 파워트레인은 8~10만km 주기 도달 시 토크컨버터 록업 클러치 마찰재 슬러지가 밸브바디를 막아 변속 지연이 생기며, 방치 시 200만~350만 원 상당의 미션 통째 오버홀 견적을 받게 됩니다."
            parts_price = "약 80,000원 ~ 120,000원 선 (현대/기아 순정 ATF 유체 기준)"
            frt = "약 0.8 ~ 1.2 시간"
            briefing_symptom = f"{mileage_man} 주행 후 변속 슬립 및 미션오일 점검"
            check2 = "전용 스캐너 물려 변속기 규정 유온 기준 레벨링 및 학습값 리셋 확인"
            part_name = "미션오일 (트랜스미션 / 토크컨버터)"

        return {
            "summary": "감속기 오일 열화 및 기어 고회전 마찰 소음 의심" if is_ev else "미션오일 열화 및 밸브바디 유압 지연 충격",
            "matchedPartIndex": 2,
            "matchedPartName": part_name,
            "urgency": "위험 (즉시정비)",
            "urgencyLevel": "danger",
            "highwayRisk": "고회전 감속 기어 소착으로 고속 주행 중 모터 동력 전달 차단 위험!" if is_ev else "변속 슬립 및 동력 전달 불량으로 고속 합류·추월 구간에서 가속 불능 2차 추돌 사고를 초래할 수 있습니다.",
            "analysis": "감속 기어오일 점도가 깨져 기어 치면 마찰열과 고온 슬러지가 발생하고 있습니다." if is_ev else "미션오일 교체 주기를 초과하여 점도가 깨지고 미세 쇳가루 슬러지가 밸브바디 솔레노이드를 막아 변속 충격과 고온 탄 냄새가 발생합니다.",
            "powertrainAnalysis": pt_note,
            "actionGuide": "차량 규격에 적합한 순정 오일로 전량 교환 및 유온 기준 정밀 레벨링을 권장합니다.",
            "unreplacedRisk": "🚨 이 부품을 안 갈고 방치하면: 오일 내 쇳가루 슬러지가 솔레노이드 밸브와 클러치를 완전히 태워먹습니다. 기어가 특정 단수에 영구 고착되는 ‘홀드(Limp-home)’ 상태에 빠지거나 고속도로에서 엑셀을 밟아도 동력이 헛돌며 150만~450만 원 상당의 미션 통째 오버홀 견적을 받게 됩니다.",
            "frtHours": f"{frt} (드레인/순환식 교환, 전용 스캐너 유온 보정 및 레벨링 세팅 기준)",
            "partsPriceRange": parts_price,
            "fieldVariables": "차량 하부 드레인 볼트 와셔 마모 상태, 레벨링 플러그 열화 및 오일팬 가스켓 누유 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
            "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
            "mechanicBriefing": {
                "symptomSummary": briefing_symptom,
                "checkPoints": [
                    "드레인 코크 자석 쇳가루 퇴적량 및 오일 탄화도(변색 및 탄내) 확인",
                    check2
                ],
                "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
            },
            "soundOrSmell": "복합"
        }

    # 3. 로워암 / 부싱
    if any(k in s for k in ["3.", "3번", "로워암", "부싱", "서스펜션", "하체", "찌그덕", "방지턱", "덜컥", "볼조인트"]):
        if is_ev or is_large_suv_or_rear:
            pt_note = f"{model}는 공차중량이 2톤을 초과하는 고하중 차체 특성상 노면 요철 통과 시 전륜 로워암 하이드로 부싱(오일 봉입형)과 볼조인트에 일반 세단 대비 1.5배 이상의 충격 하중이 가해집니다. 유격을 방치하면 볼조인트가 너클에서 이탈하여 고속 주행 바퀴 빠짐으로 250만~400만 원 상당의 하체 전손 파손이 발생합니다."
            parts_price = "약 130,000원 ~ 190,000원 선 (좌/우 모비스 순정 고하중 로워암 어셈블리 키트)"
            frt = "약 1.3 ~ 1.8 시간"
        elif is_ray_or_morning:
            pt_note = f"{model}는 전고가 1.7m에 달하는 박스카 구조로 세단 대비 무게중심이 높아 코너링과 방지턱 통과 시 전륜 로워암 대부싱 및 활대링크에 횡하중이 집중됩니다. 부싱 파열을 방치하면 고속 주행 시 롤링 쏠림으로 전복 위험과 볼조인트 이탈 바퀴 빠짐으로 150만~250만 원 상당의 하체 전손 파손이 일어납니다."
            parts_price = "약 75,000원 ~ 110,000원 선 (좌/우 모비스 순정 로워암 키트)"
            frt = "약 1.0 ~ 1.5 시간"
        else:
            pt_note = f"{model}의 전륜구동 하체 집중 구조 특성상 전륜 로워암에 하중의 65% 이상이 집중됩니다. 유격을 방치하면 볼조인트가 너클에서 이탈하여 고속도로 바퀴 빠짐 전복 사고와 200만 원 이상의 연쇄 파손이 발생합니다."
            parts_price = "약 100,000원 ~ 150,000원 선 (좌/우 모비스 순정 로워암 어셈블리 기준)"
            frt = "약 1.2 ~ 1.8 시간"

        return {
            "summary": "하체 로워암 부싱 경화 및 볼조인트 유격 소음",
            "matchedPartIndex": 3,
            "matchedPartName": "로워암 / 부싱 (서스펜션 암)",
            "urgency": "주의 (점검필요)",
            "urgencyLevel": "warning",
            "highwayRisk": "고속 주행 중 노면 요철 통과 시 차체 롤링과 쏠림이 급증하여 조향 조작 불능을 초래할 수 있습니다.",
            "analysis": "고무 부싱이 노후화되어 갈라지거나 오일 봉입형 부싱이 파열되어 방지턱이나 요철 통과 시 차체 찌그덕거림과 둔탁한 충격음이 발생합니다.",
            "powertrainAnalysis": pt_note,
            "actionGuide": "로워암 어셈블리 1:1 교체 후 공차체결 및 휠얼라인먼트 조정을 권장합니다.",
            "unreplacedRisk": "🚨 이 부품을 안 갈고 방치하면: 볼조인트가 너클에서 완전히 이탈(바퀴 빠짐 현상)합니다. 고속 주행 중 바퀴가 꺾여 휠하우스를 찢고 차체가 아스팔트에 긁히며 중앙분리대를 들이받는 치명적 전복 사고가 발생합니다. 타이어 편마모는 물론 휠·드라이브 샤프트·휀더까지 연쇄 파손되어 수백만 원의 수리비가 발생합니다.",
            "frtHours": f"{frt} (좌/우 로워암 탈부착, 공차체결 및 휠얼라인먼트 기준)",
            "partsPriceRange": parts_price,
            "fieldVariables": "하부 관통 볼트 부식 고착, 활대링크(스테빌라이저 링크) 고착 및 너클 볼트 나사선 손상 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
            "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
            "mechanicBriefing": {
                "symptomSummary": f"{mileage_man} 주행 후 방지턱 통과 시 하체 찌그덕 쇠 부딪힘 소음 및 로워암 유격 점검",
                "checkPoints": [
                    "로워암 대부싱 고무 찢어짐 및 크랙 여부 레버링 점검",
                    "볼조인트 상하 유격 및 너클 체결 관통 볼트 부식 고착 상태 확인"
                ],
                "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
            },
            "soundOrSmell": "소리"
        }

    # 4. 브레이크 오일
    if any(k in s for k in ["4.", "4번", "브레이크 오일", "브레이크오일", "브레이크액", "베이퍼 록", "베이퍼록", "페달 푹", "스펀지", "스폰지"]):
        if is_hev or is_ev:
            pt_note = f"{model} [{engine_type}] 차량은 통합 전자제동 모듈(IEB / AHB: Integrated Electronic Brake)이 탑재되어 일반 유압 진공 부스터보다 초정밀 솔레노이드 밸브 블록이 극도로 민감합니다. 브레이크액에 수분이 3%를 초과하면 고가의 전자유압 모듈 내부가 부식되어 단순 오일 교체가 200만~300만 원 상당의 IEB 모듈 통교체 견적을 초래합니다."
            frt = "약 0.8 ~ 1.2 시간 (전용 스캐너 전자유압 모듈 블리딩 및 4륜 순환 교환)"
            parts_price = "약 30,000원 ~ 48,000원 선 (모비스 순정 DOT4 전자제동 전용 고성능액 2L 기준)"
        else:
            pt_note = f"{model}의 ABS/ESC 유압 블록은 수분 산화 슬러지가 유입될 경우 솔레노이드 밸브가 고착되어 단순 오일 교체(7~8만 원대)가 120만~180만 원 상당의 ABS 모듈 앗세이 교체로 번집니다."
            frt = "약 0.6 ~ 0.8 시간 (전용 맥동식 장비 4륜 브리딩 에어빼기 세팅 기준)"
            parts_price = "약 25,000원 ~ 40,000원 선 (모비스 순정 DOT4 고성능 브레이크액 2L 기준)"

        return {
            "summary": "브레이크 오일 수분 함유로 인한 베이퍼 록 위험",
            "matchedPartIndex": 4,
            "matchedPartName": "브레이크 오일 (제동 압력 제어 유체)",
            "urgency": "위험 (즉시정비)",
            "urgencyLevel": "danger",
            "highwayRisk": "고속 급제동 시 오일 내 수분이 끓어 페달이 바닥까지 꺼지며 제동력을 완전 상실할 수 있습니다.",
            "analysis": "글리콜계 브레이크액의 친수성으로 인해 수분도가 3%를 초과하여 페달 답력이 푹신해지는 스펀지 현상이 진행 중입니다.",
            "powertrainAnalysis": pt_note,
            "actionGuide": "DOT4 규격 브레이크액으로 맥동식 전량 순환 교환 및 4륜 완벽 에어빼기를 즉시 수행하세요.",
            "unreplacedRisk": "🚨 이 부품을 안 갈고 방치하면: 고속도로 연속 급제동 시 수분이 기화되어 브레이크 페달이 바닥 끝까지 푹 꺼지는 ‘베이퍼 록(Vapor Lock)’이 발생합니다. 제동력이 ‘0’이 되어 시속 100km로 직격하는 치명적 인명 사고로 직결되며, 내부 부식으로 150만~300만 원 상당의 ABS/IEB 모듈 교체 비용이 발생합니다.",
            "frtHours": frt,
            "partsPriceRange": parts_price,
            "fieldVariables": "4륜 캘리퍼 에어 블리더 니플 고착 및 고착 해제 시 니플 파손 위험 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
            "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
            "mechanicBriefing": {
                "symptomSummary": f"{mileage_man} 주행 후 제동 시 페달 스펀지 질감 및 브레이크액 수분도 점검",
                "checkPoints": [
                    "디지털 수분 테스터기로 리저버 탱크 내 수분 함유율(3% 초과 여부) 측정",
                    "4륜 캘리퍼 블리더 니플 고착 상태 확인 및 순환식 완벽 에어빼기 실시"
                ],
                "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
            },
            "soundOrSmell": "소리"
        }

    # 5. 점화플러그 / 코일 (가솔린) vs 예열플러그 (디젤) vs 전기차 예외
    if any(k in s for k in ["5.", "5번", "점화플러그", "점화 코일", "점화", "예열플러그", "플러그", "코일", "이그니션", "실화", "부조", "덜덜", "팝콘"]):
        if is_ev:
            return {
                "summary": "순수 전기차(EV) 구동계 점화 부품 미적용 안내",
                "matchedPartIndex": 5,
                "matchedPartName": "전기차 구동 모터/인버터 (점화플러그 미적용 차종)",
                "urgency": "양호 (점검불필요)",
                "urgencyLevel": "safe",
                "highwayRisk": "순수 전기차는 내연기관 연소 실화 위험이 없습니다.",
                "analysis": "순수 전기차(EV)는 고전압 배터리와 구동 모터로 구동되므로 엔진 실린더 내 폭발을 일으키는 점화플러그 및 이그니션 코일 부품이 아예 존재하지 않습니다.",
                "powertrainAnalysis": f"{model} [{engine_type}]는 내연기관의 연소 행정(흡입-압축-폭발-배기)이 없는 순수 배터리 전기차입니다. 덜덜거림 진동이 발생한다면 엔진 실화가 아닌 모터 감속기 마운트 부싱이나 휠 밸런스 점검을 진행해야 합니다.",
                "actionGuide": "점화플러그 점검은 불필요하며, 차체 진동 발생 시 하체 서스펜션 마운트와 휠얼라인먼트를 점검받으세요.",
                "unreplacedRisk": "해당사항 없음 (전기차 전용 구동계)",
                "frtHours": "해당 없음",
                "partsPriceRange": "해당 없음 (점화플러그 미적용 차종)",
                "fieldVariables": "특이사항 없음",
                "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
                "mechanicBriefing": {
                    "symptomSummary": f"{mileage_man} 주행 후 전기차 차체 진동 발생 시 모터 마운트 점검",
                    "checkPoints": ["전동 모터 감속기 마운트 댐퍼 크랙 점검", "드라이브 샤프트 유격 확인"],
                    "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
                },
                "soundOrSmell": "소리"
            }
        elif is_diesel:
            pt_note = f"{model} [{engine_type}] 디젤 엔진은 압축 착화 방식으로 가솔린 점화플러그가 없으며, 겨울철 냉간 압축열을 돕는 [예열플러그(가열플러그 / Glow Plug) 및 예열 릴레이 모듈]이 장착됩니다. 예열플러그 단선 시 영하 날씨 시동 지연, 불완전 연소 흰 매연, DPF 과다 포집이 발생하며, 실린더 헤드착화 고착 방치 시 80만~150만 원 상당의 헤드 재생 가공 비용이 발생합니다."
            parts_price = "약 80,000원 ~ 130,000원 선 (모비스 순정 예열플러그 4개 세트 기준)"
            frt = "약 0.8 ~ 1.3 시간"
            part_name = "예열플러그 / 가열플러그 (디젤 압축착화 보조시스템)"
            briefing_symptom = f"{mileage_man} 주행 후 디젤 냉간 시동 지연 및 예열플러그 단선 점검"
            check2 = "스캐너 예열 릴레이 단선 고장코드 확인 및 플러그 저항값(0.6~1.2Ω) 측정"
        else:
            cyl_count = "3기통" if is_ray_or_morning else ("6기통" if any(k in engine_type for k in ["3.0", "3.3", "3.5", "3.8", "v6"]) else "4기통")
            plug_count = 3 if is_ray_or_morning else (6 if "6기통" in cyl_count else 4)
            if is_ray_or_morning:
                parts_price = "약 45,000원 ~ 70,000원 선 (기아 순정 3기통 플러그+코일 세트)"
            elif "6기통" in cyl_count:
                parts_price = "약 110,000원 ~ 160,000원 선 (모비스 순정 V6 플러그 6개+코일 세트)"
            else:
                parts_price = "약 60,000원 ~ 95,000원 선 (모비스 순정 이리듐 플러그 4개+코일 세트)"

            pt_note = f"{model}의 {cyl_count} 엔진 특성상 1기통만 실화가 나도 엔진 전체 균형이 깨져 차체가 극심하게 떨립니다. 실화 상태를 방치하면 미연소 가솔린이 배기 라인으로 넘어가 100만~180만 원 상당의 삼원 촉매 장치 멜팅(화재 손상)으로 이어집니다."
            frt = f"약 0.5 ~ 0.8 시간 (점화플러그 {plug_count}개 및 코일 어셈블리 세트 교환 기준)"
            part_name = "점화플러그 / 코일 (가솔린 연소 시스템)"
            briefing_symptom = f"{mileage_man} 주행 후 엔진 덜덜거림 진동 및 점화 실화(Misfire) 점검"
            check2 = f"전용 스캐너로 {cyl_count} 실화 실린더 번호 및 점화 파형 불량 여부 확인"

        return {
            "summary": "예열플러그 단선으로 인한 냉간 시동 지연" if is_diesel else "점화플러그 간극 마모 및 이그니션 코일 실화(Misfire)",
            "matchedPartIndex": 5,
            "matchedPartName": part_name,
            "urgency": "주의 (점검필요)",
            "urgencyLevel": "warning",
            "highwayRisk": "특정 기통 연소 불량으로 출력 저하 및 고속도로 주행 중 가속력 상실 위험이 큽니다.",
            "analysis": "플러그 열화로 방전 요구 전압이 상승하여 실화 및 불완전 연소 가스 냄새와 엔진 진동이 발생합니다.",
            "powertrainAnalysis": pt_note,
            "actionGuide": "스캐너 실시간 실화/단선 카운트 확인 후 세트 전체를 신품 교환하세요.",
            "unreplacedRisk": "🚨 이 부품을 안 갈고 방치하면: 미연소 연료가 배기 라인으로 흘러들어가 삼원 촉매 변환기나 DPF 내부를 녹아내리게(멜팅) 만듭니다. 배기 라인이 막혀 엔진 블록이 파손되며, 단순 플러그 교체로 막을 일이 150만 원 상당의 촉매/DPF 교체로 번집니다.",
            "frtHours": frt,
            "partsPriceRange": parts_price,
            "fieldVariables": "플러그 나사산 고착, 실린더 헤드 점화 플러그 홀 오일 누유 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
            "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
            "mechanicBriefing": {
                "symptomSummary": briefing_symptom,
                "checkPoints": [
                    "탈거된 플러그 팁 카본 고착 상태 및 전극 간극 마모도 육안 점검",
                    check2
                ],
                "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
            },
            "soundOrSmell": "복합"
        }

    # 6. 브레이크 패드 / 디스크
    if any(k in s for k in ["6.", "6번", "브레이크 패드", "브레이크패드", "패드", "디스크 로터", "라이닝", "쇳소리", "맷돌", "그르륵", "밀림"]):
        if is_hev or is_ev:
            pt_note = f"{model} [{engine_type}] 차량은 [회생제동(Regenerative Braking)] 시스템으로 감속 하중의 70~80%를 모터가 흡수하므로 마찰재 마모 속도는 느립니다(10만km 이상 사용 가능). 그러나 기계식 브레이크 사용 빈도가 낮아 [디스크 로터 표면 부식(녹) 및 캘리퍼 슬라이딩 핀 고착]으로 인한 편마모와 쇳소리 끌림 현상이 다발합니다. 방치 시 캘리퍼 고착으로 50만~80만 원 상당의 캘리퍼 통교체 견적을 받게 됩니다."
            parts_price = "약 55,000원 ~ 85,000원 선 (모비스 순정 패드 키트 세트 기준)"
            frt = "약 0.7 ~ 0.9 시간 (전/후륜 패드 교환, 슬라이딩 핀 고착 해제 및 윤활)"
            briefing_symptom = f"{mileage_man} 주행 후 회생제동 연계 브레이크 디스크 녹 부식 및 캘리퍼 핀 고착 점검"
            check2 = "캘리퍼 슬라이딩 핀 윤활 상태 및 디스크 로터 녹 턱마모 제거 점검"
        elif is_ray_or_morning:
            pt_note = f"{model}는 소구경 13/14인치 디스크 로터가 적용되어 제동 마찰 면적이 좁고 열 방출이 더뎌 도심 주행 시 패드 마모 속도가 빠릅니다. 백플레이트가 로터를 파고들면 5만 원대 패드 교체가 30만~50만 원 상당의 디스크 로터 및 캘리퍼 교체로 번집니다."
            parts_price = "약 45,000원 ~ 65,000원 선 (기아 순정 경차 전륜 패드 키트)"
            frt = "약 0.5 ~ 0.7 시간"
            briefing_symptom = f"{mileage_man} 주행 후 경차 전륜 패드 마모 쇳소리 점검"
            check2 = "패드 내/외측 마찰재 잔여 두께 및 디스크 로터 턱마모 확인"
        else:
            pt_note = f"{model}의 제동 하중은 전륜에 70% 이상 집중됩니다. 패드 잔량 0%를 방치하면 백플레이트가 로터를 파고들어 6~8만 원대 패드 교체가 50만~80만 원 상당의 디스크 로터 및 캘리퍼 피스톤 파열로 번집니다."
            parts_price = "약 50,000원 ~ 80,000원 선 (전륜 모비스 순정 패드 키트 세트 기준)"
            frt = "약 0.6 ~ 0.8 시간"
            briefing_symptom = f"{mileage_man} 주행 후 제동 시 쇳소리 마찰음 및 패드 마모 잔량 점검"
            check2 = "패드 내/외측 마찰재 잔여 두께(mm) 및 디스크 로터 외경 립 마모 점검"

        return {
            "summary": "브레이크 패드 마모 인디케이터 경고음 및 로터 부식" if (is_hev or is_ev) else "브레이크 패드 마모 인디케이터 경고음",
            "matchedPartIndex": 6,
            "matchedPartName": "브레이크 패드 / 디스크 마찰재",
            "urgency": "위험 (즉시정비)",
            "urgencyLevel": "danger",
            "highwayRisk": "마찰재 소진 시 제동거리가 2~3배 급증하여 고속 정체 꼬리물기 추돌 사고를 유발합니다.",
            "analysis": "패드 마찰재 잔량이 20% 이하로 떨어졌거나 캘리퍼 슬라이딩 핀 고착으로 마모 인디케이터 쇠클립이 회전하는 디스크와 닿아 고주파 쇳소리를 발생시킵니다.",
            "powertrainAnalysis": pt_note,
            "actionGuide": "앞/뒤 패드 잔여 두께를 버니어 캘리퍼스로 육안 측정 후 신품 세트로 교체하세요.",
            "unreplacedRisk": "🚨 이 부품을 안 갈고 방치하면: 패드 잔량이 0%가 되면 마찰재 뒤의 두꺼운 쇠 철판 백플레이트가 브레이크 디스크 로터를 칼로 긁듯 파고듭니다. 제동 거리가 2~3배 급증하여 고속도로 추돌 사고를 유발하며, 단순 패드 교체로 끝날 일이 디스크 로터 파열로 수십만 원 교체 비용으로 커집니다.",
            "frtHours": f"{frt} (전/후륜 패드 탈부착, 캘리퍼 슬라이딩 핀 윤활 세팅 기준)",
            "partsPriceRange": parts_price,
            "fieldVariables": "캘리퍼 피스톤 리턴 불량, 슬라이딩 핀 고착 및 디스크 로터 턱마모(립) 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
            "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
            "mechanicBriefing": {
                "symptomSummary": briefing_symptom,
                "checkPoints": [
                    "패드 내/외측 마찰재 잔여 두께(mm) 및 편마모 여부 확인",
                    check2
                ],
                "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
            },
            "soundOrSmell": "소리"
        }

    # 7. 냉각수 / 부동액 (일반 내연기관 vs HEV 듀얼 vs EV 저전도 냉각수)
    if any(k in s for k in ["7.", "7번", "냉각수", "부동액", "라디에이터", "오버히트", "한약", "달콤", "보글보글", "끓는", "스팀"]):
        if is_ev:
            pt_note = f"{model} [{engine_type}] 순수 전기차(EV)는 고전압 배터리팩과 구동 모터/인버터 냉각을 위해 [절연/저전도 냉각수(Blue BSC-1)]가 독립 순환 회로로 탑재됩니다. 일반 수돗물이나 일반 부동액을 주입하면 절연 파괴로 인한 고전압 쇼트 및 화재 위험으로 2,000만 원 이상의 배터리 팩 전손 교체로 이어지므로 반드시 전용 저전도 냉각수 순환식 교환을 진행해야 합니다."
            parts_price = "약 65,000원 ~ 100,000원 선 (현대/기아 순정 저전도 전용 부동액 4~6L 기준)"
            frt = "약 0.8 ~ 1.3 시간 (전용 장비 진공 충진 및 에어빼기)"
            briefing_symptom = f"{mileage_man} 주행 후 EV 배터리/인버터 전용 저전도 냉각수 레벨 및 누유 점검"
            check2 = "저전도 전용 냉각수 비중 및 절연 저항값 측정, 배터리 팩 냉각 라인 누설 확인"
        elif is_hev:
            pt_note = f"{model} [{engine_type}] 하이브리드는 엔진 냉각수 라인과 인버터/HSG용 하이브리드 전용 냉각수 라인이 2중(듀얼 리저버)으로 분리되어 있습니다. 인버터 냉각수 에어빼기 불량 시 전력 제어 모듈(HPCU) 과열로 인한 출력 제한 및 250만~400만 원 상당의 인버터 통교체 견적을 받게 됩니다."
            parts_price = "약 45,000원 ~ 70,000원 선 (모비스 순정 친환경 부동액 엔진+인버터 세트)"
            frt = "약 0.8 ~ 1.2 시간"
            briefing_symptom = f"{mileage_man} 주행 후 하이브리드 엔진 및 인버터 듀얼 냉각수 점검"
            check2 = "엔진 리저버 및 인버터 냉각수 비중 측정, 스캐너 인버터 수온 센서 데이터 점검"
        elif is_diesel:
            pt_note = f"{model} [{engine_type}] 디젤 엔진은 배기가스 재순환 장치인 [EGR 쿨러] 내부의 미세 균열로 냉각수가 흡기 다기관으로 스며드는 고질병이 있습니다. 방치 시 냉각수 고갈 오버히트는 물론 실린더 수격(Hydro-lock) 및 화재 위험으로 300만~500만 원 상당의 엔진 전손 교체 견적을 받게 됩니다."
            parts_price = "약 35,000원 ~ 55,000원 선 (모비스 순정 장수명 부동액 4L + 증류수 기준)"
            frt = "약 0.8 ~ 1.2 시간"
            briefing_symptom = f"{mileage_man} 주행 후 디젤 EGR 쿨러 냉각수 미세 누설 및 부동액 상태 점검"
            check2 = "가압 테스터기로 EGR 쿨러 및 상/하부 호스 누설 가압 점검"
        else:
            pt_note = f"{model}의 알루미늄 엔진 블록 특성상 산화된 부동액이 내부 워터재킷을 부식시키며, 오버히트 발생 시 실린더 헤드 휨 및 가스켓 블로우로 250만~450만 원 상당의 엔진 전손 교체 견적을 받게 됩니다."
            parts_price = "약 30,000원 ~ 50,000원 선 (모비스 순정 장수명 부동액 4L + 증류수 기준)"
            frt = "약 0.7 ~ 1.0 시간"
            briefing_symptom = f"{mileage_man} 주행 후 달콤한 한약 냄새 송풍구 유입 및 냉각수 누유 의심 점검"
            check2 = "가압 테스터기로 냉각수 라인 상/하부 호스 미세 누설 부위 가압 점검"

        return {
            "summary": "EV 저전도 냉각수 열화 및 배터리 냉각 라인 점검" if is_ev else "냉각수 누유 및 라디에이터 오버히트 끓어넘침 현상",
            "matchedPartIndex": 7,
            "matchedPartName": "EV 저전도 냉각수 (배터리/모터 인버터)" if is_ev else "냉각수 / 부동액 (라디에이터 냉각계통)",
            "urgency": "위험 (즉시정비)",
            "urgencyLevel": "danger",
            "highwayRisk": "고속 주행 중 냉각수 고갈로 구동계가 멈춰 서며 고속도로 1차로에서 대형 2차 사고 위험이 극도로 큽니다.",
            "analysis": "냉각수 코어 또는 상/하부 호스 미세 크랙으로 기화되어 달콤한 한약 냄새가 나고 냉각수가 끓어넘치고 있습니다." if not is_ev else "전기차 배터리 냉각 회로의 냉각수 수위 저하 및 전도도 상승이 감지됩니다.",
            "powertrainAnalysis": pt_note,
            "actionGuide": "본넷이 식을 때까지 절대 캡을 열지 마시고, 보조물통 수위와 호스 클램프 체결 부위를 긴급 점검받으세요.",
            "unreplacedRisk": "🚨 이 부품을 안 갈고 방치하면: 산화된 부동액이 라디에이터와 히터 코어를 내부에서 부식시켜 터뜨립니다. 주행 중 냉각수가 순식간에 유출되면 온도가 치솟아 실린더 헤드 휨 및 균열이 발생하여 수백만 원의 통엔진/배터리팩 교체 견적을 받게 됩니다.",
            "frtHours": f"{frt} (라디에이터 드레인, 진공 충진 및 에어빼기 세팅 기준)",
            "partsPriceRange": parts_price,
            "fieldVariables": "라디에이터 드레인 코크 부식 고착, 서모스탯 하우징 미세 누유 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
            "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
            "mechanicBriefing": {
                "symptomSummary": briefing_symptom,
                "checkPoints": [
                    "비중계로 부동액 어는점(-25℃ 이하) 및 산도(pH 산화도) 측정",
                    check2
                ],
                "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
            },
            "soundOrSmell": "복합"
        }

    # 8. 엔진오일 세트 (전기차 예외 처리)
    if is_ev:
        return {
            "summary": "순수 전기차(EV) 엔진오일 미적용 및 감속기 오일 점검 안내",
            "matchedPartIndex": 8,
            "matchedPartName": "EV 감속기 오일 / 캐빈 에어필터 (전기차 전용)",
            "urgency": "주의 (점검필요)",
            "urgencyLevel": "warning",
            "highwayRisk": "감속기 기어 마모 시 고속 주행 중 회전 저항 및 동력 전달 차단 위험",
            "analysis": "순수 전기차(EV)는 내연기관 엔진이 탑재되지 않아 엔진오일, 오일필터, 흡기 에어크리너 부품이 아예 존재하지 않습니다! 대신 구동 모터 회전력을 바퀴로 감속하는 [EV 감속기 오일]과 실내 쾌적성을 위한 [초미세먼지 에어컨 캐빈 필터] 점검이 진행됩니다.",
            "powertrainAnalysis": f"{model} [{engine_type}] 순수 전기차는 엔진오일 교환이 필요 없으며, 10~12만km 주기로 전용 [EV 감속기 오일(GL-4 70W)] 교환 및 6개월/1만km 주기의 [캐빈 에어필터] 교체가 권장됩니다.",
            "actionGuide": "엔진오일 교체는 건너뛰시고, 감속기 오일 레벨링과 에어컨/히터 향균 캐빈 필터를 교체하세요.",
            "unreplacedRisk": "🚨 감속기 오일을 방치하면: 초고회전 모터 기어가 마모되어 200만~350만 원 상당의 감속기 통교체 견적을 받게 됩니다.",
            "frtHours": "약 0.4 ~ 0.6 시간 (감속기 오일 드레인 및 주입, 캐빈필터 교체 기준)",
            "partsPriceRange": "약 40,000원 ~ 65,000원 선 (순정 EV 감속기 오일 + 순정 PM2.5 캐빈 에어필터)",
            "fieldVariables": "하부 언더커버 탈부착 볼트 고착 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
            "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
            "mechanicBriefing": {
                "symptomSummary": f"{mileage_man} 주행 후 EV 감속기 오일량 및 캐빈 에어필터 오염 점검",
                "checkPoints": [
                    "감속기 드레인 플러그 마그넷 쇳가루 점검",
                    "실내 블로워 하우징 캐빈 필터 오염도 육안 점검"
                ],
                "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
            },
            "soundOrSmell": "복합"
        }

    cycle_guidance = calculate_engine_oil_spec(model, engine_type)
    if is_diesel:
        pt_note = f"{model} [{engine_type}] 디젤 엔진은 DPF(매연저감장치) 보호를 위해 황산회분 함량이 낮은 [Low-SAPS (ACEA C2/C3 규격)] 전용 합성유 사용이 필수입니다. 시내 단거리 주행 시 DPF 재생 지연으로 미연소 경유가 실린더 벽을 타고 엔진오일 팬으로 유입되어 '오일 수위가 늘어나는 경유 희석 현상'이 발생합니다. 방치 시 터보차저 윤활 불량으로 180만~280만 원 상당의 터보 및 DPF 파손으로 번집니다."
        parts_price = "약 65,000원 ~ 95,000원 선 (모비스 순정 DPF 전용 C2/C3 합성유 6.5~7L + 오일필터 + 에어크리너)"
        frt = "약 0.4 ~ 0.6 시간"
    elif is_hev:
        pt_note = f"{model} [{engine_type}] 하이브리드는 EV모드와 엔진 가동이 분당 수 회씩 반복되어 엔진 유온(오일 온도)이 쉽게 오르지 않고 내부에 수분 응축 슬러지가 발생하기 쉽습니다. 반드시 저온 유동성이 우수한 [0W-16 / 0W-20 API SP 규격] 초저점도 합성유를 사용해야 하며, 방치 시 엔진 클러치 전환 소음과 250만 원 상당의 엔진 헤드 밸브 태핏 마모로 이어집니다."
        parts_price = "약 50,000원 ~ 75,000원 선 (순정 하이브리드 전용 0W-16/0W-20 4~4.5L 3종 세트)"
        frt = "약 0.4 ~ 0.6 시간"
    elif is_ray_or_morning:
        pt_note = f"{model}의 1.0 카파 엔진은 작은 차체 엔진룸 특성상 엔진오일 총 유량(약 2.8~3.1L)이 중형차의 절반 수준에 불과합니다. 적은 오일량으로 고회전 시내 주행을 반복하므로 열화 속도가 1.5배 빠르며, 오일 관리를 소홀히 하면 타이밍 체인 장력 이완 및 밸브 태핏 마찰 소음으로 150만~250만 원 상당의 엔진 보링 견적을 받게 됩니다."
        parts_price = "약 35,000원 ~ 55,000원 선 (기아 순정 0W-20/5W-20 3L + 오일필터 + 에어크리너 3종)"
        frt = "약 0.4 ~ 0.5 시간"
    else:
        pt_note = f"{model} [{engine_type}] 엔진은 {cycle_guidance.get('guidance', '주기적인 교체가 엔진 수명의 핵심입니다.')} 오일 교체를 미루다 유막이 붕괴되면 피스톤 융착으로 250만~450만 원 상당의 엔진 전손 교체 견적을 받게 됩니다."
        parts_price = "약 45,000원 ~ 65,000원 선 (현대 순정 규격 합성유 4~5L + 순정 오일필터 + 에어크리너 3종)"
        frt = "약 0.4 ~ 0.6 시간"

    return {
        "summary": "엔진오일 유량 부족 및 유압 태핏(HLA) 마찰 소음 의심",
        "matchedPartIndex": 8,
        "matchedPartName": "엔진오일 세트 (오일+에어크리너+오일필터)",
        "urgency": "위험 (즉시정비)",
        "urgencyLevel": "danger",
        "highwayRisk": "고속 주행 중 오일 유막 붕괴 시 실린더 고착(엔진 블로우)으로 갑작스러운 엔진 정지 및 2차 추돌 사고 위험!",
        "analysis": "엔진오일 점도가 깨지거나 유량이 부족하여 유압 태핏과 실린더 내벽 윤활이 원활하지 않아 찰찰거리는 쇠 마찰음과 오일 타는 냄새가 발생합니다.",
        "powertrainAnalysis": pt_note,
        "actionGuide": "오일 딥스틱 게이지로 잔량과 오일 색상을 즉시 확인하고, 오일필터·에어크리너 세트 교환을 신속히 진행하세요.",
        "unreplacedRisk": "🚨 이 부품을 안 갈고 방치하면: 오일이 끈적한 슬러지로 변해 오일 스트레이너를 막고, 피스톤과 크랭크샤프트가 고열로 녹아붙는 ‘엔진 붙음(Engine Seizure)’ 현상이 발생합니다. 5~8만 원의 오일 교체를 미루다 엔진 블록 전체를 교체해야 하는 250만~500만 원 상당의 엔진 전손 교체 견적을 받게 됩니다.",
        "frtHours": f"{frt} (리프트 잔유 드레인, 오일필터/에어크리너 3종 교체 기준)",
        "partsPriceRange": parts_price,
        "fieldVariables": "하부 언더커버 볼트 고착, 드레인 플러그 나사선 마모 및 오일팬 미세 누유 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
        "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
        "mechanicBriefing": {
            "symptomSummary": f"{mileage_man} 주행 후 엔진 태핏 마찰 소음 및 오일 유량 부족 점검",
            "checkPoints": [
                "오일 딥스틱 레벨 게이지 확인 및 드레인 오일 슬러지 오염도 점검",
                "오일필터 캡 오링 신품 교체 및 드레인 볼트 규정 토크 체결 확인"
            ],
            "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
        },
        "soundOrSmell": "복합"
    }

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

    elif action == "diagnose":
        input_data = sys.stdin.read()
        try:
            payload = json.loads(input_data)
            symptom = payload.get("symptom", "")
            vehicle_info = payload.get("vehicleInfo", {})
            result = diagnose_vehicle_technical(symptom, vehicle_info)
            print(json.dumps(result, ensure_ascii=False))
        except Exception as e:
            print(json.dumps({"error": str(e)}, ensure_ascii=False))

    else:
        print(json.dumps({"error": f"Unknown action: {action}"}))

if __name__ == "__main__":
    main()
