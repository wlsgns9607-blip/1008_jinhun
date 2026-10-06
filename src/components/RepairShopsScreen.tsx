import React, { useState } from 'react';
import {
  Star,
  MapPin,
  Phone,
  Calendar,
  Navigation as NavigationIcon,
  ExternalLink,
  ShieldCheck,
  Wrench,
  Moon,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { REPAIR_SHOPS } from '../data/mockData';
import { RepairShop, UserProfile } from '../types';

interface RepairShopsScreenProps {
  user: UserProfile;
  onOpenBooking: (shop: RepairShop) => void;
  onOpenDirections: (shop: RepairShop) => void;
  onOpenPhoneConsult: (shop: RepairShop) => void;
  onOpenEstimate: () => void;
  onGoToAiDiagnosis: () => void;
}

export const RepairShopsScreen: React.FC<RepairShopsScreenProps> = ({
  user,
  onOpenBooking,
  onOpenDirections,
  onOpenPhoneConsult,
  onOpenEstimate,
  onGoToAiDiagnosis,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedShopId, setSelectedShopId] = useState<string>('shop-1');
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);

  const filteredShops = REPAIR_SHOPS.filter((shop) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'cheapLabor') return true; // all current shops are cheap local shops
    if (activeFilter === 'sameDay') return shop.isSameDay;
    if (activeFilter === 'night') return shop.isNightAvailable;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-32 selection:bg-blue-100">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-100 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md md:max-w-3xl lg:max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/25">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">내 주변 착한 동네 카센타</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                  공임비 절감 특화
                </span>
              </div>
              <p className="text-[11px] text-slate-500">블루핸즈·오토큐 대비 30% 이상 저렴한 동네 양심 카센터</p>
            </div>
          </div>

          <button
            onClick={onOpenEstimate}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>견적 비교</span>
          </button>
        </div>
      </div>

      <div className="max-w-md md:max-w-3xl lg:max-w-6xl mx-auto px-4 pt-4 pb-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
          
          {/* Left Column (Desktop: Sticky Map & Filters) */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4 lg:sticky lg:top-20">
            {/* Interactive Map Section */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-800">
                    현재 위치: 서울 서초구 반포대로 (반경 5km)
                  </span>
                </div>
                <button
                  onClick={() => setIsMapExpanded(!isMapExpanded)}
                  className="text-[11px] text-blue-600 font-medium hover:underline"
                >
                  {isMapExpanded ? '지도 접기' : '크게 보기'}
                </button>
              </div>

              <div
                className={`relative w-full rounded-xl overflow-hidden transition-all duration-300 ${
                  isMapExpanded ? 'h-72 lg:h-96' : 'h-48 lg:h-64'
                } bg-slate-100 border border-slate-200`}
              >
                {/* Styled Map Graphic Canvas */}
                <div className="absolute inset-0 bg-[#E8ECEF] flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full opacity-60" viewBox="0 0 400 240">
                    {/* Roads */}
                    <path d="M-20 40 Q 150 120 420 80" stroke="#CBD5E1" strokeWidth="18" fill="none" />
                    <path d="M60 -20 Q 90 140 120 260" stroke="#CBD5E1" strokeWidth="14" fill="none" />
                    <path d="M220 -20 Q 240 130 310 260" stroke="#CBD5E1" strokeWidth="22" fill="none" />
                    <path d="M-10 180 Q 200 160 410 220" stroke="#CBD5E1" strokeWidth="16" fill="none" />
                    {/* Secondary Roads */}
                    <path d="M-20 40 Q 150 120 420 80" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                    <path d="M220 -20 Q 240 130 310 260" stroke="#FFFFFF" strokeWidth="14" fill="none" />
                    <path d="M-10 180 Q 200 160 410 220" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                    {/* Parks */}
                    <rect x="250" y="20" width="100" height="50" rx="8" fill="#D1E7DD" opacity="0.6" />
                    <rect x="30" y="100" width="70" height="60" rx="8" fill="#D1E7DD" opacity="0.5" />
                  </svg>

                  {/* User location pulsing marker */}
                  <div className="absolute top-[52%] left-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-400/40 animate-pulse shadow-md" />
                    <span className="text-[9px] font-bold text-blue-900 bg-white/90 px-1.5 py-0.5 rounded-full shadow-xs mt-1">
                      내 위치
                    </span>
                  </div>

                  {/* Shop Markers */}
                  {REPAIR_SHOPS.map((shop, idx) => {
                    const positions = [
                      { top: '30%', left: '32%' },
                      { top: '26%', left: '74%' },
                      { top: '48%', left: '78%' },
                      { top: '68%', left: '26%' },
                      { top: '78%', left: '72%' },
                      { top: '72%', left: '44%' },
                    ];
                    const pos = positions[idx % positions.length];
                    const isSelected = selectedShopId === shop.id;

                    return (
                      <button
                        key={shop.id}
                        onClick={() => setSelectedShopId(shop.id)}
                        style={{ top: pos.top, left: pos.left }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform ${
                          isSelected ? 'scale-125 z-10' : 'hover:scale-110'
                        }`}
                      >
                        <div
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                              : 'bg-white text-slate-800 border border-slate-200'
                          }`}
                        >
                          <Wrench className="w-2.5 h-2.5" />
                          <span>{shop.name.split(' ')[0]}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-600 border border-slate-200/80 shadow-xs">
                  선택 정비소: {REPAIR_SHOPS.find((s) => s.id === selectedShopId)?.name}
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                전체 동네 카센터 ({REPAIR_SHOPS.length})
              </button>
              <button
                onClick={() => setActiveFilter('sameDay')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeFilter === 'sameDay'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                당일 정비 가능
              </button>
              <button
                onClick={() => setActiveFilter('night')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeFilter === 'night'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-500" />
                토요/야간 정비
              </button>
            </div>
          </div>

          {/* Right Column (Desktop: Shop Grid/List) */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-3">
            <div className="hidden lg:flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  서초·반포 생활권 착한 동네 카센타 ({filteredShops.length}곳)
                </span>
                <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                  공임비 30%~40% 절감
                </span>
              </div>
              <span className="text-xs text-slate-500">부품 지참 공임 시공 가능</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
              {filteredShops.map((shop) => (
                <div
                  key={shop.id}
                  className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                    selectedShopId === shop.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm">{shop.name}</h3>
                          {shop.highlightBadge && (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                              {shop.highlightBadge}
                            </span>
                          )}
                          {shop.isTrustCertified && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> 양심업소
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{shop.address}</span>
                          <span className="font-bold text-emerald-600 ml-1">{shop.distance}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 justify-end">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{shop.rating}</span>
                          <span className="text-slate-400 font-normal">({shop.reviewCount})</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                          단골신뢰 {shop.trustScorePercent || 98}%
                        </span>
                      </div>
                    </div>

                    {/* Labor fee highlight note */}
                    {shop.laborFeeNote && (
                      <div className="mt-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                        <span className="font-bold text-emerald-700">💰 공임안내:</span>
                        <span>{shop.laborFeeNote}</span>
                      </div>
                    )}

                    {/* Special features tags */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {shop.tags.map((spec, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                        >
                          #{spec}
                        </span>
                      ))}
                      {shop.isSameDay && (
                        <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium">
                          ⚡ 당일 출고
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onOpenPhoneConsult(shop)}
                      className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>전화 상담</span>
                    </button>
                    <button
                      onClick={() => onOpenDirections(shop)}
                      className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <NavigationIcon className="w-3.5 h-3.5 text-slate-600" />
                      <span>길안내</span>
                    </button>
                    <button
                      onClick={() => onOpenBooking(shop)}
                      className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs shadow-emerald-500/20 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>예약하기</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
