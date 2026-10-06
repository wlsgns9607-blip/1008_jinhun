import React from 'react';
import {
  Menu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Wrench,
  Bot,
  Mail,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface IntroScreenProps {
  onGoToAiDiagnosis: () => void;
  onGoToShops: () => void;
  onOpenEmergencyGuide: () => void;
  onGoToEmailLogin: () => void;
  onQuickSocialLogin: (provider: 'kakao' | 'naver' | 'apple' | 'guest') => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onGoToAiDiagnosis,
  onGoToShops,
  onOpenEmergencyGuide,
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

        {/* Feature 1: AI Sound & Smell Diagnosis */}
        <div
          id="feature-card-ai-diagnosis"
          onClick={onGoToAiDiagnosis}
          className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 text-[15px] flex items-center gap-1">
              1. 실시간 이상 소음 & 냄새 AI 진단
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-bold border border-red-100">
              무료 체험
            </span>
          </div>

          <div className="bg-red-50/60 rounded-xl px-3 py-2 text-xs text-red-700 font-medium flex items-center gap-1 mb-3">
            <span className="text-red-500 font-bold">↳</span>
            <span>끼익 쇳소리, 고무 탄 냄새 등 전조증상 1초 분석</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>기계음 학습 데이터 120만 건</span>
              <span className="font-bold text-red-600">정확도 98.4%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-rose-600 h-full rounded-full transition-all duration-1000"
                style={{ width: '98.4%' }}
              />
            </div>
          </div>
        </div>

        {/* Feature 2: Safe Repair Shop Finder */}
        <div
          id="feature-card-repair-shop"
          onClick={onGoToShops}
          className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 text-[15px] flex items-center gap-1">
              2. 내 주변 안심 양심 정비소 찾기
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">
              공임정찰제
            </span>
          </div>

          <div className="bg-blue-50/60 rounded-xl px-3 py-2 text-xs text-blue-700 font-medium flex items-center gap-1 mb-3">
            <span className="text-blue-500 font-bold">↳</span>
            <span>과잉정비 없는 전국 1급 인증 안심 공업사 실시간 매칭</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>투명 공임표 견적 사전 확인</span>
              <span className="font-bold text-blue-600">바가지 수리비 0원</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                style={{ width: '92%' }}
              />
            </div>
          </div>
        </div>

        {/* Feature 3: Highway Shoulder Emergency Evacuation Guide */}
        <div
          id="feature-card-emergency-guide"
          onClick={onOpenEmergencyGuide}
          className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900 text-[15px] flex items-center gap-1">
              3. 고속도로 갓길 비상 대피 가이드
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100">
              긴급 지원
            </span>
          </div>

          <div className="bg-emerald-50/60 rounded-xl px-3 py-2 text-xs text-emerald-700 font-medium flex items-center gap-1 mb-3">
            <span className="text-emerald-500 font-bold">↳</span>
            <span>돌발 고장 시 원터치 2차 사고 대피 요령 & 무료 견인 안내</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>한국도로공사 긴급견인 서비스 공식 연동</span>
            <span className="font-bold text-emerald-600">24시간 상시 지원</span>
          </div>
        </div>

        {/* Quick Dual Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: 내주위 카센터 */}
          <div
            id="quick-card-repair-shops"
            onClick={onGoToShops}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-sm cursor-pointer hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Wrench className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">내주위 카센터</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                당일 긴급 정비 가능한 공업사 8곳
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs font-bold text-blue-600">
              <span>정비소 보기</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>

          {/* Card 2: AI 카싱크 챗 */}
          <div
            id="quick-card-ai-chat"
            onClick={onGoToAiDiagnosis}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-sm cursor-pointer hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Bot className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">AI 카싱크 챗</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                고장 전조증상 및 견적 1초 상담
              </p>
            </div>
            <div className="mt-3 flex items-center text-xs font-bold text-indigo-600">
              <span>AI 상담 시작</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
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

            {/* Apple & Email Split Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="apple-login-button"
                onClick={() => onQuickSocialLogin('apple')}
                className="h-10 rounded-xl bg-[#0F172A] text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-all"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.88c.64-.78 1.08-1.86.96-2.88-.93.04-2.05.62-2.71 1.4-.58.67-1.09 1.77-.95 2.81 1.04.08 2.07-.55 2.7-1.33z" />
                </svg>
                <span>Apple</span>
              </button>

              <button
                id="email-login-nav-button"
                onClick={onGoToEmailLogin}
                className="h-10 rounded-xl bg-[#F1F5F9] text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-all border border-slate-200"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>이메일 로그인</span>
              </button>
            </div>
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
