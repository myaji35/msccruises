"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MSCReservationForm } from "@/components/reservation/MSCReservationForm";
import type { MSCReservationForm as ReservationFormType } from "@/types/booking.types";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cruiseId = searchParams.get("cruiseId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reservationId, setReservationId] = useState<string>("");

  const handleSubmit = async (data: ReservationFormType) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("예약 신청에 실패했습니다");
      }

      const result = await response.json();
      setReservationId(result.reservationId || result.id);
      setIsSuccess(true);

      // 3초 후 예약 확인 페이지로 이동
      setTimeout(() => {
        router.push(`/booking/reservation/success?id=${result.reservationId || result.id}`);
      }, 3000);
    } catch (error) {
      console.error("Reservation submission error:", error);
      alert("예약 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 성공 화면
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">예약 신청 완료!</h2>
            <p className="text-gray-600">
              예약 신청이 성공적으로 접수되었습니다.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">예약 번호</p>
            <p className="text-xl font-bold text-[#003366]">{reservationId}</p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            담당자가 확인 후 연락드리겠습니다.<br />
            등록하신 이메일과 휴대폰으로 안내 메시지가 발송됩니다.
          </p>

          <div className="text-xs text-gray-500">
            잠시 후 예약 확인 페이지로 이동합니다...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-[#003366] text-white sticky top-0 z-50 shadow-lg">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center hover:opacity-80 transition">
            <Image
              src="/msc-logo.svg"
              alt="MSC Cruises"
              width={180}
              height={54}
              priority
            />
          </Link>
          <Link href="/">
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              메인으로
            </Button>
          </Link>
        </nav>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 안내 배너 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            크루즈 예약 신청 안내
          </h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 아래 양식을 작성하여 예약을 신청하실 수 있습니다</li>
            <li>• 담당자가 확인 후 상세 일정과 결제 안내를 드립니다</li>
            <li>• 필수 항목(*)은 반드시 입력해주세요</li>
            <li>• 문의사항은 이메일 또는 전화로 연락주세요</li>
          </ul>
        </div>

        {/* 예약 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <MSCReservationForm
            cruiseId={cruiseId || undefined}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </div>

        {/* 푸터 안내 */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>문의: 1588-0000 | info@msccruises.kr</p>
          <p className="mt-2">운영시간: 평일 09:00-18:00 (주말 및 공휴일 휴무)</p>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-[#003366] text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Image
              src="/msc-logo.svg"
              alt="MSC Cruises"
              width={150}
              height={45}
              className="mx-auto mb-4 opacity-80"
            />
            <p className="text-gray-300 text-sm">
              © 2025 MSC Cruises Korea. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
