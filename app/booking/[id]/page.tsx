"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Ship,
  Calendar,
  Users,
  CreditCard,
  Check,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";

interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
  nationality: string;
  isPrimary: boolean;
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ id: string}>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [cruiseId, setCruiseId] = useState<string>("");
  const [cruise, setCruise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Booking data
  const [departureDate, setDepartureDate] = useState("");
  const [cabinCategory, setCabinCategory] = useState("inside");
  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportNumber: "",
      nationality: "South Korea",
      isPrimary: true,
    },
  ]);

  useEffect(() => {
    params.then((resolvedParams) => {
      setCruiseId(resolvedParams.id);
      fetchCruise(resolvedParams.id);
    });
  }, []);

  const fetchCruise = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/cruises/${id}`);
      if (!response.ok) throw new Error("Failed to fetch cruise");
      const data = await response.json();
      setCruise(data.cruise);
    } catch (error) {
      console.error("Failed to fetch cruise:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        passportNumber: "",
        nationality: "South Korea",
        isPrimary: false,
      },
    ]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const updatePassenger = (index: number, field: string, value: any) => {
    const updated = passengers.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    setPassengers(updated);
  };

  const getCabinPrice = () => {
    if (!cruise) return 0;
    const basePrice = cruise.startingPrice;
    const multiplier = {
      inside: 1.0,
      oceanview: 1.3,
      balcony: 1.6,
      suite: 2.5,
    }[cabinCategory] || 1.0;
    return basePrice * multiplier;
  };

  const getTotalPrice = () => {
    return getCabinPrice() * passengers.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      alert("로그인이 필요합니다.");
      router.push(`/login?callbackUrl=/booking/${cruiseId}`);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cruiseId,
          departureDate,
          cabinCategory,
          passengers,
          totalPrice: getTotalPrice(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const data = await response.json();
      // Navigate to payment page
      router.push(`/dashboard/bookings/payment?bookingId=${data.booking.id}&amount=${getTotalPrice()}`);
    } catch (error: any) {
      console.error("Booking error:", error);
      alert(error.message || "예약에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!cruise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">크루즈를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/msc-logo.svg"
              alt="MSC Cruises"
              width={180}
              height={54}
              priority
            />
          </Link>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, title: "상품 선택" },
              { num: 2, title: "승객 정보" },
              { num: 3, title: "결제" },
            ].map((s) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= s.num
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span
                  className={`ml-2 font-medium ${
                    step >= s.num ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {s.title}
                </span>
                {s.num < 3 && (
                  <ChevronRight className="w-5 h-5 text-gray-300 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Cruise Selection */}
              {step === 1 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6">상품 선택</h2>

                  {/* Departure Date */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      출발 날짜 *
                    </label>
                    <input
                      type="date"
                      required
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Cabin Category */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      캐빈 등급 *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { value: "inside", label: "내부 캐빈", price: 1.0 },
                        { value: "oceanview", label: "오션뷰", price: 1.3 },
                        { value: "balcony", label: "발코니", price: 1.6 },
                        { value: "suite", label: "스위트", price: 2.5 },
                      ].map((cabin) => (
                        <label
                          key={cabin.value}
                          className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            cabinCategory === cabin.value
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="cabinCategory"
                            value={cabin.value}
                            checked={cabinCategory === cabin.value}
                            onChange={(e) => setCabinCategory(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex-grow">
                            <p className="font-semibold">{cabin.label}</p>
                            <p className="text-sm text-gray-600">
                              $
                              {(
                                cruise.startingPrice * cabin.price
                              ).toLocaleString()}{" "}
                              /인
                            </p>
                          </div>
                          {cabinCategory === cabin.value && (
                            <Check className="w-5 h-5 text-blue-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!departureDate}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    다음: 승객 정보 입력
                  </button>
                </div>
              )}

              {/* Step 2: Passenger Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">승객 정보</h2>
                      <button
                        type="button"
                        onClick={addPassenger}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        승객 추가
                      </button>
                    </div>

                    {passengers.map((passenger, index) => (
                      <div
                        key={index}
                        className="mb-6 pb-6 border-b last:border-b-0"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">
                            승객 {index + 1}
                            {passenger.isPrimary && (
                              <span className="ml-2 text-sm text-blue-600">
                                (대표)
                              </span>
                            )}
                          </h3>
                          {!passenger.isPrimary && (
                            <button
                              type="button"
                              onClick={() => removePassenger(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              이름 (First Name) *
                            </label>
                            <input
                              type="text"
                              required
                              value={passenger.firstName}
                              onChange={(e) =>
                                updatePassenger(
                                  index,
                                  "firstName",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              성 (Last Name) *
                            </label>
                            <input
                              type="text"
                              required
                              value={passenger.lastName}
                              onChange={(e) =>
                                updatePassenger(
                                  index,
                                  "lastName",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              생년월일 *
                            </label>
                            <input
                              type="date"
                              required
                              value={passenger.dateOfBirth}
                              onChange={(e) =>
                                updatePassenger(
                                  index,
                                  "dateOfBirth",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              여권 번호
                            </label>
                            <input
                              type="text"
                              value={passenger.passportNumber}
                              onChange={(e) =>
                                updatePassenger(
                                  index,
                                  "passportNumber",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              국적 *
                            </label>
                            <select
                              required
                              value={passenger.nationality}
                              onChange={(e) =>
                                updatePassenger(
                                  index,
                                  "nationality",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="South Korea">대한민국</option>
                              <option value="USA">미국</option>
                              <option value="Japan">일본</option>
                              <option value="China">중국</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      이전
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      다음: 결제
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6">결제</h2>

                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      현재는 데모 버전으로, 실제 결제는 진행되지 않습니다.
                      <br />
                      "예약 완료" 버튼을 클릭하시면 예약이 생성됩니다.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      이전
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {saving ? "처리 중..." : "예약 완료"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-8">
              <h3 className="text-xl font-bold mb-4">예약 요약</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Ship className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold">{cruise.name}</p>
                    <p className="text-sm text-gray-600">{cruise.shipName}</p>
                  </div>
                </div>

                {departureDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">출발일</p>
                      <p className="font-semibold">{departureDate}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">승객</p>
                    <p className="font-semibold">{passengers.length}명</p>
                  </div>
                </div>

                {cabinCategory && (
                  <div>
                    <p className="text-sm text-gray-600">캐빈 등급</p>
                    <p className="font-semibold">
                      {{
                        inside: "내부 캐빈",
                        oceanview: "오션뷰",
                        balcony: "발코니",
                        suite: "스위트",
                      }[cabinCategory]}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">캐빈 가격 (1인)</span>
                  <span className="font-semibold">
                    ${getCabinPrice().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">승객 수</span>
                  <span className="font-semibold">x {passengers.length}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
                  <span>총 금액</span>
                  <span className="text-blue-600">
                    ${getTotalPrice().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
