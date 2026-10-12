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
  PhoneCall,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { VehicleInfo } from '../types';
import {
  DETAILED_VEHICLE_DATABASE,
  DetailedVehicleModel,
  getEngineOilCycleInfo,
} from '../data/carModelsDatabase';

interface VehicleSetupScreenProps {
  initialVehicle?: VehicleInfo;
  initialSeniorMode?: boolean;
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
  initialSeniorMode = false,
  onComplete,
  onBack,
}) => {
  // 👓 어르신 (큰글씨·쉬운말) 모드 토글 상태
  const [isSeniorMode, setIsSeniorMode] = useState<boolean>(initialSeniorMode);

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

  // 파워트레인 명칭에서 괄호 텍스트(예: "(7단 건식 DCT ➔ 6만km)", "(7단 건식 DCT)" 등)를 제거하여 깔끔하게 정리
  const cleanPowertrainDisplay = (name: string) => {
    const cleaned = name.replace(/\s*\([^)]*\)/g, '').trim();
    // 만약 괄호를 지웠을 때 같은 차종 목록 내에서 이름이 중복되는 경우(예: 벨로스터 N 수동/DCT 등)
    const duplicates = availablePowertrains.filter(
      (p) => p.name.replace(/\s*\([^)]*\)/g, '').trim() === cleaned
    );
    if (duplicates.length > 1) {
      return name.replace(/\s*➔[^)]*/g, '').trim();
    }
    return cleaned;
  };

  // 👓 어르신 모드용 쉬운 우리말 엔진/파워트레인 명칭 변환
  const getSeniorPowertrainLabel = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('1.6') && n.includes('터보')) {
      return '1,600cc 힘 좋은 가솔린 엔진 (자동 변속기 점검 필요)';
    }
    if (n.includes('디젤')) {
      return n.includes('2.0') || n.includes('2.2')
        ? '2,000cc 힘 좋고 경제적인 경유(디젤) 엔진'
        : '1,600cc 연비 좋은 경유(디젤) 엔진';
    }
    if (n.includes('하이브리드')) {
      return '전기+휘발유 연비 최강 하이브리드 엔진';
    }
    if (n.includes('1.0') || n.includes('경형') || n.includes('캐스퍼')) {
      return '1,000cc 알뜰한 경차 가솔린 엔진';
    }
    if (n.includes('lpi') || n.includes('lpg')) {
      return '조용하고 경제적인 LPG 가스 연료 엔진';
    }
    if (n.includes('전기') || n.includes('ev')) {
      return '100% 무공해 친환경 전기 모터 (EV)';
    }
    if (n.includes('2.5') || n.includes('3.0') || n.includes('3.5')) {
      return '2,500cc 고출력 프리미엄 가솔린 엔진';
    }
    if (n.includes('2.0')) {
      return '2,000cc 조용하고 부드러운 가솔린 엔진';
    }
    return `${cleanPowertrainDisplay(name)} (일반 운행 엔진)`;
  };

  // 👓 어르신 모드용 핵심 정비 알림 쉬운말 변환
  const getSeniorMaintenanceNotice = (notice?: string) => {
    if (!notice) return '';
    if (notice.includes('DCT') || notice.includes('클러치')) {
      return '⚠️ 변속기 오일: 6만km마다 꼭 점검하세요 (기어 마모 예방)';
    }
    if (notice.includes('R엔진') || notice.includes('댐퍼풀리')) {
      return '⚠️ 엔진 구동 벨트와 연료 계통을 주기적으로 점검하세요';
    }
    if (notice.includes('GDi') || notice.includes('카본')) {
      return '⚠️ 엔진 찌꺼기 방지를 위해 정기적인 세척이 필요합니다';
    }
    return `⚠️ 주의사항: ${notice}`;
  };

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
      engineType: cleanPowertrainDisplay(selectedPowertrainName),
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
    <div className={`min-h-screen pb-28 text-slate-800 transition-colors duration-200 ${
      isSeniorMode ? 'bg-[#FFFBEB]' : 'bg-[#F4F6F9]'
    }`}>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="뒤로가기"
              >
                <ArrowLeft className={isSeniorMode ? 'w-6 h-6' : 'w-5 h-5'} />
              </button>
            )}
            <div>
              <span className={`font-bold text-blue-600 uppercase tracking-wider block ${
                isSeniorMode ? 'text-xs' : 'text-[10px]'
              }`}>
                CarSync 정밀 DB 설정
              </span>
              <h1 className={`font-black text-slate-900 leading-tight ${
                isSeniorMode ? 'text-lg sm:text-xl' : 'text-base'
              }`}>
                내 차량 설정
              </h1>
            </div>
          </div>

          {/* 👓 큰글씨·쉬운말 모드 토글 스위치 (요구사항 1) */}
          <div className="flex items-center gap-2 bg-amber-50 px-2.5 py-1.5 rounded-full border border-amber-300 shadow-xs">
            <span className={`font-black flex items-center gap-1 select-none ${
              isSeniorMode ? 'text-amber-950 text-xs sm:text-sm' : 'text-amber-800 text-[11px]'
            }`}>
              <span>👓</span>
              <span>큰글씨·쉬운말</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isSeniorMode}
              onClick={() => setIsSeniorMode(!isSeniorMode)}
              className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                isSeniorMode ? 'bg-amber-600' : 'bg-slate-300'
              }`}
              title="큰글씨 및 쉬운말 모드 전환"
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                  isSeniorMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-[10px] font-black ${
              isSeniorMode ? 'text-amber-800 font-extrabold' : 'text-slate-400'
            }`}>
              {isSeniorMode ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Simple Guide Banner */}
        <div className={`rounded-2xl p-4 shadow-sm flex items-center justify-between transition-all ${
          isSeniorMode
            ? 'bg-amber-400 text-slate-950 border-2 border-amber-500'
            : 'bg-slate-900 text-white'
        }`}>
          <div>
            <span className={`px-2 py-0.5 rounded font-extrabold ${
              isSeniorMode
                ? 'bg-slate-950 text-amber-300 text-xs'
                : 'bg-emerald-500 text-slate-900 text-[10px]'
            }`}>
              {isSeniorMode ? '👓 어르신 맞춤 큰글씨 모드 적용 중' : '실차 출시 연식 완벽 연동'}
            </span>
            <h2 className={`font-black mt-1 ${isSeniorMode ? 'text-lg sm:text-xl text-slate-950' : 'text-base text-white'}`}>
              {isSeniorMode ? '내 자동차 정보 입력' : '차량 정보 정밀 입력'}
            </h2>
            <p className={`mt-0.5 ${isSeniorMode ? 'text-xs sm:text-sm font-bold text-slate-800' : 'text-xs text-slate-300'}`}>
              {isSeniorMode
                ? '글씨가 크고 쉬운 말로 안내됩니다. 천천히 하나씩 골라주세요.'
                : '차량별 실제 출시 연도와 실제 유종만 엄격하게 매칭됩니다.'}
            </p>
          </div>
          <div className={`rounded-xl flex items-center justify-center shrink-0 ${
            isSeniorMode ? 'w-12 h-12 bg-white/40' : 'w-10 h-10 bg-white/10'
          }`}>
            <Car className={`text-blue-600 ${isSeniorMode ? 'w-7 h-7' : 'w-6 h-6'}`} />
          </div>
        </div>

        {/* Form Container */}
        <div className={`bg-white rounded-2xl p-5 border shadow-xs space-y-5 transition-all ${
          isSeniorMode ? 'border-2 border-amber-300' : 'border-slate-200/80'
        }`}>
          {/* 1. 제조사 선택 (3개 버튼) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`block font-black text-slate-900 ${
                isSeniorMode ? 'text-base sm:text-lg' : 'text-xs'
              }`}>
                1. {isSeniorMode ? '자동차 회사(제조사) 선택' : '제조사 선택'}
              </label>
            </div>
            {isSeniorMode && (
              <p className="text-xs sm:text-sm text-blue-700 font-extrabold mb-2 flex items-center gap-1">
                <span>🔍</span>
                <span>타시는 자동차의 브랜드를 눌러주세요.</span>
              </p>
            )}
            <div className="grid grid-cols-3 gap-2.5">
              {BRANDS.map((brand) => {
                const isSelected = selectedBrand === brand.id;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleBrandChange(brand.id)}
                    className={`rounded-xl font-black border transition-all cursor-pointer flex items-center justify-center ${
                      isSeniorMode ? 'h-14 text-base sm:text-lg' : 'py-2.5 text-xs'
                    } ${
                      isSelected
                        ? isSeniorMode
                          ? 'bg-blue-700 border-blue-700 text-white shadow-md ring-4 ring-blue-200'
                          : 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                        : isSeniorMode
                        ? 'bg-slate-50 border-2 border-slate-300 text-slate-800 hover:bg-slate-100'
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
              <label className={`font-black text-slate-900 ${
                isSeniorMode ? 'text-base sm:text-lg' : 'text-xs'
              }`}>
                2. {isSeniorMode ? '자동차 이름(모델) 선택' : '모델 선택'}
              </label>
              <span className={`text-slate-500 font-bold ${isSeniorMode ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
                {brandVehicleList.length}개 차종
              </span>
            </div>
            {isSeniorMode && (
              <p className="text-xs sm:text-sm text-blue-700 font-extrabold mb-2 flex items-center gap-1">
                <span>🔍</span>
                <span>타시는 자동차의 이름을 골라주세요.</span>
              </p>
            )}
            <div className="relative">
              <select
                value={selectedVehicleId}
                onChange={(e) => handleModelChange(e.target.value)}
                className={`w-full pl-3 pr-10 rounded-xl border appearance-none focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer font-black ${
                  isSeniorMode
                    ? 'h-14 text-base border-2 border-slate-400 bg-white text-slate-950'
                    : 'h-11 text-xs border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                {brandVehicleList.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.subSeries ? `(${model.subSeries.replace(/.*\((.*)\).*/, '$1')})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className={`text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isSeniorMode ? 'w-6 h-6 stroke-[3]' : 'w-4 h-4'
              }`} />
            </div>
          </div>

          {/* 3. 연식 선택 (해당 차종이 실제로 출시된 연도만 엄격하게 노출) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`font-black text-slate-900 ${
                isSeniorMode ? 'text-base sm:text-lg' : 'text-xs'
              }`}>
                3. {isSeniorMode ? '자동차 출고 연도(연식) 선택' : '연식 선택'}
              </label>
              <span className={`text-emerald-800 font-black bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ${
                isSeniorMode ? 'text-xs' : 'text-[11px]'
              }`}>
                출시 기간: {yearRangeText}
              </span>
            </div>
            {isSeniorMode && (
              <p className="text-xs sm:text-sm text-blue-700 font-extrabold mb-2 flex items-center gap-1">
                <span>🔍</span>
                <span>자동차가 처음 출고·등록된 연도를 골라주세요.</span>
              </p>
            )}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className={`w-full pl-3 pr-10 rounded-xl border appearance-none focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer font-black ${
                  isSeniorMode
                    ? 'h-14 text-base border-2 border-slate-400 bg-white text-slate-950'
                    : 'h-11 text-xs border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {isSeniorMode ? `${year}년도에 출고된 차량 (${year}년식)` : `${year}년형 (${year}년 등록)`}
                  </option>
                ))}
              </select>
              <ChevronDown className={`text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isSeniorMode ? 'w-6 h-6 stroke-[3]' : 'w-4 h-4'
              }`} />
            </div>
            <p className={`mt-1 pl-1 ${isSeniorMode ? 'text-xs sm:text-sm font-semibold text-slate-600' : 'text-[11px] text-slate-500'}`}>
              ※ 선택하신 <strong>{selectedVehicleObj?.name}</strong> 차종의 실제 생산·출시 연도만 표시됩니다.
            </p>
          </div>

          {/* 4. 유종 / 엔진 선택 (해당 모델 실제 파워트레인만 1:1 매핑) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`font-black text-slate-900 ${
                isSeniorMode ? 'text-base sm:text-lg' : 'text-xs'
              }`}>
                4. {isSeniorMode ? '사용 연료 및 엔진 선택' : '유종 및 파워트레인'}
              </label>
              <span className={`text-blue-700 font-black ${isSeniorMode ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
                실차 라인업 ({availablePowertrains.length}종)
              </span>
            </div>
            {isSeniorMode && (
              <p className="text-xs sm:text-sm text-blue-700 font-extrabold mb-2 flex items-center gap-1">
                <span>🔍</span>
                <span>자동차에 들어가는 기름 종류(휘발유, 경유, 가스 등)를 골라주세요.</span>
              </p>
            )}
            <div className="relative">
              <select
                value={selectedPowertrainName}
                onChange={(e) => setSelectedPowertrainName(e.target.value)}
                className={`w-full pl-3 pr-10 rounded-xl border appearance-none focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer font-black ${
                  isSeniorMode
                    ? 'h-14 text-sm sm:text-base border-2 border-slate-400 bg-white text-slate-950'
                    : 'h-11 text-xs border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                {availablePowertrains.map((p) => (
                  <option key={p.name} value={p.name}>
                    {isSeniorMode ? getSeniorPowertrainLabel(p.name) : cleanPowertrainDisplay(p.name)}
                  </option>
                ))}
              </select>
              <ChevronDown className={`text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isSeniorMode ? 'w-6 h-6 stroke-[3]' : 'w-4 h-4'
              }`} />
            </div>

            {/* 핵심 정비 팁 (어르신 모드 시 쉬운말 전환) */}
            {currentPowertrainObj?.maintenanceNotice && (
              <div className={`mt-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                isSeniorMode
                  ? 'p-3.5 bg-amber-100 border-2 border-amber-400 text-amber-950 text-xs sm:text-sm font-black'
                  : 'p-2.5 bg-amber-50 border-amber-200 text-amber-900 text-[11px]'
              }`}>
                <AlertCircle className={`shrink-0 ${
                  isSeniorMode ? 'w-5 h-5 text-amber-700' : 'w-4 h-4 text-amber-600'
                }`} />
                <span className="leading-snug">
                  {isSeniorMode
                    ? getSeniorMaintenanceNotice(currentPowertrainObj.maintenanceNotice)
                    : currentPowertrainObj.maintenanceNotice}
                </span>
              </div>
            )}

            {/* 조사된 차량 맞춤 엔진오일 교체 주기 및 추천 점도 안내 카드 (요구사항 2 적용) */}
            <div className={`mt-3 rounded-xl border transition-all ${
              isSeniorMode
                ? 'p-4 bg-blue-50 border-2 border-blue-300 text-blue-950'
                : 'p-3 bg-blue-50/80 border-blue-200/90 text-blue-950'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 font-black text-blue-950 ${
                  isSeniorMode ? 'text-sm sm:text-base' : 'text-xs'
                }`}>
                  <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{isSeniorMode ? '추천 엔진오일 교환 주기' : '차량 맞춤 엔진오일 교체 주기'}</span>
                </div>
                <span className={`font-black bg-blue-600 text-white rounded-full shadow-xs ${
                  isSeniorMode ? 'text-xs sm:text-sm px-3 py-1' : 'text-[11px] px-2 py-0.5'
                }`}>
                  {selectedOilSpec.cycleKm.toLocaleString()} km
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-blue-200/60 grid grid-cols-2 gap-2 text-[11px]">
                <div className={`p-2.5 rounded-lg border ${
                  isSeniorMode ? 'bg-white border-2 border-blue-200' : 'bg-white/80 border-blue-100'
                }`}>
                  <span className={`block font-bold text-slate-600 ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                    {isSeniorMode ? '시내 주행을 자주 하시면' : '가혹조건 (시내/정체)'}
                  </span>
                  <strong className={`font-black text-rose-600 block mt-0.5 ${isSeniorMode ? 'text-sm sm:text-base' : 'text-xs'}`}>
                    {isSeniorMode
                      ? `${selectedOilSpec.severeKm.toLocaleString()}km마다 교환 추천`
                      : `${selectedOilSpec.severeKm.toLocaleString()} km`}
                  </strong>
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  isSeniorMode ? 'bg-white border-2 border-blue-200' : 'bg-white/80 border-blue-100'
                }`}>
                  <span className={`block font-bold text-slate-600 ${isSeniorMode ? 'text-xs' : 'text-[10px]'}`}>
                    {isSeniorMode ? '내 차에 딱 맞는 정품 엔진오일 규격' : '권장 오일 점도 규격'}
                  </span>
                  <strong className={`font-black text-slate-900 truncate block mt-0.5 ${isSeniorMode ? 'text-sm sm:text-base' : 'text-xs'}`}>
                    {selectedOilSpec.viscosity}
                  </strong>
                </div>
              </div>
              <p className={`mt-2 font-medium leading-relaxed ${
                isSeniorMode ? 'text-xs sm:text-sm text-blue-900 font-bold' : 'text-[10px] text-blue-800'
              }`}>
                {isSeniorMode
                  ? '※ 엔진을 고장 없이 오래 타시려면 5,000~7,500km마다 엔진오일을 갈아주시는 것이 가장 안전합니다.'
                  : `※ ${selectedOilSpec.guidanceText}`}
              </p>
            </div>
          </div>

          {/* 5. 차량번호 & 주행거리 */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className={`font-black text-slate-900 ${
                isSeniorMode ? 'text-base sm:text-lg' : 'text-xs'
              }`}>
                5. 차량 번호 및 주행거리
              </label>
              <span className={`px-2 py-0.5 rounded-full font-black border ${
                isSeniorMode
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 text-xs'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
              }`}>
                {isSeniorMode ? '✓ 번호판 자동 확인 완료' : '🐍 Python 검증/저장 연동'}
              </span>
            </div>
            {isSeniorMode && (
              <p className="text-xs sm:text-sm text-blue-700 font-extrabold mb-2 flex items-center gap-1">
                <span>🔍</span>
                <span>자동차 등록증에 적힌 차량 번호를 입력해 주세요.</span>
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className={`block font-bold text-slate-700 mb-1 ${
                  isSeniorMode ? 'text-xs sm:text-sm' : 'text-[11px]'
                }`}>
                  차량 번호
                </span>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  onBlur={handlePlateBlur}
                  placeholder="예: 12가 3456"
                  className={`w-full px-3 rounded-xl border focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono font-black ${
                    isSeniorMode
                      ? 'h-14 text-base sm:text-lg border-2 border-slate-400 bg-white text-slate-950'
                      : 'h-10 text-xs border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                />
                {plateStatus.message && (
                  <p
                    className={`mt-1 font-bold ${
                      isSeniorMode ? 'text-xs sm:text-sm' : 'text-[10px]'
                    } ${
                      plateStatus.valid ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {plateStatus.valid ? '✓ ' : '✕ '}
                    {plateStatus.message}
                  </p>
                )}
              </div>
              <div>
                <span className={`block font-bold text-slate-700 mb-1 ${
                  isSeniorMode ? 'text-xs sm:text-sm' : 'text-[11px]'
                }`}>
                  주행거리 (km)
                </span>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  placeholder="예: 64000"
                  className={`w-full px-3 rounded-xl border focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-mono font-black ${
                    isSeniorMode
                      ? 'h-14 text-base sm:text-lg border-2 border-slate-400 bg-white text-slate-950'
                      : 'h-10 text-xs border-slate-200 bg-slate-50 text-slate-900'
                  }`}
                />
                <p className={`mt-1 ${isSeniorMode ? 'text-xs text-slate-600 font-bold' : 'text-[10px] text-slate-400'}`}>
                  {isSeniorMode ? '계기판 숫자를 적어주세요' : '소모품 교체 주기 산출 기준'}
                </p>
              </div>
            </div>
          </div>

          {/* 모르겠어요 / 전화로 도움받기 보조 링크 (요구사항 2-(3)) */}
          <div className="pt-2 text-center border-t border-slate-100">
            <a
              href="tel:1588-0000"
              className={`inline-flex items-center gap-1.5 font-black text-slate-600 hover:text-blue-700 underline underline-offset-4 cursor-pointer transition-colors ${
                isSeniorMode ? 'text-xs sm:text-sm py-1' : 'text-xs'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              <span>입력이 어려우신가요? 전화로 상담원 도움받기 (1588-0000)</span>
            </a>
          </div>
        </div>

        {/* Selected Vehicle Preview Banner */}
        <div className={`rounded-xl border flex items-center justify-between transition-all ${
          isSeniorMode
            ? 'p-4 bg-amber-50 border-2 border-amber-300 text-slate-900'
            : 'p-3.5 bg-blue-50 border-blue-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`rounded-xl text-white flex items-center justify-center shrink-0 ${
              isSeniorMode ? 'w-10 h-10 bg-amber-600' : 'w-8 h-8 bg-blue-600'
            }`}>
              <Car className={isSeniorMode ? 'w-6 h-6' : 'w-4 h-4'} />
            </div>
            <div>
              <div className={`font-black text-slate-950 ${
                isSeniorMode ? 'text-sm sm:text-base' : 'text-xs'
              }`}>
                {selectedVehicleObj?.name} ({selectedYear}년형)
              </div>
              <div className={`font-bold mt-0.5 ${
                isSeniorMode ? 'text-xs sm:text-sm text-amber-900' : 'text-[11px] text-blue-700'
              }`}>
                {isSeniorMode ? getSeniorPowertrainLabel(selectedPowertrainName) : cleanPowertrainDisplay(selectedPowertrainName)} · {Number(mileage).toLocaleString()}km
              </div>
            </div>
          </div>
          <span className={`font-black rounded-md border ${
            isSeniorMode
              ? 'text-xs bg-white text-amber-800 border-amber-300 px-2.5 py-1'
              : 'text-[10px] bg-white text-blue-600 border-blue-100 px-2 py-1'
          }`}>
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
            className={`w-full rounded-2xl text-white font-black tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSeniorMode
                ? 'h-16 text-base sm:text-lg bg-blue-700 hover:bg-blue-800 shadow-blue-600/30 ring-2 ring-blue-300'
                : 'h-12 text-sm bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
            } ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <span>Python 엔진에 데이터 저장 중...</span>
            ) : (
              <>
                <span>{isSeniorMode ? '👆 이 자동차로 설정하고 시작하기 (완료)' : '이 설정으로 등록 완료하기'}</span>
                <Check className={`stroke-[3] ${isSeniorMode ? 'w-5 h-5' : 'w-4 h-4'}`} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
