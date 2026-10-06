import React, { useState } from 'react';
import {
  X,
  Navigation,
  MapPin,
  Car,
  Footprints,
  ExternalLink,
  CheckCircle,
  Share2,
} from 'lucide-react';
import { RepairShop } from '../types';

interface DirectionsModalProps {
  isOpen: boolean;
  shop: RepairShop | null;
  onClose: () => void;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  isOpen,
  shop,
  onClose,
}) => {
  const [transportMode, setTransportMode] = useState<'drive' | 'walk'>('drive');

  if (!isOpen || !shop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-white rotate-45" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-400">
                실시간 최적 경로
              </span>
              <h3 className="font-extrabold text-base leading-tight">
                {shop.name} 길찾기
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Mode Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setTransportMode('drive')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                transportMode === 'drive'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>차량 경로 (약 2분)</span>
            </button>
            <button
              onClick={() => setTransportMode('walk')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                transportMode === 'walk'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Footprints className="w-4 h-4" />
              <span>도보 경로 (약 6분)</span>
            </button>
          </div>

          {/* Route Summary Card */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800">
                {transportMode === 'drive' ? '추천 주행 경로' : '안전 도보 인도'}
              </span>
              <span className="text-xs font-extrabold text-blue-600">
                거리 {shop.distance}
              </span>
            </div>

            <div className="text-sm font-bold text-slate-900">
              내 위치 (구로디지털로) → {shop.address}
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2 pt-1 border-t border-blue-100">
              <span>신호 대기 약 1회</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">정체 없음 원활</span>
            </div>
          </div>

          {/* External Map Apps Link */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-slate-700">
              외부 네비게이션 앱으로 길안내 시작
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://map.kakao.com/link/to/${encodeURIComponent(shop.name)},${shop.lat},${shop.lng}`}
                target="_blank"
                rel="noreferrer"
                className="h-11 rounded-xl bg-[#FEE500] text-[#191919] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:brightness-95 transition-all"
              >
                <span>카카오맵 연결</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://map.naver.com/v5/search/${encodeURIComponent(shop.name)}`}
                target="_blank"
                rel="noreferrer"
                className="h-11 rounded-xl bg-[#03C75A] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:brightness-95 transition-all"
              >
                <span>네이버지도 연결</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
