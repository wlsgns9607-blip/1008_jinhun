export interface EngineOilSpecification {
  cycleKm: number; // 실무 권장 교체 주기 (km)
  normalManualKm: number; // 제조사 매뉴얼 일반조건 주기 (km)
  severeKm: number; // 제조사 매뉴얼 가혹조건 주기 (km)
  viscosity: string; // 권장 엔진오일 점도 규격 (예: 0W-20 API SP)
  guidanceText: string; // 차종/엔진별 정밀 교체 가이드
  engineCategory: 'turbo' | 'naturally_aspirated' | 'hybrid' | 'diesel' | 'lpi' | 'electric' | 'high_performance';
}

export interface DetailedVehicleModel {
  id: string;
  name: string;
  subSeries?: string; // 예: "아반떼 AD (2015~2020)"
  brand: 'hyundai' | 'kia' | 'genesis';
  category: '경형/소형/해치백' | '준중형/중형 세단' | '준대형/대형 세단' | 'SUV/RV' | '세단' | 'SUV';
  startYear: number;
  endYear: number | null; // null이면 현재 출시중
  years: number[];
  powertrains: Array<{
    name: string; // 예: "1.6 가솔린 (스마트스트림 IVT/무단변속기)"
    transmission: string;
    maintenanceNotice?: string; // 예: "7단 건식 DCT ➔ 6만km 더블클러치 점검", "댐퍼풀리/EGR/DPF 관리"
    engineOilCycleKm?: number; // 실무 권장 주기 (km)
    engineOilSevereKm?: number; // 가혹 조건 주기 (km)
    engineOilViscosity?: string; // 권장 점도 규격
  }>;
}

export const DETAILED_VEHICLE_DATABASE: DetailedVehicleModel[] = [
  // ==========================================
  // 1. 현대자동차 (Hyundai, 2010년 이후)
  // ==========================================
  // [경형 / 소형 / 해치백]
  {
    id: 'casper',
    name: '캐스퍼',
    subSeries: '캐스퍼 (2021~)',
    brand: 'hyundai',
    category: '경형/소형/해치백',
    startYear: 2021,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021],
    powertrains: [
      { name: '1.0 가솔린 자연흡기 (4단 자동)', transmission: '4단 자동' },
      { name: '1.0 가솔린 터보 (4단 자동)', transmission: '4단 자동' },
    ],
  },
  {
    id: 'venue',
    name: '베뉴',
    subSeries: '베뉴 (2019~)',
    brand: 'hyundai',
    category: '경형/소형/해치백',
    startYear: 2019,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019],
    powertrains: [
      { name: '1.6 가솔린 (스마트스트림 IVT/무단변속기)', transmission: '스마트스트림 IVT' },
    ],
  },
  {
    id: 'accent-rb',
    name: '엑센트 (RB)',
    subSeries: '엑센트 (2010~2019, RB)',
    brand: 'hyundai',
    category: '경형/소형/해치백',
    startYear: 2010,
    endYear: 2019,
    years: [2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010],
    powertrains: [
      { name: '1.4 가솔린 (CVT/4단 자동)', transmission: 'CVT/4단 자동' },
      { name: '1.6 가솔린 (4단/6단 자동)', transmission: '자동변속기' },
      {
        name: '1.6 디젤 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 클러치팩 마모 주의',
      },
    ],
  },
  {
    id: 'i30',
    name: 'i30 (GD/PD)',
    subSeries: 'i30 (2011~2020, GD/PD)',
    brand: 'hyundai',
    category: '경형/소형/해치백',
    startYear: 2011,
    endYear: 2020,
    years: [2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011],
    powertrains: [
      { name: '1.6 / 2.0 가솔린 (6단 자동)', transmission: '6단 자동' },
      {
        name: '1.4T / 1.6T 가솔린 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 교체 점검',
      },
      {
        name: '1.6 디젤 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 클러치팩/플라이휠 점검',
      },
    ],
  },
  {
    id: 'veloster',
    name: '벨로스터 (FS/JS/N)',
    subSeries: '벨로스터 (2011~2022, FS/JS)',
    brand: 'hyundai',
    category: '경형/소형/해치백',
    startYear: 2011,
    endYear: 2022,
    years: [2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011],
    powertrains: [
      { name: '1.6 가솔린 (6단 자동)', transmission: '6단 자동' },
      {
        name: '1.6 터보 (6단/7단 건식 DCT)',
        transmission: '건식 DCT',
        maintenanceNotice: '건식 DCT ➔ 플라이휠 이음 및 클러치 슬립 관리',
      },
      { name: '벨로스터 N (6단 수동)', transmission: '6단 수동' },
      { name: '벨로스터 N (8단 습식 DCT)', transmission: '8단 습식 DCT' },
    ],
  },

  // [준중형 / 중형 세단]
  {
    id: 'avante-md',
    name: '아반떼 MD',
    subSeries: '아반떼 MD (2010~2015)',
    brand: 'hyundai',
    category: '준중형/중형 세단',
    startYear: 2010,
    endYear: 2015,
    years: [2015, 2014, 2013, 2012, 2011, 2010],
    powertrains: [
      { name: '1.6 GDi 가솔린 (6단 자동)', transmission: '6단 자동', maintenanceNotice: 'GDi 흡기 밸브 카본 및 노킹 관리' },
      { name: '1.6 LPi (6단 자동)', transmission: '6단 자동' },
      { name: '1.6 디젤 (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'avante-ad',
    name: '아반떼 AD',
    subSeries: '아반떼 AD (2015~2020)',
    brand: 'hyundai',
    category: '준중형/중형 세단',
    startYear: 2015,
    endYear: 2020,
    years: [2020, 2019, 2018, 2017, 2016, 2015],
    powertrains: [
      { name: '1.6 가솔린 (6단 자동 / IVT 삼각떼)', transmission: '6단 자동/IVT' },
      {
        name: '1.6 터보 스포츠 (7단 건식 DCT ➔ 6만km)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 더블클러치 마모 점검 필수',
      },
      {
        name: '1.6 디젤 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 액추에이터/클러치 점검',
      },
      { name: '1.6 LPi (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'avante-cn7',
    name: '아반떼 CN7',
    subSeries: '아반떼 CN7 (2020~)',
    brand: 'hyundai',
    category: '준중형/중형 세단',
    startYear: 2020,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020],
    powertrains: [
      { name: '1.6 가솔린 (스마트스트림 IVT/CVT)', transmission: '스마트스트림 IVT' },
      { name: '1.6 하이브리드 (6단 DCT)', transmission: '6단 DCT' },
      {
        name: 'N라인 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 클러치 마모 주기 관리',
      },
      { name: '아반떼 N (8단 습식 DCT)', transmission: '8단 습식 DCT' },
      { name: '1.6 LPi (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'i40',
    name: 'i40',
    subSeries: 'i40 (2011~2019)',
    brand: 'hyundai',
    category: '준중형/중형 세단',
    startYear: 2011,
    endYear: 2019,
    years: [2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011],
    powertrains: [
      { name: '2.0 GDi 가솔린 (6단 자동)', transmission: '6단 자동' },
      { name: '1.7 디젤 (6단 자동)', transmission: '6단 자동' },
      {
        name: '1.7 디젤 (후기형 7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '후기형 7단 건식 DCT ➔ 플라이휠 진동/소음 점검',
      },
    ],
  },
  {
    id: 'sonata-yf',
    name: 'YF 쏘나타',
    subSeries: 'YF 쏘나타 (2010~2014)',
    brand: 'hyundai',
    category: '준중형/중형 세단',
    startYear: 2010,
    endYear: 2014,
    years: [2014, 2013, 2012, 2011, 2010],
    powertrains: [
      { name: '2.0 세타/누우 가솔린 (6단 자동)', transmission: '6단 자동', maintenanceNotice: '세타2 엔진 실린더 스크래치/오일소모 주의' },
      { name: '2.0 터보 GDi (6단 자동)', transmission: '6단 자동' },
      { name: '2.0 하이브리드 (6단 자동)', transmission: '6단 자동 하이브리드' },
      { name: '2.0 LPi (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'sonata-lf',
    name: 'LF 쏘나타 / 뉴 라이즈',
    subSeries: 'LF 쏘나타 / 뉴 라이즈 (2014~2019)',
    brand: 'hyundai',
    category: '준중형/중형 세단',
    startYear: 2014,
    endYear: 2019,
    years: [2019, 2018, 2017, 2016, 2015, 2014],
    powertrains: [
      { name: '2.0 CVVL 가솔린 (6단 자동)', transmission: '6단 자동' },
      {
        name: '1.6 터보 (7단 건식 DCT ➔ 6만km)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 클러치 세트 점검',
      },
      {
        name: '1.7 디젤 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 더블클러치 마모 및 DPF 관리',
      },
      { name: '2.0 터보 (8단 자동)', transmission: '8단 자동' },
      { name: '2.0 LPi (6단 자동)', transmission: '6단 자동' },
      { name: '2.0 하이브리드 (6단 자동)', transmission: '6단 하이브리드' },
    ],
  },
  {
    id: 'sonata-dn8',
    name: '쏘나타 DN8 / 디 엣지',
    subSeries: '쏘나타 DN8 / 디 엣지 (2019~)',
    brand: 'hyundai',
    category: '준중형/중형 세단',
    startYear: 2019,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019],
    powertrains: [
      { name: '2.0 가솔린 (6단 자동)', transmission: '6단 자동' },
      { name: '1.6 터보 센슈어스 (8단 자동)', transmission: '8단 자동' },
      { name: '2.0 하이브리드 (6단 자동)', transmission: '6단 하이브리드' },
      { name: '2.5 N라인 (8단 습식 DCT)', transmission: '8단 습식 DCT' },
      { name: '2.0 LPi (6단 자동)', transmission: '6단 자동' },
    ],
  },

  // [준대형 / 대형 세단]
  {
    id: 'grandeur-hg',
    name: '그랜저 HG',
    subSeries: '그랜저 HG (2011~2016)',
    brand: 'hyundai',
    category: '준대형/대형 세단',
    startYear: 2011,
    endYear: 2016,
    years: [2016, 2015, 2014, 2013, 2012, 2011],
    powertrains: [
      { name: '2.4 / 3.0 가솔린 (6단 자동)', transmission: '6단 자동' },
      {
        name: '2.2 디젤 R엔진 (6단 자동)',
        transmission: '6단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/EGR밸브/DPF 클리닝 주기 점검',
      },
      { name: '2.4 하이브리드 (6단 자동)', transmission: '6단 자동 하이브리드' },
      { name: '3.0 LPi (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'grandeur-ig',
    name: '그랜저 IG / 더 뉴 그랜저',
    subSeries: '그랜저 IG (2016~2022)',
    brand: 'hyundai',
    category: '준대형/대형 세단',
    startYear: 2016,
    endYear: 2022,
    years: [2022, 2021, 2020, 2019, 2018, 2017, 2016],
    powertrains: [
      { name: '2.4 / 2.5 / 3.0 / 3.3 가솔린 (6단/8단 자동)', transmission: '6단/8단 자동' },
      {
        name: '2.2 디젤 R엔진 (8단 자동)',
        transmission: '8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/흡기카본/DPF 관리',
      },
      { name: '2.4 하이브리드 (6단 자동)', transmission: '6단 하이브리드' },
      { name: '3.0 LPi (6단/8단 자동)', transmission: '자동변속기' },
    ],
  },
  {
    id: 'grandeur-gn7',
    name: '디 올 뉴 그랜저 GN7',
    subSeries: '디 올 뉴 그랜저 GN7 (2022~)',
    brand: 'hyundai',
    category: '준대형/대형 세단',
    startYear: 2022,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022],
    powertrains: [
      { name: '2.5 / 3.5 가솔린 (8단 자동)', transmission: '8단 자동' },
      { name: '1.6 터보 하이브리드 (6단 자동)', transmission: '6단 자동 하이브리드' },
      { name: '3.5 LPi (8단 자동)', transmission: '8단 자동' },
    ],
  },
  {
    id: 'aslan',
    name: '아슬란',
    subSeries: '아슬란 (2014~2018)',
    brand: 'hyundai',
    category: '준대형/대형 세단',
    startYear: 2014,
    endYear: 2018,
    years: [2018, 2017, 2016, 2015, 2014],
    powertrains: [
      { name: '3.0 / 3.3 가솔린 (6단/8단 자동)', transmission: '6단/8단 자동' },
    ],
  },
  {
    id: 'equus-vi',
    name: '에쿠스 (후기형 VI)',
    subSeries: '에쿠스 (2010~2015, 후기형 VI)',
    brand: 'hyundai',
    category: '준대형/대형 세단',
    startYear: 2010,
    endYear: 2015,
    years: [2015, 2014, 2013, 2012, 2011, 2010],
    powertrains: [
      { name: '3.8 / 5.0 가솔린 (8단 자동)', transmission: '후륜 8단 자동' },
    ],
  },

  // [SUV / RV]
  {
    id: 'kona-os',
    name: '코나 1세대 (OS)',
    subSeries: '코나 1세대 (2017~2023, OS)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2017,
    endYear: 2023,
    years: [2023, 2022, 2021, 2020, 2019, 2018, 2017],
    powertrains: [
      {
        name: '1.6 가솔린 터보 (7단 건식 DCT ➔ 6만km)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 교체 점검',
      },
      {
        name: '1.6 디젤 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 클러치 마모 주의',
      },
      { name: '하이브리드 (6단 DCT)', transmission: '6단 DCT' },
      { name: '코나 N (8단 습식 DCT)', transmission: '8단 습식 DCT' },
    ],
  },
  {
    id: 'kona-sx2',
    name: '디 올 뉴 코나 2세대 (SX2)',
    subSeries: '디 올 뉴 코나 2세대 (2023~, SX2)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2023,
    endYear: null,
    years: [2026, 2025, 2024, 2023],
    powertrains: [
      { name: '1.6 가솔린 터보 (8단 자동)', transmission: '8단 자동' },
      { name: '2.0 가솔린 (스마트스트림 IVT)', transmission: '스마트스트림 IVT' },
      { name: '하이브리드 (6단 DCT)', transmission: '6단 DCT' },
    ],
  },
  {
    id: 'tucson-ix',
    name: '투싼 ix (LM)',
    subSeries: '투싼 ix (2010~2015, LM)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2010,
    endYear: 2015,
    years: [2015, 2014, 2013, 2012, 2011, 2010],
    powertrains: [
      {
        name: '2.0 디젤 R엔진 (6단 자동)',
        transmission: '6단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/EGR/인젝터 관리',
      },
      { name: '2.0 가솔린 (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'tucson-tl',
    name: '올 뉴 투싼 (TL)',
    subSeries: '올 뉴 투싼 (2015~2020, TL)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2015,
    endYear: 2020,
    years: [2020, 2019, 2018, 2017, 2016, 2015],
    powertrains: [
      {
        name: '1.7 디젤 (7단 건식 DCT ➔ 6만km)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 클러치팩 마모 점검',
      },
      {
        name: '1.6 가솔린 터보 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 클러치팩 마모 점검',
      },
      {
        name: '2.0 디젤 R엔진 (8단 자동)',
        transmission: '8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/DPF/EGR 관리',
      },
    ],
  },
  {
    id: 'tucson-nx4',
    name: '디 올 뉴 투싼 (NX4)',
    subSeries: '디 올 뉴 투싼 (2020~, NX4)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2020,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020],
    powertrains: [
      {
        name: '1.6 가솔린 터보 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 클러치 마모 및 변속 슬립 점검',
      },
      { name: '2.0 디젤 R엔진 (8단 자동)', transmission: '8단 자동' },
      { name: '1.6 터보 하이브리드 (6단 자동)', transmission: '6단 자동 하이브리드' },
    ],
  },
  {
    id: 'santafe-dm',
    name: '싼타페 DM / 더 프라임',
    subSeries: '싼타페 DM / 더 프라임 (2012~2018)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2012,
    endYear: 2018,
    years: [2018, 2017, 2016, 2015, 2014, 2013, 2012],
    powertrains: [
      {
        name: '2.0 / 2.2 디젤 R엔진 (댐퍼풀리/EGR/DPF)',
        transmission: '6단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리 크랙 이탈 및 EGR/DPF 카본 누적 필수 관리',
      },
      { name: '2.0 가솔린 터보 (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'santafe-tm',
    name: '싼타페 TM',
    subSeries: '싼타페 TM (2018~2023)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2018,
    endYear: 2023,
    years: [2023, 2022, 2021, 2020, 2019, 2018],
    powertrains: [
      {
        name: '2.0 / 2.2 디젤 R엔진 (8단 자동)',
        transmission: '8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/DPF/EGR 클리닝',
      },
      { name: '2.0 / 2.5 가솔린 터보 (8단 습식 DCT)', transmission: '8단 습식 DCT' },
      { name: '1.6 터보 하이브리드 (6단 자동)', transmission: '6단 자동 하이브리드' },
    ],
  },
  {
    id: 'santafe-mx5',
    name: '디 올 뉴 싼타페 MX5',
    subSeries: '디 올 뉴 싼타페 MX5 (2023~)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2023,
    endYear: null,
    years: [2026, 2025, 2024, 2023],
    powertrains: [
      { name: '2.5 가솔린 터보 (8단 습식 DCT)', transmission: '8단 습식 DCT' },
      { name: '1.6 터보 하이브리드 (디젤 단종, 6단 자동)', transmission: '6단 자동 하이브리드' },
    ],
  },
  {
    id: 'maxcruz',
    name: '맥스크루즈',
    subSeries: '맥스크루즈 (2013~2018)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2013,
    endYear: 2018,
    years: [2018, 2017, 2016, 2015, 2014, 2013],
    powertrains: [
      {
        name: '2.2 디젤 R엔진 (6단/8단 자동)',
        transmission: '6단/8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/흡기카본/DPF 관리',
      },
      { name: '3.3 가솔린 (6단/8단 자동)', transmission: '6단/8단 자동' },
    ],
  },
  {
    id: 'palisade',
    name: '팰리세이드 (LX2)',
    subSeries: '팰리세이드 (2018~, LX2)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2018,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018],
    powertrains: [
      {
        name: '2.2 디젤 R엔진 (8단 자동)',
        transmission: '8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리 및 DPF 클리닝 주기 점검',
      },
      { name: '3.8 가솔린 (8단 자동)', transmission: '8단 자동' },
    ],
  },
  {
    id: 'grand-starex',
    name: '그랜드 스타렉스',
    subSeries: '그랜드 스타렉스 (2010~2021)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2010,
    endYear: 2021,
    years: [2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010],
    powertrains: [
      {
        name: '2.5 A엔진 디젤 (5단 자동)',
        transmission: '5단 자동',
        maintenanceNotice: '인젝터 동와셔 파열 및 터보차저 오일라인 슬러지 주의',
      },
      { name: '2.4 LPi (5단 자동)', transmission: '5단 자동' },
    ],
  },
  {
    id: 'staria',
    name: '스타리아',
    subSeries: '스타리아 (2021~)',
    brand: 'hyundai',
    category: 'SUV/RV',
    startYear: 2021,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021],
    powertrains: [
      { name: '2.2 디젤 R엔진 (8단 자동)', transmission: '8단 자동' },
      { name: '3.5 LPi (8단 자동)', transmission: '8단 자동' },
      { name: '1.6 터보 하이브리드 (6단 자동)', transmission: '6단 자동 하이브리드' },
    ],
  },

  // ==========================================
  // 2. 기아자동차 (Kia, 2010년 이후)
  // ==========================================
  // [경형 / 소형 / 준중형]
  {
    id: 'morning',
    name: '모닝 (TA/JA)',
    subSeries: '모닝 (2011~, TA/JA)',
    brand: 'kia',
    category: '경형/소형/해치백',
    startYear: 2011,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011],
    powertrains: [
      { name: '1.0 가솔린 (4단 자동)', transmission: '4단 자동' },
      { name: '1.0 터보 (4단/CVT)', transmission: '4단/CVT' },
      { name: '1.0 LPi (4단 자동)', transmission: '4단 자동' },
    ],
  },
  {
    id: 'ray',
    name: '레이 (TAM)',
    subSeries: '레이 (2011~, TAM)',
    brand: 'kia',
    category: '경형/소형/해치백',
    startYear: 2011,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011],
    powertrains: [
      { name: '1.0 가솔린 (4단 자동)', transmission: '4단 자동' },
      { name: '1.0 터보 (CVT)', transmission: 'CVT' },
    ],
  },
  {
    id: 'pride-ub',
    name: '프라이드 (UB)',
    subSeries: '프라이드 (2011~2017, UB)',
    brand: 'kia',
    category: '경형/소형/해치백',
    startYear: 2011,
    endYear: 2017,
    years: [2017, 2016, 2015, 2014, 2013, 2012, 2011],
    powertrains: [
      { name: '1.4 / 1.6 가솔린 (4단/6단 자동)', transmission: '자동변속기' },
      { name: '1.4 디젤 (수동/자동)', transmission: '수동/자동' },
    ],
  },
  {
    id: 'k3-yd',
    name: 'K3 1세대 (YD)',
    subSeries: 'K3 1세대 (2012~2018, YD)',
    brand: 'kia',
    category: '준중형/중형 세단',
    startYear: 2012,
    endYear: 2018,
    years: [2018, 2017, 2016, 2015, 2014, 2013, 2012],
    powertrains: [
      { name: '1.6 GDi (6단 자동)', transmission: '6단 자동', maintenanceNotice: 'GDi 밸브 카본 슬러지 주기 관리' },
      { name: '1.6 터보 쿱/GT (6단/7단 DCT)', transmission: '6단/7단 DCT' },
      {
        name: '1.6 디젤 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 클러치 마모 점검',
      },
    ],
  },
  {
    id: 'k3-bd',
    name: '올 뉴 K3 / 더 뉴 K3 2세대 (BD)',
    subSeries: '올 뉴 K3 / 더 뉴 K3 2세대 (2018~2024, BD)',
    brand: 'kia',
    category: '준중형/중형 세단',
    startYear: 2018,
    endYear: 2024,
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
    powertrains: [
      { name: '1.6 스마트스트림 (스마트스트림 IVT/CVT)', transmission: '스마트스트림 IVT' },
      {
        name: 'K3 GT 1.6 터보 (7단 건식 DCT ➔ 6만km)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 더블클러치 마모 점검',
      },
    ],
  },

  // [중형 / 준대형 / 대형 세단]
  {
    id: 'k5-tf',
    name: 'K5 1세대 (TF)',
    subSeries: 'K5 1세대 (2010~2015, TF)',
    brand: 'kia',
    category: '준중형/중형 세단',
    startYear: 2010,
    endYear: 2015,
    years: [2015, 2014, 2013, 2012, 2011, 2010],
    powertrains: [
      { name: '2.0 가솔린 (6단 자동)', transmission: '6단 자동', maintenanceNotice: '세타2 엔진 스크래치 및 오일소모 주의' },
      { name: '2.0 터보 GDi (6단 자동)', transmission: '6단 자동' },
      { name: '2.0 LPi (6단 자동)', transmission: '6단 자동' },
      { name: '하이브리드 (6단 자동)', transmission: '6단 하이브리드' },
    ],
  },
  {
    id: 'k5-jf',
    name: 'K5 2세대 (JF)',
    subSeries: 'K5 2세대 (2015~2019, JF)',
    brand: 'kia',
    category: '준중형/중형 세단',
    startYear: 2015,
    endYear: 2019,
    years: [2019, 2018, 2017, 2016, 2015],
    powertrains: [
      { name: '2.0 가솔린 (6단 자동)', transmission: '6단 자동' },
      {
        name: '1.6 가솔린 터보 (7단 건식 DCT ➔ 6만km)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 더블클러치 마모 점검',
      },
      {
        name: '1.7 디젤 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 플라이휠 이음 및 클러치 슬립 점검',
      },
      { name: '2.0 터보 (6단/8단 자동)', transmission: '자동변속기' },
      { name: '2.0 LPi (6단 자동)', transmission: '6단 자동' },
      { name: '하이브리드 (6단 자동)', transmission: '6단 하이브리드' },
    ],
  },
  {
    id: 'k5-dl3',
    name: 'K5 3세대 (DL3)',
    subSeries: 'K5 3세대 (2019~, DL3)',
    brand: 'kia',
    category: '준중형/중형 세단',
    startYear: 2019,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019],
    powertrains: [
      { name: '2.0 가솔린 (6단 자동)', transmission: '6단 자동' },
      { name: '1.6 가솔린 터보 (8단 자동)', transmission: '8단 자동' },
      { name: '2.0 LPi (6단 자동)', transmission: '6단 자동' },
      { name: '하이브리드 (6단 자동)', transmission: '6단 하이브리드' },
    ],
  },
  {
    id: 'k7-vg',
    name: 'K7 1세대 (VG)',
    subSeries: 'K7 1세대 (2010~2016, VG)',
    brand: 'kia',
    category: '준대형/대형 세단',
    startYear: 2010,
    endYear: 2016,
    years: [2016, 2015, 2014, 2013, 2012, 2011, 2010],
    powertrains: [
      { name: '2.4 / 3.0 / 3.3 가솔린 (6단 자동)', transmission: '6단 자동' },
      { name: '2.4 하이브리드 (6단 자동)', transmission: '6단 하이브리드' },
      { name: '3.0 LPi (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'k7-yg',
    name: '올 뉴 K7 / 프리미어 (YG)',
    subSeries: '올 뉴 K7 / 프리미어 (2016~2021, YG)',
    brand: 'kia',
    category: '준대형/대형 세단',
    startYear: 2016,
    endYear: 2021,
    years: [2021, 2020, 2019, 2018, 2017, 2016],
    powertrains: [
      { name: '2.4 / 2.5 / 3.0 / 3.3 가솔린 (6단/8단 자동)', transmission: '6단/8단 자동' },
      {
        name: '2.2 디젤 R엔진 (8단 자동)',
        transmission: '8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/EGR/DPF 클리닝 주기 점검',
      },
      { name: '하이브리드 (6단 자동)', transmission: '6단 하이브리드' },
      { name: '3.0 LPi (6단/8단 자동)', transmission: '자동변속기' },
    ],
  },
  {
    id: 'k8-gl3',
    name: 'K8 (GL3)',
    subSeries: 'K8 (2021~, GL3)',
    brand: 'kia',
    category: '준대형/대형 세단',
    startYear: 2021,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021],
    powertrains: [
      { name: '2.5 / 3.5 가솔린 (8단 자동)', transmission: '8단 자동' },
      { name: '3.5 LPi (8단 자동)', transmission: '8단 자동' },
      { name: '1.6 터보 하이브리드 (6단 자동)', transmission: '6단 자동 하이브리드' },
    ],
  },
  {
    id: 'stinger-ck',
    name: '스팅어 (CK)',
    subSeries: '스팅어 (2017~2023, CK)',
    brand: 'kia',
    category: '준중형/중형 세단',
    startYear: 2017,
    endYear: 2023,
    years: [2023, 2022, 2021, 2020, 2019, 2018, 2017],
    powertrains: [
      { name: '2.0T / 2.5T / 3.3T 가솔린 (후륜 8단 자동)', transmission: '후륜 8단 자동' },
      {
        name: '2.2 디젤 (후륜 8단 자동)',
        transmission: '후륜 8단 자동',
        maintenanceNotice: '후륜 디퍼런셜 오일 및 R엔진 댐퍼풀리 점검',
      },
    ],
  },
  {
    id: 'k9',
    name: 'K9 (KH/RJ)',
    subSeries: 'K9 (2012~, KH/RJ)',
    brand: 'kia',
    category: '준대형/대형 세단',
    startYear: 2012,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012],
    powertrains: [
      { name: '3.3T / 3.8 / 5.0 가솔린 (후륜 8단 자동)', transmission: '후륜 8단 자동' },
    ],
  },

  // [SUV / RV]
  {
    id: 'niro',
    name: '니로 (DE/SG2)',
    subSeries: '니로 (2016~, DE/SG2)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2016,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016],
    powertrains: [
      {
        name: '1.6 하이브리드 (6단 DCT ➔ 더블클러치 점검)',
        transmission: '6단 DCT',
        maintenanceNotice: '하이브리드 6단 DCT ➔ 더블클러치 및 액추에이터 오일 점검',
      },
    ],
  },
  {
    id: 'stonic',
    name: '스토닉 (YB)',
    subSeries: '스토닉 (2017~2020, YB)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2017,
    endYear: 2020,
    years: [2020, 2019, 2018, 2017],
    powertrains: [
      { name: '1.4 가솔린 (6단 자동)', transmission: '6단 자동' },
      {
        name: '1.0 터보 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 클러치 마모 주의',
      },
      {
        name: '1.6 디젤 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 클러치팩 점검',
      },
    ],
  },
  {
    id: 'seltos-early',
    name: '셀토스 1세대 전기형 (SP2)',
    subSeries: '셀토스 1세대 전기형 (2019~2022, SP2)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2019,
    endYear: 2022,
    years: [2022, 2021, 2020, 2019],
    powertrains: [
      {
        name: '1.6 가솔린 터보 (7단 건식 DCT ➔ 6만km)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 더블클러치 및 플라이휠 마모 점검',
      },
      {
        name: '1.6 디젤 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 클러치팩 마모 주의',
      },
    ],
  },
  {
    id: 'seltos-late',
    name: '더 뉴 셀토스 1세대 후기형',
    subSeries: '더 뉴 셀토스 1세대 후기형 (2022~)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2022,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022],
    powertrains: [
      { name: '1.6 가솔린 터보 (8단 자동)', transmission: '8단 자동' },
      { name: '2.0 가솔린 (스마트스트림 IVT/CVT)', transmission: '스마트스트림 IVT' },
    ],
  },
  {
    id: 'sportage-r',
    name: '스포티지 R (SL)',
    subSeries: '스포티지 R (2010~2015, SL)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2010,
    endYear: 2015,
    years: [2015, 2014, 2013, 2012, 2011, 2010],
    powertrains: [
      {
        name: '2.0 디젤 R엔진 (6단 자동)',
        transmission: '6단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/EGR/인젝터 동와셔 점검',
      },
      { name: '2.0 터보 GDi (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'sportage-ql',
    name: '스포티지 4세대 (QL)',
    subSeries: '스포티지 4세대 (2015~2021, QL)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2015,
    endYear: 2021,
    years: [2021, 2020, 2019, 2018, 2017, 2016, 2015],
    powertrains: [
      {
        name: '1.7 디젤 (7단 건식 DCT ➔ 6만km)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 클러치팩 마모 점검',
      },
      {
        name: '2.0 디젤 R엔진 (8단 자동)',
        transmission: '8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/흡기카본/DPF 관리',
      },
      {
        name: '1.6 디젤 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 클러치 마모 주의',
      },
      { name: '2.0 가솔린 (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'sportage-nq5',
    name: '디 올 뉴 스포티지 5세대 (NQ5)',
    subSeries: '디 올 뉴 스포티지 5세대 (2021~, NQ5)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2021,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021],
    powertrains: [
      {
        name: '1.6 가솔린 터보 (7단 건식 DCT)',
        transmission: '7단 건식 DCT',
        maintenanceNotice: '7단 건식 DCT ➔ 6만km 클러치팩 점검',
      },
      { name: '2.0 디젤 R엔진 (8단 자동)', transmission: '8단 자동' },
      { name: '1.6 터보 하이브리드 (6단 자동)', transmission: '6단 자동 하이브리드' },
      { name: '2.0 LPi (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'sorento-r',
    name: '쏘렌토 R / 뉴 쏘렌토 R (XM)',
    subSeries: '쏘렌토 R / 뉴 쏘렌토 R (2010~2014, XM)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2010,
    endYear: 2014,
    years: [2014, 2013, 2012, 2011, 2010],
    powertrains: [
      {
        name: '2.0 / 2.2 디젤 R엔진 (댐퍼풀리/EGR/DPF)',
        transmission: '6단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리 고무 분리 및 DPF/EGR 막힘 필수 점검',
      },
    ],
  },
  {
    id: 'sorento-um',
    name: '올 뉴 쏘렌토 / 더 뉴 쏘렌토 (UM)',
    subSeries: '올 뉴 쏘렌토 / 더 뉴 쏘렌토 (2014~2020, UM)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2014,
    endYear: 2020,
    years: [2020, 2019, 2018, 2017, 2016, 2015, 2014],
    powertrains: [
      {
        name: '2.0 / 2.2 디젤 R엔진 (6단/8단 자동)',
        transmission: '6단/8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/흡기카본/DPF 클리닝',
      },
      { name: '2.0 가솔린 터보 (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'sorento-mq4',
    name: '쏘렌토 4세대 (MQ4)',
    subSeries: '쏘렌토 4세대 (2020~, MQ4)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2020,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020],
    powertrains: [
      { name: '2.2 디젤 스마트스트림 (8단 습식 DCT)', transmission: '8단 습식 DCT' },
      { name: '2.5 가솔린 터보 (8단 습식 DCT)', transmission: '8단 습식 DCT' },
      { name: '1.6 터보 하이브리드 (6단 자동)', transmission: '6단 자동 하이브리드' },
    ],
  },
  {
    id: 'mohave',
    name: '모하비 (HM / 더 마스터)',
    subSeries: '모하비 (2010~2024, HM/더 마스터)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2010,
    endYear: 2024,
    years: [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010],
    powertrains: [
      {
        name: '3.0 V6 디젤 S엔진 (6단/후륜 8단 자동)',
        transmission: '후륜 8단 자동',
        maintenanceNotice: '고토크 하체 부싱 파열 / 후륜 디퍼런셜 및 트랜스퍼케이스 오일 관리',
      },
    ],
  },
  {
    id: 'carnival-vq',
    name: '그랜드 카니발 R (VQ)',
    subSeries: '그랜드 카니발 R (2010~2014, VQ)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2010,
    endYear: 2014,
    years: [2014, 2013, 2012, 2011, 2010],
    powertrains: [
      {
        name: '2.2 디젤 R엔진 (6단 자동)',
        transmission: '6단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/EGR/DPF 점검',
      },
      { name: '3.5 가솔린 (6단 자동)', transmission: '6단 자동' },
    ],
  },
  {
    id: 'carnival-yp',
    name: '올 뉴 카니발 / 더 뉴 카니발 (YP)',
    subSeries: '올 뉴 카니발 / 더 뉴 카니발 (2014~2020, YP)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2014,
    endYear: 2020,
    years: [2020, 2019, 2018, 2017, 2016, 2015, 2014],
    powertrains: [
      {
        name: '2.2 디젤 R엔진 (6단/8단 자동)',
        transmission: '6단/8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/인젝터 동와셔/공명음 하체 부싱',
      },
      { name: '3.3 가솔린 (6단/8단 자동)', transmission: '6단/8단 자동' },
    ],
  },
  {
    id: 'carnival-ka4',
    name: '카니발 4세대 (KA4)',
    subSeries: '카니발 4세대 (2020~, KA4)',
    brand: 'kia',
    category: 'SUV/RV',
    startYear: 2020,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020],
    powertrains: [
      { name: '2.2 디젤 스마트스트림 (8단 자동)', transmission: '8단 자동' },
      { name: '3.5 가솔린 (8단 자동)', transmission: '8단 자동' },
      { name: '1.6 터보 하이브리드 (6단 자동)', transmission: '6단 자동 하이브리드' },
    ],
  },

  // ==========================================
  // 3. 제네시스 (Genesis, 2010년 이후)
  // ==========================================
  // [세단]
  {
    id: 'genesis-bh',
    name: '제네시스 BH 후기형',
    subSeries: '제네시스 BH 후기형 (2011~2013)',
    brand: 'genesis',
    category: '세단',
    startYear: 2011,
    endYear: 2013,
    years: [2013, 2012, 2011],
    powertrains: [
      {
        name: '3.3 / 3.8 GDi (후륜 8단 자동)',
        transmission: '후륜 8단 자동',
        maintenanceNotice: '하체 텐션암/로워암 부싱 파열, 후륜 디퍼런셜(데프) 오일, 8단 미션오일 슬러지 핵심 관리',
      },
    ],
  },
  {
    id: 'genesis-dh',
    name: '제네시스 DH',
    subSeries: '제네시스 DH (2013~2016)',
    brand: 'genesis',
    category: '세단',
    startYear: 2013,
    endYear: 2016,
    years: [2016, 2015, 2014, 2013],
    powertrains: [
      {
        name: '3.3 / 3.8 GDi (8단 자동, HTRAC 사륜)',
        transmission: '후륜 8단 자동 / HTRAC',
        maintenanceNotice: '하체 부싱 크랙 / 트랜스퍼케이스 및 디퍼런셜 오일 점검',
      },
    ],
  },
  {
    id: 'genesis-coupe',
    name: '제네시스 쿠페 (신형 젠쿱)',
    subSeries: '제네시스 쿠페 (2011~2016, 신형 젠쿱)',
    brand: 'genesis',
    category: '세단',
    startYear: 2011,
    endYear: 2016,
    years: [2016, 2015, 2014, 2013, 2012, 2011],
    powertrains: [
      { name: '2.0 터보 (8단 자동/6단 수동)', transmission: '8단 자동/6단 수동' },
      { name: '3.8 GDi (8단 자동/6단 수동)', transmission: '8단 자동/6단 수동' },
    ],
  },
  {
    id: 'g70',
    name: 'G70',
    subSeries: 'G70 (2017~)',
    brand: 'genesis',
    category: '세단',
    startYear: 2017,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017],
    powertrains: [
      { name: '2.0T / 3.3T 가솔린 (후륜 8단 자동)', transmission: '후륜 8단 자동' },
      { name: '2.5T 가솔린 (후기형, 후륜 8단 자동)', transmission: '후륜 8단 자동' },
      {
        name: '2.2 디젤 R엔진 (후륜 8단)',
        transmission: '후륜 8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리 및 후륜 디퍼런셜 오일 점검',
      },
    ],
  },
  {
    id: 'g80-dh',
    name: 'G80 2세대 (DH 파생)',
    subSeries: 'G80 2세대 (2016~2020, DH 기반 파생)',
    brand: 'genesis',
    category: '세단',
    startYear: 2016,
    endYear: 2020,
    years: [2020, 2019, 2018, 2017, 2016],
    powertrains: [
      {
        name: '3.3 / 3.8 GDi (8단 자동)',
        transmission: '8단 자동',
        maintenanceNotice: '하체 텐션암/로워암 부싱 파열, 후륜 디퍼런셜(데프) 오일, 8단 미션오일 슬러지',
      },
      { name: '3.3T 스포츠 (8단 자동)', transmission: '8단 자동' },
      {
        name: '2.2 디젤 R엔진 (8단 자동)',
        transmission: '8단 자동',
        maintenanceNotice: 'R엔진 댐퍼풀리/EGR/DPF 및 하체 부싱 관리',
      },
    ],
  },
  {
    id: 'g80-rg3',
    name: 'G80 3세대 (RG3)',
    subSeries: 'G80 3세대 (2020~, RG3)',
    brand: 'genesis',
    category: '세단',
    startYear: 2020,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020],
    powertrains: [
      { name: '2.5T / 3.5T 가솔린 (8단 자동)', transmission: '8단 자동' },
      { name: '2.2 디젤 (초기형 일부, 8단 자동)', transmission: '8단 자동' },
    ],
  },
  {
    id: 'eq900',
    name: 'EQ900',
    subSeries: 'EQ900 (2015~2018)',
    brand: 'genesis',
    category: '세단',
    startYear: 2015,
    endYear: 2018,
    years: [2018, 2017, 2016, 2015],
    powertrains: [
      {
        name: '3.8 가솔린 / 3.3 터보 (8단 자동)',
        transmission: '후륜 8단 자동',
        maintenanceNotice: '에어서스펜션 누설, 하체 텐션암 부싱, 디퍼런셜 오일 점검',
      },
      { name: '5.0 V8 타우 가솔린 (8단 자동)', transmission: '후륜 8단 자동' },
    ],
  },
  {
    id: 'g90-hi',
    name: 'G90 1세대 페이스리프트 (HI)',
    subSeries: 'G90 1세대 페이스리프트 (2018~2021, HI)',
    brand: 'genesis',
    category: '세단',
    startYear: 2018,
    endYear: 2021,
    years: [2021, 2020, 2019, 2018],
    powertrains: [
      { name: '3.8 가솔린 (8단 자동)', transmission: '후륜 8단 자동' },
      { name: '3.3 터보 (8단 자동)', transmission: '후륜 8단 자동' },
      { name: '5.0 V8 (8단 자동)', transmission: '후륜 8단 자동' },
    ],
  },
  {
    id: 'g90-rs4',
    name: 'G90 2세대 (RS4)',
    subSeries: 'G90 2세대 (2021~, RS4)',
    brand: 'genesis',
    category: '세단',
    startYear: 2021,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021],
    powertrains: [
      { name: '3.5T 가솔린 (8단 자동)', transmission: '8단 자동' },
      { name: '3.5T 일렉트릭 슈퍼차저 (8단 자동)', transmission: '8단 자동' },
    ],
  },

  // [SUV]
  {
    id: 'gv70-jk1',
    name: 'GV70 (JK1)',
    subSeries: 'GV70 (2020~, JK1)',
    brand: 'genesis',
    category: 'SUV',
    startYear: 2020,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020],
    powertrains: [
      { name: '2.5T / 3.5T 가솔린 (8단 자동)', transmission: '8단 자동' },
      {
        name: '2.2 디젤 R엔진 (8단 자동)',
        transmission: '8단 자동',
        maintenanceNotice: '디퍼런셜 오일 및 R엔진 댐퍼풀리/DPF 점검',
      },
    ],
  },
  {
    id: 'gv80-jx1',
    name: 'GV80 (JX1)',
    subSeries: 'GV80 (2020~, JX1)',
    brand: 'genesis',
    category: 'SUV',
    startYear: 2020,
    endYear: null,
    years: [2026, 2025, 2024, 2023, 2022, 2021, 2020],
    powertrains: [
      { name: '2.5T / 3.5T 가솔린 (8단 자동)', transmission: '8단 자동' },
      {
        name: '3.0 직렬 6기통 디젤 (초기형, 8단 자동)',
        transmission: '8단 자동',
        maintenanceNotice: '직렬 6기통 디젤 카본 및 진동 댐퍼/DPF 주기 관리',
      },
      { name: 'GV80 쿠페 (3.5T e-S/C, 8단 자동)', transmission: '8단 자동' },
    ],
  },
];

/**
 * 대한민국 주요 차종 및 엔진(파워트레인)별 엔진오일 교체 주기 및 권장 점도 정밀 판정 엔진
 * 현대/기아/제네시스 오너스 매뉴얼(취급설명서 정기점검표) 및 공인 정비 명장 실무 지침 조사 기반
 */
export function getEngineOilCycleInfo(
  modelName: string = '',
  engineType: string = ''
): EngineOilSpecification {
  const m = modelName.toLowerCase();
  const e = engineType.toLowerCase();
  const combined = `${m} ${e}`;

  // 1. 전기차 판정 (아이오닉, EV6, EV9, GV60 등)
  if (
    combined.includes('ev') ||
    combined.includes('전기차') ||
    combined.includes('아이오닉') ||
    combined.includes('electric') ||
    combined.includes('gv60')
  ) {
    return {
      cycleKm: 100000,
      normalManualKm: 100000,
      severeKm: 60000,
      viscosity: '감속기 전용 오일 (엔진오일 없음)',
      guidanceText: '순수 전기차(EV)는 내연기관 엔진오일이 없습니다. 10만km 주기 감속기 오일 점검 대상입니다.',
      engineCategory: 'electric',
    };
  }

  // 2. 고성능 N 모델 (아반떼 N, 벨로스터 N, 코나 N 등)
  if (
    combined.includes(' n ') ||
    combined.endsWith(' n') ||
    combined.includes('아반떼 n') ||
    combined.includes('벨로스터 n') ||
    combined.includes('코나 n')
  ) {
    return {
      cycleKm: 6000,
      normalManualKm: 8000,
      severeKm: 4000,
      viscosity: '0W-30 ACEA C2 / API SP',
      guidanceText: '고출력 플랫파워 터보 특성상 오일 전단 안정성이 중요하므로 5,000~6,000km 주기로 교체해야 엔진 마모를 방지합니다.',
      engineCategory: 'high_performance',
    };
  }

  // 3. 경차 (캐스퍼, 모닝, 레이)
  if (
    combined.includes('캐스퍼') ||
    combined.includes('모닝') ||
    combined.includes('레이') ||
    combined.includes('casper')
  ) {
    if (combined.includes('터보') || combined.includes('t-gdi')) {
      return {
        cycleKm: 7000,
        normalManualKm: 10000,
        severeKm: 5000,
        viscosity: '0W-20 API SP / ILSAC GF-6',
        guidanceText: '1.0 카파 T-GDi 고회전 터보엔진으로 오일 열화가 빠르므로 5,000~7,000km(가혹 5,000km) 교체를 적극 권장합니다.',
        engineCategory: 'turbo',
      };
    }
    return {
      cycleKm: 8000,
      normalManualKm: 15000,
      severeKm: 7500,
      viscosity: '0W-20 API SP',
      guidanceText: '작은 배기량으로 고RPM을 빈번히 사용하므로 제조사 가혹조건(7,500km)에 맞춘 7,500~8,000km 교체가 최적입니다.',
      engineCategory: 'naturally_aspirated',
    };
  }

  // 4. 하이브리드 (HEV: 아반떼, 쏘나타, 그랜저, 쏘렌토, 싼타페, K5, K8, 니로 등)
  if (
    combined.includes('하이브리드') ||
    combined.includes('hev') ||
    combined.includes('hybrid') ||
    combined.includes('니로')
  ) {
    return {
      cycleKm: 8000,
      normalManualKm: 10000,
      severeKm: 5000,
      viscosity: '0W-16 또는 0W-20 API SP / GF-6',
      guidanceText: '하이브리드는 잦은 모터 개입으로 엔진 유온이 낮아 엔진오일에 연료/수분이 희석되기 쉬우므로 8,000km 교체를 권장합니다.',
      engineCategory: 'hybrid',
    };
  }

  // 5. 디젤 (CRDi / R엔진 / 스마트스트림 D)
  if (
    combined.includes('디젤') ||
    combined.includes('diesel') ||
    combined.includes('crdi') ||
    combined.includes('vgt') ||
    combined.includes('r엔진') ||
    combined.includes('모하비')
  ) {
    return {
      cycleKm: 10000,
      normalManualKm: 15000,
      severeKm: 7500,
      viscosity: '5W-30 또는 0W-30 ACEA C2/C3 (DPF 전용 Low SAPS)',
      guidanceText: 'DPF(매연저감장치) 후분사로 인한 경유 유입 및 오일 증가 현상을 방지하기 위해 10,000km(가혹 7,500km) 교체를 준수하세요.',
      engineCategory: 'diesel',
    };
  }

  // 6. 가솔린 터보 (T-GDi: 1.6T, 2.0T, 2.5T, 3.3T, 3.5T, 제네시스/스팅어/N라인/센슈어스 등)
  if (
    combined.includes('터보') ||
    combined.includes('turbo') ||
    combined.includes('t-gdi') ||
    combined.includes('2.5t') ||
    combined.includes('3.3t') ||
    combined.includes('3.5t') ||
    combined.includes('1.6t') ||
    combined.includes('n라인') ||
    combined.includes('스팅어') ||
    combined.includes('g70') ||
    combined.includes('gv70') ||
    combined.includes('gv80') ||
    combined.includes('g80')
  ) {
    const isGenesis = combined.includes('제네시스') || combined.includes('genesis') || combined.includes('g70') || combined.includes('g80') || combined.includes('gv');
    return {
      cycleKm: isGenesis ? 8000 : 7500,
      normalManualKm: 10000,
      severeKm: 5000,
      viscosity: isGenesis ? '0W-30 API SP / ACEA C2' : '0W-20 API SP',
      guidanceText: '터보차저 고열 윤활 및 카본 슬러지 방지를 위해 7,500~8,000km(도심 가혹조건 5,000km) 교체가 필수적입니다.',
      engineCategory: 'turbo',
    };
  }

  // 7. LPi (LPG)
  if (
    combined.includes('lpi') ||
    combined.includes('lpg')
  ) {
    return {
      cycleKm: 10000,
      normalManualKm: 15000,
      severeKm: 7500,
      viscosity: '0W-20 또는 5W-20 API SP',
      guidanceText: 'LPG 청정 연료 특성상 오일 오염은 적으나 연소실 열부하가 크므로 10,000km 교체 주기가 이상적입니다.',
      engineCategory: 'lpi',
    };
  }

  // 8. 가솔린 자연흡기 (일반 세단 / SUV 스마트스트림 G, CVVL, V6 람다 등)
  return {
    cycleKm: 10000,
    normalManualKm: 15000,
    severeKm: 7500,
    viscosity: '0W-20 API SP / ILSAC GF-6',
    guidanceText: '제조사 가혹조건 7,500km, 일반조건 15,000km 사이인 10,000km 주기가 엔진 컨디션과 수명 유지에 가장 안전합니다.',
    engineCategory: 'naturally_aspirated',
  };
}
