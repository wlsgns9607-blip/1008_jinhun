import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Mic,
  Send,
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  RotateCcw,
  Sparkles,
  X,
  Upload,
  RefreshCw,
  Trash2,
  Maximize2,
  Layers,
} from 'lucide-react';

interface MechanicPosScreenProps {
  onBackToIntro: () => void;
  onShowToast: (msg: string) => void;
}

interface PhotoItem {
  id: string;
  title: string;
  tag: string;
  description: string;
  size: string;
  imageUrl: string | null;
  isRealCapture: boolean;
  capturedAt?: string;
}

// Preset defect demonstration photos (realistic high-contrast automotive mechanic photos)
const PRESET_DEFECT_1 = 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80'; // Knuckle/Brake crack inspection
const PRESET_DEFECT_2 = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'; // Lower arm bushing underbody

export const MechanicPosScreen: React.FC<MechanicPosScreenProps> = ({
  onBackToIntro,
  onShowToast,
}) => {
  // Timer State (09:58 from 598 seconds)
  const [timeLeft, setTimeLeft] = useState(598);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Photos State
  const [photo1, setPhoto1] = useState<PhotoItem>({
    id: 'p1',
    title: '[사진 1] 너클 미세 크랙',
    tag: '크랙 길이 3.2cm 식별됨',
    description: '고속 주행 중 비틀림 피로 누적으로 인한 너클 하단 3.2cm 크랙',
    size: 'JPG · 3.4MB',
    imageUrl: null,
    isRealCapture: false,
  });

  const [photo2, setPhoto2] = useState<PhotoItem>({
    id: 'p2',
    title: '[사진 2] 로어암 부싱 경화',
    tag: '고무 찢김 및 유격 발생',
    description: '10만km 주행 피로로 인한 부싱 고무 완전 파단 및 유격 발생',
    size: 'JPG · 2.9MB',
    imageUrl: null,
    isRealCapture: false,
  });

  // Recording State
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [sttText, setSttText] = useState(
    '“마이크 버튼을 누르면 30초간 정비 소견을 바로 음성으로 녹음합니다.”'
  );

  // Sent State & Customer Decision
  const [isSent, setIsSent] = useState(false);
  const [customerDecision, setCustomerDecision] = useState<'pending' | 'approved_b' | 'approved_a'>('pending');

  // --- Sequential Dual-Photo Camera Workflow State ---
  // modalStep: 'closed' | 1 (shooting photo 1) | 2 (shooting photo 2) | 'review' (both taken, confirming)
  const [cameraModalStep, setCameraModalStep] = useState<'closed' | 1 | 2 | 'review'>('closed');
  const [tempPhoto1, setTempPhoto1] = useState<string | null>(null);
  const [tempPhoto2, setTempPhoto2] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStreamActive, setIsCameraStreamActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [shutterFlash, setShutterFlash] = useState(false);

  // Preview full image modal
  const [expandedImage, setExpandedImage] = useState<{ title: string; url: string } | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dualFileInputRef = useRef<HTMLInputElement | null>(null);

  const bothPhotosTaken = Boolean(photo1.imageUrl && photo2.imageUrl);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Manage camera stream lifecycle for step 1 & 2
  useEffect(() => {
    const isCapturing = cameraModalStep === 1 || cameraModalStep === 2;

    if (isCapturing) {
      let isMounted = true;

      const initCamera = async () => {
        setCameraError(null);
        setIsCameraStreamActive(false);

        // Stop existing stream if facing mode changed
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('이 브라우저는 카메라 API를 지원하지 않습니다.');
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          if (!isMounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            try {
              await videoRef.current.play();
            } catch (playErr) {
              console.warn('Video play issue:', playErr);
            }
          }
          setIsCameraStreamActive(true);
        } catch (err: any) {
          console.warn('Camera error:', err);
          if (!isMounted) return;
          setIsCameraStreamActive(false);
          setCameraError(
            err?.name === 'NotAllowedError' || err?.message?.includes('Permission')
              ? '카메라 권한이 거부되었습니다. 아래 [실물 사진 즉시 적용] 또는 파일 선택을 이용해 주세요.'
              : '카메라 장치를 감지하지 못했습니다. 아래 [실물 사진 즉시 적용]으로 계속 진행할 수 있습니다.'
          );
        }
      };

      initCamera();

      return () => {
        isMounted = false;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };
    } else {
      // If closed or in review mode, stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraStreamActive(false);
    }
  }, [cameraModalStep, facingMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Start the 1-button 2-photo workflow ---
  const handleStartDualCapture = () => {
    setTempPhoto1(null);
    setTempPhoto2(null);
    setCameraError(null);
    setCameraModalStep(1); // Start with Step 1
    onShowToast('📸 [1/2] 1차 파손 부위(너클 미세 크랙)를 화면에 맞춰주세요.');
  };

  const handleCloseCameraModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraStreamActive(false);
    setCameraModalStep('closed');
    setTempPhoto1(null);
    setTempPhoto2(null);
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Helper to grab frame from video
  const captureFrame = (label: string): string | null => {
    if (!videoRef.current) return null;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Watermark
      const now = new Date();
      const timeStr = `${now.toLocaleDateString('ko-KR')} ${now.toLocaleTimeString('ko-KR')}`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(16, canvas.height - 48, 480, 32);
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`[TechBay 현장 점검] ${label} - ${timeStr}`, 24, canvas.height - 26);

      return canvas.toDataURL('image/jpeg', 0.88);
    } catch (e) {
      console.error('Frame capture error:', e);
      return null;
    }
  };

  // Shutter action: handles step 1 -> step 2 -> review
  const handleShutterClick = () => {
    // Trigger visual flash
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    if (cameraModalStep === 1) {
      const dataUrl = captureFrame('너클 미세 크랙');
      if (dataUrl) {
        setTempPhoto1(dataUrl);
        setCameraModalStep(2); // Automatically advance to Step 2!
        onShowToast('✅ [1차 완료] 이어서 2차 파손 부위(로어암 부싱)를 촬영해 주세요!');
      } else {
        onShowToast('사진 캡처 중 오류가 발생했습니다.');
      }
    } else if (cameraModalStep === 2) {
      const dataUrl = captureFrame('로어암 부싱');
      if (dataUrl) {
        setTempPhoto2(dataUrl);
        setCameraModalStep('review'); // Both taken! Move to review
        onShowToast('🎉 2장 연속 촬영 완료! 확인 후 등록해 주세요.');
      } else {
        onShowToast('사진 캡처 중 오류가 발생했습니다.');
      }
    }
  };

  // Confirm both photos and save to main state
  const handleConfirmBothPhotos = () => {
    if (!tempPhoto1 || !tempPhoto2) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    setPhoto1((prev) => ({
      ...prev,
      imageUrl: tempPhoto1,
      isRealCapture: true,
      size: 'JPG · 3.4MB',
      capturedAt: timeStr,
    }));

    setPhoto2((prev) => ({
      ...prev,
      imageUrl: tempPhoto2,
      isRealCapture: true,
      size: 'JPG · 2.9MB',
      capturedAt: timeStr,
    }));

    onShowToast('🎉 [사진 2장] 현장 실물 파손 사진이 성공적으로 등록되었습니다!');
    handleCloseCameraModal();
  };

  // One-click apply preset defect photos (for desktop without camera)
  const handleApplyPresetBoth = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    setPhoto1((prev) => ({
      ...prev,
      imageUrl: PRESET_DEFECT_1,
      isRealCapture: true,
      size: 'JPG · 3.4MB',
      capturedAt: timeStr,
    }));

    setPhoto2((prev) => ({
      ...prev,
      imageUrl: PRESET_DEFECT_2,
      isRealCapture: true,
      size: 'JPG · 2.9MB',
      capturedAt: timeStr,
    }));

    onShowToast('📸 현장 결함 실물 고화질 2장 샘플 사진이 원클릭 등록되었습니다.');
    handleCloseCameraModal();
  };

  // File upload for 2 photos
  const handleDualFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file1 = files[0];
    const file2 = files.length > 1 ? files[1] : files[0];

    const reader1 = new FileReader();
    reader1.onload = () => {
      const url1 = reader1.result as string;
      const reader2 = new FileReader();
      reader2.onload = () => {
        const url2 = reader2.result as string;
        setTempPhoto1(url1);
        setTempPhoto2(url2);
        setCameraModalStep('review');
        onShowToast('📁 선택하신 2장의 사진을 불러왔습니다.');
      };
      reader2.readAsDataURL(file2);
    };
    reader1.readAsDataURL(file1);
    e.target.value = '';
  };

  // Reset photos
  const handleResetPhotos = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPhoto1((prev) => ({ ...prev, imageUrl: null, isRealCapture: false }));
    setPhoto2((prev) => ({ ...prev, imageUrl: null, isRealCapture: false }));
    onShowToast('파손 부위 사진이 초기화되었습니다.');
  };

  // --- Voice Record Controls ---
  const handleToggleVoiceRecord = () => {
    if (recordingState === 'idle') {
      setRecordingState('recording');
      setSttText('🎙️ 음성 소견 실시간 녹음 및 AI STT 변환 중... (말씀해 주세요)');
      onShowToast('🎙️ 정비사 음성 녹음이 시작되었습니다.');

      // Simulate voice capture
      setTimeout(() => {
        setRecordingState('recorded');
        setSttText(
          '“하부 너클에 약 3.2cm 길이의 미세 크랙이 발견되었습니다. 고속 주행 시 유격 파손 위험이 크므로 로워암 부싱과 함께 조속한 부품 교체가 필수적입니다.”'
        );
        onShowToast('✅ 음성 녹음 및 기술 소견 STT 변환이 완료되었습니다.');
      }, 2500);
    } else if (recordingState === 'recording') {
      setRecordingState('recorded');
    } else {
      setRecordingState('idle');
      setSttText('“마이크 버튼을 누르면 30초간 정비 소견을 바로 음성으로 녹음합니다.”');
    }
  };

  // --- Stop & Hold Action ---
  const handleSendStopAndHold = () => {
    setIsSent(true);
    onShowToast('🚀 [Stop & Hold] 차주 카카오 알림톡 웹뷰 링크가 1초 만에 긴급 발송되었습니다!');

    // Simulate customer reaction after 3.5 seconds
    setTimeout(() => {
      setCustomerDecision('approved_b');
      onShowToast('🎉 차주가 모바일 웹뷰에서 [옵션 B: 부품 교체 승인(+180,000원)]을 승인했습니다!');
    }, 3500);
  };

  // Reset simulation
  const handleReset = () => {
    setTimeLeft(598);
    handleResetPhotos();
    setRecordingState('idle');
    setSttText('“마이크 버튼을 누르면 30초간 정비 소견을 바로 음성으로 녹음합니다.”');
    setIsSent(false);
    setCustomerDecision('pending');
    onShowToast('스마트 패드 시뮬레이션이 초기화되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[#090D1A] text-slate-100 p-2 sm:p-4 md:p-6 flex flex-col items-center justify-start selection:bg-rose-500 selection:text-white">
      {/* Hidden File Input for multi-file fallback */}
      <input
        type="file"
        ref={dualFileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleDualFileUpload}
      />

      {/* Top Navigation Bar - Responsive */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
        <button
          onClick={onBackToIntro}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>일반 모드로 돌아가기</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>초기화</span>
          </button>
          <span className="text-[10px] sm:text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 sm:px-2.5 py-1 rounded-full font-bold">
            실시간 테크베이 관제 중
          </span>
        </div>
      </div>

      {/* Main Terminal Container */}
      <div className="w-full max-w-4xl bg-[#111827]/95 border border-slate-700/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 md:p-7 shadow-2xl space-y-3.5 sm:space-y-4 backdrop-blur">
        
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-3.5 border-b border-slate-700/80">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#E11D48] text-white flex items-center justify-center shadow-lg shadow-rose-900/40 shrink-0">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-tight">
                  현장 정비사 스마트 패드
                </h1>
                <span className="px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold shrink-0">
                  POS 연결됨
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                동일모터스 김진우 명장 · 2번 리프트 실시간 작업 중
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-slate-900/60 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 border-slate-800">
            <span className="text-[10px] sm:text-[10px] text-slate-400 font-sans">
              리프트 공실 방어 타이머
            </span>
            <span className="text-sm sm:text-base md:text-lg font-mono font-black text-[#F43F5E] tracking-tight">
              {formatTime(timeLeft)} <span className="text-xs font-bold">남음</span>
            </span>
          </div>
        </div>

        {/* Vehicle Summary Bar */}
        <div className="p-2.5 sm:p-3.5 bg-[#0B0F19] rounded-xl border border-slate-800 grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
          <div className="p-1">
            <span className="text-[9px] sm:text-[10px] text-slate-400 block">차량 정보</span>
            <strong className="text-white text-[11px] sm:text-xs md:text-sm font-bold block mt-0.5 break-keep">
              그랜저 HG <span className="hidden sm:inline">(12가 3456)</span>
            </strong>
          </div>
          <div className="p-1 border-x border-slate-800">
            <span className="text-[9px] sm:text-[10px] text-slate-400 block">누적 주행거리</span>
            <span className="text-[#FACC15] font-mono text-[11px] sm:text-xs md:text-sm font-black block mt-0.5">
              105,200 km
            </span>
          </div>
          <div className="p-1">
            <span className="text-[9px] sm:text-[10px] text-slate-400 block">기본 예약 항목</span>
            <span className="text-[#60A5FA] text-[11px] sm:text-xs md:text-sm font-bold block mt-0.5 truncate">
              미션오일 순환식
            </span>
          </div>
        </div>

        {/* Urgent Issue Detected Card (Red Border Card) */}
        <div className="p-3 sm:p-4 bg-[#201019]/80 border border-[#E11D48]/50 rounded-xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#F43F5E]">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F43F5E] shrink-0" />
              <span>돌발 결함 감지 (작업 일시정지 대상)</span>
            </div>
            <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-[#E11D48] text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase">
              STOP &amp; HOLD
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
            하부 점검 중 <strong className="text-white underline decoration-rose-500 underline-offset-2">“로어암 부싱 심각 파손 및 너클 미세 크랙”</strong> 확인 ➔ 긴급 차주 승인 필요
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 1. 파손 부위 원터치 사진 (2장) - SINGLE BUTTON 2-SHOT FLOW               */}
        {/* ========================================================================= */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
            <span className="text-xs sm:text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#F43F5E]" />
              <span>1. 파손 부위 원터치 사진 (2장)</span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#34D399] flex items-center gap-1 font-semibold">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{bothPhotosTaken ? '2장 촬영 완료' : '자동 초점 고화질 촬영 대기'}</span>
            </span>
          </div>

          {/* MAIN 1-BUTTON TRIGGER OR DUAL PREVIEW */}
          {!bothPhotosTaken ? (
            /* --- ONE SINGLE UNIFIED BUTTON TO CAPTURE 2 PHOTOS SEQUENTIALLY --- */
            <div
              id="start-dual-capture-btn"
              role="button"
              tabIndex={0}
              onClick={handleStartDualCapture}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleStartDualCapture();
              }}
              className="w-full relative rounded-2xl border-2 border-dashed border-rose-500/60 bg-gradient-to-b from-[#1E1120] to-[#0E1322] p-5 sm:p-6 text-center cursor-pointer group hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-950/50 active:scale-[0.99] transition-all"
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                
                {/* Big Animated Dual Camera Icon */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8" />
                  </div>
                  <span className="absolute -top-1.5 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow border border-emerald-300">
                    2장 연속
                  </span>
                </div>

                {/* Primary Button Text */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-rose-300 transition">
                    📸 파손 부위 원터치 2장 연속 촬영하기
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    버튼 한 번만 누르면 <strong className="text-rose-400">[1차 너클 크랙]</strong>과 <strong className="text-amber-400">[2차 로어암 부싱]</strong>을 연속으로 촬영합니다.
                  </p>
                </div>

                {/* Step Preview Pills */}
                <div className="flex items-center gap-2 pt-1 flex-wrap justify-center text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-rose-300 border border-rose-500/30 font-medium">
                    1차: 너클 미세 크랙 (3.2cm)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-amber-300 border border-amber-500/30 font-medium">
                    2차: 로어암 부싱 경화 (유격)
                  </span>
                </div>

                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 group-hover:bg-rose-500 text-white text-xs font-bold shadow-md transition">
                    <Camera className="w-4 h-4" />
                    <span>지금 2장 연속 촬영 시작</span>
                  </span>
                </div>

              </div>
            </div>
          ) : (
            /* --- ONCE TAKEN: BOTH PHOTOS DISPLAYED SIDE-BY-SIDE + RE-SHOOT BUTTON --- */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                
                {/* Photo 1 Display */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black rounded-xl border border-emerald-500/60 overflow-hidden shadow-lg shadow-emerald-950/40">
                  <img
                    src={photo1.imageUrl!}
                    alt={photo1.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>[1차] 너클 크랙 완료</span>
                  </div>
                  <span className="absolute top-2 right-2 text-[9px] font-mono text-slate-200 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700">
                    {photo1.size}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6 flex items-end justify-between">
                    <div>
                      <strong className="text-xs text-white font-bold block">{photo1.title}</strong>
                      <span className="text-[10px] text-emerald-300 block">{photo1.tag}</span>
                    </div>
                    <button
                      onClick={() => setExpandedImage({ title: photo1.title, url: photo1.imageUrl! })}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[10px] border border-slate-600 transition"
                      title="확대 보기"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Photo 2 Display */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-black rounded-xl border border-amber-500/60 overflow-hidden shadow-lg shadow-amber-950/40">
                  <img
                    src={photo2.imageUrl!}
                    alt={photo2.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>[2차] 로어암 부싱 완료</span>
                  </div>
                  <span className="absolute top-2 right-2 text-[9px] font-mono text-slate-200 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700">
                    {photo2.size}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-6 flex items-end justify-between">
                    <div>
                      <strong className="text-xs text-white font-bold block">{photo2.title}</strong>
                      <span className="text-[10px] text-amber-300 block">{photo2.tag}</span>
                    </div>
                    <button
                      onClick={() => setExpandedImage({ title: photo2.title, url: photo2.imageUrl! })}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[10px] border border-slate-600 transition"
                      title="확대 보기"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Single Button to Re-take or Reset */}
              <div className="flex items-center justify-between gap-2 p-2 bg-[#0B0F19] rounded-xl border border-slate-800">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 pl-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>2개 파손 부위 고화질 실물 사진 등록 완료</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleStartDualCapture}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>2장 다시 촬영</span>
                  </button>
                  <button
                    onClick={handleResetPhotos}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 text-xs border border-slate-700 transition cursor-pointer"
                    title="사진 초기화"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Mechanic Voice Recording Section */}
        <div className="p-3 sm:p-3.5 bg-[#0B0F19] rounded-xl border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span className="text-blue-400">🎙️</span>
              <span>2. 정비사 30초 음성 소견 녹음</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {recordingState === 'idle'
                ? '대기 중'
                : recordingState === 'recording'
                ? '🔴 녹음 중 (00:03)'
                : '✅ 녹음 및 STT 변환 완료'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Big Mic Button */}
            <button
              onClick={handleToggleVoiceRecord}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-lg transition-all shadow-md shrink-0 cursor-pointer ${
                recordingState === 'recording'
                  ? 'bg-rose-600 animate-pulse ring-4 ring-rose-500/30'
                  : recordingState === 'recorded'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-[#4F46E5] hover:bg-indigo-500'
              }`}
              title="음성 녹음 시작/중지"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Transcript Box */}
            <div className="flex-1 bg-[#05070D] p-2.5 sm:p-3 rounded-lg border border-slate-800/90 min-h-[46px] flex items-center">
              <p className="text-[11px] sm:text-xs text-slate-300 italic leading-relaxed">
                {sttText}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Action Button */}
        <div className="pt-1 space-y-1.5 sm:space-y-2">
          <button
            id="send-stop-and-hold-btn"
            onClick={handleSendStopAndHold}
            disabled={isSent}
            className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
              isSent
                ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#E11D48] to-[#BE123C] hover:brightness-110 text-white active:scale-[0.99]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {isSent
                ? '알림톡 발송 완료 (차주 모바일 응답 대기 중...)'
                : '[Stop & Hold] 차주 카카오 알림톡 긴급 승인 전송'}
            </span>
          </button>

          <p className="text-[10px] sm:text-[11px] text-center text-slate-400">
            * 전송 즉시 리프트 공실 방어 타이머 작동 및 차주 모바일로 2가지 선택지가 발송됩니다.
          </p>
        </div>

        {/* Customer Decision Feedback Box */}
        {customerDecision !== 'pending' && (
          <div className="p-3 sm:p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl animate-in fade-in slide-in-from-bottom-2 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>차주 모바일 승인 수신 완료 (APPROVED_RESUME)</span>
              </span>
              <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-bold">
                작업 재개 승인
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-200">
              차주 <b>조복만 님</b>께서 모바일 웹뷰에서 <b>[옵션 B: 순정 부품 교체 및 정밀 정비 (+180,000원)]</b>을 즉시 승인하셨습니다.
              STOP &amp; HOLD가 해제되었으며 리프트 작업을 재개합니다.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* --- DUAL CONTINUOUS CAMERA MODAL (1-Button 2-Shot Workflow) ---            */}
      {/* ========================================================================= */}
      {cameraModalStep !== 'closed' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-[#0F172A] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  {cameraModalStep === 1 && '📸 [1/2단계] 1차 촬영: 너클 미세 크랙'}
                  {cameraModalStep === 2 && '📸 [2/2단계] 2차 촬영: 로어암 부싱 경화'}
                  {cameraModalStep === 'review' && '🎉 [완료] 파손 부위 2장 연속 촬영 완료'}
                </h3>
              </div>
              <button
                onClick={handleCloseCameraModal}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
              {/* Shutter flash effect */}
              {shutterFlash && (
                <div className="absolute inset-0 bg-white z-30 pointer-events-none animate-out fade-out duration-200" />
              )}

              {cameraModalStep === 'review' ? (
                /* --- REVIEW SCREEN: BOTH PHOTOS PREVIEWS --- */
                <div className="w-full h-full p-3 grid grid-cols-2 gap-2.5 bg-slate-950 items-center">
                  <div className="relative rounded-lg overflow-hidden border border-emerald-500/70 h-full flex flex-col justify-end bg-black">
                    <img src={tempPhoto1!} alt="1차 사진" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="relative bg-gradient-to-t from-black/90 to-transparent p-2 text-left">
                      <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">1차 완료</span>
                      <strong className="block text-xs text-white font-bold mt-0.5">[사진 1] 너클 미세 크랙</strong>
                    </div>
                  </div>
                  <div className="relative rounded-lg overflow-hidden border border-amber-500/70 h-full flex flex-col justify-end bg-black">
                    <img src={tempPhoto2!} alt="2차 사진" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="relative bg-gradient-to-t from-black/90 to-transparent p-2 text-left">
                      <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-bold">2차 완료</span>
                      <strong className="block text-xs text-white font-bold mt-0.5">[사진 2] 로어암 부싱</strong>
                    </div>
                  </div>
                </div>
              ) : isCameraStreamActive ? (
                /* --- LIVE CAMERA VIEWFINDER (STEP 1 & 2) --- */
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover"
                  />

                  {/* Step Overlay Badge */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur ${
                      cameraModalStep === 1
                        ? 'bg-rose-600/90 text-white ring-2 ring-rose-400/40'
                        : 'bg-amber-600/90 text-white ring-2 ring-amber-400/40'
                    }`}>
                      {cameraModalStep === 1 ? '1/2: 너클 미세 크랙 촬영' : '2/2: 로어암 부싱 경화 촬영'}
                    </span>

                    {/* Step 1 thumbnail badge if on step 2 */}
                    {cameraModalStep === 2 && tempPhoto1 && (
                      <div className="flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded-lg border border-emerald-500/50">
                        <img src={tempPhoto1} alt="1차 썸네일" className="w-5 h-5 rounded object-cover border border-emerald-400" />
                        <span className="text-[10px] text-emerald-300 font-bold">1차 캡처됨 ✓</span>
                      </div>
                    )}
                  </div>

                  {/* HUD Crosshairs */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500/40 m-5 rounded-xl flex items-center justify-center">
                    <div className="w-10 h-10 border-t-2 border-l-2 border-emerald-400 absolute top-2 left-2" />
                    <div className="w-10 h-10 border-t-2 border-r-2 border-emerald-400 absolute top-2 right-2" />
                    <div className="w-10 h-10 border-b-2 border-l-2 border-emerald-400 absolute bottom-2 left-2" />
                    <div className="w-10 h-10 border-b-2 border-r-2 border-emerald-400 absolute bottom-2 right-2" />
                    <span className="text-[11px] font-mono text-emerald-300 bg-black/65 px-2.5 py-1 rounded">
                      {cameraModalStep === 1 ? '너클 부위 조준 ➔ 찰칵' : '로어암 부싱 조준 ➔ 찰칵'}
                    </span>
                  </div>
                </>
              ) : (
                /* --- CAMERA ERROR / FALLBACK --- */
                <div className="p-6 text-center max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-rose-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    {cameraError || '웹캠 또는 모바일 카메라 권한을 확인하는 중입니다...'}
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleApplyPresetBoth}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>✨ 2장 실물 샘플 사진 원클릭 즉시 적용</span>
                    </button>
                    <button
                      onClick={() => dualFileInputRef.current?.click()}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>기기 사진 앨범에서 2장 선택</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Controls Bar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              {cameraModalStep === 'review' ? (
                /* --- REVIEW CONFIRM BUTTONS --- */
                <>
                  <button
                    onClick={handleStartDualCapture}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>처음부터 다시 찍기</span>
                  </button>
                  <button
                    onClick={handleConfirmBothPhotos}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>2장 모두 등록 완료</span>
                  </button>
                </>
              ) : isCameraStreamActive ? (
                /* --- SHUTTER CONTROLS FOR STEP 1 & 2 --- */
                <>
                  <button
                    onClick={handleToggleFacingMode}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                    title="전면/후면 카메라 전환"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {/* Big Red Shutter Button */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleShutterClick}
                      className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 ring-4 ring-rose-500/30 text-white flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer"
                      title={cameraModalStep === 1 ? '1차 사진 찍기' : '2차 사진 찍기'}
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                    <span className="text-[10px] text-slate-300 font-bold mt-1">
                      {cameraModalStep === 1 ? '1차 촬영' : '2차 촬영'}
                    </span>
                  </div>

                  <button
                    onClick={handleApplyPresetBoth}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
                  >
                    예시 2장
                  </button>
                </>
              ) : (
                <div className="w-full flex justify-end">
                  <button
                    onClick={handleCloseCameraModal}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Full Image Preview Modal */}
      {expandedImage && (
        <div
          onClick={() => setExpandedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={expandedImage.url}
              alt={expandedImage.title}
              className="max-h-[85vh] w-auto rounded-xl shadow-2xl object-contain"
            />
            <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded text-xs text-white">
              {expandedImage.title}
            </div>
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
