"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Ship,
  Heart,
  Plus,
  Utensils,
  Phone,
  Mail,
  MessageCircle,
  Share2,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";
import type { MSCReservationForm as ReservationFormType, Participant } from "@/types/booking.types";

interface MSCReservationFormProps {
  cruiseId?: string;
  onSubmit: (data: ReservationFormType) => void | Promise<void>;
  isLoading?: boolean;
}

export function MSCReservationForm({ cruiseId, onSubmit, isLoading = false }: MSCReservationFormProps) {
  const [formData, setFormData] = useState<ReservationFormType>({
    passportName: "",
    desiredDepartureDate: "",
    participants: [],
    preferredCabinType: "interior",
    mobilePhone: "",
    email: "",
    cruiseId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 참가자 추가
  const addParticipant = (gender: 'male' | 'female') => {
    setFormData({
      ...formData,
      participants: [...formData.participants, { gender, age: 30 }],
    });
  };

  // 참가자 제거
  const removeParticipant = (index: number) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((_, i) => i !== index),
    });
  };

  // 참가자 나이 변경
  const updateParticipantAge = (index: number, age: number) => {
    const updated = [...formData.participants];
    updated[index].age = age;
    setFormData({ ...formData, participants: updated });
  };

  // 유효성 검사
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.passportName.trim()) {
      newErrors.passportName = "여권상 이름을 입력해주세요";
    }

    if (!formData.desiredDepartureDate) {
      newErrors.desiredDepartureDate = "희망 출발일을 선택해주세요";
    }

    if (formData.participants.length === 0) {
      newErrors.participants = "최소 1명 이상의 참가자를 추가해주세요";
    }

    if (!formData.mobilePhone.trim()) {
      newErrors.mobilePhone = "휴대폰 번호를 입력해주세요";
    } else if (!/^[0-9\-+() ]+$/.test(formData.mobilePhone)) {
      newErrors.mobilePhone = "유효한 전화번호를 입력해주세요";
    }

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // 첫 번째 에러로 스크롤
      const firstErrorElement = document.querySelector('[data-error="true"]');
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    await onSubmit({
      ...formData,
      submittedAt: new Date(),
      status: 'pending',
    });
  };

  const maleCount = formData.participants.filter(p => p.gender === 'male').length;
  const femaleCount = formData.participants.filter(p => p.gender === 'female').length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 제목 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#003366] mb-2">
          MSC World Europa Cruises Reservation Form
        </h1>
        <p className="text-gray-600">MSC World Europa FIT Cruise</p>
        <p className="text-sm text-gray-500 mt-2">* 필수 항목</p>
      </div>

      {/* 1. 여권상 이름 */}
      <div className="bg-white rounded-lg shadow-sm p-6" data-error={!!errors.passportName}>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <FileText className="w-5 h-5 text-[#003366]" />
          <span className="text-red-500">*</span> 1. Name (Passport Name)
        </label>
        <input
          type="text"
          value={formData.passportName}
          onChange={(e) => {
            setFormData({ ...formData, passportName: e.target.value });
            if (errors.passportName) {
              const { passportName, ...rest } = errors;
              setErrors(rest);
            }
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.passportName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="여권에 기재된 이름을 입력해주세요"
        />
        {errors.passportName && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.passportName}
          </p>
        )}
      </div>

      {/* 2. 희망 출발일 */}
      <div className="bg-white rounded-lg shadow-sm p-6" data-error={!!errors.desiredDepartureDate}>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Calendar className="w-5 h-5 text-[#003366]" />
          <span className="text-red-500">*</span> 2. Desired Departure Date
        </label>
        <input
          type="date"
          value={formData.desiredDepartureDate}
          onChange={(e) => {
            setFormData({ ...formData, desiredDepartureDate: e.target.value });
            if (errors.desiredDepartureDate) {
              const { desiredDepartureDate, ...rest } = errors;
              setErrors(rest);
            }
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.desiredDepartureDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.desiredDepartureDate && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.desiredDepartureDate}
          </p>
        )}
      </div>

      {/* 3-4. 참가자 수 및 연령 */}
      <div className="bg-white rounded-lg shadow-sm p-6" data-error={!!errors.participants}>
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <Users className="w-5 h-5 text-[#003366]" />
            <span className="text-red-500">*</span> 3-4. Number of Participants and Age
          </label>
          <p className="text-sm text-gray-600 mb-4">참가자를 추가하고 연령을 입력해주세요</p>
        </div>

        {/* 참가자 추가 버튼 */}
        <div className="flex gap-3 mb-4">
          <Button
            type="button"
            onClick={() => addParticipant('male')}
            variant="outline"
            className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            남성 추가 ({maleCount})
          </Button>
          <Button
            type="button"
            onClick={() => addParticipant('female')}
            variant="outline"
            className="flex-1 border-pink-500 text-pink-600 hover:bg-pink-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            여성 추가 ({femaleCount})
          </Button>
        </div>

        {/* 참가자 목록 */}
        {formData.participants.length > 0 && (
          <div className="space-y-3">
            {formData.participants.map((participant, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  participant.gender === 'male' ? 'bg-blue-50 border-blue-200' : 'bg-pink-50 border-pink-200'
                }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      participant.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'
                    } text-white font-semibold`}
                  >
                    {participant.gender === 'male' ? 'M' : 'F'}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">나이</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={participant.age}
                    onChange={(e) => updateParticipantAge(index, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="나이"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeParticipant(index)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.participants && (
          <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.participants}
          </p>
        )}

        <div className="mt-4 text-sm text-gray-600">
          총 {formData.participants.length}명 (남성 {maleCount}명, 여성 {femaleCount}명)
        </div>
      </div>

      {/* 5. 선호 투어 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Ship className="w-5 h-5 text-[#003366]" />
          5. Preferred Tour (if interested in a shore excursion)
        </label>
        <textarea
          value={formData.preferredTour || ""}
          onChange={(e) => setFormData({ ...formData, preferredTour: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="관심 있는 해안 관광 투어를 입력해주세요 (선택사항)"
        />
      </div>

      {/* 6. 추가 옵션 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Plus className="w-5 h-5 text-[#003366]" />
          6. Additional Options
        </label>
        <p className="text-xs text-gray-500 mb-2">e.g., premium spa, tour escort request, etc.</p>
        <textarea
          value={formData.additionalOptions || ""}
          onChange={(e) => setFormData({ ...formData, additionalOptions: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="프리미엄 스파, 투어 에스코트 등 추가 옵션을 입력해주세요"
        />
      </div>

      {/* 7. 정기 복용 약물 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Heart className="w-5 h-5 text-[#003366]" />
          7. Regular Medication
        </label>
        <textarea
          value={formData.regularMedication || ""}
          onChange={(e) => setFormData({ ...formData, regularMedication: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="정기적으로 복용하는 약물이 있으시면 입력해주세요"
        />
      </div>

      {/* 8. 의료 상태 / 특별 사항 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Heart className="w-5 h-5 text-[#003366]" />
          8. Medical Conditions / Special Notes
        </label>
        <textarea
          value={formData.medicalConditions || ""}
          onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="특별히 알려야 할 의료 상태나 사항이 있으시면 입력해주세요"
        />
      </div>

      {/* 9. 선호 객실 타입 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Ship className="w-5 h-5 text-[#003366]" />
          <span className="text-red-500">*</span> 9. Preferred Cabin Type
        </label>
        <p className="text-xs text-gray-500 mb-3">Rates may vary depending on room type.</p>
        <p className="text-xs text-gray-600 mb-3">e.g., Interior, Ocean View, Balcony, or Suite Cabin</p>
        <select
          value={formData.preferredCabinType}
          onChange={(e) =>
            setFormData({ ...formData, preferredCabinType: e.target.value as any })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="interior">Interior (내부 객실)</option>
          <option value="oceanview">Ocean View (오션뷰)</option>
          <option value="balcony">Balcony (발코니)</option>
          <option value="suite">Suite Cabin (스위트)</option>
        </select>
      </div>

      {/* 10. 특별 식사 요청 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Utensils className="w-5 h-5 text-[#003366]" />
          10. Special Meal Requests
        </label>
        <p className="text-xs text-gray-500 mb-2">Vegetarian, Allergies, etc.</p>
        <textarea
          value={formData.specialMealRequests || ""}
          onChange={(e) => setFormData({ ...formData, specialMealRequests: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="채식, 알러지 등 특별한 식사 요청사항을 입력해주세요"
        />
      </div>

      {/* 11. 휴대폰 번호 */}
      <div className="bg-white rounded-lg shadow-sm p-6" data-error={!!errors.mobilePhone}>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Phone className="w-5 h-5 text-[#003366]" />
          <span className="text-red-500">*</span> 11. Mobile Phone Number
        </label>
        <input
          type="tel"
          value={formData.mobilePhone}
          onChange={(e) => {
            setFormData({ ...formData, mobilePhone: e.target.value });
            if (errors.mobilePhone) {
              const { mobilePhone, ...rest } = errors;
              setErrors(rest);
            }
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.mobilePhone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="010-1234-5678"
        />
        {errors.mobilePhone && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.mobilePhone}
          </p>
        )}
      </div>

      {/* 12. 이메일 */}
      <div className="bg-white rounded-lg shadow-sm p-6" data-error={!!errors.email}>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Mail className="w-5 h-5 text-[#003366]" />
          <span className="text-red-500">*</span> 12. Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) {
              const { email, ...rest } = errors;
              setErrors(rest);
            }
          }}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="example@email.com"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.email}
          </p>
        )}
      </div>

      {/* 13. 카카오톡 ID */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <MessageCircle className="w-5 h-5 text-[#003366]" />
          13. KakaoTalk ID
        </label>
        <input
          type="text"
          value={formData.kakaoTalkId || ""}
          onChange={(e) => setFormData({ ...formData, kakaoTalkId: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="카카오톡 ID (선택사항)"
        />
      </div>

      {/* 14. SNS 계정 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <Share2 className="w-5 h-5 text-[#003366]" />
          14. Social Media Account
        </label>
        <p className="text-xs text-gray-500 mb-2">e.g., Instagram, Facebook</p>
        <input
          type="text"
          value={formData.socialMediaAccount || ""}
          onChange={(e) => setFormData({ ...formData, socialMediaAccount: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="@instagram_id 또는 Facebook 프로필 링크"
        />
      </div>

      {/* 15. 추가 요청 사항 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <FileText className="w-5 h-5 text-[#003366]" />
          15. Additional Requests
        </label>
        <textarea
          value={formData.additionalRequests || ""}
          onChange={(e) => setFormData({ ...formData, additionalRequests: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="기타 요청사항이나 문의사항을 입력해주세요"
        />
      </div>

      {/* 제출 버튼 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 -mx-6 -mb-6 rounded-b-lg">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#003366] to-[#004080] hover:from-[#002244] hover:to-[#003366] text-white py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              제출 중...
            </>
          ) : (
            "예약 신청하기"
          )}
        </Button>
      </div>
    </form>
  );
}
