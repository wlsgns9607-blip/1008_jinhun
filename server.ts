import express from "express";
import path from "path";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function to execute Python vehicle_engine.py
function runPythonEngine(action: string, args: string[] = [], stdinData?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "vehicle_engine.py");
    const child = spawn("python3", [pythonScript, action, ...args]);

    let stdout = "";
    let stderr = "";

    if (stdinData) {
      child.stdin.write(stdinData);
      child.stdin.end();
    }

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        console.error(`Python process error (code ${code}):`, stderr);
        return resolve({ success: false, error: stderr || "Python execution failed" });
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        console.warn("Python stdout was not JSON:", stdout);
        resolve({ success: true, raw: stdout.trim() });
      }
    });

    child.on("error", (err) => {
      console.error("Failed to spawn python process:", err);
      reject(err);
    });
  });
}

// 1. Python Plate Validation & Normalization API
app.post("/api/vehicle/validate-plate", async (req, res) => {
  const { plateNumber } = req.body;
  try {
    const result = await runPythonEngine("validate_plate", [plateNumber || ""]);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ valid: false, error: err.message });
  }
});

// 2. Python Vehicle Data Persistence API (SQLite & JSON Store)
app.post("/api/vehicle/save", async (req, res) => {
  try {
    const payload = req.body;
    const result = await runPythonEngine("save", [], JSON.stringify(payload));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Python Vehicle Data Retrieval API
app.get("/api/vehicle/get", async (req, res) => {
  const email = (req.query.email as string) || "driver.kim@carsync.kr";
  try {
    const result = await runPythonEngine("get", [email]);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ found: false, error: err.message });
  }
});

// 4. Python Vehicle Engine Oil Spec API
app.get("/api/vehicle/oil-spec", async (req, res) => {
  const model = (req.query.model as string) || "";
  const powertrain = (req.query.powertrain as string) || "";
  try {
    const result = await runPythonEngine("oil_spec", [model, powertrain]);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "CarSync Backend" });
});

// AI Auto-Diagnostic Endpoint with multi-model fallback & resilience
app.post("/api/ai-diagnose", async (req, res) => {
  const { symptom, vehicleInfo } = req.body;
  if (!symptom || typeof symptom !== "string") {
    return res.status(400).json({ error: "증상(symptom)을 입력해주세요." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Intelligent fallback when API key is not configured
    const fallbackResult = generateFallbackDiagnosis(symptom);
    return res.json(fallbackResult);
  }

  const prompt = `당신은 대한민국 1급 차량 정비 마스터이자 카싱크(CarSync)의 수석 AI 진단 엔지니어입니다.
운전자가 차량 이상 증상(소음, 진동, 냄새, 주행감 이상 등)을 문의했습니다.
운전자 차량 정보: ${vehicleInfo ? JSON.stringify(vehicleInfo) : "아반떼 CN7 (주행거리 112,000km)"}
운전자 문의 증상: "${symptom}"

카싱크의 '고속도로 2차 사고 방지 핵심 8대 부품':
1. 동 겉벨트 세트 (구동벨트 / 텐셔너 베어링)
2. 미션오일 (트랜스미션 / 토크컨버터)
3. 로워암 / 부싱 (하체 관절 / 서스펜션 암)
4. 브레이크 오일 (제동 압력 제어 유체 / 베이퍼 록 방지)
5. 점화플러그 / 코일 (가솔린 점화 연소 시스템)
6. 브레이크 패드 / 디스크 마찰재
7. 냉각수 / 부동액 (엔진 냉각계통 / 오버히트 방지)
8. 엔진오일 세트 (엔진 윤활유 / 오일필터 / 에어크리너 3종)

[주의사항]
- AI는 금액이나 견적을 단정적으로 정해주지 않습니다. 정확한 견적은 정비소 현장 실차 점검 후 표준 공임 및 부품 실가에 따라 결정됨을 안내합니다.
- 특히 운전자가 왜 이 부품을 지금 교체해야 하는지 납득할 수 있도록, "이 부품을 제때 안 갈면 어떻게 되는지(연쇄 파손 및 대형 사고/수리비 폭탄)"를 구체적이고 생생하게 경고(unreplacedRisk)해야 합니다.

다음 JSON 포맷으로만 응답하세요:
{
  "summary": "1줄 요약 진단 (예: 엔진오일 유량 부족 및 태핏 마찰 소음 의심)",
  "matchedPartIndex": 1부터 8까지의 숫자 (핵심 8대 부품 중 매칭되는 번호, 없으면 null),
  "matchedPartName": "매칭된 부품명 또는 주요 의심 부품",
  "urgency": "위험 (즉시정비)" | "주의 (점검필요)" | "경미 (관찰필요)",
  "urgencyLevel": "danger" | "warning" | "info",
  "highwayRisk": "고속도로 주행 시 위험도 및 2차 사고 발생 가능성 설명 (1~2문장)",
  "analysis": "구체적인 원인 기전과 증상 발생 이유 (2~3문장)",
  "actionGuide": "운전자가 지금 당장 취해야 할 안전 조치 및 정비 가이드",
  "unreplacedRisk": "★이 부품을 안 갈고 방치하면 어떻게 되는가: 연쇄 부품 파손(엔진 블록 균열, 미션 통째 교체, 제동 불능 충돌 등) 및 최소 수백만 원대 수리비 폭탄, 2차 추돌 사고 위험을 2~3문장으로 명확히 설명",
  "soundOrSmell": "소리" | "냄새" | "진동" | "복합"
}`;

  // Multi-model resilience fallback list to mitigate 503 high demand spikes
  const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  
  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    } catch (modelError: any) {
      console.warn(`Model ${modelName} unavailable or busy (${modelError?.status || modelError?.message}), attempting next option...`);
      // Short delay before next attempt if high demand
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // Graceful rule-based intelligent fallback if all external models are experiencing demand spikes
  console.info("Serving intelligent fallback diagnosis for symptom:", symptom);
  return res.json(generateFallbackDiagnosis(symptom));
});

function generateFallbackDiagnosis(symptom: string) {
  const s = symptom.toLowerCase();
  if (s.includes("엔진오일") || s.includes("오일") || s.includes("태핏") || s.includes("찰찰") || s.includes("타닥") || s.includes("유압") || s.includes("프라이팬") || s.includes("오일 경고등")) {
    return {
      summary: "엔진오일 유량 부족 및 유압 태핏(HLA) 마찰 소음 의심",
      matchedPartIndex: 8,
      matchedPartName: "엔진오일 세트 (오일+에어크리너+오일필터)",
      urgency: "위험 (즉시정비)",
      urgencyLevel: "danger",
      highwayRisk: "고속 주행 중 오일 유막 붕괴 시 실린더 고착(엔진 블로우)으로 고속도로 1차로에서 갑작스러운 엔진 정지 및 2차 추돌 사고 위험!",
      analysis: "엔진오일 점도가 깨지거나 유량이 부족하여 유압 태핏과 실린더 내벽 윤활이 원활하지 않아 찰찰거리는 쇠 마찰음과 오일 타는 냄새가 발생합니다.",
      actionGuide: "오일 딥스틱 게이지로 잔량과 오일 색상을 즉시 확인하고, 오일필터·에어크리너 세트 교환을 신속히 진행하세요.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 오일이 끈적한 슬러지로 변해 오일 스트레이너를 막고, 피스톤과 크랭크샤프트가 고열로 녹아붙는 ‘엔진 붙음(Engine Seizure)’ 현상이 발생합니다. 5~8만 원의 오일 교체를 미루다 엔진 블록 전체를 교체해야 하는 300~700만 원 상당의 엔진 전손 교체 견적을 받게 됩니다.",
      soundOrSmell: "복합",
    };
  } else if (s.includes("귀뚜라미") || s.includes("끼익") || s.includes("삐걱") || s.includes("벨트") || s.includes("에어컨")) {
    return {
      summary: "겉벨트 장력 저하 및 텐셔너 베어링 마모 전조증상",
      matchedPartIndex: 1,
      matchedPartName: "동 겉벨트 세트 (구동벨트 / 텐셔너)",
      urgency: "주의 (점검필요)",
      urgencyLevel: "warning",
      highwayRisk: "장시간 고속 주행 시 벨트 이탈로 인한 발전기(알터네이터) 동력 상실 및 엔진 과열 위험이 있습니다.",
      analysis: "에어컨 컴프레서 가동 부하나 냉간 시동 시 벨트 슬립(미끄러짐) 현상으로 쇳소리/귀뚜라미 소음이 발생합니다.",
      actionGuide: "비 오는 날이나 시동 직후 소음이 더 커진다면 텐셔너 장력 및 벨트 균열을 즉시 육안 점검받으세요.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 고속 주행 중 벨트가 끊어지며 워터펌프와 발전기가 동시 정지합니다. 1~2분 만에 엔진 냉각수가 끓어넘쳐 실린더 헤드가 뒤틀리고(엔진 사망), 유압 파워스티어링과 브레이크 부압이 상실되어 주행 중 핸들이 돌처럼 굳고 차가 멈추며 대형 연쇄 추돌을 유발합니다. 단순 소모품 벨트 교체로 막을 수 있는 일이 최소 300~500만 원 상당의 엔진 전손 교체로 번집니다.",
      soundOrSmell: "소리",
    };
  } else if (s.includes("쿵") || s.includes("충격") || s.includes("미션") || s.includes("변속") || s.includes("오징어")) {
    return {
      summary: "미션오일 열화 및 밸브바디 유압 지연 충격",
      matchedPartIndex: 2,
      matchedPartName: "미션오일 (트랜스미션 / 토크컨버터)",
      urgency: "위험 (즉시정비)",
      urgencyLevel: "danger",
      highwayRisk: "변속 지연 및 동력 전달 불량으로 고속 합류 구간에서 가속 불능 사고를 초래할 수 있습니다.",
      analysis: "미션오일 교체 주기(8~10만km)를 초과하여 오일 점도가 깨지고 슬러지가 밸브바디를 막아 변속 충격과 고온 탄 냄새가 발생합니다.",
      actionGuide: "미션오일 순환식 교환 및 레벨링 점검을 권장합니다.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 오일 내 쇳가루 슬러지가 미션 솔레노이드 밸브와 클러치 디스크를 완전히 태워먹습니다. 결국 기어가 3단이나 P단에 영구 고착되는 ‘홀드(Limp-home)’ 상태에 빠지거나, 고속도로 주행 중 동력이 완전 상실되어 엑셀을 밟아도 헛돌게 됩니다. 오일 교체 시기를 놓치면 200~400만 원 상당의 미션 통째 교체(앗세이 오버홀)를 피할 수 없습니다.",
      soundOrSmell: "복합",
    };
  } else if (s.includes("찌그덕") || s.includes("방지턱") || s.includes("로워암") || s.includes("하체") || s.includes("덜컥")) {
    return {
      summary: "하체 로워암 부싱 경화 및 볼조인트 유격 소음",
      matchedPartIndex: 3,
      matchedPartName: "로워암 / 부싱 (서스펜션 암)",
      urgency: "주의 (점검필요)",
      urgencyLevel: "warning",
      highwayRisk: "고속 주행 중 노면 요철 통과 시 차체 롤링과 조향 불안정이 급증합니다.",
      analysis: "고무 부싱이 노후화되어 찢어지거나 경화되어 방지턱을 넘을 때 차체 삐걱거림 소음이 발생합니다.",
      actionGuide: "로워암 부싱 어셈블리 교체 또는 강화 부싱 교체 정비를 권장합니다.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 유격을 방치하면 주행 중 볼조인트가 너클에서 완전히 이탈(바퀴 빠짐 현상)합니다. 고속 주행 중 바퀴가 꺾여 휠하우스를 찢고 차체가 아스팔트에 긁히며 중앙분리대를 들이받는 치명적 전복 사고가 발생합니다. 타이어 편마모로 인한 타이어 조기 파손은 물론, 휠·드라이브 샤프트·휀더까지 연쇄 파손되어 수백만 원의 수리비가 발생합니다.",
      soundOrSmell: "소리",
    };
  } else if (s.includes("푹") || s.includes("스펀지") || s.includes("브레이크 오일") || s.includes("밀림")) {
    return {
      summary: "브레이크 오일 수분 함유로 인한 베이퍼 록 위험",
      matchedPartIndex: 4,
      matchedPartName: "브레이크 오일 (제동 압력 제어 유체)",
      urgency: "위험 (즉시정비)",
      urgencyLevel: "danger",
      highwayRisk: "고속 급제동 시 오일 내 수분이 끓어 순간적으로 브레이크 페달이 바닥까지 푹 꺼지며 제동력을 완전 상실할 수 있습니다.",
      analysis: "브레이크 오일 수분도가 3%를 초과하여 페달 답력이 푹신해지는 스폰지 현상이 진행 중입니다.",
      actionGuide: "DOT4 규격 브레이크액으로 전량 순환 교환 및 에어 빼기 작업을 즉시 수행하세요.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 내리막길이나 고속도로에서 2~3회 연속 급제동하는 순간 수분이 기화되어 브레이크 페달이 바닥 끝까지 푹 꺼지는 ‘베이퍼 록(Vapor Lock)’ 현상이 발생합니다. 브레이크를 밟아도 제동력이 ‘0’이 되어 앞차나 가드레일을 시속 100km로 직격하는 최악의 인명 사고로 직결됩니다. 또한 오일 내 수분으로 캘리퍼 피스톤과 ABS 모듈 내부가 부식되어 150만 원 상당의 ABS 모듈 교체 비용이 발생합니다.",
      soundOrSmell: "소리",
    };
  } else if (s.includes("부조") || s.includes("덜덜") || s.includes("팝콘") || s.includes("시동") || s.includes("점화")) {
    return {
      summary: "점화플러그 / 이그니션 코일 실화(Misfire) 현상",
      matchedPartIndex: 5,
      matchedPartName: "점화플러그 / 코일 (가솔린 연소 시스템)",
      urgency: "주의 (점검필요)",
      urgencyLevel: "warning",
      highwayRisk: "특정 기통 연소 불량으로 출력 저하 및 촉매장치 손상을 유발할 수 있습니다.",
      analysis: "플러그 간극 마모 또는 코일 절연 파괴로 인해 불완전 연소 가스 냄새와 엔진 진동이 유발됩니다.",
      actionGuide: "진단기 스캔 후 실화 실린더 확인 및 4기통/6기통 세트 교환을 추천합니다.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 폭발하지 못한 생가솔린이 배기 라인으로 그대로 흘러들어가 800도가 넘는 고온의 ‘삼원 촉매 변환기(Catalytic Converter)’ 안에서 후폭풍 화재를 일으키며 녹아내립니다(촉매 멜팅). 촉매가 막히면 배기 가스가 역류해 엔진 블록이 파손되며, 촉매 장치 단품 교체 비용만 100~200만 원이 추가 발생합니다.",
      soundOrSmell: "복합",
    };
  } else if (s.includes("냉각수") || s.includes("부동액") || s.includes("오버히트") || s.includes("한약") || s.includes("달콤") || s.includes("보글보글") || s.includes("끓는") || s.includes("스팀") || s.includes("라디에이터")) {
    return {
      summary: "냉각수 누유 및 라디에이터 오버히트 끓어넘침 현상",
      matchedPartIndex: 7,
      matchedPartName: "냉각수 / 부동액 (라디에이터 냉각계통)",
      urgency: "위험 (즉시정비)",
      urgencyLevel: "danger",
      highwayRisk: "고속 주행 중 냉각수 부족으로 엔진 실린더 헤드가 뒤틀리거나 주행 중 갑작스러운 엔진 정지로 2차 추돌 사고 위험이 매우 큽니다.",
      analysis: "라디에이터 코어 또는 상/하부 호스 미세 크랙으로 에틸렌글리콜이 기화되어 달콤한 한약 냄새가 나고 냉각수가 끓어넘치고 있습니다.",
      actionGuide: "본넷이 식을 때까지 절대 캡을 열지 마시고, 냉각수 레벨과 호스 누유 부위를 긴급 점검받으세요.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 산화된 부동액이 라디에이터와 히터 코어를 내부에서 부식시켜 터뜨립니다. 주행 중 냉각수가 순식간에 유출되면 엔진 온도가 130도 이상 치솟아 ‘엔진 헤드 가스켓 파열 및 실린더 헤드 휨/균열’이 발생합니다. 엔진오일과 냉각수가 섞여 엔진이 녹아붙는 ‘엔진 블로우’로 이어져 400~700만 원의 통엔진 교체 견적을 받게 됩니다.",
      soundOrSmell: "복합",
    };
  } else {
    return {
      summary: "브레이크 패드 마모 인디케이터 경고음",
      matchedPartIndex: 6,
      matchedPartName: "브레이크 패드 / 디스크 마찰재",
      urgency: "위험 (즉시정비)",
      urgencyLevel: "danger",
      highwayRisk: "제동 거리 증가 및 디스크 로터 손상으로 제동 시 핸들 진동 및 제동력 저하가 발생합니다.",
      analysis: "패드 마모 잔량이 20% 이하로 떨어져 인디케이터 클립이 디스크와 마찰하며 고주파 쇳소리를 발생시킵니다.",
      actionGuide: "앞/뒤 패드 잔량을 육안 측정하고 조속히 신품 패드로 교환하세요.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 패드 잔량이 0%가 되면 마찰재 뒤의 두꺼운 쇠 철판 백플레이트가 브레이크 디스크 로터를 칼로 긁듯 파고듭니다. 제동 거리가 2~3배 급증하여 고속도로 정체 꼬리물기에서 앞차 후미를 추돌하게 됩니다. 단순 7~8만 원 패드 교체로 끝날 정비가 디스크 로터 파열 및 캘리퍼 피스톤 손상으로 이어져 50~80만 원 이상의 교체 비용으로 커집니다.",
      soundOrSmell: "소리",
    };
  }
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CarSync server running on http://localhost:${PORT}`);
  });
}

startServer();
