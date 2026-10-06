import React from 'react';
import { ShieldAlert, AlertTriangle, Phone, CheckCircle2, X, AlertOctagon, ArrowUpRight, Copy } from 'lucide-react';

interface IllegalTowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IllegalTowGuideModal: React.FC<IllegalTowGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const insuranceNumbers = [
    { name: '한국도로공사 (무료긴급견인)', number: '1588-2504', isHighway: true },
    { name: '경찰청 (불법견인신고)', number: '112', isPolice: true },
    { name: '삼성화재 긴급출동', number: '1588-5114' },
    { name: '현대해상 긴급출동', number: '1588-5656' },
    { name: 'DB손해보험 긴급출동', number: '1588-0100' },
    { name: 'KB손해보험 긴급출동', number: '1544-0114' },
  ];

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
              긴급 대응 매뉴얼
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-yellow-300" />
            사설 렉카 피해 방지 & 무료 견인
          </h2>
          <p className="text-xs text-rose-100 mt-1">
            고속도로 및 일반도로 사고/고장 시 강제 견인 바가지요금 예방 가이드
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-700">
          {/* Top Highway Free Towing Banner */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-900 text-xs">한국도로공사 무료 긴급견인</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    국가 무료 지원
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  고속도로 본선/갓길에서 가장 가까운 안전지대(휴게소·영업소·졸음쉼터)까지 <strong>무료 견인</strong>해 드립니다.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href="tel:15882504"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>1588-2504 바로 연결</span>
                  </a>
                  <span className="text-[11px] text-amber-700 font-semibold">24시간 운영</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Crucial Action Steps */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              사설 견인차 접근 시 필수 대처 4단계
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-900">구두 거부 의사를 단호하게 밝히세요</p>
                  <p className="text-slate-600 mt-0.5">
                    "보험사(또는 도로공사) 견인차 불렀으니 차에 손대지 마세요!"라고 명확히 거부하세요.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-900">스마트폰으로 거부 현장을 동영상 촬영하세요</p>
                  <p className="text-slate-600 mt-0.5">
                    차량 번호판과 함께 "견인 거부합니다"라고 말하는 음성을 영상에 남기면 추후 강제 견인 입증 증거가 됩니다.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-bold text-slate-900">견인 동의서나 영수증에 절대 서명하지 마세요</p>
                  <p className="text-slate-600 mt-0.5">
                    "갓길까지만 빼주겠다"며 고리부터 걸려는 경우 즉시 제지하고 서명을 거부하세요.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <p className="font-bold text-slate-900">위협이나 강제 견인 시 즉시 112 신고</p>
                  <p className="text-slate-600 mt-0.5">
                    차주 동의 없는 견인은 <strong>형법상 권리행사방해 및 재물손괴</strong>에 해당될 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Call List */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs mb-2">원클릭 긴급 전화번호</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {insuranceNumbers.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex items-center justify-between ${
                    item.isHighway
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : item.isPolice
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="overflow-hidden pr-1">
                    <p className="text-[11px] font-bold truncate">{item.name}</p>
                    <p className="text-[11px] font-mono font-bold text-slate-600">{item.number}</p>
                  </div>
                  <a
                    href={`tel:${item.number.replace(/-/g, '')}`}
                    className="p-1.5 rounded-lg bg-white shadow-2xs hover:bg-slate-100 text-slate-700 shrink-0"
                    title="전화걸기"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors text-center"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
