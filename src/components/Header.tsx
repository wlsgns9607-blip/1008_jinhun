import React from 'react';
import { ChevronLeft, ShieldCheck, User } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  user?: UserProfile;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  user,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-2.5">
          {showBack && (
            <button
              id="header-back-button"
              onClick={onBack}
              className="p-1 -ml-1 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {title ? (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base leading-tight">
                  {title}
                </span>
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 leading-none mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={onBack}>
              {/* CarSync Logo */}
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
                  <circle cx="7.5" cy="14.5" r="1.5" />
                  <circle cx="16.5" cy="14.5" r="1.5" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-black tracking-tight text-lg text-slate-900 leading-none">
                    Car<span className="text-blue-600">Sync</span>
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-blue-600 leading-tight tracking-wider uppercase">
                  Home Diagnosis
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right side profile / status */}
        <div className="flex items-center gap-2">
          {user?.isLoggedIn ? (
            <button
              id="header-user-status-badge"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{user.vehicle.plateNumber}</span>
            </button>
          ) : (
            <button
              id="header-guest-status-badge"
              onClick={onOpenProfile}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              <User className="w-3 h-3" />
              <span>체험 모드</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
