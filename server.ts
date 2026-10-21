import express from "express";
import path from "path";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

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

  // 1. Python vehicle_engine.py 고도화 정밀 진단 1순위 실행 (전 차종 파워트레인 100% 맞춤 강제 분기)
  try {
    const pyResult = await runPythonEngine("diagnose", [], JSON.stringify({ symptom, vehicleInfo }));
    if (pyResult && !pyResult.error && pyResult.summary && pyResult.powertrainAnalysis) {
      return res.json(pyResult);
    }
  } catch (pyErr) {
    console.warn("Python diagnostic engine fallback:", pyErr);
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fallbackResult = generateFallbackDiagnosis(symptom, vehicleInfo);
    return res.json(fallbackResult);
  }

  const prompt = `당신은 대한민국 1위 현장 밀착형 모빌리티 정비 OS '카싱크(CarSync)'의 수석 테크니컬 어드바이저 AI입니다.
당신은 인터넷 백과사전식 뜬구름 잡는 조언을 철저히 배제하며, 10년 이상의 실전 정비 메커니즘과 현장 도메인 지식을 바탕으로 차주의 불안을 해소하고 '리프트 위 바가지 공임'을 시스템적으로 방어하는 역할을 수행합니다.

# Core Principles (절대 규칙)
1. 파워트레인(동력원) 강제 분기:
   반드시 아래 전달된 [운전자 차량 정보]의 바로 그 차종과 파워트레인(가솔린/디젤/건식DCT/습식DCT/하이브리드/전기차 등)에만 100% 집중하여 분석하세요. 절대로 다른 차종(예: 아반떼, 레이 등 상관없는 차종)을 결과에 언급하지 마세요!
   - 전기차(EV): 엔진오일/점화플러그 없음(해당없음), EV 감속기 오일, 저전도 냉각수 반영
   - 디젤: 점화플러그 대신 예열플러그/릴레이, 댐퍼풀리 고무 파열, DPF 전용 C2/C3 오일 반영
   - 7단 건식 DCT: 저속 정체 반클러치 슬립 열화, 더블클러치 마모 반영
   - 8단 습식 DCT: 오일냉각 다판클러치 및 전동식 오일펌프(EOP) 반영
   - 하이브리드(HEV): 회생제동 연계 디스크 녹 부식 및 캘리퍼 슬라이딩 핀 고착, HSG 구동벨트 반영
   - 경차: 1.0 카파 3기통 맥동 진동 및 4단 자동변속기 2단 충격 반영
2. 확정 공임 단정 금지 & 표준 공수(FRT) 제공:
   "수리비 15만 원입니다"와 같은 거짓 견적을 절대 제시하지 않습니다. 대신 자동차정비조합 기준 "표준 작업시간(FRT 공수)"과 "모비스 순정품 부품대 범위"를 객관적 가이드로 제공하여 유저에게 협상 기준점을 쥐여줍니다.
3. 리프트 위 현장 변수 인정 및 사전 안전망(STOP & HOLD) 락인:
   현장 볼트 고착, 하체 부식, 연계 부품 파손 등 '리프트 위 돌발 변수'가 존재함을 당당히 인정합니다. 단, 카싱크 제휴점에서는 [STOP & HOLD 프로토콜]이 적용되어 차주의 모바일 사전 승인 없이는 단 1원의 추가 작업도 임의로 진행할 수 없음을 강력히 고지합니다.
4. 현장 정비사용 3초 브리핑 카드 생성:
   차알못 고객이 정비소에서 기죽지 않도록, 정비사에게 즉시 보여줄 수 있는 [현장 전달용 3초 테크니컬 문진표]를 결과에 반드시 생성합니다.

운전자 차량 정보: ${vehicleInfo ? JSON.stringify(vehicleInfo) : "레이 1.0 가솔린 (4단 자동변속기, 주행거리 85,000km)"}
운전자 문의 증상: "${symptom}"

카싱크의 핵심 8대 부품:
1. 동 겉벨트 세트 (구동벨트 / 텐셔너 베어링)
2. 미션오일 (트랜스미션 / 토크컨버터 / 무단변속기 체인)
3. 로워암 / 부싱 (하체 관절 / 서스펜션 암)
4. 브레이크 오일 (제동 압력 제어 유체 / 베이퍼 록 방지)
5. 점화플러그 / 코일 (가솔린 점화 연소 시스템)
6. 브레이크 패드 / 디스크 마찰재
7. 냉각수 / 부동액 (엔진 냉각계통 / 오버히트 방지)
8. 엔진오일 세트 (엔진 윤활유 / 오일필터 / 에어크리너 3종)

반드시 아래 JSON 포맷으로만 응답하세요:
{
  "summary": "1줄 요약 진단",
  "matchedPartIndex": 1부터 8까지의 숫자,
  "matchedPartName": "매칭된 부품명",
  "urgency": "위험 (즉시정비)" | "주의 (점검필요)",
  "urgencyLevel": "danger" | "warning",
  "highwayRisk": "고속도로 주행 시 위험도 및 2차 사고 발생 가능성 설명 (1~2문장)",
  "analysis": "현장 메커니즘 분석 (증상이 발생하는 기계적 원인을 2줄 이내로 명확히 설명)",
  "powertrainAnalysis": "파워트레인 특이점 (차량 정보에 등록된 바로 그 차종과 변속기 특성을 정확히 반영하여 왜 이 주기에 고장이 나는지, 방치 시 예상 견적 폭탄 앵커링)",
  "actionGuide": "운전자가 지금 취해야 할 행동 가이드",
  "unreplacedRisk": "🚨 이 부품을 안 갈고 방치하면 생기는 치명적 연쇄 파손 및 수백만 원대 견적 폭탄",
  "frtHours": "약 O.O ~ O.O 시간 (탈부착 및 기본 세팅 기준)",
  "partsPriceRange": "약 OO,OOO원 ~ OO,OOO원 선 (모비스 순정품 부품대 예상)",
  "fieldVariables": "차량 하부 부식, 볼트 고착, 관련 부싱류 파손 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
  "stopAndHoldNotice": "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
  "mechanicBriefing": {
    "symptomSummary": "유저 차량 및 입력 증상 1줄 요약",
    "checkPoints": ["점검 포인트 1", "점검 포인트 2"],
    "workRule": "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
  },
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
  try {
    const pyResult = await runPythonEngine("diagnose", [], JSON.stringify({ symptom, vehicleInfo }));
    if (pyResult && !pyResult.error && pyResult.summary) {
      return res.json(pyResult);
    }
  } catch (pyErr) {
    console.warn("Python diagnostic engine fallback:", pyErr);
  }

  console.info("Serving intelligent technical advisor fallback diagnosis for symptom:", symptom);
  return res.json(generateFallbackDiagnosis(symptom, vehicleInfo));
});

function generateFallbackDiagnosis(symptom: string, vehicleInfo?: any) {
  const s = (symptom || "").toLowerCase();
  const vModel = vehicleInfo?.model || "아반떼 CN7";
  const vEngine = vehicleInfo?.engineType || "1.6 가솔린";
  const vTrans = vehicleInfo?.transmission || "IVT 무단변속기";
  const vMileage = vehicleInfo?.mileage || 85000;
  const mileageMan = vMileage >= 10000 ? `${Math.floor(vMileage / 10000)}만km` : `${vMileage}km`;

  const mLower = vModel.toLowerCase();
  const eLower = vEngine.toLowerCase();
  const tLower = vTrans.toLowerCase();

  const isEv = mLower.includes("아이오닉") || mLower.includes("ev") || mLower.includes("electric") || mLower.includes("gv60") || eLower.includes("ev") || eLower.includes("전기");
  const isHev = mLower.includes("하이브리드") || mLower.includes("hev") || mLower.includes("hybrid") || eLower.includes("하이브리드") || eLower.includes("hev");
  const isDiesel = eLower.includes("디젤") || eLower.includes("diesel") || eLower.includes("crdi") || mLower.includes("디젤");
  const isWetDct = tLower.includes("습식") || tLower.includes("8단 dct") || tLower.includes("wdct") || ((eLower.includes("2.5t") || mLower.includes("아반떼 n")) && tLower.includes("dct"));
  const isDryDct = (tLower.includes("7단 dct") || tLower.includes("건식 dct") || (tLower.includes("dct") && !isWetDct)) && !isWetDct;
  const isCvt = tLower.includes("ivt") || tLower.includes("cvt") || tLower.includes("무단");
  const isRayOrMorning = mLower.includes("레이") || mLower.includes("모닝") || mLower.includes("캐스퍼");
  const isLargeSuvOrRear = ["팰리세이드", "카니발", "모하비", "g70", "g80", "g90", "gv70", "gv80", "k9", "스팅어"].some(k => mLower.includes(k));

  // 1. 동 겉벨트 세트
  if (s.includes("1.") || s.includes("1번") || s.includes("겉벨트") || s.includes("구동벨트") || s.includes("텐셔너") || s.includes("벨트") || s.includes("귀뚜라미") || s.includes("끼익") || s.includes("삐걱")) {
    if (isEv) {
      return {
        summary: "EV 보기류 전동 컴프레서 구동계 상태 양호",
        matchedPartIndex: 1,
        matchedPartName: "EV 전동 구동계 (엔진 겉벨트 미적용 차종)",
        urgency: "양호 (점검불필요)",
        urgencyLevel: "safe",
        highwayRisk: "전기차는 전동 구동계로 벨트 단선 위험이 없습니다.",
        analysis: "순수 전기차(EV)는 내연기관 겉벨트 시스템이 없으므로 해당 증상은 공조기 블로워 모터 등을 점검해야 합니다.",
        powertrainAnalysis: `${vModel} [${vEngine}] 순수 전기차는 내연기관 엔진 구동벨트가 없으며, 전동 E-Compressor 및 고전압 워터펌프(EWP)가 직접 구동됩니다.`,
        actionGuide: "순수 전기차는 엔진 겉벨트 정비가 필요하지 않습니다.",
        unreplacedRisk: "해당사항 없음",
        frtHours: "해당 없음",
        partsPriceRange: "해당 없음 (EV 전동 컴프레서 직결 구동)",
        fieldVariables: "특이사항 없음",
        stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
        mechanicBriefing: {
          symptomSummary: `${mileageMan} 주행 후 전기차 전동 컴프레서 가동음 점검`,
          checkPoints: ["고전압 전동 컴프레서 및 냉각수 전동 펌프 작동 상태 점검", "공조기 블로워 팬 이물질 점검"],
          workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
        },
        soundOrSmell: "소리",
      };
    }

    let ptNote = `${vModel} [${vEngine}] 파워트레인은 보조기기 구동 풀리 부하가 집중되어 10만km 도달 시 벨트 크랙 및 텐셔너 유격이 급증하며, 방치 시 발전기/워터펌프 정지로 300만~500만 원 상당의 엔진 헤드 변형으로 번집니다.`;
    let partsPrice = "약 70,000원 ~ 110,000원 선 (모비스 순정 구동벨트+오토텐셔너 베어링 키트)";
    let frt = "약 1.0 ~ 1.5 시간";

    if (isHev) {
      ptNote = `${vModel} [${vEngine}] 파워트레인은 일반 알터네이터 대신 고전압 하이브리드 스타터 제너레이터(HSG) 구동벨트가 적용됩니다. 8~10만km 경과 시 벨트 장력이 이완되면 시동 불가 및 하이브리드 경고등 점등으로 150만~250만 원 상당의 HSG 고장 견적을 받게 됩니다.`;
      partsPrice = "약 75,000원 ~ 110,000원 선 (모비스 순정 HSG 고장력 전용 벨트 + 오토텐셔너 키트)";
      frt = "약 1.0 ~ 1.4 시간";
    } else if (isDiesel) {
      ptNote = `${vModel} [${vEngine}] 디젤 엔진은 고토크 폭발 압력으로 크랭크샤프트 '댐퍼 풀리(Damper Pulley)'의 방진 고무가 10만km 전후로 피로 파열되는 고질병이 있습니다. 댐퍼풀리 파열 시 벨트가 튕겨나가며 조향 상실과 150만~250만 원 상당의 연쇄 파손이 발생합니다.`;
      partsPrice = "약 120,000원 ~ 170,000원 선 (모비스 순정 댐퍼풀리 + 겉벨트 + 오토텐셔너 세트)";
      frt = "약 1.2 ~ 1.6 시간";
    } else if (isRayOrMorning) {
      ptNote = `${vModel}의 1.0 카파 3기통 엔진은 홀수 실린더 상하 맥동 진동이 심하여 구동벨트 장력 이완 및 텐셔너 베어링 마모가 빠르게 진행됩니다. 방치 시 워터펌프 정지로 좁은 엔진룸에서 냉각수가 끓어넘쳐 150만~250만 원 상당의 엔진 헤드 교체로 번집니다.`;
      partsPrice = "약 55,000원 ~ 85,000원 선 (기아 순정 벨트+오토텐셔너 키트)";
      frt = "약 0.9 ~ 1.3 시간";
    }

    return {
      summary: "겉벨트 장력 저하 및 오토텐셔너 베어링 마모 전조증상",
      matchedPartIndex: 1,
      matchedPartName: "동 겉벨트 세트 (구동벨트 / 텐셔너)",
      urgency: "주의 (점검필요)",
      urgencyLevel: "warning",
      highwayRisk: "장시간 고속 주행 시 벨트 이탈로 인한 발전기 동력 상실 및 엔진 오버히트 2차 사고 위험이 있습니다.",
      analysis: "에어컨 컴프레서 가동 부하나 냉간 시동 시 벨트 슬립(미끄러짐) 현상과 텐셔너 내부 스프링 피로로 인해 쇳소리/귀뚜라미 소음이 발생합니다.",
      powertrainAnalysis: ptNote,
      actionGuide: "비 오는 날이나 시동 직후 소음이 커진다면 텐셔너 장력 및 벨트 리브 균열 상태를 즉시 점검받으세요.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 고속 주행 중 벨트가 끊어지며 워터펌프와 발전기가 동시 정지합니다. 1~2분 만에 냉각수가 끓어넘쳐 실린더 헤드가 뒤틀리고 핸들이 돌처럼 굳어 대형 연쇄 추돌을 유발하며, 단순 벨트 교체로 막을 일이 150만~500만 원 상당의 엔진 전손 교체로 이어집니다.",
      frtHours: `${frt} (구동벨트, 오토텐셔너, 아이들러 풀리 탈부착 및 장력 세팅 기준)`,
      partsPriceRange: partsPrice,
      fieldVariables: "차량 하부 언더커버 볼트 고착, 댐퍼 풀리 부식 및 알터네이터 OAP 풀리 고착 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
      stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
      mechanicBriefing: {
        symptomSummary: `${mileageMan} 주행 후 구동벨트 슬립 귀뚜라미 소음 및 텐셔너 유격 점검`,
        checkPoints: [
          "오토텐셔너 인디케이터 장력 마킹 위치 및 아이들 풀리 유격 확인",
          "구동벨트 리브(V홈) 미세 크랙 발생률 및 OAP 풀리 원웨이 클러치 고착 점검"
        ],
        workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
      },
      soundOrSmell: "소리",
    };
  }

  // 2. 미션오일 (트랜스미션 / 감속기)
  if (s.includes("2.") || s.includes("2번") || s.includes("미션오일") || s.includes("미션") || s.includes("트랜스미션") || s.includes("변속") || s.includes("토크컨버터") || s.includes("감속기") || s.includes("오징어") || s.includes("쿵") || s.includes("충격")) {
    if (isEv) {
      return {
        summary: "감속기 오일 열화 및 기어 고회전 마찰 소음 의심",
        matchedPartIndex: 2,
        matchedPartName: "EV 감속기 오일 (감속기 기어 윤활 유체)",
        urgency: "위험 (즉시정비)",
        urgencyLevel: "danger",
        highwayRisk: "고회전 감속 기어 소착으로 고속 주행 중 모터 동력 전달 차단 위험!",
        analysis: "감속 기어오일 점도가 깨져 기어 치면 마찰열과 고온 슬러지가 발생하고 있습니다.",
        powertrainAnalysis: `${vModel} [${vEngine}] 순수 전기차(EV)는 1단 [EV 감속기]가 탑재되어 15,000rpm 초고회전 모터 동력을 감속합니다. 10~12만km 도달 시 오일 점도가 깨지면 기어 마모 소음이 발생하며 방치 시 200만~350만 원 상당의 감속기 앗세이 교체 견적을 받게 됩니다.`,
        actionGuide: "순정 EV 감속기 전용 오일(GL-4 70W)로 전량 드레인 및 주입을 권장합니다.",
        unreplacedRisk: "🚨 감속기 오일을 방치하면: 초고회전 모터 기어가 마모되어 200만~350만 원 상당의 감속기 통교체 견적을 받게 됩니다.",
        frtHours: "약 0.5 ~ 0.8 시간 (드레인 및 레벨링 홀 주입 기준)",
        partsPriceRange: "약 45,000원 ~ 70,000원 선 (순정 EV 감속기 오일 GL-4 70W 1.5~2L 기준)",
        fieldVariables: "드레인 코크 와셔 마모 상태에 따라 현장 공임이 일부 가감될 수 있습니다.",
        stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
        mechanicBriefing: {
          symptomSummary: `${mileageMan} 주행 후 EV 감속기 고주파 기어 회전음 및 감속기 오일 점검`,
          checkPoints: ["감속기 드레인 마그네틱 코크 쇳가루 흡착량 점검", "레벨링 플러그 기준 규정 오일량 확인"],
          workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
        },
        soundOrSmell: "복합",
      };
    }

    let ptNote = `${vModel}의 [${vTrans}] 파워트레인은 8~10만km 주기 도달 시 토크컨버터 록업 클러치 마찰재 슬러지가 밸브바디를 막아 변속 지연이 생기며, 방치 시 200만~350만 원 상당의 미션 통째 오버홀 견적을 받게 됩니다.`;
    let partsPrice = "약 80,000원 ~ 120,000원 선 (현대/기아 순정 ATF 유체 기준)";
    let frt = "약 0.8 ~ 1.2 시간";
    let partName = "미션오일 (트랜스미션 / 토크컨버터)";

    if (isWetDct) {
      ptNote = `${vModel}의 [${vTrans}] 파워트레인은 8단 습식 듀얼 클러치(WDCT)로 오일 냉각 다판 클러치팩과 전동식 오일펌프(EOP)를 사용합니다. 열화된 오일을 방치하면 클러치 슬립과 유압 밸브 고착으로 300만~450만 원 상당의 습식 DCT 통교체 견적을 받게 됩니다.`;
      partsPrice = "약 120,000원 ~ 180,000원 선 (모비스 순정 8단 습식 DCT 전용 오일 4.5~5.5L 기준)";
      frt = "약 1.0 ~ 1.4 시간";
      partName = "미션오일 (8단 습식 DCT 전용 유체)";
    } else if (isDryDct) {
      ptNote = `${vModel}의 [${vTrans}] 파워트레인은 7단 건식 DCT 구조로 저속 정체 반클러치 슬립 열화가 심합니다. 오일 산화 방치 시 액추에이터 고착으로 180만~250만 원 상당의 더블 클러치 교체 견적을 받게 됩니다.`;
      partsPrice = "약 75,000원 ~ 110,000원 선 (모비스 순정 7단 건식 DCT 전용 오일 2L 기준)";
      frt = "약 0.8 ~ 1.1 시간";
      partName = "미션오일 (7단 건식 DCT 전용 기어유)";
    } else if (isCvt) {
      ptNote = `${vModel}의 [${vTrans}] 파워트레인은 스틸 체인 벨트와 풀리 간 마찰 전단력으로 동력을 전달합니다. 8~10만km 도달 시 전단 안정성이 무너지면 풀리 스크래치로 250만~350만 원 상당의 무단변속기 통교체로 번집니다.`;
      partsPrice = "약 90,000원 ~ 130,000원 선 (현대/기아 순정 SP-CVT1 규격 6~8L 기준)";
      frt = "약 0.8 ~ 1.2 시간";
      partName = "미션오일 (스마트스트림 IVT/CVT 무단변속기)";
    } else if (isHev) {
      ptNote = `${vModel} [${vEngine}] 하이브리드는 6단 자동변속기 내부에 모터와 엔진 클러치 유압 블록이 통합된 TMED 구조입니다. 8~10만km 경과 시 오일 산화로 EV-HEV 동력 전환 충격(울컥거림)이 발생하며, 방치 시 250만~400만 원 상당의 하이브리드 미션 통교체 견적을 받게 됩니다.`;
      partsPrice = "약 85,000원 ~ 125,000원 선 (현대/기아 순정 하이브리드 전용 ATF SP-IV-M 기준)";
      frt = "약 0.8 ~ 1.2 시간";
      partName = "미션오일 (하이브리드 TMED 변속기)";
    } else if (isRayOrMorning) {
      ptNote = `${vModel}의 [${vTrans}]는 1.0L 저배기량 엔진 특성상 잦은 2~3단 고부하 변속을 반복합니다. 8~10만km 경과 시 오일 산화 슬러지가 밸브바디를 막아 2단 쿵 충격이 발생하며, 방치 시 120만~180만 원 상당의 4단 미션 통교체로 번집니다.`;
      partsPrice = "약 55,000원 ~ 85,000원 선 (기아 순정 SP-4M/ATF 규격 4~6L 기준)";
      frt = "약 0.7 ~ 1.0 시간";
      partName = "미션오일 (트랜스미션 / 토크컨버터)";
    }

    return {
      summary: "미션오일 열화 및 밸브바디 유압 지연 충격",
      matchedPartIndex: 2,
      matchedPartName: partName,
      urgency: "위험 (즉시정비)",
      urgencyLevel: "danger",
      highwayRisk: "변속 슬립 및 동력 전달 불량으로 고속 합류·추월 구간에서 가속 불능 2차 추돌 사고를 초래할 수 있습니다.",
      analysis: "미션오일 교체 주기를 초과하여 점도가 깨지고 미세 쇳가루 슬러지가 밸브바디 솔레노이드를 막아 변속 충격과 고온 탄 냄새가 발생합니다.",
      powertrainAnalysis: ptNote,
      actionGuide: "차량 규격에 적합한 순정 오일로 전량 교환 및 유온 기준 정밀 레벨링을 권장합니다.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 오일 내 쇳가루 슬러지가 솔레노이드 밸브와 클러치를 완전히 태워먹습니다. 기어가 특정 단수에 영구 고착되는 ‘홀드’ 상태에 빠지거나 150만~450만 원 상당의 미션 통째 오버홀 견적을 받게 됩니다.",
      frtHours: `${frt} (드레인/순환식 교환, 전용 스캐너 유온 보정 및 레벨링 세팅 기준)`,
      partsPriceRange: partsPrice,
      fieldVariables: "차량 하부 드레인 볼트 와셔 마모 상태, 레벨링 플러그 열화 및 오일팬 가스켓 누유 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
      stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
      mechanicBriefing: {
        symptomSummary: `${mileageMan} 주행 후 ${vModel} 변속 충격 및 미션오일 점검`,
        checkPoints: [
          "드레인 코크 자석 쇳가루 퇴적량 및 오일 탄화도(변색 및 탄내) 확인",
          `전용 스캐너 물려 [${vTrans}] 규정 유온 기준 레벨링 및 유압 학습값 리셋 확인`
        ],
        workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
      },
      soundOrSmell: "복합",
    };
  }

  // 3. 로워암 / 부싱
  if (s.includes("3.") || s.includes("3번") || s.includes("로워암") || s.includes("부싱") || s.includes("서스펜션") || s.includes("하체") || s.includes("찌그덕") || s.includes("방지턱") || s.includes("덜컥") || s.includes("볼조인트")) {
    let ptNote = `${vModel}의 전륜구동 하체 집중 구조 특성상 전륜 로워암에 하중의 65% 이상이 집중됩니다. 유격을 방치하면 볼조인트가 너클에서 이탈하여 고속도로 바퀴 빠짐 전복 사고와 200만 원 이상의 연쇄 파손이 발생합니다.`;
    let partsPrice = "약 100,000원 ~ 150,000원 선 (좌/우 모비스 순정 로워암 어셈블리 기준)";
    let frt = "약 1.2 ~ 1.8 시간";

    if (isEv || isLargeSuvOrRear) {
      ptNote = `${vModel}는 공차중량이 2톤을 초과하는 고하중 차체 특성상 노면 요철 통과 시 전륜 로워암 하이드로 부싱과 볼조인트에 일반 세단 대비 1.5배 이상의 충격 하중이 가해집니다. 유격을 방치하면 250만~400만 원 상당의 하체 전손 파손이 발생합니다.`;
      partsPrice = "약 130,000원 ~ 190,000원 선 (좌/우 모비스 순정 고하중 로워암 키트)";
      frt = "약 1.3 ~ 1.8 시간";
    } else if (isRayOrMorning) {
      ptNote = `${vModel}는 전고가 1.7m에 달하는 박스카 구조로 롤링 쏠림 시 전륜 로워암 대부싱에 횡하중이 집중됩니다. 부싱 파열을 방치하면 볼조인트 이탈 바퀴 빠짐으로 150만~250만 원 상당의 하체 전손 파손이 일어납니다.`;
      partsPrice = "약 75,000원 ~ 110,000원 선 (좌/우 모비스 순정 로워암 키트)";
      frt = "약 1.0 ~ 1.5 시간";
    }

    return {
      summary: "하체 로워암 부싱 경화 및 볼조인트 유격 소음",
      matchedPartIndex: 3,
      matchedPartName: "로워암 / 부싱 (서스펜션 암)",
      urgency: "주의 (점검필요)",
      urgencyLevel: "warning",
      highwayRisk: "고속 주행 중 노면 요철 통과 시 차체 롤링과 쏠림이 급증하여 조향 조작 불능을 초래할 수 있습니다.",
      analysis: "고무 부싱이 노후화되어 갈라지거나 오일 봉입형 부싱이 파열되어 방지턱이나 요철 통과 시 차체 찌그덕거림과 둔탁한 충격음이 발생합니다.",
      powertrainAnalysis: ptNote,
      actionGuide: "로워암 어셈블리 1:1 교체 후 공차체결 및 휠얼라인먼트 조정을 권장합니다.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 볼조인트가 너클에서 완전히 이탈(바퀴 빠짐 현상)합니다. 고속 주행 중 바퀴가 꺾여 전복 사고가 발생하며, 200만 원 이상의 연쇄 파손이 발생합니다.",
      frtHours: `${frt} (좌/우 로워암 탈부착, 공차체결 및 휠얼라인먼트 기준)`,
      partsPriceRange: partsPrice,
      fieldVariables: "하부 관통 볼트 부식 고착, 활대링크(스테빌라이저 링크) 고착 및 너클 볼트 나사선 손상 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
      stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
      mechanicBriefing: {
        symptomSummary: `${mileageMan} 주행 후 방지턱 통과 시 하체 찌그덕 소음 및 로워암 유격 점검`,
        checkPoints: [
          "로워암 대부싱 고무 찢어짐 및 크랙 여부 레버링 점검",
          "볼조인트 상하 유격 및 너클 체결 관통 볼트 부식 고착 상태 확인"
        ],
        workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
      },
      soundOrSmell: "소리",
    };
  }

  // 4. 브레이크 오일
  if (s.includes("4.") || s.includes("4번") || s.includes("브레이크 오일") || s.includes("브레이크오일") || s.includes("브레이크액") || s.includes("베이퍼 록") || s.includes("베이퍼록") || s.includes("페달 푹") || s.includes("스펀지") || s.includes("스폰지")) {
    const isElecBrake = isHev || isEv;
    const ptNote = isElecBrake
      ? `${vModel} [${vEngine}] 차량은 통합 전자제동 모듈(IEB / AHB)이 탑재되어 초정밀 솔레노이드 밸브 블록이 극도로 민감합니다. 브레이크액에 수분이 3%를 초과하면 내부 부식으로 200만~300만 원 상당의 IEB 모듈 통교체 견적을 받게 됩니다.`
      : `${vModel}의 ABS/ESC 유압 블록은 수분 산화 슬러지가 유입될 경우 솔레노이드 밸브가 고착되어 단순 오일 교체가 120만~180만 원 상당의 ABS 모듈 앗세이 교체로 번집니다.`;

    return {
      summary: "브레이크 오일 수분 함유로 인한 베이퍼 록 위험",
      matchedPartIndex: 4,
      matchedPartName: "브레이크 오일 (제동 압력 제어 유체)",
      urgency: "위험 (즉시정비)",
      urgencyLevel: "danger",
      highwayRisk: "고속 급제동 시 오일 내 수분이 끓어 페달이 바닥까지 꺼지며 제동력을 완전 상실할 수 있습니다.",
      analysis: "글리콜계 브레이크액의 친수성으로 인해 수분도가 3%를 초과하여 페달 답력이 푹신해지는 스펀지 현상이 진행 중입니다.",
      powertrainAnalysis: ptNote,
      actionGuide: "DOT4 규격 브레이크액으로 맥동식 전량 순환 교환 및 4륜 완벽 에어빼기를 즉시 수행하세요.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 고속도로 연속 급제동 시 수분이 기화되어 ‘베이퍼 록’이 발생하며 제동력이 ‘0’이 됩니다. 내부 부식으로 150만~300만 원 상당의 ABS/IEB 모듈 교체 비용이 발생합니다.",
      frtHours: isElecBrake ? "약 0.8 ~ 1.2 시간 (전용 스캐너 전자유압 블리딩 기준)" : "약 0.6 ~ 0.8 시간 (전용 맥동식 장비 4륜 브리딩 기준)",
      partsPriceRange: isElecBrake ? "약 30,000원 ~ 48,000원 선 (모비스 순정 DOT4 전자제동 전용 2L)" : "약 25,000원 ~ 40,000원 선 (모비스 순정 DOT4 고성능 브레이크액 2L)",
      fieldVariables: "4륜 캘리퍼 에어 블리더 니플 고착 및 고착 해제 시 니플 파손 위험 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
      stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
      mechanicBriefing: {
        symptomSummary: `${mileageMan} 주행 후 제동 시 페달 스펀지 질감 및 브레이크액 수분도 점검`,
        checkPoints: [
          "디지털 수분 테스터기로 리저버 탱크 내 수분 함유율(3% 초과 여부) 측정",
          "4륜 캘리퍼 블리더 니플 고착 상태 확인 및 순환식 완벽 에어빼기 실시"
        ],
        workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
      },
      soundOrSmell: "소리",
    };
  }

  // 5. 점화플러그 / 코일 (가솔린 vs 디젤 예열플러그 vs EV 예외)
  if (s.includes("5.") || s.includes("5번") || s.includes("점화플러그") || s.includes("점화 코일") || s.includes("점화") || s.includes("예열플러그") || s.includes("플러그") || s.includes("코일") || s.includes("이그니션") || s.includes("실화") || s.includes("부조") || s.includes("덜덜") || s.includes("팝콘")) {
    if (isEv) {
      return {
        summary: "순수 전기차(EV) 구동계 점화 부품 미적용 안내",
        matchedPartIndex: 5,
        matchedPartName: "전기차 구동 모터/인버터 (점화플러그 미적용 차종)",
        urgency: "양호 (점검불필요)",
        urgencyLevel: "safe",
        highwayRisk: "순수 전기차는 내연기관 연소 실화 위험이 없습니다.",
        analysis: "순수 전기차(EV)는 고전압 배터리와 구동 모터로 구동되므로 엔진 실린더 내 폭발을 일으키는 점화플러그 및 이그니션 코일 부품이 아예 존재하지 않습니다.",
        powertrainAnalysis: `${vModel} [${vEngine}]는 순수 배터리 전기차로 점화플러그가 없습니다. 덜덜거림 진동이 발생한다면 엔진 실화가 아닌 모터 감속기 마운트 부싱이나 휠 밸런스 점검을 진행해야 합니다.`,
        actionGuide: "점화플러그 점검은 불필요하며 하체 서스펜션 마운트와 휠얼라인먼트를 점검받으세요.",
        unreplacedRisk: "해당사항 없음 (전기차 전용 구동계)",
        frtHours: "해당 없음",
        partsPriceRange: "해당 없음 (점화플러그 미적용 차종)",
        fieldVariables: "특이사항 없음",
        stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
        mechanicBriefing: {
          symptomSummary: `${mileageMan} 주행 후 전기차 차체 진동 발생 시 모터 마운트 점검`,
          checkPoints: ["전동 모터 감속기 마운트 댐퍼 크랙 점검", "드라이브 샤프트 유격 확인"],
          workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
        },
        soundOrSmell: "소리",
      };
    }

    if (isDiesel) {
      return {
        summary: "예열플러그 단선으로 인한 냉간 시동 지연",
        matchedPartIndex: 5,
        matchedPartName: "예열플러그 / 가열플러그 (디젤 압축착화 보조시스템)",
        urgency: "주의 (점검필요)",
        urgencyLevel: "warning",
        highwayRisk: "영하 날씨 시동 불가 및 불완전 연소로 인한 주행 중 출력 저하 위험",
        analysis: "디젤 엔진은 점화플러그 대신 '예열플러그 및 예열 릴레이 모듈'이 장착됩니다. 플러그 단선 시 냉간 시동 지연과 흰 연기, DPF 과다 포집이 발생합니다.",
        powertrainAnalysis: `${vModel} [${vEngine}] 디젤 엔진은 압축 착화 방식입니다. 예열플러그 단선 방치 시 실린더 헤드착화 고착으로 80만~150만 원 상당의 헤드 재생 가공 비용이 발생합니다.`,
        actionGuide: "스캐너 예열 릴레이 단선 고장코드 확인 후 4개 세트를 신품 교체하세요.",
        unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 미연소 경유가 DPF를 막아 150만 원 상당의 DPF 교체 견적으로 번집니다.",
        frtHours: "약 0.8 ~ 1.3 시간 (예열플러그 4개 탈부착 기준)",
        partsPriceRange: "약 80,000원 ~ 130,000원 선 (모비스 순정 예열플러그 4개 세트 기준)",
        fieldVariables: "실린더 헤드 고착 플러그 탈거 시 나사선 파손 위험 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
        stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
        mechanicBriefing: {
          symptomSummary: `${mileageMan} 주행 후 디젤 냉간 시동 지연 및 예열플러그 단선 점검`,
          checkPoints: ["스캐너 예열 릴레이 단선 고장코드 확인", "플러그 저항값(0.6~1.2Ω) 측정"],
          workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
        },
        soundOrSmell: "복합",
      };
    }

    const cylCount = isRayOrMorning ? "3기통" : (["3.0", "3.3", "3.5", "3.8", "v6"].some(k => eLower.includes(k)) ? "6기통" : "4기통");
    const plugCount = isRayOrMorning ? 3 : (cylCount === "6기통" ? 6 : 4);
    const partsPrice = isRayOrMorning ? "약 45,000원 ~ 70,000원 선" : (cylCount === "6기통" ? "약 110,000원 ~ 160,000원 선" : "약 60,000원 ~ 95,000원 선");

    return {
      summary: "점화플러그 간극 마모 및 이그니션 코일 실화(Misfire)",
      matchedPartIndex: 5,
      matchedPartName: "점화플러그 / 코일 (가솔린 연소 시스템)",
      urgency: "주의 (점검필요)",
      urgencyLevel: "warning",
      highwayRisk: "특정 기통 연소 불량으로 출력 저하 및 고속도로 주행 중 가속력 상실 위험이 큽니다.",
      analysis: "플러그 중심 전극 마모로 방전 요구 전압이 상승하여 코일 절연이 파괴되고 불완전 연소 가스 냄새와 엔진 진동이 발생합니다.",
      powertrainAnalysis: `${vModel}의 ${cylCount} 엔진 특성상 1기통만 실화가 나도 차체가 극심하게 떨립니다. 실화 방치 시 미연소 가솔린이 배기로 흘러들어가 100만~180만 원 상당의 삼원 촉매 장치 멜팅으로 이어집니다.`,
      actionGuide: `스캐너 실시간 실화 카운트 확인 후 ${cylCount} 세트 전체를 신품 교환하세요.`,
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 삼원 촉매 변환기 내부를 용융(녹아내림)시켜 단순 플러그 교체로 막을 일이 150만 원 상당의 촉매 교체로 번집니다.",
      frtHours: `약 0.5 ~ 0.8 시간 (점화플러그 ${plugCount}개 및 코일 어셈블리 세트 교환 기준)`,
      partsPriceRange: `${partsPrice} (모비스 순정 플러그 ${plugCount}개 + 이그니션 코일 세트)`,
      fieldVariables: "플러그 나사산 고착, 실린더 헤드 점화 플러그 홀 오일 누유 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
      stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
      mechanicBriefing: {
        symptomSummary: `${mileageMan} 주행 후 엔진 덜덜거림 진동 및 점화 실화(Misfire) 점검`,
        checkPoints: [
          `전용 스캐너로 ${cylCount} 실화 실린더 번호 및 점화 파형 불량 여부 확인`,
          "탈거된 플러그 팁 카본 고착 상태 및 전극 간극 마모도 육안 점검"
        ],
        workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
      },
      soundOrSmell: "복합",
    };
  }

  // 6. 브레이크 패드 / 디스크
  if (s.includes("6.") || s.includes("6번") || s.includes("브레이크 패드") || s.includes("브레이크패드") || s.includes("패드") || s.includes("디스크 로터") || s.includes("라이닝") || s.includes("쇳소리") || s.includes("맷돌") || s.includes("그르륵") || s.includes("밀림")) {
    const isRegenBrake = isHev || isEv;
    let ptNote = `${vModel}의 제동 하중은 전륜에 70% 이상 집중됩니다. 패드 잔량 0%를 방치하면 백플레이트가 로터를 파고들어 6~8만 원대 패드 교체가 50만~80만 원 상당의 디스크 로터 및 캘리퍼 피스톤 파열로 번집니다.`;
    let partsPrice = "약 50,000원 ~ 80,000원 선 (전륜 모비스 순정 패드 키트 세트 기준)";
    let frt = "약 0.6 ~ 0.8 시간";

    if (isRegenBrake) {
      ptNote = `${vModel} [${vEngine}] 차량은 [회생제동] 시스템으로 패드 마모 속도는 느리지만(10만km 이상 사용 가능), 기계식 브레이크 사용 빈도가 낮아 [디스크 로터 녹 부식 및 캘리퍼 슬라이딩 핀 고착]으로 인한 편마모와 쇳소리 끌림이 다발합니다. 방치 시 50만~80만 원 상당의 캘리퍼 통교체 견적을 받게 됩니다.`;
      partsPrice = "약 55,000원 ~ 85,000원 선 (모비스 순정 패드 키트 세트 기준)";
      frt = "약 0.7 ~ 0.9 시간 (전/후륜 패드 교환 및 핀 윤활 세팅)";
    } else if (isRayOrMorning) {
      ptNote = `${vModel}는 소구경 13/14인치 디스크 로터가 적용되어 제동 마찰 면적이 좁고 열 방출이 더뎌 도심 주행 시 패드 마모 속도가 빠릅니다. 백플레이트가 로터를 파고들면 30만~50만 원 상당의 디스크 로터 교체로 번집니다.`;
      partsPrice = "약 45,000원 ~ 65,000원 선 (기아 순정 경차 전륜 패드 키트)";
      frt = "약 0.5 ~ 0.7 시간";
    }

    return {
      summary: isRegenBrake ? "브레이크 패드 마모 인디케이터 경고음 및 로터 부식" : "브레이크 패드 마모 인디케이터 경고음",
      matchedPartIndex: 6,
      matchedPartName: "브레이크 패드 / 디스크 마찰재",
      urgency: "위험 (즉시정비)",
      urgencyLevel: "danger",
      highwayRisk: "마찰재 소진 시 제동거리가 2~3배 급증하여 고속 정체 꼬리물기 추돌 사고를 유발합니다.",
      analysis: "패드 마찰재 잔량이 20% 이하로 떨어졌거나 캘리퍼 슬라이딩 핀 고착으로 마모 인디케이터 쇠클립이 회전하는 디스크와 닿아 고주파 쇳소리를 발생시킵니다.",
      powertrainAnalysis: ptNote,
      actionGuide: "앞/뒤 패드 잔여 두께를 버니어 캘리퍼스로 육안 측정 후 신품 세트로 교체하세요.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 패드 잔량이 0%가 되면 마찰재 뒤의 두꺼운 쇠 철판 백플레이트가 브레이크 디스크 로터를 칼로 긁듯 파고듭니다. 제동 거리가 2~3배 급증하여 고속도로 추돌 사고를 유발하며 수십만 원의 로터 교체 비용으로 커집니다.",
      frtHours: `${frt} (전/후륜 패드 탈부착, 캘리퍼 슬라이딩 핀 윤활 세팅 기준)`,
      partsPriceRange: partsPrice,
      fieldVariables: "캘리퍼 피스톤 리턴 불량, 슬라이딩 핀 고착 및 디스크 로터 턱마모(립) 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
      stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
      mechanicBriefing: {
        symptomSummary: `${mileageMan} 주행 후 제동 시 쇳소리 마찰음 및 패드 마모 잔량 점검`,
        checkPoints: [
          "패드 내/외측 마찰재 잔여 두께(mm) 및 편마모 여부 확인",
          "디스크 로터 턱마모(외경 립) 및 열변형 스크래치 깊이 점검"
        ],
        workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
      },
      soundOrSmell: "소리",
    };
  }

  // 7. 냉각수 / 부동액 (일반 vs HEV 듀얼 vs EV 저전도 냉각수)
  if (s.includes("7.") || s.includes("7번") || s.includes("냉각수") || s.includes("부동액") || s.includes("라디에이터") || s.includes("오버히트") || s.includes("한약") || s.includes("달콤") || s.includes("보글보글") || s.includes("끓는") || s.includes("스팀")) {
    if (isEv) {
      return {
        summary: "EV 저전도 냉각수 열화 및 배터리 냉각 라인 점검",
        matchedPartIndex: 7,
        matchedPartName: "EV 저전도 냉각수 (배터리/모터 인버터)",
        urgency: "위험 (즉시정비)",
        urgencyLevel: "danger",
        highwayRisk: "배터리 온도 제어 불능으로 고속 주행 중 출력 제한 및 2차 추돌 사고 위험!",
        analysis: "전기차 배터리 냉각 회로의 냉각수 수위 저하 및 전도도 상승이 감지됩니다.",
        powertrainAnalysis: `${vModel} [${vEngine}] 순수 전기차(EV)는 고전압 배터리팩 냉각을 위해 [절연/저전도 냉각수(Blue BSC-1)]가 별도 순환합니다. 일반 수돗물이나 일반 부동액 주입 시 절연 파괴로 인한 쇼트 및 2,000만 원 이상의 배터리 팩 전손 교체로 이어지므로 반드시 전용 저전도 냉각수를 주입해야 합니다.`,
        actionGuide: "보조탱크 수위를 확인하고 전용 장비를 갖춘 전기차 전문점에서 전용 저전도 냉각수로 교환하세요.",
        unreplacedRisk: "🚨 일반 부동액을 넣거나 방치하면: 배터리팩 내부 절연 파괴로 고전압 쇼트 화재 및 2,000만 원 이상의 배터리 전손 교체 견적을 받게 됩니다.",
        frtHours: "약 0.8 ~ 1.3 시간 (전용 진공 충진 및 순환식 에어빼기)",
        partsPriceRange: "약 65,000원 ~ 100,000원 선 (현대/기아 순정 저전도 전용 부동액 4~6L)",
        fieldVariables: "배터리 냉각 호스 커넥터 누설 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
        stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
        mechanicBriefing: {
          symptomSummary: `${mileageMan} 주행 후 EV 배터리 전용 저전도 냉각수 레벨 및 누유 점검`,
          checkPoints: ["저전도 전용 냉각수 비중 및 절연 저항값 측정", "배터리 팩 냉각 라인 누설 확인"],
          workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
        },
        soundOrSmell: "복합",
      };
    }

    let ptNote = `${vModel}의 알루미늄 엔진 블록 특성상 산화된 부동액이 내부 워터재킷을 부식시키며, 오버히트 발생 시 실린더 헤드 휨 및 가스켓 블로우로 250만~450만 원 상당의 엔진 전손 교체 견적을 받게 됩니다.`;
    let partsPrice = "약 30,000원 ~ 50,000원 선 (모비스 순정 장수명 부동액 4L + 증류수 기준)";
    let frt = "약 0.7 ~ 1.0 시간";

    if (isHev) {
      ptNote = `${vModel} [${vEngine}] 하이브리드는 엔진 라인과 인버터/HSG 라인이 듀얼 리저버로 분리되어 있습니다. 인버터 냉각수 에어빼기 불량 시 전력 제어 모듈(HPCU) 과열로 250만~400만 원 상당의 인버터 통교체 견적을 받게 됩니다.`;
      partsPrice = "약 45,000원 ~ 70,000원 선 (모비스 순정 친환경 부동액 엔진+인버터 세트)";
      frt = "약 0.8 ~ 1.2 시간";
    } else if (isDiesel) {
      ptNote = `${vModel} [${vEngine}] 디젤 엔진은 [EGR 쿨러] 내부의 미세 균열로 냉각수가 흡기 다기관으로 스며드는 고질병이 있습니다. 방치 시 냉각수 고갈 오버히트는 물론 실린더 수격 및 화재 위험으로 300만~500만 원 상당의 엔진 전손 교체 견적을 받게 됩니다.`;
      partsPrice = "약 35,000원 ~ 55,000원 선 (모비스 순정 장수명 부동액 4L + 증류수 기준)";
      frt = "약 0.8 ~ 1.2 시간";
    }

    return {
      summary: "냉각수 누유 및 라디에이터 오버히트 끓어넘침 현상",
      matchedPartIndex: 7,
      matchedPartName: "냉각수 / 부동액 (라디에이터 냉각계통)",
      urgency: "위험 (즉시정비)",
      urgencyLevel: "danger",
      highwayRisk: "고속 주행 중 냉각수 고갈로 엔진이 멈춰 서며 고속도로 1차로에서 대형 2차 사고 위험이 극도로 큽니다.",
      analysis: "라디에이터 코어 또는 상/하부 호스 미세 크랙으로 에틸렌글리콜이 기화되어 달콤한 한약 냄새가 나고 냉각수가 끓어넘치고 있습니다.",
      powertrainAnalysis: ptNote,
      actionGuide: "본넷이 식을 때까지 절대 캡을 열지 마시고, 보조물통 수위와 호스 클램프 체결 부위를 긴급 점검받으세요.",
      unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 산화된 부동액이 라디에이터와 히터 코어를 내부에서 부식시켜 터뜨립니다. 주행 중 냉각수가 순식간에 유출되면 실린더 헤드 휨 및 균열이 발생하여 수백만 원의 통엔진 교체 견적을 받게 됩니다.",
      frtHours: `${frt} (라디에이터 드레인, 진공 충진 및 에어빼기 세팅 기준)`,
      partsPriceRange: partsPrice,
      fieldVariables: "라디에이터 드레인 코크 부식 고착, 서모스탯 하우징 미세 누유 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
      stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
      mechanicBriefing: {
        symptomSummary: `${mileageMan} 주행 후 달콤한 한약 냄새 및 냉각수 누유 의심 점검`,
        checkPoints: [
          "비중계로 부동액 어는점(-25℃ 이하) 및 산도(pH 산화도) 측정",
          "가압 테스터기로 냉각수 라인 상/하부 호스 미세 누설 부위 가압 점검"
        ],
        workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
      },
      soundOrSmell: "복합",
    };
  }

  // 8. 엔진오일 세트 (기본값)
  if (isEv) {
    return {
      summary: "순수 전기차(EV) 엔진오일 미적용 및 감속기 오일 점검 안내",
      matchedPartIndex: 8,
      matchedPartName: "EV 감속기 오일 / 캐빈 에어필터 (전기차 전용)",
      urgency: "주의 (점검필요)",
      urgencyLevel: "warning",
      highwayRisk: "감속기 기어 마모 시 고속 주행 중 회전 저항 및 동력 전달 차단 위험",
      analysis: "순수 전기차(EV)는 내연기관 엔진이 탑재되지 않아 엔진오일, 오일필터, 흡기 에어크리너 부품이 아예 존재하지 않습니다! 대신 구동 모터 회전력을 바퀴로 감속하는 [EV 감속기 오일]과 실내 쾌적성을 위한 [초미세먼지 에어컨 캐빈 필터] 점검이 진행됩니다.",
      powertrainAnalysis: `${vModel} [${vEngine}] 순수 전기차는 엔진오일 교환이 필요 없으며, 10~12만km 주기로 전용 [EV 감속기 오일(GL-4 70W)] 교환 및 6개월/1만km 주기의 [캐빈 에어필터] 교체가 권장됩니다.`,
      actionGuide: "엔진오일 교체는 건너뛰시고, 감속기 오일 레벨링과 에어컨/히터 향균 캐빈 필터를 교체하세요.",
      unreplacedRisk: "🚨 감속기 오일을 방치하면: 초고회전 모터 기어가 마모되어 200만~350만 원 상당의 감속기 통교체 견적을 받게 됩니다.",
      frtHours: "약 0.4 ~ 0.6 시간 (감속기 오일 드레인 및 주입, 캐빈필터 교체 기준)",
      partsPriceRange: "약 40,000원 ~ 65,000원 선 (순정 EV 감속기 오일 + 순정 PM2.5 캐빈 에어필터)",
      fieldVariables: "하부 언더커버 탈부착 볼트 고착 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
      stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다.",
      mechanicBriefing: {
        symptomSummary: `${mileageMan} 주행 후 EV 감속기 오일량 및 캐빈 에어필터 오염 점검`,
        checkPoints: [
          "감속기 드레인 플러그 마그넷 쇳가루 점검",
          "실내 블로워 하우징 캐빈 필터 오염도 육안 점검"
        ],
        workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
      },
      soundOrSmell: "복합",
    };
  }

  let ptNote = `${vModel} [${vEngine}] 엔진은 주기적인 교체가 엔진 수명의 핵심입니다. 오일 교체를 미루다 유막이 붕괴되면 피스톤 융착으로 250만~450만 원 상당의 엔진 전손 교체 견적을 받게 됩니다.`;
  let partsPrice = "약 45,000원 ~ 65,000원 선 (현대 순정 규격 합성유 4~5L + 순정 오일필터 + 에어크리너 3종)";
  let frt = "약 0.4 ~ 0.6 시간";

  if (isDiesel) {
    ptNote = `${vModel} [${vEngine}] 디젤 엔진은 DPF 보호를 위해 황산회분 함량이 낮은 [Low-SAPS (ACEA C2/C3 규격)] 전용 합성유 사용이 필수입니다. 시내 단거리 주행 시 DPF 재생 지연으로 미연소 경유가 실린더 벽을 타고 엔진오일 팬으로 유입되어 '오일 수위가 늘어나는 경유 희석 현상'이 발생합니다. 방치 시 180만~280만 원 상당의 터보 및 DPF 파손으로 번집니다.`;
    partsPrice = "약 65,000원 ~ 95,000원 선 (모비스 순정 DPF 전용 C2/C3 합성유 6.5~7L + 오일필터 + 에어크리너)";
    frt = "약 0.4 ~ 0.6 시간";
  } else if (isHev) {
    ptNote = `${vModel} [${vEngine}] 하이브리드는 EV모드와 엔진 가동이 빈번히 반복되어 유온 상승이 더디고 수분 응축 슬러지가 발생하기 쉽습니다. 반드시 [0W-16 / 0W-20 API SP 규격] 초저점도 합성유를 사용해야 하며, 방치 시 엔진 클러치 전환 소음과 250만 원 상당의 엔진 헤드 밸브 태핏 마모로 이어집니다.`;
    partsPrice = "약 50,000원 ~ 75,000원 선 (순정 하이브리드 전용 0W-16/0W-20 4~4.5L 3종 세트)";
    frt = "약 0.4 ~ 0.6 시간";
  } else if (isRayOrMorning) {
    ptNote = `${vModel}의 1.0 카파 엔진은 작은 차체 엔진룸 특성상 엔진오일 총 유량(약 2.8~3.1L)이 중형차의 절반 수준에 불과합니다. 적은 오일량으로 고회전 시내 주행을 반복하므로 열화 속도가 1.5배 빠르며, 방치 시 타이밍 체인 장력 이완 및 밸브 태핏 마찰 소음으로 150만~250만 원 상당의 엔진 보링 견적을 받게 됩니다.`;
    partsPrice = "약 35,000원 ~ 55,000원 선 (기아 순정 0W-20/5W-20 3L + 오일필터 + 에어크리너 3종)";
    frt = "약 0.4 ~ 0.5 시간";
  }

  return {
    summary: "엔진오일 유량 부족 및 유압 태핏(HLA) 마찰 소음 의심",
    matchedPartIndex: 8,
    matchedPartName: "엔진오일 세트 (오일+에어크리너+오일필터)",
    urgency: "위험 (즉시정비)",
    urgencyLevel: "danger",
    highwayRisk: "고속 주행 중 오일 유막 붕괴 시 실린더 고착(엔진 블로우)으로 갑작스러운 엔진 정지 및 2차 추돌 사고 위험!",
    analysis: "엔진오일 점도가 깨지거나 유량이 부족하여 유압 태핏과 실린더 내벽 윤활이 원활하지 않아 찰찰거리는 쇠 마찰음과 오일 타는 냄새가 발생합니다.",
    powertrainAnalysis: ptNote,
    actionGuide: "오일 딥스틱 게이지로 잔량과 오일 색상을 즉시 확인하고, 오일필터·에어크리너 세트 교환을 신속히 진행하세요.",
    unreplacedRisk: "🚨 이 부품을 안 갈고 방치하면: 오일이 끈적한 슬러지로 변해 오일 스트레이너를 막고 피스톤과 크랭크샤프트가 고열로 녹아붙는 ‘엔진 붙음’ 현상이 발생합니다. 250만~500만 원 상당의 엔진 전손 교체 견적을 받게 됩니다.",
    frtHours: `${frt} (리프트 잔유 드레인, 오일필터/에어크리너 3종 교체 기준)`,
    partsPriceRange: partsPrice,
    fieldVariables: "하부 언더커버 볼트 고착, 드레인 플러그 나사선 마모 및 오일팬 미세 누유 여부에 따라 현장 공임이 일부 가감될 수 있습니다.",
    stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
    mechanicBriefing: {
      symptomSummary: `${mileageMan} 주행 후 엔진 태핏 마찰 소음 및 오일 유량 부족 점검`,
      checkPoints: [
        "오일 딥스틱 레벨 게이지 확인 및 드레인 오일 슬러지 오염도 점검",
        "오일필터 캡 오링 신품 교체 및 드레인 볼트 규정 토크 체결 확인"
      ],
      workRule: "추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수"
    },
    soundOrSmell: "복합",
  };
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
