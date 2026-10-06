import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  Laptop,
  CheckCircle2,
  Headphones,
  ArrowRight,
} from 'lucide-react';

interface EmailLoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (email: string) => void;
}

export const EmailLoginScreen: React.FC<EmailLoginScreenProps> = ({
  onBack,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('driver.kim@carsync.kr');
  const [password, setPassword] = useState('Passcode2025!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar with back button & CarSync brand */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <button
          id="email-login-back-button"
          onClick={onBack}
          className="p-1 -ml-1 text-slate-800 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2 pr-6">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
            </svg>
          </div>
          <span className="font-extrabold text-slate-900 text-base tracking-tight">
            Car<span className="text-blue-600">Sync</span>
          </span>
        </div>

        <div className="w-6" />
      </div>

      <div className="max-w-md mx-auto px-5 pt-6 pb-12 space-y-6">
        {/* Header Titles */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            통합 계정 인증
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            이메일로 로그인
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            가입하신 이메일 주소와 비밀번호를 입력해 주세요.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              이메일 주소
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                id="email-input-field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
                className="w-full h-12 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmail('')}
                  className="absolute right-3 w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                비밀번호
              </label>
              <span className="text-[11px] text-slate-400 font-normal">
                8자 이상 영문·숫자 조합
              </span>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                id="password-input-field"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                className="w-full h-12 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Find account */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">
                로그인 상태 유지
              </span>
            </label>

            <div className="text-xs text-slate-400 space-x-1.5">
              <button
                type="button"
                onClick={() => alert('아이디 찾기: driver.kim@carsync.kr 로 등록되어 있습니다.')}
                className="hover:text-slate-600 transition-colors"
              >
                아이디 찾기
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => alert('비밀번호 재설정 이메일이 발송되었습니다.')}
                className="hover:text-slate-600 transition-colors"
              >
                비밀번호 재설정
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="email-login-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all disabled:opacity-75"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>로그인하기</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sync Card */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-800">
                안전한 데이터 동기화
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                로그인 즉시 등록된 제네시스 G80 차량 연동
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            준비됨
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-3 pt-6 border-t border-slate-100">
          <div className="text-xs text-slate-600">
            아직 CarSync 회원이 아니신가요?{' '}
            <button
              onClick={() => {
                alert('CarSync 신규 계정 가입이 즉시 완료되었습니다!');
                onLoginSuccess('driver.kim@carsync.kr');
              }}
              className="font-bold text-blue-600 hover:underline"
            >
              회원가입하기 &gt;
            </button>
          </div>

          <button
            onClick={() => alert('카싱크 24시 고객센터: 1600-8282 (평일/주말 24시간 상시 운영)')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>로그인에 어려움이 있으신가요? 고객센터 문의</span>
          </button>
        </div>
      </div>
    </div>
  );
};
