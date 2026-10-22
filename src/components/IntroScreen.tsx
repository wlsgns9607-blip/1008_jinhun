import React from 'react';
import {
  Menu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Wrench,
  Mail,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface IntroScreenProps {
  onGoToAiDiagnosis: () => void;
  onGoToShops: () => void;
  onOpenEmergencyGuide: () => void;
  onOpenIllegalTowGuide?: () => void;
  onGoToEmailLogin: () => void;
  onQuickSocialLogin: (provider: 'kakao' | 'naver' | 'apple' | 'google' | 'guest' | 'large' | 'partner') => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onGoToAiDiagnosis,
  onGoToShops,
  onOpenEmergencyGuide,
  onOpenIllegalTowGuide,
  onGoToEmailLogin,
  onQuickSocialLogin,
}) => {
  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-16 selection:bg-blue-100">
      {/* Header */}
      <div className="bg-white px-4 py-3.5 border-b border-slate-100 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
                <circle cx="7.5" cy="14.5" r="1.5" />
                <circle cx="16.5" cy="14.5" r="1.5" />
              </svg>
            </div>
            <div>
              <div className="font-black tracking-tight text-lg text-slate-900 leading-none">
                Car<span className="text-blue-600">Sync</span>
              </div>
              <div className="text-[10px] font-semibold text-blue-600 leading-tight uppercase tracking-wider">
                Home Diagnosis
              </div>
            </div>
          </div>

          {/* 파트너 정비소 로그인 버튼 (헤더) */}
          <button
            id="header-partner-login-button"
            onClick={() => onQuickSocialLogin('partner')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all border border-slate-700 shadow-xs cursor-pointer active:scale-95"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>파트너 정비소 로그인</span>
          </button>
        </div>
      </div>

      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-4 space-y-4">
        {/* Top Feature Bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center text-slate-700">
              <Menu className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-[13px]">
              AI 스마트 차계부 & 고속도로 안심 케어
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            체험 모드
          </span>
        </div>

        {/* Highway 2nd Accident Prevention Highlight Banner (Pink Alert Card) */}
        <div
          id="intro-highway-banner"
          onClick={onOpenEmergencyGuide}
          className="bg-[#FFF5F5] border border-red-100 rounded-2xl p-4 shadow-sm cursor-pointer hover:border-red-200 transition-all"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <h2 className="text-[15px] font-bold text-[#E02424] leading-tight">
              고속도로 2차 사고 방지 핵심 6대 부품 점검
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-7">
            고속 주행 중 동력 상실 및 조향 불능을 유발하는 치명 부품의 전조증상(소음·진동·냄새)을 사전에 감지합니다.
          </p>
        </div>


        {/* Card: 내주위 카센터 */}
        <div
          id="quick-card-repair-shops"
          className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm flex items-center justify-between select-none hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">내주위 카센터</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                당일 긴급 정비 가능한 공업사 8곳
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-600">
            <span>정비소 보기</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </div>
        </div>

        {/* Bottom Login / Vehicle Link Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-md text-center space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
            간편 1초 시작
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              간편 로그인으로 1초 만에 내 차량 연동하기
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              차량 번호만으로 소모품 교체 주기와 위험 부품을 자동 조회합니다.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Google Login Button */}
            <button
              id="google-login-button"
              type="button"
              onClick={() => onQuickSocialLogin('google')}
              className="w-full h-11 rounded-xl bg-white text-slate-800 font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-all shadow-sm border border-slate-200 active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google 계정으로 계속하기</span>
            </button>

            {/* Kakao Login Button */}
            <button
              id="kakao-login-button"
              onClick={() => onQuickSocialLogin('kakao')}
              className="w-full h-11 rounded-xl bg-[#FEE500] text-[#191919] font-bold text-sm flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-sm active:scale-[0.98]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 3C6.48 3 2 6.48 2 10.77c0 2.74 1.8 5.14 4.54 6.52l-1.15 4.25c-.1.38.33.68.66.47l5.06-3.34c.29.03.59.04.89.04 5.52 0 10-3.48 10-7.77S17.52 3 12 3z" />
              </svg>
              <span>카카오로 3초 만에 시작하기</span>
            </button>

            {/* Naver Login Button */}
            <button
              id="naver-login-button"
              onClick={() => onQuickSocialLogin('naver')}
              className="w-full h-11 rounded-xl bg-[#03C75A] text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-95 transition-all shadow-sm active:scale-[0.98]"
            >
              <span className="font-black text-base">N</span>
              <span>네이버로 로그인</span>
            </button>

            {/* 간편·쉬운말 모드 로그인 버튼 */}
            <button
              id="large-text-login-button"
              onClick={() => onQuickSocialLogin('large')}
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] border border-amber-400/80 cursor-pointer"
            >
              <span className="text-base">👓</span>
              <span>간편·쉬운말 모드</span>
              <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-extrabold ml-0.5">추천</span>
            </button>


            {/* 이메일 로그인 버튼 */}
            <button
              id="email-login-nav-button"
              onClick={onGoToEmailLogin}
              className="w-full h-11 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-200 active:scale-[0.98] cursor-pointer"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>이메일로 로그인 / 회원가입</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              id="guest-browse-button"
              onClick={() => onQuickSocialLogin('guest')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-4 transition-colors"
            >
              로그인 없이 먼저 둘러보기
            </button>
          </div>

          <p className="text-[10px] text-slate-400 pt-1 leading-normal">
            가입 시 CarSync의{' '}
            <span className="underline cursor-pointer">이용약관</span> 및{' '}
            <span className="underline cursor-pointer">개인정보처리방침</span>에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
