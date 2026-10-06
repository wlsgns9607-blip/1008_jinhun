import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import { UserProfile } from '../types';

interface EstimateModalProps {
  isOpen: boolean;
  user: UserProfile;
  onClose: () => void;
  onProceedBooking: (selectedItems: string[]) => void;
}

export const EstimateModal: React.FC<EstimateModalProps> = ({
  isOpen,
  user,
  onClose,
  onProceedBooking,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'mission_oil',
    'brake_pads',
  ]);

  if (!isOpen) return null;

  const items = [
    {
      id: 'mission_oil',
      name: '미션오일 순환식 교환 세트',
      category: '변속 동력계 (10만km 주기)',
      urgency: '교체 주기 초과 (위험)',
      urgencyColor: 'text-red-600 bg-red-50 border-red-200',
      partsPrice: 150000,
      laborPrice: 80000,
      discount: 20000,
      totalPrice: 210000,
      description: '제네시스 후륜 8단 전용 SP-IV-RR 순정 유체 12L + 전용 순환식 어댑터 공임 포함',
    },
    {
      id: 'brake_pads',
      name: '브레이크 패드 앞/뒤 세트',
      category: '제동 시스템 (4만km 주기)',
      urgency: '잔여 20% 마모 경고',
      urgencyColor: 'text-amber-600 bg-amber-50 border-amber-200',
      partsPrice: 110000,
      laborPrice: 50000,
      discount: 15000,
      totalPrice: 145000,
      description: '제네시스 순정 세라믹 패드 + 신품 마모 인디케이터 센서 및 소음 방지제 도포',
    },
    {
      id: 'outer_belt',
      name: '동 겉벨트 및 오토텐셔너 풀리 세트',
      category: '엔진 구동계 (10만km 주기)',
      urgency: '권장 점검 주기',
      urgencyColor: 'text-blue-600 bg-blue-50 border-blue-200',
      partsPrice: 95000,
      laborPrice: 65000,
      discount: 10000,
      totalPrice: 150000,
      description: '고장력 V-리브드 벨트 + 아이들러 풀리 2EA + 텐셔너 어셈블리',
    },
  ];

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const calculateTotal = () => {
    return items
      .filter((i) => selectedItems.includes(i.id))
      .reduce((acc, curr) => acc + curr.totalPrice, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#1E293B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                {user.vehicle.plateNumber}
              </span>
              <h3 className="font-extrabold text-base leading-tight mt-0.5">
                정비 주기 도래 항목 투명 견적 비교
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
          {/* Vehicle Mileage Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <div className="text-slate-500 font-medium">현재 주행거리</div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {user.vehicle.mileage.toLocaleString()} km
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 font-medium">차종 / 연식</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                {user.vehicle.model} ({user.vehicle.year})
              </div>
            </div>
          </div>

          {/* Guarantee Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>카싱크 전국 1급 양심 공업사 표준 공임 정찰제 0원 바가지 보증</span>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {items.map((item) => {
              const isSelected = selectedItems.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.category}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.urgencyColor}`}
                    >
                      {item.urgency}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs pl-6">
                    <div className="text-slate-400">
                      부품 {item.partsPrice.toLocaleString()} + 공임 {item.laborPrice.toLocaleString()}
                    </div>
                    <div className="font-black text-slate-900 text-sm">
                      {item.totalPrice.toLocaleString()}원
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total & Checkout Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span>선택 항목 수</span>
              <span className="font-bold text-white">{selectedItems.length}개 부품</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">최종 예상 정산 견적</span>
              <span className="text-xl font-black text-white">
                {calculateTotal().toLocaleString()} 원
              </span>
            </div>

            <button
              onClick={() => onProceedBooking(selectedItems)}
              disabled={selectedItems.length === 0}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Wrench className="w-4 h-4" />
              <span>선택 항목 안심 정비소 예약하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
