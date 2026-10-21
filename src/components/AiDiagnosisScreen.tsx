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
}

interface AiDiagnosisScreenProps {
  user: UserProfile;
  onBack: () => void;
  onBookPart: (part: CorePartDiagnostic) => void;
  onGoToShops: () => void;
}

export const AiDiagnosisScreen: React.FC<AiDiagnosisScreenProps> = ({
  user,
  onBack,
  onBookPart,
  onGoToShops,
}) => {
  const [inputSymptom, setInputSymptom] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedPartModal, setSelectedPartModal] = useState<CorePartDiagnostic | null>(null);
  const [isDetailingModalOpen, setIsDetailingModalOpen] = useState<boolean>(false);
  const [selectedDetailingCourse, setSelectedDetailingCourse] = useState<string>('engine');
  const [detailingSubmitted, setDetailingSubmitted] = useState<boolean>(false);

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

  // Initial Chatbot Conversation with 7 Core Parts Guide embedded into the chat flow!
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `반갑습니다, ${user.name || '운전자'}님! 🤖\n**ai 카싱크** 수석 엔지니어입니다.\n\n운전 중 들리는 **소음**, 느껴지는 **진동**이나 **냄새**를 말씀해 주시거나, 상단의 **핵심 7대 부품 질문 버튼**을 눌러보세요.\n\n"이 부품을 제때 안 갈면 엔진 블로우나 제동 불능 등 어떤 치명적 사고와 수리비 폭탄이 터지는지"를 상세히 짚어드립니다.\n\n※ ai 카싱크는 정비 금액을 임의로 단정하지 않으며, 정확한 수리비는 현장 실차 점검 후 확정됩니다.`,
      timestamp: '지금',
    },
  ]);

  const quickSymptoms = [
    '에어컨 켤 때 삐걱 소리',
    '변속할 때 쿵 충격',
    '달콤한 한약 냄새 (냉각수)',
    '브레이크 밟을 때 쇳소리',
    '방지턱 넘을 때 찌그덕',
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

      const data: AiDiagnosisResult = await res.json();
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
        {/* Core 8 Parts Quick Q&A Bar (8가지 부품 질문과 답 - 안 갈면 어떻게 되는지) */}
        <div className="mb-4 bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="font-extrabold text-xs text-slate-900">
                핵심 8대 부품 문답: 안 갈면 어떻게 되나요?
              </span>
            </div>
            <span className="text-[11px] font-bold text-red-600">원터치 질문</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {CORE_PARTS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  const baseName = p.name.split('(')[0].trim();
                  const lastChar = baseName[baseName.length - 1];
                  const code = lastChar.charCodeAt(0);
                  const hasBatchim = code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 > 0 : false;
                  const particle = hasBatchim ? '을' : '를';
                  const query = `${p.name}${particle} 제때 교체하지 않고 방치하면 어떻게 되나요? 고속도로 위험과 수리비 피해를 알려주세요.`;
                  handleDiagnose(query);
                }}
                className="px-2 py-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200/80 hover:border-red-300 text-slate-800 hover:text-red-700 text-xs font-bold transition-all flex flex-col items-start gap-0.5 active:scale-95 group text-left"
              >
                <div className="flex items-center gap-1 w-full justify-between">
                  <span className="truncate">{p.name.split('(')[0].trim()}</span>
                  <span className="text-[10px] text-red-500 font-extrabold group-hover:scale-105">Q&A</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">안 갈면 생기는 일</span>
              </button>
            ))}
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
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-line ${
                        isAi
                          ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm'
                          : 'bg-blue-600 text-white rounded-tr-sm font-medium'
                      }`}
                    >
                      {msg.text}
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

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            id="btn-detailing-match"
                            onClick={() => {
                              setSelectedDetailingCourse(
                                msg.diagnosis?.soundOrSmell === '냄새' ? 'interior' :
                                msg.matchedPart?.id === 1 || msg.matchedPart?.id === 7 || msg.matchedPart?.id === 8 ? 'engine' :
                                msg.matchedPart?.id === 3 ? 'underbody' : 'gloss'
                              );
                              setDetailingSubmitted(false);
                              setIsDetailingModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95 border border-emerald-400/40"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                            <span>✨ 디테일링 매칭</span>
                          </button>
                          <button
                            onClick={() => {
                              const partToBook = msg.matchedPart || CORE_PARTS[0];
                              onBookPart(partToBook);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
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
          {/* Quick Suggestion Chips (5개 버튼 전체 가림 없이 깔끔하게 표시) */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            <button
              onClick={() => {
                setSelectedDetailingCourse('engine');
                setDetailingSubmitted(false);
                setIsDetailingModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] sm:text-xs font-black shadow-xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1 whitespace-nowrap border border-emerald-400/30"
            >
              <Sparkles className="w-3 h-3 text-emerald-200" />
              <span>디테일링 매칭</span>
            </button>
            {quickSymptoms.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleDiagnose(chip)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-slate-700 text-[11px] sm:text-xs font-semibold border border-slate-200/90 shadow-2xs transition-all active:scale-95 whitespace-nowrap"
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

      {/* Detailing Matching Modal (디테일링 전담 매칭 모달) */}
      {isDetailingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/40 max-h-[90vh] flex flex-col text-white">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      카싱크 프리미엄 디테일링 1:1 매칭
                    </h3>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                      공식인증
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {user.vehicle.model} • 정밀 케어 전담 1급 마스터 매칭
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {!detailingSubmitted ? (
                <>
                  {/* Vehicle Info Badge */}
                  <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">매칭 대상 차량</span>
                      <span className="font-black text-sm text-emerald-300">{user.vehicle.model}</span>
                      <span className="text-[11px] text-slate-300 ml-1.5">({user.vehicle.transmission || '구동계'} / {user.vehicle.mileage ? `${(user.vehicle.mileage / 10000).toFixed(1)}만km` : '8.5만km'})</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 text-[11px] font-bold border border-emerald-600/40">
                      인근 전문점 3곳 대기
                    </span>
                  </div>

                  {/* Course Options */}
                  <div className="space-y-2">
                    <label className="text-slate-300 font-bold block text-xs flex items-center gap-1">
                      <span>✨ 맞춤 디테일링 케어 코스 선택</span>
                      <span className="text-emerald-400 text-[10px]">(진단 결과 기반 권장)</span>
                    </label>

                    {/* Course 1: Engine Room Steam */}
                    <div
                      onClick={() => setSelectedDetailingCourse('engine')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        selectedDetailingCourse === 'engine'
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🧼</span>
                          <div>
                            <span className="font-extrabold text-sm text-white">엔진룸 정밀 고온 스팀 클리닝</span>
                            <span className="text-[10px] text-emerald-400 font-bold ml-1.5">정비 전/후 강력 권장</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-emerald-300 text-xs">약 60,000원 ~</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-relaxed">
                        누유 흔적·오일 찌든 때 슬러지 완전 박멸, 고전압 배선 보호용 드레싱 코팅 시공
                      </p>
                    </div>

                    {/* Course 2: Interior Ozone Sterilization */}
                    <div
                      onClick={() => setSelectedDetailingCourse('interior')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        selectedDetailingCourse === 'interior'
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">💨</span>
                          <div>
                            <span className="font-extrabold text-sm text-white">실내 에어컨 냄새 & 오존 스팀 살균</span>
                            <span className="text-[10px] text-teal-400 font-bold ml-1.5">송풍구 악취 박멸</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-emerald-300 text-xs">약 80,000원 ~</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-relaxed">
                        공조기 에바포레이터 고온 스팀 세척, 가죽시트 크리닝, 실내 99.9% 항균 오존 탈취
                      </p>
                    </div>

                    {/* Course 3: Underbody High Pressure */}
                    <div
                      onClick={() => setSelectedDetailingCourse('underbody')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        selectedDetailingCourse === 'underbody'
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🚿</span>
                          <div>
                            <span className="font-extrabold text-sm text-white">하체 고압 정밀 세척 & 방청 코팅</span>
                            <span className="text-[10px] text-cyan-400 font-bold ml-1.5">로워암·하부 부식 방지</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-emerald-300 text-xs">약 50,000원 ~</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-relaxed">
                        하부 염화칼슘·진흙 완전 세척, 로워암 부싱 및 관통 볼트 방청 윤활 코팅
                      </p>
                    </div>

                    {/* Course 4: Premium Water Polish */}
                    <div
                      onClick={() => setSelectedDetailingCourse('gloss')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        selectedDetailingCourse === 'gloss'
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">✨</span>
                          <div>
                            <span className="font-extrabold text-sm text-white">프리미엄 수성 듀얼 광택 & 유리막 코팅</span>
                            <span className="text-[10px] text-amber-400 font-bold ml-1.5">신차급 광택 복원</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-emerald-300 text-xs">약 180,000원 ~</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-relaxed">
                        미세 스크래치 스월마크 제거, 9H 고경도 나노 세라믹 유리막 발수 코팅
                      </p>
                    </div>
                  </div>

                  {/* Guaranteed Badge */}
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-bold text-white">카싱크 디테일링 보증제: </span>
                      시공 불만족 시 100% 무상 재시공 보증 및 STOP & HOLD 실시간 시공 전/후 사진 비교 전송.
                    </div>
                  </div>
                </>
              ) : (
                /* Submission Success View */
                <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-900/40">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white">
                      디테일링 1:1 전담 마스터 매칭 완료!
                    </h4>
                    <p className="text-xs text-emerald-300 mt-1">
                      차주님의 {user.vehicle.model} 전담 디테일러가 배정되었습니다.
                    </p>
                  </div>

                  <div className="bg-slate-800/90 rounded-2xl p-4 text-left border border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-700/80 pb-2">
                      <span className="text-slate-400">매칭 번호</span>
                      <span className="font-bold text-white">CS-DT-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/80 pb-2">
                      <span className="text-slate-400">선택 코스</span>
                      <span className="font-bold text-emerald-400">
                        {selectedDetailingCourse === 'engine' && '엔진룸 정밀 고온 스팀 클리닝'}
                        {selectedDetailingCourse === 'interior' && '실내 에어컨 냄새 & 오존 스팀 살균'}
                        {selectedDetailingCourse === 'underbody' && '하체 고압 정밀 세척 & 방청 코팅'}
                        {selectedDetailingCourse === 'gloss' && '프리미엄 수성 듀얼 광택 & 유리막 코팅'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/80 pb-2">
                      <span className="text-slate-400">배정 전문점</span>
                      <span className="font-bold text-white">카싱크 공식인증 디테일링 본점 (평점 4.97★)</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">전담 혜택</span>
                      <span className="font-extrabold text-amber-300">카싱크 제휴 20,000원 즉시 할인권 발급</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    등록하신 연락처로 10분 이내 상세 일정 조율 알림톡 및 전용 할인 쿠폰이 전송됩니다.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
              {!detailingSubmitted ? (
                <>
                  <button
                    onClick={() => setIsDetailingModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs transition-colors"
                  >
                    취소
                  </button>
                  <button
                    id="btn-confirm-detailing"
                    onClick={() => setDetailingSubmitted(true)}
                    className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>디테일링 1:1 매칭 신청하기</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsDetailingModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md"
                >
                  확인 완료
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
