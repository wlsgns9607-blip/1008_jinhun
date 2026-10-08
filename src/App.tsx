import React, { useState } from 'react';
import { IntroScreen } from './components/IntroScreen';
import { EmailLoginScreen } from './components/EmailLoginScreen';
import { VehicleSetupScreen } from './components/VehicleSetupScreen';
import { HomeScreen } from './components/HomeScreen';
import { RepairShopsScreen } from './components/RepairShopsScreen';
import { AiDiagnosisScreen } from './components/AiDiagnosisScreen';
import { Navigation, NavTab } from './components/Navigation';
import { EmergencyGuideModal } from './components/EmergencyGuideModal';
import { EstimateModal } from './components/EstimateModal';
import { BookingModal } from './components/BookingModal';
import { DirectionsModal } from './components/DirectionsModal';
import { PhoneConsultModal } from './components/PhoneConsultModal';
import { DEFAULT_USER_PROFILE, REPAIR_SHOPS, CORE_PARTS } from './data/mockData';
import { RepairShop, CorePartDiagnostic, UserProfile, VehicleInfo } from './types';

export default function App() {
  // Navigation & Screen state: intro -> email-login -> vehicle-setup -> main
  const [screen, setScreen] = useState<'intro' | 'email-login' | 'vehicle-setup' | 'main'>('intro');
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  // Modals state
  const [isEmergencyGuideOpen, setIsEmergencyGuideOpen] = useState(false);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const [bookingModalState, setBookingModalState] = useState<{
    isOpen: boolean;
    shop: RepairShop | null;
    part: CorePartDiagnostic | null;
  }>({
    isOpen: false,
    shop: null,
    part: null,
  });
  const [directionsModalState, setDirectionsModalState] = useState<{
    isOpen: boolean;
    shop: RepairShop | null;
  }>({
    isOpen: false,
    shop: null,
  });
  const [phoneModalState, setPhoneModalState] = useState<{
    isOpen: boolean;
    shop: RepairShop | null;
  }>({
    isOpen: false,
    shop: null,
  });

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Actions from Intro screen
  const handleQuickSocialLogin = (provider: 'kakao' | 'naver' | 'apple' | 'guest') => {
    setUser({
      ...DEFAULT_USER_PROFILE,
      isLoggedIn: provider !== 'guest',
      email: provider === 'guest' ? 'guest@carsync.kr' : `${provider}.user@carsync.kr`,
    });
    // Immediately open Vehicle Setup screen as requested!
    setScreen('vehicle-setup');
    showToast(
      provider === 'guest'
        ? '체험 모드로 입장했습니다. 차량 설정을 진행해 주세요.'
        : `${provider.toUpperCase()} 로그인 완료! 차량 상세 설정을 시작합니다.`
    );
  };

  const handleEmailLoginSuccess = (email: string) => {
    setUser({
      ...DEFAULT_USER_PROFILE,
      email,
      isLoggedIn: true,
    });
    // Immediately open Vehicle Setup screen after login as requested!
    setScreen('vehicle-setup');
    showToast(`${email} 로그인 성공! 등록할 차량 스펙을 설정해 주세요.`);
  };

  const handleVehicleSetupComplete = (newVehicle: VehicleInfo) => {
    setUser((prev) => ({
      ...prev,
      vehicle: newVehicle,
    }));
    setScreen('main');
    setCurrentTab('home');
    showToast(`${newVehicle.model} 차량 설정 및 진단 프로필 등록이 완료되었습니다!`);
  };

  const handleOpenBooking = (shop?: RepairShop, part?: CorePartDiagnostic) => {
    setBookingModalState({
      isOpen: true,
      shop: shop || REPAIR_SHOPS[0],
      part: part || null,
    });
  };

  const handleOpenDirections = (shop: RepairShop) => {
    setDirectionsModalState({
      isOpen: true,
      shop,
    });
  };

  const handleOpenPhoneConsult = (shop: RepairShop) => {
    setPhoneModalState({
      isOpen: true,
      shop,
    });
  };

  const handleUpdateMileage = (newMileage: number) => {
    setUser((prev) => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        mileage: newMileage,
      },
    }));
    showToast(`주행거리가 ${newMileage.toLocaleString()} km로 업데이트되었습니다.`);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen 1: Intro / Login before screen (CarSync 로그인 전 화면.png) */}
      {screen === 'intro' && (
        <IntroScreen
          onGoToAiDiagnosis={() => {
            setScreen('main');
            setCurrentTab('ai');
          }}
          onGoToShops={() => {
            setScreen('main');
            setCurrentTab('home');
          }}
          onOpenEmergencyGuide={() => setIsEmergencyGuideOpen(true)}
          onGoToEmailLogin={() => setScreen('email-login')}
          onQuickSocialLogin={handleQuickSocialLogin}
        />
      )}

      {/* Screen 2: Email Login (CarSync 이메일 로그인.png) */}
      {screen === 'email-login' && (
        <EmailLoginScreen
          onBack={() => setScreen('intro')}
          onLoginSuccess={handleEmailLoginSuccess}
        />
      )}

      {/* Screen 2.5: Vehicle Setup Screen (로그인 후 차량 설정 화면) */}
      {screen === 'vehicle-setup' && (
        <VehicleSetupScreen
          initialVehicle={user.vehicle}
          onComplete={handleVehicleSetupComplete}
          onBack={() => setScreen('main')}
        />
      )}

      {/* Screen 3: Main App with Navigation (Html → Body.png & Html → Body-1.png) */}
      {screen === 'main' && (
        <div className="relative">

          {/* Current Tab Body */}
          {currentTab === 'home' && (
            <HomeScreen
              user={user}
              onOpenBooking={(shop, part) => handleOpenBooking(shop, part)}
              onOpenEmergencyGuide={() => setIsEmergencyGuideOpen(true)}
              onGoToAiDiagnosis={() => setCurrentTab('ai')}
              onGoToShops={() => setCurrentTab('shops')}
              onLogout={() => setScreen('intro')}
              onUpdateMileage={handleUpdateMileage}
              onOpenVehicleSetup={() => setScreen('vehicle-setup')}
            />
          )}

          {currentTab === 'ai' && (
            <AiDiagnosisScreen
              user={user}
              onBack={() => setCurrentTab('home')}
              onBookPart={(part) => handleOpenBooking(undefined, part)}
              onGoToShops={() => setCurrentTab('shops')}
            />
          )}

          {currentTab === 'shops' && (
            <RepairShopsScreen
              user={user}
              onOpenBooking={(shop) => handleOpenBooking(shop)}
              onOpenDirections={handleOpenDirections}
              onOpenPhoneConsult={handleOpenPhoneConsult}
              onOpenEstimate={() => setIsEstimateModalOpen(true)}
              onGoToAiDiagnosis={() => setCurrentTab('ai')}
            />
          )}

          {/* Bottom Fixed Navigation */}
          <Navigation currentTab={currentTab} onChangeTab={setCurrentTab} />
        </div>
      )}

      {/* Modals */}
      <EmergencyGuideModal
        isOpen={isEmergencyGuideOpen}
        onClose={() => setIsEmergencyGuideOpen(false)}
      />

      <EstimateModal
        isOpen={isEstimateModalOpen}
        user={user}
        onClose={() => setIsEstimateModalOpen(false)}
        onProceedBooking={(selectedItems) => {
          setIsEstimateModalOpen(false);
          handleOpenBooking();
          showToast(`${selectedItems.length}개 부품 예약 접수창으로 이동합니다.`);
        }}
      />

      <BookingModal
        isOpen={bookingModalState.isOpen}
        shop={bookingModalState.shop}
        initialPart={bookingModalState.part}
        user={user}
        onClose={() =>
          setBookingModalState({ isOpen: false, shop: null, part: null })
        }
        onSuccess={(bookingId) => {
          showToast(`정비 예약이 접수되었습니다. (예약번호: ${bookingId})`);
        }}
      />

      <DirectionsModal
        isOpen={directionsModalState.isOpen}
        shop={directionsModalState.shop}
        onClose={() => setDirectionsModalState({ isOpen: false, shop: null })}
      />

      <PhoneConsultModal
        isOpen={phoneModalState.isOpen}
        shop={phoneModalState.shop}
        onClose={() => setPhoneModalState({ isOpen: false, shop: null })}
      />
    </div>
  );
}
