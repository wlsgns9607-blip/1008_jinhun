import React from 'react';
import { X, Phone, Clock, ShieldCheck, UserCheck, MessageSquare } from 'lucide-react';
import { RepairShop } from '../types';

interface PhoneConsultModalProps {
  isOpen: boolean;
  shop: RepairShop | null;
  onClose: () => void;
}

export const PhoneConsultModal: React.FC<PhoneConsultModalProps> = ({
  isOpen,
  shop,
  onClose,
}) => {
  if (!isOpen || !shop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-200">
                1급 정비 책임 엔지니어 직통
              </span>
              <h3 className="font-extrabold text-base leading-tight">
                {shop.name} 전화상담
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blue-700/60 text-white hover:bg-blue-700 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Shop Specialist Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                영업 및 상담 시간
              </span>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {shop.businessHours}
              </span>
            </div>

            <div className="text-sm font-black text-slate-900">
              대표 번호: <span className="text-blue-600">{shop.phone}</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200">
              {shop.specialtyText}
            </p>
          </div>

          {/* Safe Call Protection Info */}
          <div className="flex items-start gap-2 bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              카싱크 안심 통화가 연결됩니다. 통화 시 과잉정비 방지 녹취 및 견적 사전 안내가 제공됩니다.
            </p>
          </div>

          {/* Action Call Button */}
          <div className="space-y-2 pt-1">
            <a
              id="direct-phone-call-anchor"
              href={`tel:${shop.phone.replace(/[^0-9]/g, '')}`}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" />
              <span>{shop.phone} 바로 통화 연결</span>
            </a>

            <button
              onClick={onClose}
              className="w-full h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
