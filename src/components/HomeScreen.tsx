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
  Droplets,
  Info,
  Clock,
  Phone,
  MapPin,
  Calendar,
  X,
  Sparkles,
  History,
  Star,
  ShieldCheck,
  Navigation as NavigationIcon,
  Radio,
  Compass,
  ChevronLeft,
  RefreshCw,
  ChevronDown,
  Zap,
  Home,
} from 'lucide-react';
import { UserProfile, CorePartDiagnostic } from '../types';
import { MileageEditModal } from './MileageEditModal';
import { GongimModal } from './GongimModal';
import {
  getEngineOilCycleInfo,
  getTransmissionCycleInfo,
  getSparkPlugCycleInfo,
} from '../data/carModelsDatabase';
import { CORE_PARTS, REPAIR_SHOPS } from '../data/mockData';

export interface DetailingShop {
  id: string;
  name: string;
  washType: 'steam' | 'high_pressure';
  badge?: string;
  badgeType?: 'badge' | 'star';
  tags: { text: string; bg: string; color: string }[];
  satisfaction: number;
  logo: string;
  afterImage: string;
  processImage: string;
  category: 'polish' | 'interior' | 'detailing';
  region: string;
  distance: string;
  landmark: string;
  address: string;
  phone: string;
  description: string;
}

export const DETAILING_SHOPS: DetailingShop[] = [
  // 1. 스팀 세차 매장 5곳 (서초동 중심)
  {
    id: 'shop-1',
    name: '스팀보이 서초교대점',
    washType: 'steam',
    badge: '인기',
    badgeType: 'badge',
    tags: [
      { text: '#고온스팀세차', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#정밀실내크리닝', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#에어컨살균', bg: 'bg-slate-100', color: 'text-slate-600' }
    ],
    satisfaction: 98,
    logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&h=100&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&fit=crop',
    processImage: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500&fit=crop',
    category: 'interior',
    region: '서울 서초구 서초동',
    distance: '0.3km',
    landmark: '남부터미널역 350m',
    address: '서울 서초구 사임당로 143 1층',
    phone: '02-582-8833',
    description: '180도 고온 살균 스팀 분사로 찌든 때와 세균, 에어컨 냄새 99.9% 완벽 박멸'
  },
  {
    id: 'shop-2',
    name: '루페스 빅풋 디테일링센터 서초',
    washType: 'steam',
    badge: '프리미엄',
    badgeType: 'badge',
    tags: [
      { text: '#광택전문', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#유리막코팅', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#이탈리아루페스', bg: 'bg-slate-100', color: 'text-slate-600' }
    ],
    satisfaction: 99,
    logo: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100&h=100&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500&fit=crop',
    processImage: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&fit=crop',
    category: 'polish',
    region: '서울 서초구 서초동',
    distance: '0.4km',
    landmark: '교대역 450m',
    address: '서울 서초구 반포대로28길 52 1층',
    phone: '02-588-7201',
    description: '이탈리아 명품 루페스 정밀 광택기 및 스팀 딥클렌징 기반의 하이엔드 복원 시공'
  },
  {
    id: 'shop-3',
    name: '모터스킨 서초본점',
    washType: 'steam',
    badge: '⭐',
    badgeType: 'star',
    tags: [
      { text: '#광택전문', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#유리막코팅', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#스팀수성광택', bg: 'bg-slate-100', color: 'text-slate-600' }
    ],
    satisfaction: 98,
    logo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=100&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&fit=crop',
    processImage: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500&fit=crop',
    category: 'polish',
    region: '서울 서초구 서초동',
    distance: '0.3km',
    landmark: '서초역 350m',
    address: '서울 서초구 서초대로38길 65 1층',
    phone: '02-523-9942',
    description: '스팀 딥클렌징 전처리와 듀얼 액션 수성 광택 및 나노 세라믹 유리막 코팅 전문'
  },
  {
    id: 'shop-4',
    name: '맨케이브 디테일링 서초점',
    washType: 'steam',
    badge: '프리미엄',
    badgeType: 'badge',
    tags: [
      { text: '#스팀살균크리닝', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#유리막코팅', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#친환경약재', bg: 'bg-slate-100', color: 'text-slate-600' }
    ],
    satisfaction: 97,
    logo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&h=100&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=500&fit=crop',
    processImage: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=500&fit=crop',
    category: 'interior',
    region: '서울 서초구 서초동',
    distance: '0.5km',
    landmark: '예술의전당 300m',
    address: '서울 서초구 효령로52길 31 1층',
    phone: '02-597-2210',
    description: '인체 무해 친환경 약재와 고온 스팀을 이용한 프리미엄 실내 케어 & 코팅 전문'
  },
  {
    id: 'shop-5',
    name: '소낙스 카케어 서초양재점',
    washType: 'steam',
    badge: '인기',
    badgeType: 'badge',
    tags: [
      { text: '#독일소낙스', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#스팀살균', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#유리막코팅', bg: 'bg-slate-100', color: 'text-slate-600' }
    ],
    satisfaction: 96,
    logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&h=100&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&fit=crop',
    processImage: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&fit=crop',
    category: 'polish',
    region: '서울 서초구 양재동',
    distance: '1.8km',
    landmark: '양재시민의숲역 400m',
    address: '서울 서초구 매헌로 46 소낙스빌딩',
    phone: '02-573-9104',
    description: '독일 정품 소낙스 스팀 케어 기반의 듀얼 광택 및 세라믹 코팅 도장면 딥케어'
  },

  // 2. 고압수 세차 매장 5곳 (서초동 중심)
  {
    id: 'shop-6',
    name: '더클래스 오토스파 서초점',
    washType: 'high_pressure',
    badge: '프리미엄',
    badgeType: 'badge',
    tags: [
      { text: '#초고압수세차', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#철분제거', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#유막제거·발수', bg: 'bg-slate-100', color: 'text-slate-600' }
    ],
    satisfaction: 98,
    logo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&h=100&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=500&fit=crop',
    processImage: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=500&fit=crop',
    category: 'detailing',
    region: '서울 서초구 서초동',
    distance: '0.5km',
    landmark: '서초역 500m',
    address: '서울 서초구 서초대로42길 28',
    phone: '02-525-1120',
    description: '최고급 초고압수 노즐과 스노우폼 기본 도포, 도장면 철분제거 & 유막제거 전문'
  },
  {
    id: 'shop-7',
    name: '오토글로스 서초점',
    washType: 'high_pressure',
    badge: '⭐',
    badgeType: 'star',
    tags: [
      { text: '#고압수세차', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#유리막코팅', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#유막제거', bg: 'bg-slate-100', color: 'text-slate-600' }
    ],
    satisfaction: 97,
    logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=100&h=100&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500&fit=crop',
    processImage: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&fit=crop',
    category: 'detailing',
    region: '서울 서초구 서초동',
    distance: '0.4km',
    landmark: '교대역 400m',
    address: '서울 서초구 서초중앙로 85 1층',
    phone: '02-585-6320',
    description: '맞춤형 고압수 워시미트와 단독 드라잉 부스, 꼼꼼한 유리 유막제거 및 유리발수'
  },
  {
    id: 'shop-8',
    name: '샤인스튜디오 서초방배점',
    washType: 'high_pressure',
    badge: '⭐',
    badgeType: 'star',
    tags: [
      { text: '#광택전문', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#스월마크복원', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#철분제거', bg: 'bg-slate-100', color: 'text-slate-600' }
    ],
    satisfaction: 97,
    logo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=100&h=100&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&fit=crop',
    processImage: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500&fit=crop',
    category: 'polish',
    region: '서울 서초구 방배동',
    distance: '0.8km',
    landmark: '내방역 250m',
    address: '서울 서초구 방배로 162 1층',
    phone: '02-536-4488',
    description: '고압수 린스와 스노우폼 기본 도포, 도장면 철분제거 및 스월마크 완벽 복원 수성 광택'
  },
  {
    id: 'shop-9',
    name: '마스터피스 디테일링 반포점',
    washType: 'high_pressure',
    badge: '프리미엄',
    badgeType: 'badge',
    tags: [
      { text: '#광택전문', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#유리막코팅', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#유리발수', bg: 'bg-slate-100', color: 'text-slate-600' }
    ],
    satisfaction: 99,
    logo: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100&h=100&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&fit=crop',
    processImage: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500&fit=crop',
    category: 'polish',
    region: '서울 서초구 반포동',
    distance: '1.5km',
    landmark: '고속터미널역 600m',
    address: '서울 서초구 사평대로 205 1층',
    phone: '02-532-7123',
    description: '초고압수 린스 부스에서 진행되는 하이엔드 수성 광택, 유리막 코팅 및 전면 유리발수'
  },
  {
    id: 'shop-10',
    name: '모터샤인 서초양재점',
    washType: 'high_pressure',
    badge: '인기',
    badgeType: 'badge',
    tags: [
      { text: '#고압수세차', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#철분제거', bg: 'bg-[#bef264]', color: 'text-slate-900' },
      { text: '#유막제거', bg: 'bg-slate-100', color: 'text-slate-600' }
    ],
    satisfaction: 94,
    logo: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100&h=100&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500&fit=crop',
    processImage: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=500&fit=crop',
    category: 'detailing',
    region: '서울 서초구 양재동',
    distance: '1.9km',
    landmark: '양재역 500m',
    address: '서울 서초구 남부순환로350길 18 1층',
    phone: '02-571-0945',
    description: '사계절 온수 고압수 세척과 스노우폼 기본 분사, 도장면 철분제거 및 전면 유리 유막제거'
  }
];

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
  const [isRecentShopModalOpen, setIsRecentShopModalOpen] = useState(false);
  const [isGpsScanning, setIsGpsScanning] = useState(false);
  const [gpsScanStep, setGpsScanStep] = useState(1);
  const [isDetailingModalOpen, setIsDetailingModalOpen] = useState(false);
  const [selectedWashTab, setSelectedWashTab] = useState<'steam' | 'high_pressure'>('steam');
  const [selectedDetailingRegion, setSelectedDetailingRegion] = useState<string>('전체 (서초구)');
  const [isDetailingRegionOpen, setIsDetailingRegionOpen] = useState<boolean>(false);
  const [quoteShop, setQuoteShop] = useState<DetailingShop | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>(['초고압수 디테일링']);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isQuoteSuccess, setIsQuoteSuccess] = useState<boolean>(false);
  const [isDetailingGpsScanning, setIsDetailingGpsScanning] = useState<boolean>(false);
  const [detailingGpsAddress, setDetailingGpsAddress] = useState<string>('서울 서초구 서초대로 (서초역 3번 출구)');
  const [gpsScanToast, setGpsScanToast] = useState<boolean>(false);

  const handleRefreshDetailingGps = () => {
    setIsDetailingGpsScanning(true);
    setTimeout(() => {
      setIsDetailingGpsScanning(false);
      setDetailingGpsAddress('서울 서초구 효령로 (현위치 수신완료 📍)');
      setGpsScanToast(true);
      setTimeout(() => setGpsScanToast(false), 3000);
    }, 700);
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteShop(null);
    setIsQuoteSuccess(true);
    setTimeout(() => {
      setIsQuoteSuccess(false);
    }, 3500);
  };

  const getServicesForShop = (shop: DetailingShop | null) => {
    if (!shop) return ['초고압수 디테일링', '철분제거', '유막제거', '유리발수'];
    if (shop.washType === 'high_pressure') {
      // 고압수 세차 전문점: 스노우폼 기본 포함, 엔진룸케어/하부세척 제외, 철분제거/유막제거/유리발수/광택/코팅
      return ['초고압수 디테일링', '철분제거', '유막제거', '유리발수', '수성 광택', '유리막 코팅'];
    }
    // 스팀 세차 전문점:
    return ['정밀 고온 스팀세차', '실내 오존 스팀 살균', '가죽 시트 코팅', '스팀 수성 광택·유리막 코팅', '담배 냄새 탈취', '엔진룸 스팀 세척'];
  };

  const handleOpenQuoteModal = (shop: DetailingShop) => {
    setQuoteShop(shop);
    const services = getServicesForShop(shop);
    setSelectedServices([services[0]]);
  };

  const handleOpenDetailingMap = (shop: DetailingShop) => {
    const query = encodeURIComponent(`${shop.name} ${shop.address}`);
    window.open(`https://map.naver.com/v5/search/${query}`, '_blank');
  };

  const detailingRegionOptions = ['전체 (서초구)', '서초동', '방배동', '반포동', '양재동', '잠원동'];
  const filteredDetailingShops = DETAILING_SHOPS.filter((shop) => {
    const matchWash = shop.washType === selectedWashTab;
    const matchRegion = selectedDetailingRegion === '전체 (서초구)' || shop.region.includes(selectedDetailingRegion);
    return matchWash && matchRegion;
  });

  // 실시간 위치 기반 내 주변 카센타 찾기 (서초동 실시간 GPS 연출 후 '내 주변 정비소' 화면으로 직행!)
  const handleOpenNearbyShops = () => {
    setIsGpsScanning(true);
    setGpsScanStep(1);

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { timeout: 400 }
      );
    }

    setTimeout(() => {
      setGpsScanStep(2);
    }, 180);

    setTimeout(() => {
      setGpsScanStep(3);
    }, 380);

    setTimeout(() => {
      setIsGpsScanning(false);
      if (onGoToShops) {
        onGoToShops(); // 사용자가 올린 '내 주변 착한 동네 카센타' 화면으로 바로 전환!
      }
    }, 550);
  };

  const mileage = user.vehicle.mileage;

    // 차종 및 파워트레인별 정밀 조사된 엔진오일 스펙 도출
    const oilSpec = getEngineOilCycleInfo(user.vehicle.model, user.vehicle.engineType);
    const engineOilCycleKm = user.vehicle.engineOilCycleKm || oilSpec.cycleKm;
    const engineOilViscosity = user.vehicle.engineOilViscosity || oilSpec.viscosity;
    const engineOilSevereKm = user.vehicle.engineOilSevereKm || oilSpec.severeKm;
    const engineOilGuidance = user.vehicle.engineOilGuidance || oilSpec.guidanceText;

    // 차종 및 변속기별(DCT 6만km, IVT 7만km, 일반 AT 10만km) 정밀 조사된 미션오일 스펙 도출
    const transSpec = getTransmissionCycleInfo(
      user.vehicle.model,
      user.vehicle.engineType,
      user.vehicle.transmission
    );

    // 차종 및 엔진별(터보 7만km, 디젤 예열플러그 등) 점화플러그 스펙 도출
    const plugSpec = getSparkPlugCycleInfo(user.vehicle.model, user.vehicle.engineType);

    // 8대 핵심 부품 (현재 주행거리에 맞춰 항목 전체에 동일한 진행률 바, 주행거리, 상태 박스 UI 적용)
    const calculatePartStatus = (
      id: string,
      name: string,
      cycleKm: number,
      riskWarning: string,
      normalNote: string
    ) => {
      // 주기 대비 현재 누적 주행거리의 진행 상태 계산
      const isDanger = mileage >= cycleKm * 1.1; // 10% 초과
      const isWarning = mileage >= cycleKm * 0.8 && mileage < cycleKm * 1.1; // 80%~110% 주의 구간
      const isNormal = !isDanger && !isWarning; // 주기 미만 정상 구간

      const status: '위험' | '경고' | '정상' = isDanger ? '위험' : isWarning ? '경고' : '정상';
      const badgeColor: 'danger' | 'warning' | 'normal' = isDanger ? 'danger' : isWarning ? 'warning' : 'normal';

      // 뱃지 및 상태 박스 색상 (상태와 정확히 1:1 일치)
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
        'part-engine-oil',
        '엔진오일 세트',
        engineOilCycleKm,
        '엔진 유막 파괴 • 실린더 고착(엔진 블로우) 위험',
        `권장 주기 ${engineOilCycleKm.toLocaleString()}km (${engineOilViscosity})`
      ),
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
        transSpec.cycleKm,
        transSpec.riskWarning,
        transSpec.normalNote
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
        plugSpec.name,
        plugSpec.cycleKm,
        plugSpec.riskWarning,
        plugSpec.normalNote
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
    <div className="min-h-screen bg-[#F4F6F9] pb-10 selection:bg-blue-100">
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

          <div className="flex items-center gap-2 sm:gap-3">
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

                {/* Action Buttons: 차량 수정 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenVehicleSetup && (
                    <button
                      onClick={onOpenVehicleSetup}
                      id="btn-edit-vehicle"
                      className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-sm shadow-blue-500/25 transition-all flex items-center gap-1.5"
                      title="등록된 차량 정보를 변경하거나 다른 차량으로 수정합니다"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>차량 수정</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Engine Oil Custom Spec Banner */}
              <div className="mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-amber-950 text-xs">엔진오일 맞춤 주기:</span>
                      <span className="font-black text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded text-[11px]">
                        {engineOilCycleKm.toLocaleString()} km
                      </span>
                      <span className="text-slate-600 text-[10px] font-semibold">
                        (가혹: {engineOilSevereKm.toLocaleString()}km | 점도: {engineOilViscosity})
                      </span>
                    </div>
                    <p className="text-slate-600 text-[10px] mt-0.5 truncate">{engineOilGuidance}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Sub-info & Realtime Sync Notice */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>차량 변경 시 부품 수명 및 엔진오일 주기가 즉시 자동 재계산됩니다.</span>
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

            {/* NEW: 프리미엄 디테일링 1:1 매칭 배너 */}
            <div
              onClick={() => setIsDetailingModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all shadow-xs flex items-center justify-between group border border-emerald-400/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <Sparkles className="w-6 h-6 text-emerald-200 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm sm:text-base">
                    가까운 디테일링 매칭
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-300 text-slate-950 text-[10px] font-black">
                    공식인증 4.9★
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>

            {/* NEW: 최근에 방문한 카센터 카드 (Recently Visited Car Center) */}
            <div className="bg-white rounded-2xl p-4 border border-emerald-200/90 bg-gradient-to-br from-white via-white to-emerald-50/40 shadow-xs space-y-2.5 hover:border-emerald-400 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black text-emerald-800 tracking-wider">
                    최근에 방문한 카센터
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    D-1 정비 완료
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">2026.10.12 방문</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                    <Wrench className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-slate-900 font-black text-sm sm:text-base">
                        동일모터스
                      </strong>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded">
                        2번 테크베이
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      담당: <b className="text-slate-800">김진우 명장</b> · 미션오일 순환식 완료
                    </p>
                  </div>
                </div>

                <button
                  id="recent-shop-detail-btn"
                  onClick={() => setIsRecentShopModalOpen(true)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>내역 보기</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 truncate">
                  📍 서울 서초구 효령로 152 (380m)
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const targetShop = REPAIR_SHOPS.find((s) => s.name.includes('동일')) || REPAIR_SHOPS[0];
                      onOpenBooking(targetShop);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5"
                  >
                    <span>다시 예약</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  {onGoToShops && (
                    <button
                      onClick={onGoToShops}
                      className="text-slate-400 hover:text-slate-600 text-[10px] underline ml-1"
                    >
                      다른 정비소 찾기
                    </button>
                  )}
                </div>
              </div>
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

                {/* Direct Action Button: 내주변 카센타 (서초동 실시간 위치 기반) */}
                <button
                  type="button"
                  onClick={handleOpenNearbyShops}
                  disabled={isGpsScanning}
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-slate-700/80 hover:border-emerald-500/60 group relative overflow-hidden"
                >
                  {/* GPS Pulse Dot */}
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm tracking-tight font-extrabold text-white">내주변 카센타</span>
                  <span className="text-[10px] bg-slate-800 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    서초동 GPS 실시간
                  </span>
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
                8개 핵심 항목 진단 완료
              </span>
            </div>

            {/* 8 Core Parts Diagnostic Analysis List */}
            <div className="grid grid-cols-1 gap-3">
              {corePartsList.map((part, index) => {
                const isDanger = part.badgeColor === 'danger';
                const isWarning = part.badgeColor === 'warning';
                const isNormal = part.badgeColor === 'normal';

                // CORE_PARTS 데이터베이스에서 매칭 부품 추출
                const matchedDbPart =
                  CORE_PARTS.find((p) => p.name.includes(part.name) || part.name.includes(p.name)) ||
                  (part.id === 'part-engine-oil' ? CORE_PARTS.find((p) => p.id === 8) : undefined);

                const cycleKmLabel =
                  part.cycleKm >= 10000
                    ? `${(part.cycleKm / 10000).toFixed(part.cycleKm % 10000 === 0 ? 0 : 1)}만km`
                    : `${(part.cycleKm / 1000).toFixed(0)}천km`;

                return (
                  <div
                    key={part.id}
                    onClick={() =>
                      onOpenBooking(
                        undefined,
                        matchedDbPart || {
                          id: index + 1,
                          name: part.name,
                          subName: part.name,
                          category: '엔진/구동계',
                          cycleKm: `${cycleKmLabel} 주기`,
                          soundTitle: '이상 소음',
                          soundDescriptions: [part.subWarning],
                          smellTitle: '이상 냄새',
                          smellDescription: part.subWarning,
                          highwayRiskLevel: isDanger ? 'critical' : isWarning ? 'high' : 'medium',
                          highwayRiskText: part.subWarning,
                          estimatedCost: '55,000 ~ 120,000원',
                          symptomType: 'both',
                          icon: part.id === 'part-engine-oil' ? 'Droplets' : 'RotateCw',
                        }
                      )
                    }
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Part Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">
                          {index + 1}. {part.name}
                        </span>
                        <span className="text-xs text-slate-400">({cycleKmLabel})</span>
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

            {/* Core Parts Section Footer Detailing Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/40 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    부품 점검과 함께하는 프리미엄 디테일링 케어
                  </h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    엔진룸 오일 슬러지 고온 세척부터 하체 염화칼슘 방청까지 1:1 전담 매칭
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailingModalOpen(true)}
                id="btn-parts-detailing"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>디테일링 매칭 신청</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button (FAB): 우측 하단 고정 디테일링 매칭 버튼 */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsDetailingModalOpen(true)}
          id="btn-fab-detailing"
          className="group relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm rounded-full shadow-xl shadow-emerald-900/40 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-emerald-300/60 cursor-pointer"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <Sparkles className="w-4 h-4 text-emerald-100 animate-pulse" />
          <span>디테일링 1:1 매칭</span>
          <span className="bg-emerald-950/50 text-[10px] text-emerald-200 px-1.5 py-0.5 rounded-full font-bold ml-0.5">
            4.9★
          </span>
        </button>
      </div>

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

      {/* 최근 방문 정비소 상세 내역 및 점검 리포트 모달 */}
      {isRecentShopModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">최근 방문 정비소 점검 내역</h3>
                  <p className="text-[11px] text-emerald-300">동일모터스 · 테크베이 2번 리프트</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecentShopModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-5 overflow-y-auto space-y-4 text-slate-800 text-xs">
              
              {/* Shop & Mechanic Profile Card */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-black text-slate-900">동일모터스</strong>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                      단골 안심 정비소
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    담당 정비사: <b className="text-slate-800">김진우 명장</b> (자동차정비기능장 · 경력 24년)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    📍 서울 서초구 효령로 152 (내 위치에서 380m)
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">방문 일시</span>
                  <span className="font-bold text-slate-800">2026.10.12 (어제)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">정비 완료 출고</span>
                </div>
              </div>

              {/* Maintenance Summary Box */}
              <div>
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>시공 완료 항목 및 점검 소견</span>
                </h4>

                <div className="space-y-2">
                  {/* Item 1 */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>1. 미션오일 순환식 정밀 교환 (16L 합성유)</span>
                      <span className="text-blue-600">완료</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      신유 치환율 96% 달성, 밸브바디 슬러지 세정 및 변속 슬립 완벽 해결. (다음 권장: 21만km)
                    </p>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="text-rose-700">2. 하부 너클 크랙 &amp; 로어암 부싱 교체 (STOP &amp; HOLD)</span>
                      <span className="text-rose-600">긴급 승인 완료</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      리프트 작업 중 3.2cm 미세 크랙 발견 ➔ 차주 카카오 알림톡 긴급 승인 후 순정 부품 교체 및 규격 토크 체결 완료.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mechanic Memo */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <span className="font-bold text-amber-800 text-[11px] block">👨‍🔧 김진우 명장 실시간 작업 소견</span>
                <p className="text-[11px] text-amber-950 mt-1 leading-relaxed">
                  “하부 유격과 변속 충격이 모두 말끔히 사라졌습니다. 다음 엔진오일 교환 주기(122,000km)까지 안심하고 고속 주행하셔도 좋습니다.”
                </p>
              </div>

              {/* Payment Summary */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">정비 결제 금액 (보증 공임 할인)</span>
                  <span className="text-base font-black text-emerald-400">280,000원</span>
                </div>
                <span className="text-[11px] text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg">
                  카드 승인 완료
                </span>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <a
                href="tel:02-585-6444"
                className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>전화 상담</span>
              </a>

              <div className="flex items-center gap-2">
                {onGoToShops && (
                  <button
                    onClick={() => {
                      setIsRecentShopModalOpen(false);
                      onGoToShops();
                    }}
                    className="px-3 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                  >
                    주변 정비소 목록
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsRecentShopModalOpen(false);
                    const targetShop = REPAIR_SHOPS.find((s) => s.name.includes('동일')) || REPAIR_SHOPS[0];
                    onOpenBooking(targetShop);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>동일모터스 다시 예약</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 실시간 GPS 위치 탐색 레이더 오버레이 */}
      {isGpsScanning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            {/* Radar Animation Icon */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500/30"></span>
              <span className="animate-pulse absolute inline-flex h-14 w-14 rounded-full bg-emerald-500/40"></span>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/40">
                <Radio className="w-6 h-6 animate-spin text-white" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold rounded-full">
                실시간 위치 서비스 연동 중
              </span>
              <h4 className="text-base font-extrabold text-white">
                {gpsScanStep === 1 && '🛰️ 위성 GPS 신호 수신 중...'}
                {gpsScanStep === 2 && '📍 현재 위치 감지: 서울시 서초구 서초동'}
                {gpsScanStep === 3 && '✅ 서초동 반경 1.5km 카센타 10곳 스캔 완료!'}
              </h4>
              <p className="text-xs text-slate-400">
                {gpsScanStep === 1 && '내 기기의 GPS 좌표를 기반으로 주변 정비소를 탐색합니다.'}
                {gpsScanStep === 2 && '서초대로·효령로 일대 공임비 안심 정비소를 정렬하고 있습니다.'}
                {gpsScanStep === 3 && '가장 가까운 거리순으로 10곳의 목록을 불러옵니다.'}
              </p>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${gpsScanStep * 33.3}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detailing Matching Modal for HomeScreen */}
      {/* Detailing Matching Full-Screen View from User Screenshot */}
      {isDetailingModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#F4F6F9] overflow-hidden animate-in fade-in duration-150">
          {/* Top Header */}
          <div className="bg-white text-slate-900 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs shrink-0 border-b border-slate-200/80 z-20">
            <button
              onClick={() => setIsDetailingModalOpen(false)}
              className="p-1 -ml-1 text-slate-700 hover:text-slate-900 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              title="뒤로가기"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>

            <button
              onClick={() => setIsDetailingModalOpen(false)}
              className="p-1.5 -mr-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="홈으로"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>

          {/* Main Scroll Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col gap-4 pb-20 max-w-4xl w-full mx-auto">
            {/* Title & Introduction Banner */}
            <div className="flex flex-col gap-1 pt-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  프리미엄 디테일링 견적
                </h2>
                {/* Location Active Status Badge */}
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-blue-600 text-xs font-black">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  <span>📍 서울 서초구 중심</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                검증된 실력파 디테일러들의 명품 케어를 경험하세요.
              </p>
            </div>

            {/* Mock GPS Status & Quick Search Bar */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-400 animate-bounce" />
                  <div className="absolute -inset-1 bg-emerald-400/20 rounded-full animate-ping" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      내 위치 (모의 GPS)
                    </span>
                    <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                      반경 3km
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {isDetailingGpsScanning ? '위성 신호 수신 중...' : detailingGpsAddress}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRefreshDetailingGps}
                  disabled={isDetailingGpsScanning}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-1 shadow cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDetailingGpsScanning ? 'animate-spin' : ''}`} />
                  <span>{isDetailingGpsScanning ? '탐색 중' : '위치 갱신'}</span>
                </button>
                <button
                  onClick={() => {
                    const url = `https://map.naver.com/v5/search/${encodeURIComponent('서초동 디테일링 세차장')}`;
                    window.open(url, '_blank');
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  지도보기
                </button>
              </div>
            </div>

            {/* Region Filter Dropdown & Nearby Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsDetailingRegionOpen(!isDetailingRegionOpen)}
                  className="bg-white rounded-2xl py-2 px-3.5 shadow-xs border border-slate-200 flex items-center justify-between gap-2.5 text-slate-700 font-bold text-xs hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>{selectedDetailingRegion === '전체 (서초구)' ? '서초구 동별 선택' : selectedDetailingRegion}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDetailingRegionOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDetailingRegionOpen && (
                  <div className="absolute top-11 left-0 z-30 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 min-w-[170px] flex flex-col gap-1 max-h-56 overflow-y-auto">
                    {detailingRegionOptions.map((reg) => (
                      <button
                        key={reg}
                        onClick={() => {
                          setSelectedDetailingRegion(reg);
                          setIsDetailingRegionOpen(false);
                        }}
                        className={`text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedDetailingRegion === reg
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {reg}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-xs font-bold text-slate-600">
                총 <b className="text-blue-600">{filteredDetailingShops.length}</b>개 전문 매장
              </span>
            </div>

            {/* 2대 메인 탭: 스팀 세차 vs 고압수 세차 */}
            <div className="bg-slate-200/80 p-1.5 rounded-2xl flex gap-1.5 shadow-inner">
              <button
                onClick={() => setSelectedWashTab('steam')}
                className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedWashTab === 'steam'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="text-base">🧼</span>
                <span>스팀 세차</span>
              </button>

              <button
                onClick={() => setSelectedWashTab('high_pressure')}
                className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedWashTab === 'high_pressure'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="text-base">🧽</span>
                <span>고압수 세차</span>
              </button>
            </div>

            {/* Shop Cards List */}
            <div className="flex flex-col gap-5 mt-1">
              {filteredDetailingShops.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 shadow-md">
                  <span className="text-4xl">🔍</span>
                  <p className="font-bold text-slate-700 text-sm">해당 동에 등록된 매장이 없습니다.</p>
                  <button
                    onClick={() => setSelectedDetailingRegion('전체 (서초구)')}
                    className="text-xs font-bold text-blue-600 underline cursor-pointer"
                  >
                    서초구 전체로 보기
                  </button>
                </div>
              ) : (
                filteredDetailingShops.map((shop) => (
                  <div
                    key={shop.id}
                    className="bg-white rounded-[2rem] p-5 shadow-lg border border-white/60 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200"
                  >
                    {/* Shop Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 shadow-inner flex items-center justify-center">
                          <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-black text-slate-900 text-base tracking-tight">
                              {shop.name}
                            </h3>
                            {shop.badge && (
                              shop.badgeType === 'star' ? (
                                <span className="text-yellow-400 text-sm">⭐</span>
                              ) : (
                                <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                  {shop.badge}
                                </span>
                              )
                            )}
                          </div>

                          {/* Location distance & landmark */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                            <span className="text-blue-600 font-extrabold flex items-center gap-0.5">
                              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              {shop.landmark} ({shop.distance})
                            </span>
                          </div>

                          {/* Tags */}
                          <div className="flex items-center gap-1 flex-wrap mt-0.5">
                            {shop.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className={`${tag.bg} ${tag.color} text-[10px] font-black px-2 py-0.5 rounded-md tracking-tight`}
                              >
                                {tag.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Satisfaction Rating */}
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-[#0066ff] text-xl font-black leading-none">
                          {shop.satisfaction}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                          만족도
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 font-medium">
                      {shop.description}
                    </p>

                    {/* 2-Column Photo Gallery */}
                    <div className="grid grid-cols-2 gap-2.5 h-44 rounded-2xl overflow-hidden shadow-inner">
                      {/* Left: After Photo */}
                      <div className="relative w-full h-full bg-slate-100 overflow-hidden group">
                        <img
                          src={shop.afterImage}
                          alt="시공 후 사진"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider shadow">
                          AFTER
                        </div>
                      </div>

                      {/* Right: Working Process Photo */}
                      <div className="relative w-full h-full bg-slate-100 overflow-hidden group">
                        <img
                          src={shop.processImage}
                          alt="시공 과정 사진"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    {/* Action CTA Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenDetailingMap(shop)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-3.5 rounded-2xl flex items-center justify-center gap-1 text-xs shrink-0 active:scale-95 transition-all cursor-pointer"
                      >
                        <NavigationIcon className="w-4 h-4" />
                        <span>길찾기</span>
                      </button>

                      <button
                        onClick={() => handleOpenQuoteModal(shop)}
                        className="flex-1 bg-[#0070f3] hover:bg-[#0060df] active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span className="text-sm font-black">이 매장에 실시간 견적 문의하기</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quote Request Modal */}
          {quoteShop && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900">
                <button
                  onClick={() => setQuoteShop(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
                    실시간 다이렉트 견적
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">{quoteShop.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{quoteShop.address} ({quoteShop.landmark})</p>
                </div>

                <form onSubmit={handleSendQuote} className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">내 차종</label>
                    <input
                      type="text"
                      defaultValue={user.vehicle.model || '카니발 (기아)'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                      placeholder="예: 그랜저 GN7, 카니발, 아반떼"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        희망 시공 선택 ({quoteShop.washType === 'high_pressure' ? '고압수 세차 전문' : '스팀 세차 전문'})
                      </label>
                      {quoteShop.washType === 'high_pressure' && (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          스노우폼 기본 제공 ✨
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {getServicesForShop(quoteShop).map((srv) => (
                        <button
                          type="button"
                          key={srv}
                          onClick={() => {
                            if (selectedServices.includes(srv)) {
                              setSelectedServices(selectedServices.filter((s) => s !== srv));
                            } else {
                              setSelectedServices([...selectedServices, srv]);
                            }
                          }}
                          className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                            selectedServices.includes(srv)
                              ? 'bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          {srv}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">추가 요청사항</label>
                    <textarea
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="예: 스월마크가 심합니다. 주말 오전에 맡기고 싶어요."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0070f3] hover:bg-[#0060df] active:scale-95 text-white font-black py-3 rounded-xl text-sm shadow-md transition-all mt-1 cursor-pointer"
                  >
                    ⚡️ 실시간 견적 무료 접수하기
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Success Toast */}
          {isQuoteSuccess && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-500 animate-in fade-in slide-in-from-top-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div className="text-xs">
                <span className="font-extrabold text-white">견적 문의 접수 완료! </span>
                <span className="text-slate-300">10분 이내 카카오 알림톡으로 예상 견적이 전송됩니다.</span>
              </div>
            </div>
          )}

          {/* GPS Scan Toast */}
          {gpsScanToast && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-blue-500 animate-in fade-in slide-in-from-top-3">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">📍 현위치 기반 주변 4개 디테일링 샵 스캔 완료!</span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

