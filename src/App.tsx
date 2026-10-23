import React, { useState, useEffect } from 'react';
import { IntroScreen } from './components/IntroScreen';
import { EmailLoginScreen } from './components/EmailLoginScreen';
import { VehicleSetupScreen } from './components/VehicleSetupScreen';
import { HomeScreen } from './components/HomeScreen';
import { RepairShopsScreen } from './components/RepairShopsScreen';
import { AiDiagnosisScreen } from './components/AiDiagnosisScreen';
import { Navigation, NavTab } from './components/Navigation';
import { EmergencyGuideModal } from './components/EmergencyGuideModal';
import { IllegalTowGuideModal } from './components/IllegalTowGuideModal';
import { EstimateModal } from './components/EstimateModal';
import { BookingModal } from './components/BookingModal';
import { DirectionsModal } from './components/DirectionsModal';
import { PhoneConsultModal } from './components/PhoneConsultModal';
import { MechanicPosScreen } from './components/MechanicPosScreen';
import { DEFAULT_USER_PROFILE, REPAIR_SHOPS, CORE_PARTS } from './data/mockData';
import { RepairShop, CorePartDiagnostic, UserProfile, VehicleInfo } from './types';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './main';

export default function App() {
  // Navigation & Screen state: intro -> email-login -> vehicle-setup -> main -> partner-shop
  const [screen, setScreen] = useState<'intro' | 'email-login' | 'vehicle-setup' | 'main' | 'partner-shop'>('intro');
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const savedVehicleJson = typeof window !== 'undefined' ? localStorage.getItem(`carsync_vehicle_${firebaseUser.email}`) : null;
        let savedVehicle: VehicleInfo | undefined = undefined;
        if (savedVehicleJson) {
          try {
            savedVehicle = JSON.parse(savedVehicleJson);
          } catch (e) {
            console.warn('저장된 차량 복원 실패:', e);
          }
        }

        setUser((prev) => ({
          ...prev,
          name: firebaseUser.displayName || prev.name,
          email: firebaseUser.email || prev.email,
          isLoggedIn: true,
          vehicle: savedVehicle || prev.vehicle,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Modals state
  const [isEmergencyGuideOpen, setIsEmergencyGuideOpen] = useState(false);
  const [isIllegalTowGuideOpen, setIsIllegalTowGuideOpen] = useState(false);
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
  const [openDetailingOnHome, setOpenDetailingOnHome] = useState(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Actions from Intro screen
  const handleQuickSocialLogin = async (provider: 'kakao' | 'naver' | 'apple' | 'google' | 'guest' | 'large' | 'partner') => {
    if (provider === 'partner') {
      setUser({
        ...DEFAULT_USER_PROFILE,
        name: '동일모터스 김진우 명장',
        isLoggedIn: true,
        email: 'mechanic.kim@carsync.kr',
        loginProvider: 'partner',
      });
      setScreen('partner-shop');
      showToast('🔧 [현장 정비사 스마트 패드] POS 시스템에 연결되었습니다.');
      return;
    }

    if (provider === 'google') {
      try {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        const userEmail = result.user.email || 'google.user@carsync.kr';
        const userName = result.user.displayName || '구글 운전자';

        // 1번 이상 차량 설정을 완료했는지 확인
        const savedVehicleJson = typeof window !== 'undefined' ? localStorage.getItem(`carsync_vehicle_${userEmail}`) : null;

        if (savedVehicleJson) {
          try {
            const savedVehicle: VehicleInfo = JSON.parse(savedVehicleJson);
            setUser({
              ...DEFAULT_USER_PROFILE,
              name: userName,
              email: userEmail,
              isLoggedIn: true,
              loginProvider: 'google',
              vehicle: savedVehicle,
            });
            setScreen('main');
            setCurrentTab('home');
            showToast(`🎉 Google 계정(${userEmail}) 로그인! 등록된 ${savedVehicle.model} 정보로 바로 이동합니다.`);
            return;
          } catch (e) {
            console.warn('저장된 차량 정보 복원 실패:', e);
          }
        }

        // 최초 로그인(설정 정보 없음)일 때만 1번째 차량 설정 화면으로 이동
        setUser({
          ...DEFAULT_USER_PROFILE,
          name: userName,
          email: userEmail,
          isLoggedIn: true,
          loginProvider: 'google',
        });
        setScreen('vehicle-setup');
        showToast(`🎉 Google 계정(${userEmail}) 최초 로그인 성공! 차량 설정을 진행해 주세요.`);
        return;
      } catch (err: any) {
        console.error('Google signInWithPopup error:', err);
        if (err.code === 'auth/unauthorized-domain') {
          showToast('⚠️ 도메인 미승인: Firebase 콘솔 > Authorized domains에 Vercel 주소를 등록해 주세요.');
          alert(`[Google 로그인 오류 - 승인되지 않은 도메인]\n\n현재 접속 주소(${window.location.hostname})가 파이어베이스에 등록되지 않았습니다.\n\n해결 방법:\n1. Firebase 콘솔 > Authentication > Settings(설정)\n2. Authorized domains(승인된 도메인)에 "${window.location.hostname}" 추가`);
        } else if (err.code === 'auth/operation-not-allowed') {
          showToast('⚠️ Firebase 콘솔에서 Google 로그인을 사용 설정해 주세요.');
          alert('[Google 로그인 오류]\nFirebase 콘솔 > Authentication > Sign-in method에서 Google 제공업체를 사용 설정(ON)해 주세요.');
        } else if (err.code === 'auth/popup-closed-by-user') {
          showToast('로그인 창이 닫혔습니다.');
        } else {
          showToast(`⚠️ 로그인 실패: ${err.message || err.code}`);
        }
        return;
      }
    }

    setUser({
      ...DEFAULT_USER_PROFILE,
      isLoggedIn: provider !== 'guest',
      email: provider === 'guest' ? 'guest@carsync.kr' : provider === 'large' ? 'senior.user@carsync.kr' : `${provider}.user@carsync.kr`,
      loginProvider: provider,
    });
    // Immediately open Vehicle Setup screen as requested!
    setScreen('vehicle-setup');
    showToast(
      provider === 'guest'
        ? '체험 모드로 입장했습니다. 차량 설정을 진행해 주세요.'
        : provider === 'large'
        ? '👓 간편·쉬운말 모드로 입장했습니다! 차량 설정을 시작합니다.'
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
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        vehicle: newVehicle,
      };
      if (typeof window !== 'undefined' && updatedUser.email) {
        localStorage.setItem(`carsync_vehicle_${updatedUser.email}`, JSON.stringify(newVehicle));
      }
      return updatedUser;
    });
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
    setUser((prev) => {
      const updatedVehicle = {
        ...prev.vehicle,
        mileage: newMileage,
      };
      if (typeof window !== 'undefined' && prev.email) {
        localStorage.setItem(`carsync_vehicle_${prev.email}`, JSON.stringify(updatedVehicle));
      }
      return {
        ...prev,
        vehicle: updatedVehicle,
      };
    });
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
          onOpenIllegalTowGuide={() => setIsIllegalTowGuideOpen(true)}
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
          initialSeniorMode={user.loginProvider === 'large'}
          onComplete={handleVehicleSetupComplete}
          onBack={() => setScreen('main')}
        />
      )}

      {/* Screen: Partner Shop POS (Mechanic Smart Pad - User Screenshot View) */}
      {screen === 'partner-shop' && (
        <MechanicPosScreen
          onBackToIntro={() => setScreen('intro')}
          onShowToast={showToast}
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
              onLogout={async () => {
                try {
                  await signOut(auth);
                } catch (err) {
                  console.warn('Firebase SignOut error:', err);
                }
                setUser(DEFAULT_USER_PROFILE);
                setScreen('intro');
                showToast('로그아웃되었습니다.');
              }}
              onUpdateMileage={handleUpdateMileage}
              onOpenVehicleSetup={() => setScreen('vehicle-setup')}
              initialOpenDetailing={openDetailingOnHome}
              onCloseDetailing={() => setOpenDetailingOnHome(false)}
            />
          )}

          {currentTab === 'ai' && (
            <AiDiagnosisScreen
              user={user}
              onBack={() => setCurrentTab('home')}
              onBookPart={(part) => handleOpenBooking(undefined, part)}
              onGoToShops={() => setCurrentTab('shops')}
              onGoToDetailingShops={() => {
                setOpenDetailingOnHome(true);
                setCurrentTab('home');
              }}
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

          {/* Bottom Fixed Navigation (Hidden on Home screen per user request) */}
          {currentTab !== 'home' && (
            <Navigation currentTab={currentTab} onChangeTab={setCurrentTab} />
          )}
        </div>
      )}

      {/* Modals */}
      <EmergencyGuideModal
        isOpen={isEmergencyGuideOpen}
        onClose={() => setIsEmergencyGuideOpen(false)}
        onOpenIllegalTow={() => setIsIllegalTowGuideOpen(true)}
      />

      <IllegalTowGuideModal
        isOpen={isIllegalTowGuideOpen}
        onClose={() => setIsIllegalTowGuideOpen(false)}
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
