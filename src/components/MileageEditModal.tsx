import React, { useState } from 'react';
import { Gauge, X, Check, RotateCcw } from 'lucide-react';

interface MileageEditModalProps {
  isOpen: boolean;
  currentMileage: number;
  onClose: () => void;
  onSave: (newMileage: number) => void;
}

export const MileageEditModal: React.FC<MileageEditModalProps> = ({
  isOpen,
  currentMileage,
  onClose,
  onSave,
}) => {
  const [mileage, setMileage] = useState<number>(currentMileage);

  if (!isOpen) return null;

  const quickAdds = [1000, 5000, 10000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mileage > 0) {
      onSave(mileage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">내 차 주행거리 수정</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              현재 누적 주행거리 (km)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="999999"
                step="100"
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl font-mono text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                km
              </span>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-1.5">
            {quickAdds.map((add) => (
              <button
                key={add}
                type="button"
                onClick={() => setMileage((prev) => prev + add)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                +{add.toLocaleString()}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setMileage(112000)}
              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs"
              title="기본값(112,000km)으로 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            * 입력하신 주행거리에 맞춰 6대 핵심 소모품의 교체 주기 및 위험도 판정이 자동으로 즉시 재계산됩니다.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>적용하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
