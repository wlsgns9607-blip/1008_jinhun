import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Bot,
  Send,
  Volume2,
  AlertCircle,
  Flame,
  Wrench,
  CheckCircle2,
  Sparkles,
  StopCircle,
  RotateCw,
  Gauge,
  Droplet,
  Zap,
  Disc,
  Thermometer,
  Droplets,
  User,
  HelpCircle,
  RefreshCw,
  ZoomIn,
  X,
  ChevronRight,
} from 'lucide-react';
import { CORE_PARTS } from '../data/mockData';
import { CorePartDiagnostic, AiDiagnosisResult, UserProfile } from '../types';
import { playCarSound, stopCurrentSound } from '../utils/audioSynth';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text?: string;
  diagnosis?: AiDiagnosisResult;
  matchedPart?: CorePartDiagnostic;
  timestamp: string;
  imageUrl?: string;
  imageCaption?: string;
}

interface AiDiagnosisScreenProps {
  user: UserProfile;
  onBack: () => void;
  onBookPart: (part: CorePartDiagnostic) => void;
  onGoToShops: () => void;
  onGoToDetailingShops?: () => void;
}

export const AiDiagnosisScreen: React.FC<AiDiagnosisScreenProps> = ({
  user,
  onBack,
  onBookPart,
  onGoToShops,
  onGoToDetailingShops,
}) => {
  const [inputSymptom, setInputSymptom] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedPartModal, setSelectedPartModal] = useState<CorePartDiagnostic | null>(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{ url: string; caption?: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 음성 재생 정지 클린업
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // AI 정밀 분석 리포트 내용 음성(TTS) 읽기/정지 토글
  const handleToggleSpeakDiagnosis = (messageId: string, diagnosis?: AiDiagnosisResult) => {
    if (!diagnosis) return;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('현재 브라우저에서는 음성 합성(TTS) 기능을 지원하지 않습니다.');
      return;
    }

    // 이미 재생 중인 메시지를 다시 클릭하면 정지
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    // 이전 재생 음성 취소
    window.speechSynthesis.cancel();

    const cleanText = (text?: string) =>
      (text || '')
        .replace(/[🚨⚠️🤖✨↳•·]/g, '')
        .replace(/\n+/g, '. ')
        .trim();

    const textToSpeak = [
      cleanText(diagnosis.summary),
      diagnosis.matchedPartName ? `핵심 의심 부품은 ${cleanText(diagnosis.matchedPartName)}입니다.` : '',
      `기전 분석. ${cleanText(diagnosis.analysis)}`,
      `고속도로 위험. ${cleanText(diagnosis.highwayRisk)}`,
      diagnosis.unreplacedRisk ? `미교체 방치 시 위험. ${cleanText(diagnosis.unreplacedRisk)}` : '',
      `조치 가이드. ${cleanText(diagnosis.actionGuide)}`,
    ]
      .filter(Boolean)
      .join(' ');

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.05; // 듣기 편한 자연스러운 속도
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find((v) => v.lang === 'ko-KR' || v.lang.startsWith('ko'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

// ==========================================
// 세차의 정석 (proper_Way_car) 32개 전문 Q&A 지식 엔진
// ==========================================
function getCarWashAnswer(input: string): string | null {
  const raw = input.toLowerCase();
  const clean = raw.replace(/[\s\t\r\n.,?!~^'"`_+\-*/]+/g, "");
  const has = (...keywords: string[]) => keywords.some(k => {
    const normK = k.toLowerCase().replace(/[\s\t\r\n.,?!~^'"`_+\-*/]+/g, "");
    return raw.includes(k.toLowerCase()) || clean.includes(normK);
  });
  const hasAll = (...groups: string[][]) => groups.every(grp => has(...grp));

  // [01] 동선이 꼬이지 않고 빨리하는 세차 법
  if (has("동선", "꼬이지", "선실내", "순서", "시간단축", "빨리끝내", "빨리세차", "빠른세차", "빨리하") || hasAll(["세차", "순서"], ["빠르", "단축"])) {
    return `[세차의 정석 AI 전문가 솔루션] 🚿 동선이 꼬이지 않고 빨리하는 세차 법\n\n가장 효율적인 프로의 동선은 **'선(先) 실내, 후(後) 외판'**입니다. 베이에 들어가기 전 드라잉 존에 차를 대고 엔진열을 식히는 동안 실내 세차를 먼저 마스터하세요.\n\n1. **준비 단계**: 차량의 문을 다 열고 매트를 전부 탈거해 세척기로 보냅니다.\n2. **에어건/청소기 공정 (조수석 라인 시작)**: 에어건 먼지 몰이는 앞에서 뒤로 진행합니다. 먼저 [조수석] 대시보드와 틈새를 에어로 불어 먼지를 뒤로 보낸 뒤 청소기를 돌리고, 바로 뒤로 넘어가 [조수석 뒷자리] 바닥에 모인 먼지를 청소기로 흡입합니다. 끝나면 문을 꼭 닫아주세요.\n3. **운전석 라인 마무리**: 반대편으로 넘어가 [운전석] 기어봉, 송풍구, 안전벨트 틈새를 에어로 불어 뒤로 밀어내고 청소기질을 한 뒤, [운전석 뒷자리]로 넘어가 이물질을 싹 빨아들입니다.\n\n이렇게 실내를 끝내면 엔진룸과 휠 열이 안전하게 식어 있습니다. 이제 베이로 진입해 바로 휠 세정 → 고압수 → 미트질 → 고압수로 이어가면 시간과 동선 낭비를 완벽히 잡을 수 있습니다.`;
  }
  // [02] 먼지 털 때 가장 빠르고 디테일한 방법 (에어건 사용법)
  if (has("에어건", "에어로", "실내먼지", "먼지털", "먼지제거", "송풍구먼지", "도어포켓", "시트먼지") || (has("실내", "먼지") && has("털", "불", "에어", "청소"))) {
    return `[세차의 정석 AI 전문가 솔루션] 💨 에어건으로 실내 먼지 털 때 가장 빠르고 디테일한 방법\n\n**'앞에서 뒤로 몰아가기'**와 **'도어 주변 및 시트 사각지대 공략'**이 핵심입니다. 의자를 처음부터 움직이지 말고 앞좌석 대시보드와 송풍구, 기어봉 틈새부터 에어건을 쏘아 먼지를 뒷좌석 바닥 한곳으로 몰아치세요.\n\n★ 절대 놓쳐선 안 되는 실전 꿀스팟 3곳:\n• **도어 트림 & 도어 포켓**: 창문 스위치 사이 틈새와 문 아래쪽 '도어 포켓' 구석에 에어건을 깊숙이 찔러 숨은 부스러기를 먼저 밖(뒷자리 바닥 방향)으로 불어내야 합니다.\n• **안전벨트 고정 뭉치 틈새**: 앞좌석 작업 후 시트를 앞으로 바짝 제끼고, 안전벨트 고정 뭉치가 있는 좁은 시트 사이 틈새에 에어를 집중적으로 쏘아 청소기가 못 잡는 먼지를 끄집어냅니다.\n• **마무리**: 뒷좌석 바닥 한곳에 모인 이물질들만 청소기로 슥 흡입하면 실내 세차가 완벽히 끝납니다.`;
  }
  // [03] 30분 초고속 세차 방법
  if (has("30분", "삼십분", "초고속", "간단하게", "간단한", "약식세차", "급할때", "바쁠때", "시간없을때", "빠르게하는")) {
    return `[세차의 정석 AI 전문가 솔루션] ⚡ 30분 초고속 세차 코스\n\n바쁠 때는 불필요한 공정을 과감히 빼고 '핵심'만 빠르게 치고 빠져야 합니다.\n\n1. **실내 초속 컷 (5분)**: 드라잉 존에서 에어건으로 앞좌석 먼지를 뒷좌석 바닥으로 빠르게 몰아친 뒤 청소기로 흡입하고 끝냅니다.\n2. **외부 본 세차 (15분)**: 휠 클리너 분사는 건너뜁니다. 바로 고압수 프리워시(휠도 고압수로만 세척) → 스노우폼 분사 → 미트질 → 고압수 마감 순으로 쉬지 않고 빠르게 움직입니다.\n3. **드라잉 및 마감 (10분)**: 드라잉 존으로 이동해 타월로 외관 물기만 빠르게 잡습니다. 물왁스는 선택사항이므로 시간 없으면 바로 출차하셔도 무방합니다.`;
  }
  // [04] 나무 수액 / 송진 제거법
  if (has("수액", "송진", "나무즙", "나무진", "나무수액", "나무송진", "소나무송진", "송진제거", "수액제거", "나무에서떨어진", "끈적한나무")) {
    return `[세차의 정석 AI 전문가 솔루션] 🌲 나무 수액 / 송진 제거법\n\n나무 수액 및 송진은 발견 즉시 지우는 것이 핵심이며, **★최대 일주일 이내에 무조건 제거해야 합니다.★** 일주일 이상 방치하면 수액이 도장면 클리어층 깊숙이 파고들어 아예 배겨버려 광택기를 돌려야 합니다.\n\n• **제거 방법**: 절대 힘으로 벅벅 문지르지 마세요. 알코올(소독용 에탄올)이나 타르/수액 제거제를 막타월에 듬뿍 적신 뒤 수액(송진) 위에 가볍게 얹어두세요. 성분이 녹아 말랑해졌을 때 부드럽게 걷어내듯 닦아내야 흠집 없이 안전하게 지워집니다. 시간이 지나면 도장면 자체가 파고들어 영구 변색되니 무조건 빨리 지우셔야 합니다.`;
  }
  // [05] 새똥(새 배설물) 지우는 법
  if (has("새똥", "새분변", "비둘기똥", "새배설물", "새똥자국", "새똥제거", "새똥지우")) {
    return `[세차의 정석 AI 전문가 솔루션] 🐦 새똥(새 배설물) 안전 제거법\n\n새똥은 안에 모래알과 강한 산성 성분이 있어 마찰을 주어 문지르면 기스가 직빵으로 나며 오래 두면 도장면 칠이 파입니다. 절대로 물티슈나 타월로 문지르지 마세요.\n\n• **정석 처리법**: 버그 크리너를 뿌려 새똥을 완전히 녹여낸 뒤, 고압수로 시원하게 날려버리는 것이 정석입니다. 그 후 스노우폼을 뿌려 미트질로 안전하게 마감해야 도장면에 대미지가 남지 않습니다.`;
  }
  // [06] 벌레제거제로 쓰면 좋은 세차용품
  if (has("벌레제거제", "버그클리너", "버그크리너", "벌레약재") || (has("벌레", "버그") && has("용품", "추천", "어떤거", "제품", "약재", "브랜드"))) {
    return `[세차의 정석 AI 전문가 솔루션] 🧴 벌레제거제 추천 및 사용 요령\n\n대중적으로 시중의 '버그클리너'를 사용하는 것이 가장 안전하고 효과적입니다.\n\n만약 오래 굳어 안 지워지는 게 있다면 PB나 알칼리성(또는 pH 2 계열의 산성) 제품을 쓰시면 더 잘 지워지긴 하지만, 도장면 코팅층에 손상을 줄 수 있기 때문에 웬만하면 과도한 사용을 피하고 순정 버그클리너로 충분히 불려서 제거하는 것을 추천합니다.`;
  }
  // [07] 벌레 사체(버그) 제거하기
  if (has("사체", "벌레", "버그", "벌레자국", "하루살이", "모기자국", "나방", "고속주행벌레")) {
    return `[세차의 정석 AI 전문가 솔루션] 🦟 벌레 사체(버그) 제거법\n\n벌레 사체는 사후 대처가 아니라 '속도'가 생명입니다. **★벌레 사체는 강한 산성이라 되도록 빨리 지우지 않으면 도장면 클리어층에 그대로 배겨버립니다.★** 땡볕 아래 하루이틀만 방치해도 도장면이 파여 영구적인 자국이 남으니 무조건 빨리 지우셔야 합니다.\n\n• **제거 순서**: 단단히 굳은 벌레는 고압수만으로 떨어지지 않습니다. 세차 시작 전 버그 크리너를 범퍼와 사이드미러에 미리 뿌려 단백질을 먼저 녹이세요. 그 후 고압수로 큰 덩어리를 1차로 날려버린 뒤, 반드시 스노우폼을 뿌려 부드러운 미트질로 미세 잔여물과 파고든 기름때까지 완벽히 닦아내야 합니다.`;
  }
  // [08] 가죽 시트 관리법
  if (has("가죽", "시트", "가죽시트", "청바지이염", "시트관리", "시트이염", "가죽클리너")) {
    return `[세차의 정석 AI 전문가 솔루션] 💺 가죽 시트 관리법\n\n청바지 이염이나 유분으로 오염된 가죽은 가죽 전용 클리너를 극세사 타월에 묻혀 살살 닦아내야 때가 빠집니다.\n\n때를 뺀 후에는 가죽 컨디셔너(로션)를 얇게 펴 발라주어야 가죽이 건조해져 갈라지거나 트는 것을 막고 부드러운 뽀송함을 오래 유지할 수 있습니다.`;
  }
  // [09] 가장 효과적인 고압수 각도
  if (hasAll(["고압수", "물뿌", "고압"], ["각도", "방향", "몇도", "비스듬", "기울"])) {
    return `[세차의 정석 AI 전문가 솔루션] 📐 가장 효과적인 고압수 각도\n\n고압수를 도장면에 정면(90도)으로 내리꽂으면 오염물이 튕겨 나가지 않고 오히려 도장면을 때려 미세 흠집(스톤칩 효과)을 낼 수 있습니다.\n\n항상 **45도 정도 비스듬한 각도**로 위에서 아래로 쓸어내리듯 쏴주어야 오염물이 물줄기를 타고 자연스럽게 흘러내려 도장면 손상 없이 깨끗하게 씻겨 나갑니다.`;
  }
  // [10] 가성비 세차용품 추천 4대장
  if (has("가성비세차용품", "가성비용품", "용품추천", "세차용품추천") || (has("가성비", "추천", "필수") && has("용품", "제품", "아이템", "약재", "브랜드"))) {
    return `[세차의 정석 AI 전문가 솔루션] 🏆 가성비 세차용품 추천 4대장\n\n1. **카샴푸 (미트질용)**: **소낙스(SONAX) 세차샴푸 (글로스 샴푸)** - 1L 대용량 만 원 초반대, 풍성한 거품과 높은 윤활력으로 도장면 손상 방지.\n2. **휠 & 타이어 (하체 관리)**: **소낙스 익스트림 휠클리너 또는 더클래스 휠앤타이어** - 분진과 갈변, 철분을 보라색 반응과 함께 한 방에 분해.\n3. **물왁스 (최종 마무리)**: **더클래스 불렛 (Bullet) 타이거 또는 루미너스 LM 그래핀** - 뛰어난 슬릭감과 거울 광택, 잔사(얼룩) 방지 작업성 우수.\n4. **유리세정제 (잔사 방지)**: **인비저블 글래스 (Invisible Glass)** - 틴팅지를 상하게 하는 암모니아가 없으며 허연 얼룩 줄이 생기지 않음.`;
  }
  // [11] 가성비 세차 방법
  if (has("가성비", "벌크", "돈아끼", "절약", "싸게", "저렴하게", "가성비세차")) {
    return `[세차의 정석 AI 전문가 솔루션] 💰 만 원 안팎 가성비 세차 6단계\n\n불필요한 고가 약재 대신 인터넷에서 **벌크용 소형 막타월 세트(30~40장에 12,000원 선)**와 가성비 좋은 카샴푸, 물왁스 하나씩만 구비하세요.\n\n**[선 실내 에어건 → 고압수 프리워시 → 카샴푸 미트질 → 고압수 린스 → 외관 드라잉 → 물왁스 버핑]**\n이 핵심 6단계만 지키면 만 원 안팎으로 번쩍이는 불광을 완벽히 유지할 수 있습니다.`;
  }
  // [12] 엔진룸 청소해도 괜찮나요?
  if (has("엔진룸", "엔진청소", "본넷청소", "엔진룸청소", "엔진룸세척", "본네트청소")) {
    return `[세차의 정석 AI 전문가 솔루션] ⚠️ 엔진룸 청소 주의사항\n\n엔진룸에는 절대로 고압수를 함부로 쏘시면 안 됩니다! 큰일 납니다.\n\n기본 방수 처리가 되어 있긴 하지만, 발전기(알터네이터), ECU, 각종 센서류, 퓨즈박스 등 민감한 전자 부품과 복잡한 전기 배선이 밀집되어 있어 쇼트나 치명적인 전자계통 고장으로 이어질 수 있습니다.\n\n• **셀프 관리법**: 다목적 세정제(APC)를 막타월에 살짝 묻혀 표면 먼지만 조심스럽게 닦아내는 정도로 끝내시는 것이 안전하며, 찌든 때 청소는 전문 디테일링 샵의 '스팀 세차'에 맡기시는 것이 정석입니다.`;
  }
  // [13] 타이어 갈변 해결법
  if (has("갈변", "타이어갈변", "갈색타이어", "타이어갈색", "타이어세척", "타이어때")) {
    return `[세차의 정석 AI 전문가 솔루션] 🛞 타이어 갈변 해결법\n\n타이어가 갈색으로 변한 것은 오존 노화 방지제가 오염물과 결합해 산화된 결과입니다.\n\n1. 갈변/휠 클리너를 타이어 사이드월에 골고루 분사합니다.\n2. 타이어 전용 솔(브러쉬)로 문지르면 갈색 구정물이 쏟아져 나옵니다.\n3. 고압수로 시원하게 씻어내고 물기를 완전히 말립니다.\n4. 타이어 광택제(드레싱)를 어플리케이터 스펀지로 발라주면 신차 출고 때처럼 새까맣고 매트한 흑광이 복원됩니다.`;
  }
  // [14] 매트 세척건조기 사용 팁
  if (has("매트", "세척기", "세척건조기", "발매트", "코일매트", "직물매트", "매트세탁")) {
    return `[세차의 정석 AI 전문가 솔루션] 🧼 매트 세척건조기 올바른 사용법\n\n• **순정 직물 매트만 사용 가능**: 두꺼운 코일 매트나 벌집 매트는 기계를 고장 내므로 절대 투입 금지입니다.\n• **투입 방향**: 글자나 마크가 적힌 **앞면이 아래(바닥)를 향하도록 뒤집어서** 넣어야 기계 롤러 브러쉬가 먼지를 밑으로 쏙 털어냅니다.`;
  }
  // [15] 잔기스 컴파운드로 지워지나요?
  if (has("잔기스", "컴파운드", "스월마크", "스월", "스크래치", "기스제거", "흠집제거", "광택기", "자가광택")) {
    return `[세차의 정석 AI 전문가 솔루션] 🛑 잔기스 컴파운드 자가 시공 경고\n\n절대 함부로 손대지 마세요. 광택 작업이 그렇게 쉬운 게 아닙니다!\n\n초보자가 장비를 사서 직접 밀거나 컴파운드로 강하게 문지르면 100% 도장면 클리어 코팅을 다 태워 먹고 홀로그램 얼룩이 생겨 차를 망칩니다. 손톱이 걸리지 않는 얕은 스크래치는 가벼운 페인트클렌저로 완화하고, 넓게 퍼진 잔기스와 스월마크는 디테일링 전문점에 맡겨 전문 광택기로 교정하는 것이 비용과 시간을 아끼는 길입니다.`;
  }
  // [16] 자동세차 자주 돌리면 망가지나요?
  if (has("자동세차", "기계세차", "주유소세차", "터널세차", "자동세차기")) {
    return `[세차의 정석 AI 전문가 솔루션] ⚠️ 자동세차(기계세차)의 치명적 단점\n\n자동세차 기계의 회전 솔에는 앞 차들이 남기고 간 모래알과 돌가루가 가득 박혀 있습니다. 돌릴 때마다 도장면 클리어층을 모래 맷돌로 갈아버리는 것과 같아 거미줄 같은 스월마크가 빽빽하게 생겨 광택이 죽습니다.\n\n**★특히 검은색/어두운 색 차량은 햇빛 아래서 스월마크가 적나라하게 드러나★** 차가 금방 낡아 보입니다. 차를 아끼신다면 손세차나 노터치 자동세차를 이용하세요.`;
  }
  // [17] 타르 깨끗하게 지우는 법
  if (has("타르", "아스팔트타르", "타르제거", "타르지우", "검은점", "타르제거제")) {
    return `[세차의 정석 AI 전문가 솔루션] 🖤 하부 타르(아스팔트 기름때) 제거법\n\n아스팔트 유분이 튄 타르는 물이나 카샴푸로 절대 안 지워집니다.\n\n외부 세차와 드라잉이 완전히 끝난 **마른 차체**에 타르 제거제를 콕콕 분사해 두고, 30초~1분 뒤 타르가 갈색/검정으로 녹아 흘러내릴 때 부드러운 막타월로 살살 닦아내면 흠집 없이 깨끗하게 제거됩니다.`;
  }
  // [18] 지하주차장 시멘트물(석회물) 떨어졌을 때
  if (has("시멘트물", "시멘트", "낙수", "석회물", "석회수", "지하주차장물", "지하주차장낙수", "천장물떨어")) {
    return `[세차의 정석 AI 전문가 솔루션] 🚨 지하주차장 시멘트물(석회수) 낙수 대처법\n\n시멘트물은 강알칼리성이라 굳으면 클리어층을 부식시킵니다. **★일주일 이상 방치하면 절대 안 지워지니 무조건 일주일 안에 처리하셔야 합니다.★**\n\n• **자가 제거법**: 발견 즉시 식초나 약산성 약재를 화장솜이나 막타월에 듬뿍 적셔 오염 부위에 5~10분 올려두세요. 알칼리 성분이 중화되어 녹아내리면 물로 씻어냅니다.\n• **주의**: 만약 이미 굳어서 녹지 않는다면 억지로 문지르지 마시고 관리사무소에 보상 접수 후 전문 디테일링 샵에 맡기세요.`;
  }
  // [19] 하이그로시 내장재 기스 없이 닦기
  if (has("하이그로시", "하이글로시", "피아노블랙", "실내하이그로시") || (has("내장재", "실내") && has("기스없이", "스크래치", "광택"))) {
    return `[세차의 정석 AI 전문가 솔루션] ✨ 하이그로시(피아노 블랙) 흠집 방지 관리\n\n실내 하이그로시는 스치기만 해도 실기스가 나는 초민감 부위입니다. 절대 마른 타월로 벅벅 닦지 마세요.\n\n올이 아주 부드러운 초극세사 타월에 실내 디테일러(인테리어 퀵디테일러)를 듬뿍 분사하여, 타월 자체의 무게감만으로 스치듯 살살 먼지를 훔쳐내야 영롱한 광택이 유지됩니다.`;
  }
  // [20] 효과적으로 고압수 뿌리는 방법
  if (hasAll(["고압수", "고압세척", "물뿌"], ["효과", "방법", "요령", "팁", "순서", "잘뿌리는", "어떻게"])) {
    return `[세차의 정석 AI 전문가 솔루션] 💦 고압수 제대로 뿌리는 2대 원칙\n\n1. 벌레 사체나 새똥 등은 사전에 버그클리너로 충분히 녹인 후 고압수를 쏩니다.\n2. 고압수는 반드시 **'위에서 아래로(루프 → 유리 → 보닛 → 도어 → 하부)'** 쓸어내리듯 분사해야 오염물과 구정물이 다시 튀지 않고 시원하게 배출됩니다.`;
  }
  // [21] 플라스틱 트림 하얗게 바랬을 때 (백화현상)
  if (has("플라스틱", "트림", "가니쉬", "가니시", "백화현상", "하얗게변한", "하얗게바랜", "무광플라스틱")) {
    return `[세차의 정석 AI 전문가 솔루션] 🛡️ 범퍼·가니쉬 플라스틱 백화현상 복원\n\nSUV의 범퍼나 도어 하단 무광 플라스틱은 자외선을 오래 받으면 유분이 빠져 허옇게 변하는 '백화현상'이 생깁니다.\n\n세차 후 물기를 말리고 **플라스틱 복원제(트림 리스토어러)**를 꼼꼼히 도포해 주면 플라스틱 내부로 실리콘/오일 성분이 침투하여 깊고 매트한 순정 블랙 컬러가 복원됩니다.`;
  }
  // [22] 여름철 세차 주의사항
  if (has("여름", "여름철", "직사광선", "땡볕", "더울때", "폭염", "워터스팟", "햇빛세차")) {
    return `[세차의 정석 AI 전문가 솔루션] ☀️ 여름철 땡볕 세차 절대 금지\n\n절대 직사광선이 내리쬐는 땡볕 아래서 세차하지 마세요!\n\n도장면에 맺힌 물방울이 볼록렌즈 역할을 하여 도장면 클리어층을 태우고 지워지지 않는 '워터스팟(물때)'을 박아버립니다. 카샴푸도 순식간에 말라붙어 얼룩을 남깁니다. 여름에는 해가 진 야간이나 실내 냉방 세차장을 이용하세요.`;
  }
  // [23] 세차 수건 / 타월 세탁법
  if (has("수건", "타월", "타올", "세탁", "빨래", "섬유유연제", "타월빨래", "드라잉타월세탁")) {
    return `[세차의 정석 AI 전문가 솔루션] 🧺 세차 타월 세탁 꿀팁\n\n세차용 극세사 타월에는 **섬유유연제를 절대 쓰면 안 됩니다!**\n\n섬유유연제의 실리콘 피막 성분이 초극세사의 흡수력을 마비시키고 기름막을 만들어 다음 세차 때 끔찍한 잔사를 남깁니다. 중성세제나 울샴푸를 풀어 미지근한 물에 단독 세탁하고 그늘에서 자연 건조하세요.`;
  }
  // [24] 유리막 코팅 차량 관리법
  if (has("유리막", "유리막코팅", "세라믹코팅", "코팅차량", "코팅관리")) {
    return `[세차의 정석 AI 전문가 솔루션] 💎 유리막 코팅 차량 실전 관리법\n\n유리막 코팅의 생명은 약재보다 **'세차 주기'와 '꾸준한 물왁스 관리'**입니다. 아무리 비싼 시공을 했어도 세차를 안 하면 오염물이 코팅을 파괴합니다.\n\n• **실전 관리**: 주 1회 노터치 자동세차나 고압수로 오염물을 가볍게 털어내고, 2~3주마다 유리막 관리제 전용 물왁스(SiO2 성분)를 도포해 주어야 코팅층이 영구적으로 살아납니다.`;
  }
  // [25] 차량 담배 냄새 완벽 제거법
  if (has("담배", "담배냄새", "담배재", "차냄새", "악취", "에어컨냄새", "홀애비냄새", "탈취", "실내냄새")) {
    return `[세차의 정석 AI 전문가 솔루션] 🚭 차 안 담배 냄새 완벽 제거법\n\n내장재 천장과 시트 스펀지에 깊숙이 배긴 니코틴/타르 악취는 개인용 캔 방향제나 연막탄으로는 절대 안 없어집니다.\n\n헛돈 쓰지 마시고, 전문 스팀 세차장에 방문하여 차량 천장, 바닥 플로어 매트, 시트 전체를 고온 스팀과 석션(흡입) 장비로 빨아내는 **전문 실내 딥클리닝**을 받으시는 것이 유일한 해결책입니다.`;
  }
  // [26] 스노우폼 뿌리고 대기하는 시간
  if (has("폼건", "스노우폼", "폼샴푸", "폼대기", "거품대기") || (has("거품", "폼") && has("대기", "시간", "기다", "언제까지", "몇분"))) {
    return `[세차의 정석 AI 전문가 솔루션] ⏳ 스노우폼 거품 대기 골든타임\n\n스노우폼은 도장면의 때를 불려 아래로 끌고 내려오는 프리워시 단계입니다.\n\n거품이 마르기 전, 보통 **3분~5분 사이** 오염물을 머금고 바닥으로 흘러내렸을 때 고압수를 분사해야 합니다. 너무 오래 방치해 거품이 도장면에 말라붙으면 오히려 심각한 얼룩을 유발합니다.`;
  }
  // [27] 하부 세차 꼭 해야 하나요?
  if (has("하부", "하부세차", "하체세차", "바닥세차", "하부세척", "언더세차")) {
    return `[세차의 정석 AI 전문가 솔루션] 🚘 하부 세차의 필요성\n\n겨울철 눈길 주행 후(염화칼슘)나 바닷가 염분 주행 후에는 하부 세차가 필수입니다.\n\n염화칼슘은 차량 하부 프레임, 머플러, 서스펜션 로워암을 순식간에 부식시킵니다. 하부 노즐이 구비된 세차 베이에서 고압수로 바닥면을 주기적으로 때려주어 부식을 원천 차단해야 합니다.`;
  }
  // [28] 물왁스 바를 때 꿀팁 (잔사 방지)
  if (has("물왁스", "물 왁스", "퀵디테일러", "qd", "버핑", "잔사", "왁스바르", "광택제")) {
    return `[세차의 정석 AI 전문가 솔루션] ✨ 물왁스 잔사(얼룩) 방지 2대 꿀팁\n\n1. **무조건 얇고 가볍게**: 물왁스가 좋다고 과도하게 떡칠하듯 뿌리면 타월로 닦을 때 기름 찌꺼기 얼룩(잔사)이 남습니다. 한 판당 1~2번만 가볍게 분사하세요.\n2. **마른 타월로 마무리 버핑**: 약재를 도장면에 펼쳐주는 타월과, 마지막에 광을 내며 잔사를 지워주는 **'뽀송하게 마른 타월'**을 구분해야 합니다. 마지막엔 꼭 깨끗하고 마른 타월로 슥 버핑해 주셔야 번쩍이는 불광이 완성됩니다.`;
  }
  // [29] 초보자 기본 습관
  if (has("초보자", "초보", "입문", "첫세차", "기본습관", "초보습관", "세차처음") || (has("습관", "기본") && has("세차", "주의"))) {
    return `[세차의 정석 AI 전문가 솔루션] 🔰 초보자 세차 필수 2대 습관\n\n비싼 약재보다 무조건 **'차량 열 식히기'**와 **'타월 구분하기'**부터 시작하세요.\n\n엔진과 브레이크 디스크가 뜨거운 상태에서 물을 뿌리면 디스크가 열변형되어 제동 시 핸들이 떨립니다. 또한 흙먼지 닦은 하부 타월로 도장면을 문지르면 차가 걸레가 됩니다. 실내용/외관용/휠용 타월을 반드시 구분하세요.`;
  }
  // [30] 세차장 공용 거품 솔 써도 되나요?
  if (has("공용솔", "공용 솔", "거품솔", "거품 솔", "세차장솔", "세차장 솔", "세차솔") || (has("솔", "브러쉬") && has("공용", "거품", "써도", "사용해도", "세차장"))) {
    return `[세차의 정석 AI 전문가 솔루션] 🚫 세차장 공용 거품 솔 절대 금지\n\n셀프 세차장에 비치된 공용 거품 솔은 절대 사용하시면 안 됩니다!\n\n앞사람이 휠, 타이어, 흙먼지 가득한 트럭 하부를 닦았을지 모르는 '사포'나 다름없습니다. 솔 모 사이에 모래알이 가득 박혀 있어 문지르는 순간 도장면에 깊은 스월마크와 잔기스를 유발합니다. 반드시 개인용 워시 미트를 챙기세요.`;
  }
  // [31] 프리미엄 세차 순서와 방법
  if (has("프리미엄", "디테일링", "풀코스", "정석세차", "돈제대로", "최고급세차", "완벽세차", "순서와방법")) {
    return `[세차의 정석 AI 전문가 솔루션] 👑 프리미엄 디테일링 풀코스 공정\n\n1단계: 실내 및 사각지대 에어/청소기 (엔진룸 틈새 낙엽 제거 → 문 개방 및 매트 탈거 → 앞좌석 컵홀더/시트틈새 에어링 → 조수석부터 청소기 흡입 → 실내 유리 닦기)\n2단계: 외관 약재 반응 & 본 세차 (벌레/새똥에 버그크리너 분사 → 수입차 휠클리너 분사 → 위에서 아래로 1차 고압수 → 스노우폼 전체 도포 → 양모 미트로 부드러운 미트질)\n3단계: 틈새 물기 제거 & 코팅 마감 (그릴/엠블럼/사이드미러 틈새 에어 배출 → 드라잉 타월 물기 흡수 → 프리미엄 물왁스로 마른 타월과 함께 정밀 버핑).`;
  }
  // [32] 유막제거 / 유리발수 하면 좋은 점
  if (has("유막", "유막제거", "유리발수", "발수코팅", "유막제거좋은점", "유리발수좋은점", "우막제거")) {
    return `[세차의 정석 AI 전문가 솔루션] 🌧️ 유막제거 & 유리발수, 왜 전문가에게 맡겨야 할까요?\n\n유막은 공기 중 배기가스, 도로 타르, 찌든 기름때가 유리에 고착되어 산화된 막으로, 일반 카샴푸나 손세차로는 절대 완벽히 벗겨지지 않습니다.\n\n⚠️ **셀프 작업 시 흔한 위험 요인**:\n• 손으로 불균일하게 힘을 주어 문지를 경우 유리 표면에 미세 스크래치가 발생할 수 있습니다.\n• 유막이 1%라도 덜 닦인 상태에서 발수제를 올리면 얼룩덜룩한 잔사가 남아 야간 운전 시 빛 번짐이 오히려 악화됩니다.\n\n★ **디테일링 전문가 시공을 강력 추천하는 3가지 이유**:\n1. **전용 샌더기 & 산화세륨 무흠집 완전 박멸**: 전문가용 듀얼 샌더기로 유리 손상 없이 100% 완전 친수 상태로 원상 복원합니다.\n2. **초발수 비딩 & 1년 지속력**: 유막이 0%인 순수 유리면에 전문가용 고경도 불소 발수코팅을 경화시켜, 시속 60km 이상 주행 시 와이퍼 없이도 물방울이 튕겨 날아가는 쾌적한 시야가 완성됩니다.\n3. **와이퍼 소음·떨림 완전 종결**: 유리 표면 마찰 저항이 사라져 와이퍼 덜컹거림과 삑삑거리는 소음이 완벽히 사라집니다.\n\n안전한 빗길 시야 확보를 위해, 유막제거와 유리발수는 숙련된 디테일링 전문가에게 맡기시는 것을 강력히 추천드립니다!`;
  }

  // 세차 관련 일반 키워드가 포함되었지만 세부 매칭이 안 된 경우 (Fallback 가이드)
  if (has("세차", "디테일링", "물세차", "손세차", "셀프세차", "광택", "코팅", "세차팁", "세차방법", "세차장")) {
    return `[세차의 정석 AI 전문가 솔루션] 🚗 세차의 정석 핵심 추천 질문 가이드\n\n현재 카싱크 × 세차의 정석 통합 시스템이 가동 중입니다. 아래와 같은 핵심 질문을 입력해 보세요:\n\n1. '동선이 꼬이지 않고 빨리할 수 있는 세차 방법'\n2. '에어건으로 실내 먼지 디테일하게 털기'\n3. '30분 초고속 세차 방법'\n4. '나무 수액 / 송진 안전 제거법'\n5. '새똥 제거 요령'\n6. '가성비 세차용품 추천 4대장'\n7. '타이어 갈변 해결법'\n8. '유막제거와 유리발수를 하면 좋은 점'\n9. '물왁스 잔사 안 남기는 꿀팁'\n10. '프리미엄 세차 순서와 방법'\n\n원하시는 세차 고민 키워드를 편하게 말씀해 주세요!`;
  }

  return null;
}

  // Initial Chatbot Conversation with 7 Core Parts Guide embedded into the chat flow!
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `반갑습니다, ${user.name || '운전자'}님! 🤖\n**카싱크 × 세차의 정석** 통합 AI 수석 테크니컬 어드바이저입니다.\n\n차량 **정비 이상 소음·진동·냄새 진단(핵심 8대 부품)**부터 **32개 분야별 디테일링 세차 비법(세차 동선, 송진/새똥 제거, 유막제거, 물왁스 잔사 방지 등)**까지 원스톱으로 해결해 드립니다.\n\n궁금하신 차량 증상이나 세차 팁을 자유롭게 질문해 보세요!`,
      timestamp: '지금',
    },
  ]);

  const quickSymptoms = [
    '에어컨 켤 때 삐걱 소리',
    '물왁스 잔사 안 남기는 법',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiLoading]);

  // 클라이언트 로컬 지능형 폴백 진단 생성 함수
  const createFallbackDiagnosis = (symptomText: string): { diagnosis: AiDiagnosisResult; matched?: CorePartDiagnostic } => {
    const s = symptomText.toLowerCase();
    let targetPart = CORE_PARTS[7]; // 기본 8번 엔진오일

    if (s.includes('1.') || s.includes('1번') || s.includes('겉벨트') || s.includes('구동벨트') || s.includes('텐셔너') || s.includes('벨트') || s.includes('귀뚜라미')) {
      targetPart = CORE_PARTS.find((p) => p.id === 1) || CORE_PARTS[0];
    } else if (s.includes('2.') || s.includes('2번') || s.includes('미션오일') || s.includes('미션') || s.includes('트랜스미션') || s.includes('변속') || s.includes('토크컨버터') || s.includes('오징어')) {
      targetPart = CORE_PARTS.find((p) => p.id === 2) || CORE_PARTS[1];
    } else if (s.includes('3.') || s.includes('3번') || s.includes('로워암') || s.includes('부싱') || s.includes('하체') || s.includes('방지턱') || s.includes('찌그덕')) {
      targetPart = CORE_PARTS.find((p) => p.id === 3) || CORE_PARTS[2];
    } else if (s.includes('4.') || s.includes('4번') || s.includes('브레이크 오일') || s.includes('브레이크오일') || s.includes('브레이크액') || s.includes('베이퍼 록') || s.includes('페달 푹') || s.includes('스펀지')) {
      targetPart = CORE_PARTS.find((p) => p.id === 4) || CORE_PARTS[3];
    } else if (s.includes('5.') || s.includes('5번') || s.includes('점화플러그') || s.includes('점화') || s.includes('플러그') || s.includes('코일') || s.includes('실화') || s.includes('부조')) {
      targetPart = CORE_PARTS.find((p) => p.id === 5) || CORE_PARTS[4];
    } else if (s.includes('6.') || s.includes('6번') || s.includes('브레이크 패드') || s.includes('브레이크패드') || s.includes('패드') || s.includes('라이닝') || s.includes('쇳소리')) {
      targetPart = CORE_PARTS.find((p) => p.id === 6) || CORE_PARTS[5];
    } else if (s.includes('7.') || s.includes('7번') || s.includes('냉각수') || s.includes('부동액') || s.includes('라디에이터') || s.includes('오버히트') || s.includes('한약') || s.includes('달콤')) {
      targetPart = CORE_PARTS.find((p) => p.id === 7) || CORE_PARTS[6];
    } else if (s.includes('8.') || s.includes('8번') || s.includes('엔진오일') || s.includes('오일') || s.includes('태핏')) {
      targetPart = CORE_PARTS.find((p) => p.id === 8) || CORE_PARTS[7];
    }

    const diagnosis: AiDiagnosisResult = {
      summary: `${targetPart.name.replace(/^\d+\.\s*/, '')} 이상 마모 및 정밀 점검 권고`,
      matchedPartIndex: targetPart.id,
      matchedPartName: targetPart.name,
      urgency: targetPart.highwayRiskLevel === 'critical' ? '위험 (즉시정비)' : '주의 (점검필요)',
      urgencyLevel: targetPart.highwayRiskLevel === 'critical' ? 'danger' : 'warning',
      highwayRisk: targetPart.highwayRiskText || '고속 주행 중 연쇄 부품 손상으로 인한 제동 불능 또는 엔진 정지 위험이 있습니다.',
      analysis: targetPart.soundDescriptions?.[0] || `${targetPart.subName}의 교체 주기가 경과하여 기계적 마찰 피로가 한계에 도달했습니다.`,
      powertrainAnalysis: ((user.vehicle.model || '').includes('레이') || (user.vehicle.model || '').includes('모닝')) && targetPart.id === 2
        ? `${user.vehicle.model}의 [${user.vehicle.transmission || '4단 자동변속기'}]는 1.0L 저배기량 엔진 특성상 잦은 킥다운과 2~3단 고부하 변속을 반복하여 8~10만km 경과 시 오일 산화로 밸브바디 솔레노이드 오리피스가 막히며 변속 쿵 충격이 발생합니다. 방치 시 다판 클러치 디스크 소착으로 단순 오일 교체(10만 원대)가 120만~180만 원 상당의 4단 재생/앗세이 미션 통교체로 번집니다.`
        : `${user.vehicle.model || '해당 차종'} [${user.vehicle.transmission || '구동계'}] 특성상 10만km 주기 도달 시 열화가 집중되며, 방치 시 연쇄 부품 파손으로 단순 교체 대비 5~10배 이상의 수리비 폭탄이 발생합니다.`,
      actionGuide: '신뢰할 수 있는 카싱크 제휴 정비소에서 표준 작업시간(FRT)을 기준으로 실차 점검을 받으세요.',
      unreplacedRisk: targetPart.unreplacedConsequence || '🚨 이 부품을 안 갈고 방치하면: 연쇄적인 주요 동력·제동 계통 파손으로 수백만 원대의 수리비 폭탄과 고속도로 2차 대형 추돌 사고를 초래합니다.',
      frtHours: ((user.vehicle.model || '').includes('레이') || (user.vehicle.model || '').includes('모닝')) && targetPart.id === 2
        ? '약 0.7 ~ 1.0 시간'
        : targetPart.id === 1 ? '약 1.0 ~ 1.5 시간' : targetPart.id === 2 ? '약 0.8 ~ 1.2 시간' : targetPart.id === 3 ? '약 1.2 ~ 1.8 시간' : targetPart.id === 4 ? '약 0.6 ~ 0.8 시간' : targetPart.id === 5 ? '약 0.5 ~ 0.8 시간' : targetPart.id === 6 ? '약 0.6 ~ 0.9 시간' : targetPart.id === 7 ? '약 0.8 ~ 1.2 시간' : '약 0.4 ~ 0.6 시간',
      partsPriceRange: ((user.vehicle.model || '').includes('레이') || (user.vehicle.model || '').includes('모닝')) && targetPart.id === 2
        ? '약 55,000원 ~ 85,000원 선 (기아 순정 SP-4M 규격 기준)'
        : targetPart.id === 1 ? '약 70,000원 ~ 110,000원 선' : targetPart.id === 2 ? '약 90,000원 ~ 130,000원 선' : targetPart.id === 3 ? '약 100,000원 ~ 150,000원 선' : targetPart.id === 4 ? '약 25,000원 ~ 40,000원 선' : targetPart.id === 5 ? '약 60,000원 ~ 95,000원 선' : targetPart.id === 6 ? '약 65,000원 ~ 95,000원 선' : targetPart.id === 7 ? '약 35,000원 ~ 55,000원 선' : '약 45,000원 ~ 65,000원 선',
      fieldVariables: '차량 하부 부식, 볼트 고착, 관련 부싱류 파손 여부에 따라 현장 공임이 일부 가감될 수 있습니다.',
      stopAndHoldNotice: "본 진단 건은 카싱크 제휴 정비소 입고 시 'STOP & HOLD 시스템'이 자동 적용됩니다. 리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, 정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.",
      mechanicBriefing: {
        symptomSummary: `${user.vehicle.model || '차량'} 이상 증상 점검 요청 (${symptomText.substring(0, 30)})`,
        checkPoints: [
          `${targetPart.subName || targetPart.name} 1차 유격 및 마모도 육안 점검`,
          `전용 스캐너 물려 [${user.vehicle.transmission || '변속기'}] 규정 유온 기준 점검`
        ],
        workRule: '추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수'
      },
      soundOrSmell: targetPart.symptomType === 'smell' ? '냄새' : targetPart.symptomType === 'both' ? '복합' : '소리',
    };

    return { diagnosis, matched: targetPart };
  };

  const handleDiagnose = async (symptomText: string) => {
    if (!symptomText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: symptomText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputSymptom('');
    setIsAiLoading(true);

    // 0. 세차의 정석 (proper_Way_car) 32개 Q&A 1순위 즉각 매칭
    const carWashAnswer = getCarWashAnswer(symptomText);
    if (carWashAnswer) {
      setTimeout(() => {
        const isGlassRepellent =
          carWashAnswer.includes("유막제거 & 유리발수 시공의 4대 효과") ||
          symptomText.includes("유리발수") ||
          symptomText.includes("유막") ||
          symptomText.includes("발수코팅");

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: carWashAnswer,
          imageUrl: isGlassRepellent ? '/assets/glass_repellent_demo.jpg' : undefined,
          imageCaption: isGlassRepellent ? '🌧️ [실제 빗길 시공 전후 비교] 좌측: 심한 유막 번짐 vs 우측: 유리발수 코팅 후 선명한 시야 & 비딩' : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsAiLoading(false);
        setTimeout(scrollToBottom, 50);
      }, 400);
      return;
    }

    try {
      const res = await fetch('/api/ai-diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom: symptomText,
          vehicleInfo: user.vehicle,
        }),
      });

      if (!res.ok) {
        throw new Error('진단 요청 실패');
      }

      const data: any = await res.json();

      // 서버에서 세차 답변이 반환된 경우
      if (data.isCarWash && data.text) {
        const isGlassRepellent =
          data.text.includes("유막제거 & 유리발수 시공의 4대 효과") ||
          symptomText.includes("유리발수") ||
          symptomText.includes("유막") ||
          symptomText.includes("발수코팅");

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.text,
          imageUrl: data.imageUrl || (isGlassRepellent ? '/assets/glass_repellent_demo.jpg' : undefined),
          imageCaption: data.imageCaption || (isGlassRepellent ? '🌧️ [실제 빗길 시공 전후 비교] 좌측: 심한 유막 번짐 vs 우측: 유리발수 코팅 후 선명한 시야 & 비딩' : undefined),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        return;
      }

      const matched = CORE_PARTS.find((p) => p.id === data.matchedPartIndex);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        diagnosis: data,
        matchedPart: matched,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('AI 진단 네트워크 일시 지연, 정밀 안전 진단 시스템으로 즉시 응답:', err);
      // Smart Fallback based on specific symptom
      const { diagnosis, matched } = createFallbackDiagnosis(symptomText);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        diagnosis,
        matchedPart: matched,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsAiLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  const handlePlaySound = (soundKey?: string) => {
    if (!soundKey) return;
    if (playingAudioKey === soundKey) {
      stopCurrentSound();
      setPlayingAudioKey(null);
    } else {
      setPlayingAudioKey(soundKey);
      playCarSound(soundKey, () => {
        setPlayingAudioKey(null);
      });
    }
  };

  const getPartIcon = (iconName: string) => {
    switch (iconName) {
      case 'RotateCw':
        return <RotateCw className="w-5 h-5 text-blue-600" />;
      case 'Gauge':
        return <Gauge className="w-5 h-5 text-indigo-600" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'Droplet':
        return <Droplet className="w-5 h-5 text-rose-600" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'Disc':
        return <Disc className="w-5 h-5 text-red-600" />;
      case 'Thermometer':
        return <Thermometer className="w-5 h-5 text-cyan-600" />;
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-amber-600" />;
      default:
        return <Wrench className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-24 selection:bg-blue-100 flex flex-col">
      {/* Top Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 sticky top-0 z-20 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              id="ai-diagnosis-back-button"
              onClick={onBack}
              className="p-1 -ml-1 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-blue-600 leading-tight flex items-center gap-1">
                <span>실시간 진단 챗봇</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="text-base font-black text-slate-900 leading-tight">
                ai 카싱크
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: `msg-${Date.now()}`,
                    sender: 'ai',
                    text: `대화가 초기화되었습니다. 이상 증상(소음, 냄새, 진동 등)을 다시 말씀해 주세요! 🤖`,
                    timestamp: '지금',
                  },
                ]);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-all"
              title="대화 초기화"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">새 대화</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 flex flex-col justify-between">
        {/* 대표 고장 소리 예시 2선 (클릭 시 즉시 진단) */}
        <div className="mb-4 bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span className="font-extrabold text-xs text-slate-900">
                대표 고장 소음 예시 (원터치 진단)
              </span>
            </div>
            <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
              클릭 시 질문 전송
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 소리 예시 1: 겉벨트 귀뚜라미 소음 */}
            <button
              type="button"
              onClick={() => handleDiagnose("시동 걸 때 본넷에서 끼익 찌르르 귀뚜라미 쇳소리가 납니다.")}
              className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col items-start gap-1 text-left cursor-pointer group shadow-2xs active:scale-[0.99]"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[12px] font-extrabold text-slate-900 group-hover:text-blue-700">
                  “끼익- 귀뚜라미 쇳소리”
                </span>
                <span className="text-[10px] text-blue-600 font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">
                  진단받기
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                1. 동 겉벨트 · 오토텐셔너 마모 슬립음
              </p>
            </button>

            {/* 소리 예시 2: 브레이크 패드 마찰 쇳소리 */}
            <button
              type="button"
              onClick={() => handleDiagnose("브레이크 밟을 때 끼이익 긁히는 쇳소리가 납니다.")}
              className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col items-start gap-1 text-left cursor-pointer group shadow-2xs active:scale-[0.99]"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[12px] font-extrabold text-slate-900 group-hover:text-blue-700">
                  “끼이익- 브레이크 쇳소리”
                </span>
                <span className="text-[10px] text-blue-600 font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">
                  진단받기
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                6. 브레이크 패드 마모 인디케이터
              </p>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="space-y-4 mb-4">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isAi ? '' : 'flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isAi ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-white shadow-sm'
                  }`}
                >
                  {isAi ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                  {/* Text Message */}
                  {msg.text && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-line relative ${
                        isAi
                          ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm'
                          : 'bg-blue-600 text-white rounded-tr-sm font-medium'
                      }`}
                    >
                      {msg.text}
                      {/* Image Attachment (유리발수 전후 비교 사진 등) */}
                      {msg.imageUrl && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/90 shadow-sm bg-slate-950 group">
                          <div
                            className="relative aspect-video w-full overflow-hidden cursor-pointer"
                            onClick={() => setSelectedLightboxImage({ url: msg.imageUrl!, caption: msg.imageCaption })}
                          >
                            <img
                              src={msg.imageUrl}
                              alt={msg.imageCaption || '시공 비교 이미지'}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                              loading="lazy"
                            />
                            {/* Before / After Badges */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-black text-rose-300 border border-rose-400/30">
                              ◀ BEFORE (유막/친수)
                            </div>
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-black text-cyan-300 border border-cyan-400/30">
                              AFTER (발수코팅) ▶
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-white/90 flex items-center gap-1 opacity-90 group-hover:opacity-100">
                              <ZoomIn className="w-3 h-3 text-cyan-300" />
                              <span>클릭하여 확대</span>
                            </div>
                          </div>
                          {msg.imageCaption && (
                            <div className="px-3 py-2 bg-slate-900 text-slate-200 text-[11px] font-semibold border-t border-slate-800 flex items-center justify-between">
                              <span>{msg.imageCaption}</span>
                              <span className="text-[10px] text-cyan-400 font-bold shrink-0 ml-2">실제 야간 빗길 시야</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Chat Bot Message Footer */}
                      {isAi && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            msg.text.includes('세차의 정석')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {msg.text.includes('세차의 정석') ? '🧼 세차의 정석 공인 솔루션' : '🤖 카싱크 정비 어드바이저'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleSpeakDiagnosis(msg.id, { summary: msg.text ? msg.text.substring(0, 60) : '', analysis: msg.text || '' } as any)}
                            className="text-[11px] text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            title="음성으로 듣기"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>음성 듣기</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Structured Diagnosis Card in Chat */}
                  {msg.diagnosis && (
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-lg border border-slate-700 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold text-amber-300">
                              AI 정밀 분석 리포트
                            </span>
                          </div>

                          {/* 스피커 음성 듣기 버튼 */}
                          <button
                            type="button"
                            onClick={() => handleToggleSpeakDiagnosis(msg.id, msg.diagnosis)}
                            className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                              speakingMessageId === msg.id
                                ? 'bg-amber-400 text-slate-950 animate-pulse'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600/80 hover:border-amber-400/50'
                            }`}
                            title={speakingMessageId === msg.id ? '음성 읽기 정지' : '리포트 내용 음성으로 듣기'}
                          >
                            <Volume2 className={`w-3.5 h-3.5 ${speakingMessageId === msg.id ? 'animate-bounce' : ''}`} />
                            <span className="text-[11px]">
                              {speakingMessageId === msg.id ? '음성 정지' : '음성 듣기'}
                            </span>
                          </button>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            msg.diagnosis.urgencyLevel === 'danger'
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {msg.diagnosis.urgency}
                        </span>
                      </div>

                      {/* Summary */}
                      <div>
                        <h4 className="text-sm font-black text-white">
                          {msg.diagnosis.summary}
                        </h4>
                        {msg.diagnosis.matchedPartName && (
                          <p className="text-xs text-blue-300 mt-0.5 font-medium">
                            핵심 의심 부품: {msg.diagnosis.matchedPartName}
                          </p>
                        )}
                      </div>

                      {/* Section 1: 🚗 [차량명 / 파워트레인 매핑 진단] */}
                      <div className="bg-slate-800/90 rounded-xl p-3.5 text-xs space-y-2 border border-slate-700/70">
                        <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[12px] border-b border-slate-700/80 pb-1.5">
                          <span>🚗</span>
                          <span>[{user.vehicle?.model || '차량'} / {user.vehicle?.transmission || '파워트레인'} 매핑 진단]</span>
                        </div>
                        <div className="text-slate-200">
                          <span className="text-blue-300 font-bold">• 의심 부품군: </span>
                          <span className="font-semibold text-white">{msg.diagnosis.matchedPartName}</span>
                        </div>
                        <div className="text-slate-200">
                          <span className="text-slate-400 font-bold">• 현장 메커니즘 분석: </span>
                          {msg.diagnosis.analysis}
                        </div>
                        {msg.diagnosis.powertrainAnalysis && (
                          <div className="text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                            <span className="text-amber-400 font-bold">• 파워트레인 특이점: </span>
                            {msg.diagnosis.powertrainAnalysis}
                          </div>
                        )}
                        <div className="text-red-300">
                          <span className="font-bold text-red-400">• ⚠️ 고속도로 위험: </span>
                          {msg.diagnosis.highwayRisk}
                        </div>
                        
                        {/* 이 부품을 안 갈면 생기는 일 */}
                        <div className="bg-red-950/70 border border-red-500/50 rounded-lg p-2.5 text-red-200">
                          <div className="font-extrabold text-red-300 flex items-center gap-1 mb-1">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>🚨 이 부품을 안 갈고 방치하면 어떻게 되나요?</span>
                          </div>
                          <p className="leading-relaxed text-[11px] sm:text-xs">
                            {msg.diagnosis.unreplacedRisk ||
                              msg.matchedPart?.unreplacedConsequence ||
                              '부품 파손 시 연쇄 부품 손상(엔진·미션·브레이크 계통)으로 이어져 주행 중 급정차 및 수백만 원대의 수리비 폭탄과 2차 추돌 사고를 초래합니다.'}
                          </p>
                        </div>
                      </div>

                      {/* Section 2: ⏱️ [객관적 정비 기준 가이드] */}
                      <div className="bg-slate-800/90 rounded-xl p-3.5 text-xs space-y-2 border border-slate-700/70">
                        <div className="flex items-center gap-1.5 text-emerald-300 font-extrabold text-[12px] border-b border-slate-700/80 pb-1.5">
                          <span>⏱️</span>
                          <span>[객관적 정비 기준 가이드]</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200">
                          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                            <span className="text-emerald-400 font-bold block mb-0.5">정비조합 표준 작업시간(FRT)</span>
                            <span className="text-white font-extrabold text-[13px]">{msg.diagnosis.frtHours || '약 0.8 ~ 1.2 시간'}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">(탈부착 및 기본 세팅 기준)</span>
                          </div>
                          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50">
                            <span className="text-emerald-400 font-bold block mb-0.5">모비스 순정품 부품대 (예상)</span>
                            <span className="text-white font-extrabold text-[13px]">{msg.diagnosis.partsPriceRange || '약 80,000원 ~ 120,000원 선'}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">(표준 순정품 단가 기준)</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-lg">
                          <span className="font-semibold text-slate-300">• 현장 변수 안내: </span>
                          {msg.diagnosis.fieldVariables || '차량 하부 부식, 볼트 고착, 관련 부싱류 파손 여부에 따라 현장 공임이 일부 가감될 수 있습니다.'}
                        </div>
                      </div>

                      {/* Section 3: 🛡️ [카싱크 STOP & HOLD 현장 안전망] */}
                      <div className="bg-blue-950/40 border border-blue-500/40 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-blue-300 font-extrabold text-[12px]">
                          <span>🛡️</span>
                          <span>[카싱크 STOP & HOLD 현장 안전망]</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          본 진단 건은 카싱크 제휴 정비소 입고 시 <span className="text-blue-200 font-bold">'STOP & HOLD 시스템'</span>이 자동 적용됩니다.
                        </p>
                        <p className="text-slate-300 text-[11px] leading-relaxed bg-blue-900/30 p-2 rounded-lg border border-blue-500/30">
                          리프트 상차 후 돌발 변수로 추가 작업이 필요할 경우, <span className="text-amber-300 font-extrabold">정비사가 [현장 사진 2장 + 20초 음성 소견]을 전송하여 차주의 모바일 승인을 얻기 전까지 작업을 임의 진행하지 않습니다.</span>
                        </p>
                      </div>

                      {/* Section 4: 📋 [정비소 방문 시 정비사에게 보여줄 3초 화면] */}
                      <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-xl p-3.5 text-xs space-y-2 shadow-inner">
                        <div className="flex items-center justify-between border-b border-amber-500/40 pb-1.5">
                          <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs">
                            <span>📋</span>
                            <span>[정비소 방문 시 정비사에게 보여줄 3초 화면]</span>
                          </div>
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                            현장 브리핑용
                          </span>
                        </div>
                        <div className="space-y-1.5 bg-slate-900/80 p-2.5 rounded-lg border border-amber-500/30 text-slate-200 text-[11px]">
                          <div>
                            <span className="text-amber-400 font-bold">• 체감 증상: </span>
                            <span>{msg.diagnosis.mechanicBriefing?.symptomSummary || msg.text || '차량 주요 이상 증상 점검 요청'}</span>
                          </div>
                          <div>
                            <span className="text-amber-400 font-bold block mb-0.5">• 중점 확인 요청:</span>
                            <div className="pl-2 space-y-0.5 text-slate-300">
                              <div>1) {msg.diagnosis.mechanicBriefing?.checkPoints?.[0] || '1차 유격 및 마모도 점검'}</div>
                              <div>2) {msg.diagnosis.mechanicBriefing?.checkPoints?.[1] || '관련 계통 누유/크랙 육안 검사'}</div>
                            </div>
                          </div>
                          <div className="pt-1 border-t border-slate-700 text-amber-300 font-semibold">
                            <span>• 작업 룰: </span>
                            <span className="text-white">{msg.diagnosis.mechanicBriefing?.workRule || '추가 하부 변수 발견 시 STOP & HOLD 모바일 전송 필수'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-700/80">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>정비 금액은 정비소 현장 실차 점검 후 최종 확정됩니다.</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const partToBook = msg.matchedPart || CORE_PARTS[0];
                              onBookPart(partToBook);
                            }}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>추천 정비소 예약 (STOP & HOLD 적용)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isAiLoading && (
            <div className="flex items-start gap-2.5 animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm p-3.5 shadow-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-500 font-medium ml-1">
                  증상 기전 및 고속도로 위험도 분석 중...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Suggestion Chips at the Bottom */}
        <div className="sticky bottom-16 md:bottom-20 z-10 pt-2 bg-gradient-to-t from-[#F4F6F9] via-[#F4F6F9] to-transparent">
          {/* Quick Suggestion Chips (예시문 2개만 깔끔하게 표시) */}
          <div className="flex items-center gap-1.5 pb-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] text-slate-400 font-semibold pl-1 shrink-0">💡 예시:</span>
            {quickSymptoms.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleDiagnose(chip)}
                className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-slate-700 text-[11px] sm:text-xs font-semibold border border-slate-200/90 shadow-2xs transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDiagnose(inputSymptom);
            }}
            className="relative flex items-center shadow-md rounded-2xl bg-white border border-slate-200 p-1"
          >
            <input
              id="ai-chat-input"
              type="text"
              value={inputSymptom}
              onChange={(e) => setInputSymptom(e.target.value)}
              placeholder="증상을 챗봇에 입력하세요 (예: 본넷에서 귀뚜라미 소리, 물 끓는 소리...)"
              className="flex-1 h-11 pl-3.5 pr-11 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
            />
            <button
              id="ai-chat-submit-btn"
              type="submit"
              disabled={isAiLoading || !inputSymptom.trim()}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 transition-all shadow-sm shrink-0"
              aria-label="챗봇 전송"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* 챗봇 하단: 디테일링 매칭 버튼 */}
          <div className="pt-2">
            <button
              type="button"
              id="btn-ai-detailing-match"
              onClick={() => {
                if (onGoToDetailingShops) {
                  onGoToDetailingShops();
                } else {
                  onGoToShops();
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-950/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>디테일링 매칭</span>
            </button>
          </div>
        </div>
      </div>

      {/* Part Detail Modal when clicked from chat */}
      {selectedPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                  {getPartIcon(selectedPartModal.icon)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {selectedPartModal.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedPartModal.subName} • {selectedPartModal.cycleKm}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPartModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {/* Sound */}
              <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-100 space-y-1.5">
                <div className="font-bold text-blue-700 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span>{selectedPartModal.soundTitle}</span>
                </div>
                {selectedPartModal.soundDescriptions.map((desc, i) => (
                  <p key={i} className="text-slate-700 whitespace-pre-line leading-relaxed">
                    • {desc}
                  </p>
                ))}
              </div>

              {/* Smell */}
              <div className="bg-rose-50/70 rounded-xl p-3 border border-rose-100 space-y-1.5">
                <div className="font-bold text-rose-700 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>{selectedPartModal.smellTitle}</span>
                </div>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedPartModal.smellDescription}
                </p>
              </div>

              {/* Highway Risk */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-amber-800 leading-relaxed flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">고속도로 주행 위험: </span>
                  <span>{selectedPartModal.highwayRiskText}</span>
                </div>
              </div>

              {/* Unreplaced Critical Consequence in Modal */}
              {selectedPartModal.unreplacedConsequence && (
                <div className="bg-red-50 rounded-xl p-3 border border-red-200 text-red-900 leading-relaxed space-y-1">
                  <div className="font-extrabold text-red-700 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black">
                      필독
                    </span>
                    <span>이 부품을 제때 안 갈면 어떻게 되나요?</span>
                  </div>
                  <p className="text-slate-800 text-[11px] sm:text-xs leading-relaxed pt-0.5">
                    {selectedPartModal.unreplacedConsequence}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
              <button
                onClick={() => setSelectedPartModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  const part = selectedPartModal;
                  setSelectedPartModal(null);
                  onBookPart(part);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm"
              >
                <Wrench className="w-4 h-4" />
                <span>정비소 예약하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal (이미지 원본 확대 보기) */}
      {selectedLightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
              <span className="text-xs font-bold text-slate-200">
                {selectedLightboxImage.caption || '시공 전후 상세 비교'}
              </span>
              <button
                onClick={() => setSelectedLightboxImage(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <img
                src={selectedLightboxImage.url}
                alt="확대 비교 이미지"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-xs font-black text-rose-300 border border-rose-400/40">
                ◀ BEFORE (유막/친수 상태)
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-xs font-black text-cyan-300 border border-cyan-400/40">
                AFTER (발수코팅 비딩 효과) ▶
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
