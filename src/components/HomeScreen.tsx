import React, { useState } from 'react';
import {
  Gauge,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  ExternalLink,
  Car,
  Edit3,
  Bot,
  ChevronRight,
} from 'lucide-react';
import { UserProfile, CorePartDiagnostic } from '../types';
import { MileageEditModal } from './MileageEditModal';
import { GongimModal } from './GongimModal';

interface HomeScreenProps {
  user: UserProfile;
  onOpenBooking: (shop?: any, part?: CorePartDiagnostic) => void;
  onOpenEmergencyGuide: () => void;
  onGoToAiDiagnosis?: () => void;
  onGoToShops?: () => void;
  onLogout: () => void;
  onUpdateMileage: (newMileage: number) => void;
  onOpenVehicleSetup?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  onOpenBooking,
  onOpenEmergencyGuide,
  onGoToAiDiagnosis,
  onGoToShops,
  onLogout,
  onUpdateMileage,
  onOpenVehicleSetup,
}) => {
  const [isMileageModalOpen, setIsMileageModalOpen] = useState(false);
  const [isGongimModalOpen, setIsGongimModalOpen] = useState(false);

  const mileage = user.vehicle.mileage;

    // 7대 핵심 부품 (현재 주행거리에 맞춰 7개 항목 전체에 동일한 진행률 바, 주행거리, 상태 박스 UI 적용)
    const calculatePartStatus = (
      id: string,
      name: string,
      cycleKm: number,
      riskWarning: string,
      normalNote: string
    ) => {
      // 주기 대비 현재 누적 주행거리의 진행 상태 계산 (10만km 주기 부품에 6.4만km 주행 시 64% 진행)
      const isDanger = mileage >= cycleKm * 1.1; // 10% 초과
      const isWarning = mileage >= cycleKm * 0.8 && mileage < cycleKm * 1.1; // 80%~110% 주의 구간
      const isNormal = !isDanger && !isWarning; // 주기 미만 정상 구간

      const status: '위험' | '경고' | '정상' = isDanger ? '위험' : isWarning ? '경고' : '정상';
      const badgeColor: 'danger' | 'warning' | 'normal' = isDanger ? 'danger' : isWarning ? 'warning' : 'normal';

      // 뱃지 및 상태 박스 색상 (상태와 정확히 1:1 일치)
      // 위험 ➔ 붉은색(bg-rose-50 / text-rose-700)
      // 경고 ➔ 푸른색/노란색(bg-blue-50/70 border-blue-200 text-blue-700)
      // 정상 ➔ 에메랄드 녹색(bg-emerald-50/70 border-emerald-200 text-emerald-700)
      const boxBg = isDanger
        ? 'bg-rose-50 border-rose-200'
        : isWarning
        ? 'bg-blue-50/70 border-blue-200'
        : 'bg-emerald-50/70 border-emerald-200';

      const boxText = isDanger
        ? 'text-rose-700'
        : isWarning
        ? 'text-blue-700'
        : 'text-emerald-700';

      // '정상'일 때는 정상 작동 안내 문구가 뜨고, '경고/위험'일 때 위험 경고 문구가 뜸
      const subWarning = isNormal ? normalNote : riskWarning;

      const progressPercent = Math.min(100, Math.round(((mileage % cycleKm === 0 ? cycleKm : mileage % cycleKm) / cycleKm) * 100));

      const exceededText = isDanger
        ? `(${Math.round(mileage - cycleKm).toLocaleString()}km 교체 주기 초과)`
        : isWarning
        ? '(점검 및 교체 준비 필요)'
        : '(정상 작동 중)';

      return {
        id,
        name,
        cycleKm,
        status,
        subWarning,
        currentKmText: `${mileage.toLocaleString()} / ${cycleKm.toLocaleString()} km`,
        exceededText,
        progressPercent,
        badgeColor,
        boxBg,
        boxText,
      };
    };

    const corePartsList = [
      calculatePartStatus(
        'part-belt',
        '동 겉벨트 세트',
        100000,
        '발전기 정지 • 주행 중 멈춤 위험',
        '구동벨트 장력 및 텐셔너 베어링 양호 (정상)'
      ),
      calculatePartStatus(
        'part-transmission',
        '미션오일',
        100000,
        '변속 슬립 • 출력 상실 위험',
        '변속 유압 및 토크컨버터 반응 정상'
      ),
      calculatePartStatus(
        'part-lowerarm',
        '로워암 / 부싱',
        100000,
        '고속 주행 밸런스 붕괴 • 차선 이탈',
        '하체 관절 부싱 탄성 및 조향 유격 양호'
      ),
      calculatePartStatus(
        'part-brake-oil',
        '브레이크 오일',
        40000,
        '베이퍼 록 • 고속 제동력 급상실',
        '수분도 1% 미만 정상 (제동 압력 양호)'
      ),
      calculatePartStatus(
        'part-spark-plug',
        '점화플러그 / 코일',
        100000,
        '실린더 실화 • 급격한 출력 저하',
        '실화 감지 없음 • 정상 점화 연소 중'
      ),
      calculatePartStatus(
        'part-brake-pad',
        '브레이크 패드',
        40000,
        '제동 밀림 • 디스크 파손 예방',
        '잔여 마찰재 두께 7.2mm (양호)'
      ),
      calculatePartStatus(
        'part-coolant',
        '냉각수 (부동액)',
        50000,
        '엔진 과열(오버히트) • 헤드 변형',
        '비중 및 어는점(-35℃) 정상 • 순환 양호'
      ),
    ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-32 selection:bg-blue-100">
      {/* Top Header */}
      <header className="bg-white px-4 py-3.5 border-b border-slate-100 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md md:max-w-3xl lg:max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
                <circle cx="7.5" cy="14.5" r="1.5" />
                <circle cx="16.5" cy="14.5" r="1.5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-blue-600 tracking-tight text-lg leading-none">
                  CarSync
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded ml-1">
                  스마트 진단 관제
                </span>
              </div>
              <p className="text-[11px] text-blue-500 font-medium leading-tight">Home Diagnosis</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>실시간 OBD 연동 중</span>
            </div>
            <button
              onClick={onLogout}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Responsive Breakpoints */}
      <main className="max-w-md md:max-w-3xl lg:max-w-6xl mx-auto px-4 pt-4 lg:pt-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start space-y-3.5 lg:space-y-0">
          
          {/* Left Column (Mobile: top stack, Desktop: left dashboard column) */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-3.5 lg:sticky lg:top-20">
            {/* Vehicle Badge Card with Prominent '차량 수정' button */}
            <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-slate-900 text-base">
                        {user.vehicle.model || '카니발 (기아)'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200">
                        {user.vehicle.year || 2021}년형
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold mt-1">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                        {user.vehicle.plateNumber || '12가 3456'}
                      </span>
                      <span className="text-slate-400 mx-1.5">|</span>
                      <span>{user.vehicle.engineType || '디젤 (자동변속기)'}</span>
                    </p>
                  </div>
                </div>

                {/* Prominent '차량 수정' Action Button */}
                {onOpenVehicleSetup && (
                  <button
                    onClick={onOpenVehicleSetup}
                    id="btn-edit-vehicle"
                    className="shrink-0 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-sm shadow-blue-500/25 transition-all flex items-center gap-1.5"
                    title="등록된 차량 정보를 변경하거나 다른 차량으로 수정합니다"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>차량 수정</span>
                  </button>
                )}
              </div>

              {/* Vehicle Sub-info & Realtime Sync Notice */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>차량 변경 시 부품 수명 및 고질병 진단 기준이 즉시 자동 재계산됩니다.</span>
                </div>
                <span className="font-semibold text-blue-600 hidden sm:inline">실시간 연동</span>
              </div>
            </section>

            {/* Mileage Card */}
            <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Gauge className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold">내 차 주행거리</span>
                </div>
                <span className="text-[11px] text-slate-400">기준 : km</span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-mono">
                    {mileage.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-600">km</span>
                </div>

                <button
                  onClick={() => setIsMileageModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>수정</span>
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>최근 업데이트: 오늘 · 평균 주행거리 대비 진단 기준 자동 적용</span>
              </div>
            </section>

            {/* Highway 2nd Accident Prevention 7 Core Parts Banner */}
            <div
              onClick={onOpenEmergencyGuide}
              className="bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl p-4 cursor-pointer hover:bg-[#FFEBEB] transition-all shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-red-700 text-sm tracking-tight flex items-center gap-1.5">
                    고속도로 2차 사고 방지 핵심 7대 부품 (냉각수 포함)
                  </h3>
                  <p className="text-xs text-red-500 mt-1 leading-snug">
                    고속 주행 중 동력 상실, 오버히트 및 조향 불능을 유발하는 치명 부품 정밀 분석
                  </p>
                </div>
              </div>
            </div>

            {/* AI 이상 소음/냄새 실시간 진단 챗봇 바로가기 배너 */}
            <div
              onClick={onGoToAiDiagnosis}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all shadow-xs flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-white text-sm">
                      ai 카싱크 진단 챗봇
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-slate-900 text-[10px] font-black">
                      7대 부품 Q&A
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 mt-0.5">
                    이상 증상 분석 및 제때 안 갈면 생기는 치명적 손상 안내
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* Quick Utility Card (공임나라 표준 공임비 비교 & 전국 가맹점) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">공임나라</span>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                      표준공임
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                    부품 직접 구매 후 표준 공임비 비교 & 전국 가맹점 예약
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsGongimModalOpen(true)}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>예약하기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 정비 예약 안내 와이어프레임 카드 (CarSync Maintenance Reservation Policy) */}
            <section className="bg-white rounded-2xl border-2 border-slate-800 shadow-sm overflow-hidden">
              {/* Header Box */}
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="font-black text-sm tracking-tight text-white">정비 예약 안내</h3>
                </div>
                <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-slate-200">
                  CarSync 공통 규정
                </span>
              </div>

              {/* Body Content */}
              <div className="p-4 space-y-4 text-slate-800 bg-[#FAFAFA]/60">
                {/* Notice Subtitle */}
                <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200/80">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-extrabold text-xs">⚠️ 카싱크 정밀 정비 예약 규정</span>
                </div>

                {/* 1. 100% 사전 부품 수급제 (D-2 예약 필수) */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>100% 사전 부품 수급제 (D-2 예약 필수)</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 pl-5 list-disc leading-relaxed">
                    <li>
                      <strong className="text-slate-800">고위험 핵심 순정·OE 부품의 안전한 확보</strong>를 위해 최소 방문 2일 전(D-2) 예약을 원칙으로 합니다.
                    </li>
                    <li>
                      부품 부재로 인한 <strong className="text-slate-800">작업 딜레이 및 리프트 묶임을 원천 차단</strong>합니다.
                    </li>
                  </ul>
                </div>

                {/* 2. 노쇼 방지 예약 보증금 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>노쇼 방지 예약 보증금</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 pl-5 list-disc leading-relaxed">
                    <li>
                      <strong className="text-slate-900">예약금: 10,000원</strong>
                    </li>
                    <li>
                      정비 완료 시 <strong className="text-blue-700">최종 후결제 금액에서 전액 공제</strong>됩니다.
                    </li>
                  </ul>
                </div>

                {/* 3. 현장 리프트 점검 후 투명 정산 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>현장 리프트 점검 후 투명 정산</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 pl-5 list-disc leading-relaxed">
                    <li>
                      하부 볼트 부식·고착 등 리프트 점검 변수는 <strong className="text-slate-800">음성·사진 리포트 승인 후 투명하게 정산</strong>됩니다.
                    </li>
                  </ul>
                </div>

                {/* Direct Action Button */}
                <button
                  type="button"
                  onClick={() => onOpenBooking()}
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>D-2 사전 부품 확보 정밀 정비 예약하기</span>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column (Mobile: below, Desktop: main diagnostic feed) */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-3.5">
            {/* Desktop section title */}
            <div className="hidden lg:flex items-center justify-between pb-1">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  실시간 부품 상태 정밀 분석
                </h2>
                <p className="text-xs text-slate-500">
                  누적 {mileage.toLocaleString()}km 주행 기준 소모 및 노후 위험도 분석
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                7개 핵심 항목 진단 완료
              </span>
            </div>

            {/* 7 Core Parts Diagnostic Analysis List */}
            <div className="grid grid-cols-1 gap-3">
              {corePartsList.map((part, index) => {
                const isDanger = part.badgeColor === 'danger';
                const isWarning = part.badgeColor === 'warning';
                const isNormal = part.badgeColor === 'normal';

                return (
                  <div
                    key={part.id}
                    onClick={() =>
                      onOpenBooking(undefined, {
                        id: index + 1,
                        name: part.name,
                        subName: part.name,
                        category: '엔진/구동',
                        urgency: isDanger ? 'urgent' : isWarning ? 'warning' : 'safe',
                        statusTitle: part.status,
                        riskDescription: part.subWarning,
                        replacementCycleKm: part.cycleKm,
                        lastInspectedKm: 95000,
                        estimatedCost: '120,000 ~ 190,000원',
                        partPrice: 70000,
                        laborCost: 50000,
                        highwayRisk: part.subWarning,
                        cycleKm: `${part.cycleKm / 10000}만km 주기`,
                        soundTitle: '이상 소음',
                        soundDescriptions: [part.subWarning],
                        smellTitle: '이상 냄새',
                        smellDescription: part.subWarning,
                        highwayRiskLevel: isDanger ? 'critical' : isWarning ? 'high' : 'medium',
                        highwayRiskText: part.subWarning,
                        symptomType: 'both',
                        icon: 'RotateCw',
                      })
                    }
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Part Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">
                          {index + 1}. {part.name}
                        </span>
                        <span className="text-xs text-slate-400">({part.cycleKm / 10000}만km)</span>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isDanger
                            ? 'bg-rose-100 text-rose-700'
                            : isWarning
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isDanger
                              ? 'bg-rose-600'
                              : isWarning
                              ? 'bg-blue-600'
                              : 'bg-emerald-600'
                          }`}
                        />
                        <span>{part.status}</span>
                      </div>
                    </div>

                    {/* Sub Warning Box */}
                    <div
                      className={`mt-2.5 p-2.5 rounded-xl border text-xs flex items-center justify-between ${part.boxBg}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isNormal && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                        {!isNormal && <span className="text-slate-400 font-mono">↳</span>}
                        <span className={`font-semibold ${part.boxText}`}>{part.subWarning}</span>
                      </div>
                    </div>

                    {/* Progress Bar & Mileage Label (7개 모든 부품에 3번처럼 일관된 게이지 및 주행거리 표시) */}
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDanger
                              ? 'bg-rose-500'
                              : isWarning
                              ? 'bg-blue-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${part.progressPercent}%` }}
                        />
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-500">{part.currentKmText}</span>
                        {part.exceededText && (
                          <span
                            className={`font-semibold ${
                              isDanger
                                ? 'text-rose-600'
                                : isWarning
                                ? 'text-blue-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {part.exceededText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <MileageEditModal
        isOpen={isMileageModalOpen}
        currentMileage={mileage}
        onClose={() => setIsMileageModalOpen(false)}
        onSave={(newVal) => onUpdateMileage(newVal)}
      />

      <GongimModal
        isOpen={isGongimModalOpen}
        onClose={() => setIsGongimModalOpen(false)}
      />
    </div>
  );
};
