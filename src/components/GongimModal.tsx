import React from 'react';
import { Wrench, ExternalLink, X, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';

interface GongimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GongimModal: React.FC<GongimModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const gongimStandards = [
    { name: '엔진오일 교환', standard: '19,000원 ~ 25,000원', note: '오일/필터 직접 구매 지참' },
    { name: '브레이크 패드 (전륜)', standard: '30,000원 ~ 35,000원', note: '부품 미포함 순수 공임' },
    { name: '브레이크 오일 순환식', standard: '45,000원 ~ 55,000원', note: '순환식 장비 사용' },
    { name: '미션오일 (순환식/드레인)', standard: '50,000원 ~ 70,000원', note: '오일 별도' },
    { name: '겉벨트 세트 교환', standard: '80,000원 ~ 120,000원', note: '텐셔너/아이들러 포함' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold">
              표준공임 정보 & 예약
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-200" />
            공임나라 표준 공임 & 예약
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            부품을 온라인 최저가로 직접 구매하고 투명한 공임만 지불하세요
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-700">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-bold">공임나라 이용 꿀팁!</p>
              <p className="text-blue-700 mt-0.5 leading-relaxed">
                1. 스마트스토어 등에서 내 차 부품 품번 확인 후 최저가 구매<br />
                2. 공임나라 홈페이지에서 가까운 가맹점 날짜/시간 예약<br />
                3. 예약 당일 부품 들고 방문하여 표준 공임만 결제!
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              핵심 주요 정비 부품 표준공임표
            </h3>
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden text-xs">
              {gongimStandards.map((item, idx) => (
                <div key={idx} className="p-3 bg-white flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500">{item.note}</p>
                  </div>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    {item.standard}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://www.gongim.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
            >
              <span>공임나라 공식 웹사이트 가맹점 예약 바로가기</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
