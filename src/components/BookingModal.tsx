import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Car,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  Check,
  RotateCw,
  Gauge,
  Wrench,
  Droplet,
  Zap,
  Disc,
  Thermometer,
  PackageCheck,
  Layers,
} from 'lucide-react';
import { RepairShop, UserProfile, CorePartDiagnostic } from '../types';
import { REPAIR_SHOPS, CORE_PARTS } from '../data/mockData';

interface BookingModalProps {
  isOpen: boolean;
  shop: RepairShop | null;
  initialPart?: CorePartDiagnostic | null;
  user: UserProfile;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

// 7가지 핵심 점검 및 교체 부품 목록
const BOOKING_CORE_PARTS = [
  {
    id: 1,
    name: '1. 동 겉벨트 세트',
    shortName: '동 겉벨트 세트',
    category: '발전기/워터펌프 구동벨트',
    icon: RotateCw,
  },
  {
    id: 2,
    name: '2. 미션오일 (트랜스미션)',
    shortName: '미션오일',
    category: '변속기 유체 순환식',
    icon: Gauge,
  },
  {
    id: 3,
    name: '3. 로워암 / 부싱',
    shortName: '로워암 / 부싱',
    category: '하체 잡소리·유격 방지',
    icon: Wrench,
  },
  {
    id: 4,
    name: '4. 브레이크 오일',
    shortName: '브레이크 오일',
    category: 'DOT4 고성능 제동 유압',
    icon: Droplet,
  },
  {
    id: 5,
    name: '5. 점화플러그 / 코일',
    shortName: '점화플러그 / 코일',
    category: '엔진 부조·출력 정상화',
    icon: Zap,
  },
  {
    id: 6,
    name: '6. 브레이크 패드',
    shortName: '브레이크 패드',
    category: '마찰재 세트 (앞/뒤)',
    icon: Disc,
  },
  {
    id: 7,
    name: '7. 냉각수 (부동액)',
    shortName: '냉각수 (부동액)',
    category: '엔진 과열·동파 방지',
    icon: Thermometer,
  },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  shop,
  initialPart,
  user,
  onClose,
  onSuccess,
}) => {
  const selectedShop = shop || REPAIR_SHOPS[0];
  const [selectedDate, setSelectedDate] = useState('2026-09-08 (내일)');
  const [selectedTime, setSelectedTime] = useState('11:00');

  // 7가지 부품 중복 선택 상태
  const [selectedParts, setSelectedParts] = useState<string[]>(() => {
    if (initialPart) {
      const match = BOOKING_CORE_PARTS.find(
        (p) => p.name === initialPart.name || p.id === initialPart.id
      );
      return match ? [match.name] : [initialPart.name];
    }
    return ['1. 동 겉벨트 세트', '2. 미션오일 (트랜스미션)'];
  });

  useEffect(() => {
    if (initialPart) {
      const match = BOOKING_CORE_PARTS.find(
        (p) => p.name === initialPart.name || p.id === initialPart.id
      );
      setSelectedParts(match ? [match.name] : [initialPart.name]);
    }
  }, [initialPart]);

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const dateOptions = [
    '2026-09-08 (내일)',
    '2026-09-09 (수)',
    '2026-09-10 (목)',
    '2026-09-12 (토)',
  ];

  const timeOptions = ['09:30', '11:00', '14:00', '15:30', '17:00'];

  // 부품 중복 토글 선택 함수
  const togglePartSelection = (partName: string) => {
    setSelectedParts((prev) =>
      prev.includes(partName)
        ? prev.filter((name) => name !== partName)
        : [...prev, partName]
    );
  };

  // 전체 선택 / 전체 해제 토글
  const handleSelectAll = () => {
    if (selectedParts.length === BOOKING_CORE_PARTS.length) {
      setSelectedParts([]);
    } else {
      setSelectedParts(BOOKING_CORE_PARTS.map((p) => p.name));
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const fakeId = `CS-${Math.floor(100000 + Math.random() * 900000)}`;
      setCompletedBookingId(fakeId);
      onSuccess(fakeId);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-blue-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                카싱크 안심 정비 예약
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                과잉 정비 없는 1급 공업사 실시간 예약
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blue-700/60 text-white hover:bg-blue-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedBookingId ? (
          /* Confirmation View */
          <div className="p-6 text-center space-y-4 overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                예약 접수 완료
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                정비 예약이 확정되었습니다!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                예약 번호: <span className="font-bold text-slate-800">{completedBookingId}</span>
              </p>
            </div>

            {/* 사장님 부품 전달 알림 카드 */}
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-left">
              <PackageCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-extrabold text-blue-900">
                  사장님께 부품 준비 목록 전달 완료!
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5 leading-snug">
                  방문 전 필요한 <strong>{selectedParts.length}가지 부품</strong>을 사장님이 공업사에 미리 챙겨둡니다.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">예약 매장</span>
                <span className="font-bold text-slate-900">{selectedShop.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">방문 일시</span>
                <span className="font-bold text-slate-900">{selectedDate} {selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">차량 정보</span>
                <span className="font-bold text-slate-900">{user.vehicle.model} ({user.vehicle.plateNumber})</span>
              </div>

              {/* 사장님 챙김 요청 부품 목록 */}
              <div className="border-t border-slate-200 pt-2.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-700 font-extrabold flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    사장님 챙김 부품 ({selectedParts.length}개)
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-100/70 px-2 py-0.5 rounded-md">
                    전달 완료
                  </span>
                </div>
                {selectedParts.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedParts.map((part) => (
                      <span
                        key={part}
                        className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-[11px] font-bold text-blue-800 flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3 h-3 text-blue-600" />
                        {part}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 text-[11px]">지정 부품 없음 (일반 점검 요청)</span>
                )}
              </div>

              {notes && (
                <div className="border-t border-slate-200 pt-2">
                  <span className="text-slate-500 block mb-1">고객 전달 메모</span>
                  <p className="text-slate-800 bg-white p-2 rounded-xl border border-slate-200 text-[11px] font-medium leading-relaxed">
                    {notes}
                  </p>
                </div>
              )}

              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">보증 혜택</span>
                <span className="font-bold text-emerald-600">소비자원 과잉정비 0원 안심 보증</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md"
            >
              확인 완료
            </button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleBookingSubmit} className="p-5 overflow-y-auto space-y-4">
            {/* Selected Shop Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                  ★ 양심업소 인증
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-1">
                  {selectedShop.name}
                </h4>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>{selectedShop.address} ({selectedShop.distance})</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-700">{selectedShop.phone}</span>
                <div className="text-[10px] text-slate-400 mt-0.5">당일 입고 가능</div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                방문 예약 일자 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                {dateOptions.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedDate === date
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                방문 시간 선택
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
                      selectedTime === time
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* 7가지 핵심 부품 중복 선택 섹션 (사장님 전달용) */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800">
                    정비·교체 요청 부품 선택{' '}
                    <span className="text-blue-600 font-bold">(중복 선택 가능)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    선택한 부품은 사장님께 전달되어 입고 전 미리 챙겨둡니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg border border-blue-200 transition-colors whitespace-nowrap"
                >
                  {selectedParts.length === BOOKING_CORE_PARTS.length ? '전체 해제' : '전체 선택'}
                </button>
              </div>

              {/* 7가지 부품 버튼 그리드 */}
              <div className="grid grid-cols-2 gap-2">
                {BOOKING_CORE_PARTS.map((part, index) => {
                  const isSelected = selectedParts.includes(part.name);
                  const IconComp = part.icon;
                  const isLastItem = index === BOOKING_CORE_PARTS.length - 1; // 7번째 부품

                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => togglePartSelection(part.name)}
                      className={`relative flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all ${
                        isLastItem ? 'col-span-2' : ''
                      } ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/90 text-blue-900 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <IconComp className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-extrabold truncate ${
                              isSelected ? 'text-blue-900' : 'text-slate-800'
                            }`}
                          >
                            {part.shortName}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {part.category}
                        </p>
                      </div>

                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mr-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 선택 요약 알림 배지 */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                <span className="text-slate-600 font-medium">
                  사장님 챙김 부품:
                </span>
                <span className="font-extrabold text-blue-600">
                  {selectedParts.length > 0
                    ? `총 ${selectedParts.length}개 부품 선택됨`
                    : '선택 안 됨 (일반 점검)'}
                </span>
              </div>
            </div>

            {/* Vehicle & Customer Info */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                예약 차량 및 고객 정보
              </label>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">차량 정보</span>
                  <span className="font-bold text-slate-900">
                    {user.vehicle.model} ({user.vehicle.plateNumber})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">예약자 성명</span>
                  <span className="font-bold text-slate-900">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">연락처</span>
                  <span className="font-bold text-slate-900">010-8282-3456</span>
                </div>
              </div>
            </div>

            {/* Request notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                정비 요청 사항 또는 증상 메모
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예: 시동 걸 때 귀뚜라미 소음 점검 부탁드립니다. 부품 미리 확인해주세요."
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Submit button */}
            <button
              id="submit-booking-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {selectedParts.length > 0
                      ? `${selectedParts.length}개 부품 예약 신청 완료하기`
                      : '예약 신청 완료하기'}
                  </span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

