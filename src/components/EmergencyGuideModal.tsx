import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  PhoneCall,
  Shield,
  Flashlight,
  Volume2,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface EmergencyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenIllegalTow?: () => void;
}

export const EmergencyGuideModal: React.FC<EmergencyGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenIllegalTow,
}) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFlashActive) {
      interval = setInterval(() => {
        setIsFlashing((prev) => !prev);
      }, 350);
    } else {
      setIsFlashing(false);
    }
    return () => clearInterval(interval);
  }, [isFlashActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Flash Screen Strobe Overlay when active */}
        {isFlashActive && (
          <div
            className={`absolute inset-0 z-40 pointer-events-none transition-colors duration-200 ${
              isFlashing ? 'bg-red-600/90' : 'bg-amber-400/90'
            } flex items-center justify-center`}
          >
            <div className="text-white text-center font-black text-2xl animate-bounce drop-shadow-lg">
              ⚠️ 비상 대피 경고 신호 작동 중 ⚠️
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#FFF5F5] border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold">
                긴급 지원 가이드
              </span>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight mt-0.5">
                고속도로 갓길 비상 대피 가이드
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Urgent Warning */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-xs text-red-800 space-y-1">
            <div className="font-extrabold text-sm flex items-center gap-1.5 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span>고속도로 2차 사고 치명률은 일반 사고의 6배!</span>
            </div>
            <p className="text-red-700 leading-relaxed text-[11px]">
              차량 고장이나 가벼운 접촉 사고 시, 차 안이나 갓길에 서 계시면 절대 안 됩니다. 사람 먼저 신속히 가드레일 밖 안전지대로 대피하세요.
            </p>
          </div>

          {/* Korea Expressway Free Towing Hotline Card */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-4 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-blue-200">
                한국도로공사 공식 연동 서비스
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold">
                24시간 무료 견인
              </span>
            </div>

            <div>
              <div className="text-xl font-black tracking-tight">
                1588 - 2504
              </div>
              <div className="text-xs text-blue-100 mt-0.5">
                가장 가까운 휴게소, 졸음쉼터, 영업소 등 안전지대까지 무료 견인 지원
              </div>
            </div>

            <a
              href="tel:1588-2504"
              className="w-full h-11 rounded-xl bg-white text-blue-700 font-extrabold text-sm flex items-center justify-center gap-2 shadow hover:bg-blue-50 transition-all active:scale-[0.98]"
            >
              <PhoneCall className="w-4 h-4" />
              <span>한국도로공사 긴급견인 원터치 전화 연결</span>
            </a>
          </div>

          {/* Step-by-step Evacuation Checklist */}
          <div className="space-y-2 pt-1">
            <h4 className="font-bold text-slate-900 text-xs">
              원터치 2차 사고 행동 수칙 (4단계)
            </h4>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <div className="font-bold text-slate-800">
                    비상등을 켜고 트렁크를 여세요
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    후속 차량에 원거리 이상 신호를 알리기 위해 비상등을 켜고 트렁크를 개방합니다.
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <div className="font-bold text-slate-800">
                    탑승자 전원 가드레일 밖 안전지대로 대피
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    갓길이나 차로에 머물지 말고 도로 밖 안전한 언덕이나 방음벽 너머로 신속 대피하세요.
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <div className="font-bold text-slate-800">
                    안전지대에서 스마트폰 비상 플래시 작동
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    야간에는 차량 방향으로 스마트폰 플래시를 비추어 2차 추돌을 방지합니다.
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <div className="font-bold text-slate-800">
                    한국도로공사 (1588-2504) 또는 경찰 (112) 신고
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    안전지대에서 위치(고속도로 노선명 및 기점 표지판 숫자)를 알리고 무료 견인을 신청합니다.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Illegal Tow Manual Shortcut */}
          {onOpenIllegalTow && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenIllegalTow();
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-between hover:bg-rose-100 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>사설·불법 렉카 강제 견인 대처 매뉴얼 보기</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          )}

          {/* Interactive Screen Flash Strobe Button */}
          <div className="pt-1">
            <button
              onClick={() => setIsFlashActive(!isFlashActive)}
              className={`w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isFlashActive
                  ? 'bg-slate-900 text-red-400 border-2 border-red-500 animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              <Flashlight className="w-5 h-5" />
              <span>
                {isFlashActive ? '비상 점멸 신호 끄기 (화면 터치)' : '야간 비상 점멸 신호 화면 켜기'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
