"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Phone, Home, FileText } from "lucide-react";

export default function ReservationSuccessPage() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id") || "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      {/* 헤더 */}
      <header className="bg-[#003366] text-white shadow-lg">
        <nav className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center hover:opacity-80 transition">
            <Image
              src="/msc-logo.svg"
              alt="MSC Cruises"
              width={180}
              height={54}
              priority
            />
          </Link>
        </nav>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* 성공 메시지 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 상단 배너 */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">예약 신청이 완료되었습니다!</h1>
            <p className="text-green-100">
              MSC Cruises 예약을 신청해주셔서 감사합니다.
            </p>
          </div>

          {/* 예약 정보 */}
          <div className="p-8">
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">예약 번호</span>
                </div>
                <span className="text-2xl font-bold text-[#003366]">{reservationId}</span>
              </div>
              <p className="text-sm text-gray-600">
                위 예약 번호를 메모해두시거나 스크린샷으로 저장해주세요.
              </p>
            </div>

            {/* 다음 단계 안내 */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">다음 단계</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#003366] text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">예약 확인</h3>
                    <p className="text-sm text-gray-600">
                      담당자가 예약 내용을 확인합니다 (영업일 기준 1-2일 소요)
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#003366] text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">연락 드림</h3>
                    <p className="text-sm text-gray-600">
                      이메일 또는 휴대폰으로 상세 일정과 견적을 안내드립니다
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#003366] text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">예약 확정</h3>
                    <p className="text-sm text-gray-600">
                      결제 완료 후 예약이 최종 확정됩니다
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 안내 사항 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">📋 안내 사항</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• 예약 확인 메일이 발송되었습니다 (스팸함도 확인해주세요)</li>
                <li>• 성수기에는 확인이 다소 지연될 수 있습니다</li>
                <li>• 문의사항은 아래 연락처로 편하게 문의해주세요</li>
                <li>• 여권 유효기간을 반드시 확인해주세요 (출발일 기준 6개월 이상)</li>
              </ul>
            </div>

            {/* 연락처 */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-[#003366] text-white rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">전화 문의</p>
                  <p className="font-semibold text-[#003366]">1588-0000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-[#003366] text-white rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">이메일 문의</p>
                  <p className="font-semibold text-[#003366]">info@msccruises.kr</p>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white">
                  <Home className="w-4 h-4 mr-2" />
                  홈으로 돌아가기
                </Button>
              </Link>
              <Link href="/cruises" className="flex-1">
                <Button className="w-full bg-[#003366] hover:bg-[#002244]">
                  다른 크루즈 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            운영시간: 평일 09:00-18:00 (주말 및 공휴일 휴무)
          </p>
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
