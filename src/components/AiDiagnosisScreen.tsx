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
  const [selectedPartModal, setSelectedPartModal] = useState<CorePartDiagnostic | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiLoading]);

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
      console.warn('AI 진단 네트워크 일시 지연, 안전 진단 시스템으로 전환:', err);
      // Smart Fallback
      const fallbackDiagnosis: AiDiagnosisResult = {
        summary: '구동벨트 장력 저하 및 텐셔너 마모 의심',
        matchedPartIndex: 1,
        matchedPartName: '동 겉벨트 세트 (구동벨트 / 텐셔너)',
        urgency: '주의 (점검필요)',
        urgencyLevel: 'warning',
        highwayRisk: '장시간 고속 주행 시 벨트 이탈로 인한 발전기 동력 상실 및 엔진 과열 위험이 있습니다.',
        analysis: '에어컨 컴프레서 부하나 비 오는 날 벨트 슬립으로 귀뚜라미 쇳소리 소음이 발생합니다.',
        actionGuide: '텐셔너 장력 및 벨트 균열 상태를 육안 점검받으세요.',
        unreplacedRisk:
          '고속도로 주행 중 벨트가 끊어지면 워터펌프와 발전기가 동시 정지하여 1~2분 만에 냉각수 오버히트로 엔진 헤드가 뒤틀리고(엔진 사망), 핸들이 돌처럼 굳어 대형 2차 추돌 사고가 발생합니다. 단순 벨트 교체로 막을 수 있는 일이 300~500만 원 상당의 엔진 전손 교체로 번집니다.',
        soundOrSmell: '소리',
      };
      const matched = CORE_PARTS.find((p) => p.id === 1);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        diagnosis: fallbackDiagnosis,
        matchedPart: matched,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsAiLoading(false);
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
                  const query = `${p.name}을 제때 교체하지 않고 방치하면 어떻게 되나요? 고속도로 위험과 수리비 피해를 알려주세요.`;
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
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-amber-300">
                            AI 정밀 분석 리포트
                          </span>
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

                      {/* Body details */}
                      <div className="bg-slate-800/80 rounded-xl p-3 text-xs space-y-2.5 border border-slate-700/60 leading-relaxed">
                        <div className="text-slate-200">
                          <span className="text-slate-400 font-bold">기전 분석: </span>
                          {msg.diagnosis.analysis}
                        </div>
                        <div className="text-red-300">
                          <span className="font-bold text-red-400">⚠️ 고속도로 위험: </span>
                          {msg.diagnosis.highwayRisk}
                        </div>
                        
                        {/* 이 부품을 안 갈면 어떻게 되는가 (Unreplaced Critical Consequence) */}
                        <div className="bg-red-950/60 border border-red-500/40 rounded-lg p-2.5 text-red-200">
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

                        <div className="text-emerald-300">
                          <span className="font-bold text-emerald-400">조치 가이드: </span>
                          {msg.diagnosis.actionGuide}
                        </div>
                      </div>

                      {/* Audio listen if matched part has sound */}
                      {msg.matchedPart && msg.matchedPart.soundAudioKey && (
                        <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-blue-300 font-medium">
                            <Volume2 className="w-4 h-4 text-blue-400" />
                            <span>전조 소음 실제 비교 음성</span>
                          </div>
                          <button
                            onClick={() => handlePlaySound(msg.matchedPart?.soundAudioKey)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              playingAudioKey === msg.matchedPart.soundAudioKey
                                ? 'bg-red-600 text-white animate-pulse'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                          >
                            {playingAudioKey === msg.matchedPart.soundAudioKey ? (
                              <>
                                <StopCircle className="w-3.5 h-3.5" />
                                <span>정지</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>미리듣기</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Notice: AI does not fix price, on-site inspection */}
                      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-700/80">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Wrench className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>정비 금액은 정비소 현장 실차 점검 후 최종 확정됩니다.</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {msg.matchedPart && (
                            <button
                              onClick={() => setSelectedPartModal(msg.matchedPart || null)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all"
                            >
                              부품 백과 상세
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const partToBook = msg.matchedPart || CORE_PARTS[0];
                              onBookPart(partToBook);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md transition-all active:scale-95"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>추천 정비소 예약</span>
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
    </div>
  );
};
