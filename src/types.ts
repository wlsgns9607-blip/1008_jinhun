export interface VehicleInfo {
  model: string;
  plateNumber: string;
  mileage: number;
  year: number;
  engineType: string;
  transmission: string;
  lastInspectionDate: string;
  engineOilCycleKm?: number; // 차종별 실무 권장 엔진오일 교체 주기 (km)
  engineOilSevereKm?: number; // 가혹 조건 엔진오일 교체 주기 (km)
  engineOilViscosity?: string; // 권장 엔진오일 점도 규격 (예: 0W-20 SP)
  engineOilGuidance?: string; // 차종별 엔진오일 관리 특이사항
}

export interface UserProfile {
  name: string;
  email: string;
  vehicle: VehicleInfo;
  isLoggedIn: boolean;
  loginProvider?: 'email' | 'kakao' | 'naver' | 'apple' | 'guest';
}

export interface CorePartDiagnostic {
  id: number;
  name: string;
  subName: string;
  category: string;
  cycleKm: string;
  soundTitle: string;
  soundDescriptions: string[];
  soundAudioKey?: string;
  smellTitle: string;
  smellDescription: string;
  smellWarning?: string;
  highwayRiskLevel: 'high' | 'medium' | 'critical';
  highwayRiskText: string;
  unreplacedConsequence?: string; // 이 부품을 안 갈고 방치했을 때 발생하는 치명적 손상 및 수리비 폭탄
  estimatedCost: string;
  symptomType: 'sound' | 'smell' | 'both';
  icon: string;
}

export interface RepairShop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distance: string;
  distanceMeter: number;
  address: string;
  phone: string;
  tags: string[];
  highlightBadge?: string;
  category?: 'local' | 'brand' | 'firstClass';
  laborFeeNote?: string;
  isTrustCertified: boolean;
  isFirstClass: boolean;
  isSameDay: boolean;
  isNightAvailable: boolean;
  specialtyText: string;
  consumerBoardClaimZero: boolean;
  trustScorePercent?: number;
  lat: number;
  lng: number;
  businessHours: string;
}

export interface AiDiagnosisResult {
  summary: string;
  matchedPartIndex?: number | null;
  matchedPartName?: string;
  urgency: string;
  urgencyLevel: 'danger' | 'warning' | 'info';
  highwayRisk: string;
  analysis: string;
  actionGuide: string;
  unreplacedRisk?: string; // 미교체 시 발생하는 치명적 손상 및 수리비 폭탄 경고
  estimatedPriceRange?: string;
  soundOrSmell: string;
}

export interface BookingForm {
  shopId: string;
  shopName: string;
  date: string;
  time: string;
  selectedSymptoms: string[];
  notes: string;
  customerName: string;
  customerPhone: string;
}
