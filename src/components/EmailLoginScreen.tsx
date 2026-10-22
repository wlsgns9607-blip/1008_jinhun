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
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../main';

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
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      if (isSignUp) {
        // Firebase Auth 회원가입
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setIsLoading(false);
        onLoginSuccess(userCredential.user.email || email);
      } else {
        // Firebase Auth 로그인
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          setIsLoading(false);
          onLoginSuccess(userCredential.user.email || email);
        } catch (signInErr: any) {
          // 사용자가 등록되지 않은 경우 (user-not-found 혹은 invalid-credential) 자동 회원가입 유도 또는 체험 로그인 지원
          if (
            signInErr.code === 'auth/user-not-found' ||
            signInErr.code === 'auth/invalid-credential'
          ) {
            try {
              // 신규 계정으로 자동 생성 시도
              const newUser = await createUserWithEmailAndPassword(auth, email, password);
              setIsLoading(false);
              onLoginSuccess(newUser.user.email || email);
              return;
            } catch (createErr: any) {
              if (createErr.code === 'auth/email-already-in-use') {
                setErrorMessage('비밀번호가 일치하지 않습니다. 비밀번호를 다시 확인해 주세요.');
              } else if (createErr.code === 'auth/weak-password') {
                setErrorMessage('비밀번호는 6자리 이상이어야 합니다.');
              } else if (createErr.code === 'auth/operation-not-allowed') {
                // Firebase Console에서 Email 인증 미활성화 시 안내 후 로컬 세션 전환
                setInfoMessage('Firebase 이메일 공급자 연결 확인 중: 데모 모드로 즉시 로그인합니다.');
                setTimeout(() => onLoginSuccess(email), 500);
                return;
              } else {
                setErrorMessage(createErr.message || '인증 중 오류가 발생했습니다.');
              }
            }
          } else if (signInErr.code === 'auth/wrong-password') {
            setErrorMessage('비밀번호가 올바르지 않습니다.');
          } else if (signInErr.code === 'auth/operation-not-allowed') {
            setInfoMessage('Firebase 콘솔 이메일 공급자 대기 상태: 로컬 세션으로 즉시 로그인합니다.');
            setTimeout(() => onLoginSuccess(email), 500);
            return;
          } else {
            setErrorMessage(`로그인 오류: ${signInErr.code || signInErr.message}`);
          }
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || '인증 처리 중 오류가 발생했습니다.');
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert('비밀번호를 재설정할 이메일 주소를 입력해 주세요.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`${email} 주소로 비밀번호 재설정 링크가 전송되었습니다.`);
    } catch (err: any) {
      alert(`비밀번호 재설정 요청 실패: ${err.message || err.code}`);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setIsLoading(false);
      onLoginSuccess(result.user.email || 'google.user@carsync.kr');
    } catch (err: any) {
      console.error('Google login error:', err);
      setIsLoading(false);
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(`⚠️ 승인되지 않은 도메인: Firebase 콘솔의 Authorized domains에 현재 주소(${window.location.hostname})를 추가해야 구글 로그인이 작동합니다.`);
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage('⚠️ Firebase 콘솔 > Authentication > Sign-in method에서 Google 제공업체를 사용 설정(ON)해 주세요.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('로그인 팝업 창이 닫혔습니다.');
      } else {
        setErrorMessage(`Google 로그인 실패: ${err.message || err.code}`);
      }
    }
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
            Firebase 실시간 인증
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isSignUp ? '이메일로 회원가입' : '이메일로 로그인'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isSignUp
              ? 'CarSync 통합 계정을 생성하여 실시간 차량 진단 데이터를 동기화하세요.'
              : '가입하신 이메일 주소와 비밀번호를 입력해 주세요.'}
          </p>
        </div>

        {/* Error / Info Messages */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}
        {infoMessage && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium flex items-start gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">{infoMessage}</div>
          </div>
        )}

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
                6자 이상 영문·숫자 조합
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
                onClick={() => alert('등록된 기본 계정: driver.kim@carsync.kr')}
                className="hover:text-slate-600 transition-colors"
              >
                아이디 찾기
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handlePasswordReset}
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
            className="w-full h-12 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all disabled:opacity-75 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? '계정 생성하고 시작하기' : '로그인하기'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Social Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2.5 text-slate-400 font-semibold text-[11px]">
                또는
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            id="email-screen-google-button"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-white text-slate-800 font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-all shadow-xs border border-slate-200 active:scale-[0.98] cursor-pointer"
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
        </form>

        {/* Sync Card */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-800">
                Firebase 클라우드 연동
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
            {isSignUp ? (
              <>
                이미 CarSync 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage(null);
                  }}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  로그인하기 &gt;
                </button>
              </>
            ) : (
              <>
                아직 CarSync 회원이 아니신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage(null);
                  }}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  회원가입하기 &gt;
                </button>
              </>
            )}
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
