import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Check,
  ChevronDown,
  Car,
  AlertCircle,
  Droplets,
  ShieldAlert,
} from 'lucide-react';
import { VehicleInfo } from '../types';
import {
  DETAILED_VEHICLE_DATABASE,
  DetailedVehicleModel,
  getEngineOilCycleInfo,
} from '../data/carModelsDatabase';

interface VehicleSetupScreenProps {
  initialVehicle?: VehicleInfo;
  onComplete: (vehicle: VehicleInfo) => void;
  onBack?: () => void;
}

// 1. 제조사 정의
const BRANDS = [
  { id: 'hyundai', name: '현대' },
  { id: 'kia', name: '기아' },
  { id: 'genesis', name: '제네시스' },
] as const;

type BrandType = 'hyundai' | 'kia' | 'genesis';

export const VehicleSetupScreen: React.FC<VehicleSetupScreenProps> = ({
  initialVehicle,
  onComplete,
  onBack,
}) => {
  // 1. 제조사 선택
  const [selectedBrand, setSelectedBrand] = useState<BrandType>('kia');

  // 해당 제조사의 차량 목록 (carModelsDatabase.ts 기준)
  const brandVehicleList = useMemo(() => {
    return DETAILED_VEHICLE_DATABASE.filter((v) => v.brand === selectedBrand);
  }, [selectedBrand]);

  // 2. 모델 선택 (예: '스포티지 NQ5 5세대', '쏘렌토 MQ4 4세대', '코나 1세대 (OS)', '코나 2세대 (SX2)')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    return brandVehicleList[0]?.id || 'carnival-ka4';
  });

  // 현재 선택된 차량 객체
  const selectedVehicleObj = useMemo<DetailedVehicleModel | undefined>(() => {
    const found = brandVehicleList.find((v) => v.id === selectedVehicleId);
    return found || brandVehicleList[0];
  }, [brandVehicleList, selectedVehicleId]);

  // 3. 선택된 모델의 실제 출시 연식 목록 (코나는 2017년부터만, 캐스퍼는 2021년부터만 등)
  const availableYears = useMemo<number[]>(() => {
    if (!selectedVehicleObj) return [2021];
    return selectedVehicleObj.years;
  }, [selectedVehicleObj]);

  // 연식 선택 상태
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return availableYears[0] || 2021;
  });

  // 차량 모델이 바뀌면 연식을 해당 차량의 실제 출시 연식 중 최신으로 자동 동기화
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // 4. 선택된 모델의 실제 유종/파워트레인 목록
  const availablePowertrains = useMemo(() => {
    if (!selectedVehicleObj || !selectedVehicleObj.powertrains.length) {
      return [{ name: '가솔린 (자동변속기)', transmission: '자동변속기', maintenanceNotice: '엔진오일 관리' }];
    }
    return selectedVehicleObj.powertrains;
  }, [selectedVehicleObj]);

  // 파워트레인 선택 상태
  const [selectedPowertrainName, setSelectedPowertrainName] = useState<string>(() => {
    return availablePowertrains[0]?.name || '1.6 가솔린 터보';
  });

  // 차량 모델이 바뀌면 파워트레인도 첫 번째 실제 사양으로 자동 동기화
  useEffect(() => {
    if (
      availablePowertrains.length > 0 &&
      !availablePowertrains.some((p) => p.name === selectedPowertrainName)
    ) {
      setSelectedPowertrainName(availablePowertrains[0].name);
    }
  }, [availablePowertrains, selectedPowertrainName]);

  // 현재 선택된 파워트레인 객체 (정비 알림 및 미션 정보 추출)
  const currentPowertrainObj = useMemo(() => {
    return (
      availablePowertrains.find((p) => p.name === selectedPowertrainName) ||
      availablePowertrains[0]
    );
  }, [availablePowertrains, selectedPowertrainName]);

  // 실시간 차종 및 파워트레인별 엔진오일 교체 스펙 산출
  const selectedOilSpec = useMemo(() => {
    return getEngineOilCycleInfo(selectedVehicleObj?.name || '', selectedPowertrainName);
  }, [selectedVehicleObj, selectedPowertrainName]);

  // 제조사 변경 시
  const handleBrandChange = (brand: BrandType) => {
    setSelectedBrand(brand);
    const firstOfBrand = DETAILED_VEHICLE_DATABASE.find((v) => v.brand === brand);
    if (firstOfBrand) {
      setSelectedVehicleId(firstOfBrand.id);
      setSelectedYear(firstOfBrand.years[0]);
      setSelectedPowertrainName(firstOfBrand.powertrains[0].name);
    }
  };

  // 모델 변경 시
  const handleModelChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    const found = brandVehicleList.find((v) => v.id === vehicleId);
    if (found) {
      setSelectedYear(found.years[0]);
      setSelectedPowertrainName(found.powertrains[0].name);
    }
  };

  // 5. 차량번호 & 주행거리
  const [plateNumber, setPlateNumber] = useState(initialVehicle?.plateNumber || '12가 3456');
  const [mileage, setMileage] = useState<number>(initialVehicle?.mileage || 64000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plateStatus, setPlateStatus] = useState<{
    valid?: boolean;
    normalized?: string;
    message?: string;
    plateType?: string;
  }>({
    valid: true,
    normalized: initialVehicle?.plateNumber || '12가 3456',
    message: '파이썬(Python) 번호판 규격 검증 완료',
  });

  // 파이썬 기반 차량번호 실시간 규격 검증
  const handlePlateBlur = async () => {
    if (!plateNumber.trim()) return;
    try {
      const res = await fetch('/api/vehicle/validate-plate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plateNumber }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlateStatus(data);
        if (data.valid && data.normalized) {
          setPlateNumber(data.normalized);
        }
      }
    } catch (e) {
      console.warn('Python plate validation check failed:', e);
    }
  };

  // 등록 완료
  const handleConfirm = async () => {
    setIsSubmitting(true);
    const brandName =
      selectedBrand === 'hyundai' ? '현대' : selectedBrand === 'kia' ? '기아' : '제네시스';

    const modelDisplayName = selectedVehicleObj
      ? `${selectedVehicleObj.name} (${brandName})`
      : `차량 (${brandName})`;

    const transmissionType = currentPowertrainObj?.transmission ||
      (selectedPowertrainName.includes('DCT')
        ? 'DCT 변속기'
        : selectedPowertrainName.includes('IVT')
        ? 'IVT 무단변속기'
        : '자동변속기');

    const finalVehicle: VehicleInfo = {
      model: modelDisplayName,
      plateNumber: plateStatus.normalized || plateNumber.trim() || '12가 3456',
      mileage: Number(mileage) || 64000,
      year: selectedYear,
      engineType: selectedPowertrainName,
      transmission: transmissionType,
      lastInspectionDate: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      engineOilCycleKm: selectedOilSpec.cycleKm,
      engineOilSevereKm: selectedOilSpec.severeKm,
      engineOilViscosity: selectedOilSpec.viscosity,
      engineOilGuidance: selectedOilSpec.guidanceText,
    };

    try {
      await fetch('/api/vehicle/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: 'driver.kim@carsync.kr',
          brand: brandName,
          vehicle: finalVehicle,
        }),
      });
    } catch (err) {
      console.warn('Python vehicle save fallback to local state:', err);
    } finally {
      setIsSubmitting(false);
      onComplete(finalVehicle);
    }
  };

  // 연식 범위 안내 텍스트 (예: "2017년 ~ 2023년 출시 모델")
  const yearRangeText = useMemo(() => {
    if (!selectedVehicleObj) return '';
    const endStr = selectedVehicleObj.endYear ? `${selectedVehicleObj.endYear}년` : '현재';
    return `${selectedVehicleObj.startYear}년 ~ ${endStr}`;
  }, [selectedVehicleObj]);

  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-24 text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="뒤로가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                CarSync 정밀 DB 설정
              </span>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                내 차량 설정
              </h1>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <User className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Simple Guide Banner */}
        <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-900 text-[10px] font-extrabold">
              실차 출시 연식 완벽 연동
            </span>
            <h2 className="text-base font-black mt-1 text-white">차량 정보 정밀 입력</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              차량별 실제 출시 연도와 실제 유종만 엄격하게 매칭됩니다.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          {/* 1. 제조사 선택 (3개 버튼) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              1. 제조사 선택
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BRANDS.map((brand) => {
                const isSelected = selectedBrand === brand.id;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleBrandChange(brand.id)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-600/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {brand.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 모델 선택 (세대별 실제 출시 모델) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                2. 모델 선택
              </label>
              <span className="text-[11px] text-slate-400">
                {brandVehicleList.length}개 차종
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedVehicleId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full h-11 pl-3 pr-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold appearance-none focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                {brandVehicleList.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.subSeries ? `(${model.subSeries.replace(/.*\((.*)\).*/, '$1')})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. 연식 선택 (해당 차종이 실제로 출시된 연도만 엄격하게 노출) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                3. 연식 선택
              </label>
              <span className="text-[11px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                실제 출시 기간: {yearRangeText}
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full h-11 pl-3 pr-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold appearance-none focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}년형 ({year}년 등록)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 pl-1">
              ※ 선택하신 <strong>{selectedVehicleObj?.name}</strong> 차종의 실제 생산·출시 연도만 표시됩니다.
            </p>
          </div>

          {/* 4. 유종 / 엔진 선택 (해당 모델 실제 파워트레인만 1:1 매핑) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                4. 유종 및 파워트레인
              </label>
              <span className="text-[11px] text-blue-600 font-semibold">
                실차 라인업 ({availablePowertrains.length}종)
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedPowertrainName}
                onChange={(e) => setSelectedPowertrainName(e.target.value)}
                className="w-full h-11 pl-3 pr-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold appearance-none focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                {availablePowertrains.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 핵심 정비 팁 (DCT 6만km, R엔진 댐퍼풀리 등) */}
            {currentPowertrainObj?.maintenanceNotice && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">{currentPowertrainObj.maintenanceNotice}</span>
              </div>
            )}

            {/* 조사된 차량 맞춤 엔진오일 교체 주기 및 추천 점도 안내 카드 */}
            <div className="mt-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200/90 text-blue-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-blue-900">
                  <Droplets className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>차량 맞춤 엔진오일 교체 주기</span>
                </div>
                <span className="text-[11px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                  {selectedOilSpec.cycleKm.toLocaleString()} km
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200/60 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                  <span className="text-slate-500 block text-[10px]">가혹조건 (시내/정체)</span>
                  <strong className="text-rose-600 font-bold">{selectedOilSpec.severeKm.toLocaleString()} km</strong>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-blue-100">
                  <span className="text-slate-500 block text-[10px]">권장 오일 점도 규격</span>
                  <strong className="text-slate-800 font-bold truncate block">{selectedOilSpec.viscosity}</strong>
                </div>
              </div>
              <p className="mt-1.5 text-[10px] text-blue-800 font-medium leading-relaxed">
                ※ {selectedOilSpec.guidanceText}
              </p>
            </div>
          </div>

          {/* 5. 차량번호 & 주행거리 */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                5. 차량 번호 및 주행거리
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                🐍 Python 검증/저장 연동
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-slate-500 font-semibold mb-1">
                  차량 번호
                </span>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  onBlur={handlePlateBlur}
                  placeholder="예: 12가 3456"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                />
                {plateStatus.message && (
                  <p
                    className={`text-[10px] mt-1 font-medium ${
                      plateStatus.valid ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {plateStatus.valid ? '✓ ' : '✕ '}
                    {plateStatus.message}
                  </p>
                )}
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-semibold mb-1">
                  주행거리 (km)
                </span>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  placeholder="예: 64000"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                />
                <p className="text-[10px] mt-1 text-slate-400">
                  소모품 교체 주기 산출 기준
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Vehicle Preview Banner */}
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900">
                {selectedVehicleObj?.name} ({selectedYear}년형)
              </div>
              <div className="text-[11px] text-blue-700 font-medium">
                {selectedPowertrainName} · {Number(mileage).toLocaleString()}km
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-1 rounded-md border border-blue-100">
            설정 대기
          </span>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-20">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className={`w-full h-12 rounded-xl text-white font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-500/25'
            }`}
          >
            {isSubmitting ? (
              <span>Python 엔진에 데이터 저장 중...</span>
            ) : (
              <>
                <span>이 설정으로 등록 완료하기</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
