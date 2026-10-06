import React from 'react';
import { Gauge, Bot, MapPin } from 'lucide-react';

export type NavTab = 'home' | 'ai' | 'shops';

interface NavigationProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 md:bottom-4 left-0 right-0 z-30 pointer-events-none flex justify-center px-0 md:px-4">
      <div className="w-full max-w-md md:max-w-lg bg-white/95 backdrop-blur-md border-t md:border border-slate-200/90 py-2 px-6 md:rounded-2xl shadow-lg md:shadow-2xl shadow-slate-300/40 pointer-events-auto flex items-center justify-around transition-all">
        {/* 홈 / 진단 (매칭 및 홈) */}
        <button
          id="nav-tab-home"
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className="relative">
            <Gauge className={`w-5.5 h-5.5 md:w-6 md:h-6 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {currentTab === 'home' && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[11px] md:text-xs mt-1">홈/진단</span>
        </button>

        {/* AI 카싱크 이상 증상 진단 */}
        <button
          id="nav-tab-ai"
          onClick={() => onChangeTab('ai')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${
            currentTab === 'ai'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className="relative">
            <Bot className={`w-5.5 h-5.5 md:w-6 md:h-6 ${currentTab === 'ai' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-red-500 text-[9px] text-white rounded-full font-extrabold animate-pulse">
              LIVE
            </span>
          </div>
          <span className="text-[11px] md:text-xs mt-1">AI 챗봇</span>
        </button>

        {/* 내 주변 정비소 탭 */}
        <button
          id="nav-tab-shops"
          onClick={() => onChangeTab('shops')}
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all ${
            currentTab === 'shops'
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className="relative">
            <MapPin className={`w-5.5 h-5.5 md:w-6 md:h-6 ${currentTab === 'shops' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          </div>
          <span className="text-[11px] md:text-xs mt-1">내 주변 정비소</span>
        </button>
      </div>
    </nav>
  );
};
