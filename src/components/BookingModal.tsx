import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Car,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { RepairShop, UserProfile, CorePartDiagnostic } from '../types';
import { REPAIR_SHOPS } from '../data/mockData';

interface BookingModalProps {
  isOpen: boolean;
  shop: RepairShop | null;
  initialPart?: CorePartDiagnostic | null;
  user: UserProfile;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

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
  const [symptoms, setSymptoms] = useState<string[]>(
    initialPart ? [initialPart.name] : ['동 겉벨트 세트 점검', '미션오일 교환']
  );
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
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-blue-600 text-white flex items-center justify-between">
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
            className="w-8 h-8 rounded-full bg-blue-700/60 text-white hover:bg-blue-700 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedBookingId ? (
          /* Confirmation View */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
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

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
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
                placeholder="예: 시동 걸 때 귀뚜라미 소음 점검 부탁드립니다."
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
                  <span>예약 신청 완료하기</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
