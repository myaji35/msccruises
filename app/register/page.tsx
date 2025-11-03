"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ship, Mail, Lock, User, Phone, Building, FileText, MapPin, ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<"customer" | "partner">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    // Partner fields
    company_name: "",
    business_number: "",
    representative_name: "",
    address: "",
  });

  // Check URL param for partner registration
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "partner") {
      setUserType("partner");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    try {
      const registerData: any = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || undefined,
        userType: userType,
      };

      // Add partner info if registering as partner
      if (userType === "partner") {
        registerData.partnerInfo = {
          companyName: formData.company_name,
          businessNumber: formData.business_number,
          representativeName: formData.representative_name || formData.name,
          address: formData.address,
        };
      }

      // Call registration API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "회원가입에 실패했습니다");
      }

      // Show success message
      if (userType === "partner") {
        alert(
          "회원사 등록 신청이 완료되었습니다.\n관리자 승인 후 이용 가능합니다.\n승인 결과는 이메일로 안내드립니다."
        );
        router.push("/login");
      } else {
        alert("회원가입이 완료되었습니다!\nMSC Voyagers Club 멤버십이 자동으로 등록되었습니다.");

        // Auto login after registration
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          router.push("/dashboard/my-bookings");
        } else {
          router.push("/login");
        }
      }
    } catch (err: any) {
      setError(err.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#004080] py-12 px-4">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            메인으로
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-[#003366] mb-4">
            <Ship className="w-12 h-12" />
            <span className="text-3xl font-bold">MSC CRUISES</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">회원가입</h1>
          <p className="text-gray-600">새로운 계정을 만들어 크루즈 여행을 시작하세요</p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setUserType("customer")}
            className={`p-4 rounded-lg border-2 transition ${
              userType === "customer"
                ? "border-[#003366] bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <User className="w-8 h-8 mx-auto mb-2 text-[#003366]" />
            <div className="font-semibold text-[#003366]">일반 회원</div>
            <div className="text-xs text-gray-600 mt-1">크루즈 여행 예약</div>
          </button>
          <button
            type="button"
            onClick={() => setUserType("partner")}
            className={`p-4 rounded-lg border-2 transition ${
              userType === "partner"
                ? "border-[#FFD700] bg-amber-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Building className="w-8 h-8 mx-auto mb-2 text-[#FFD700]" />
            <div className="font-semibold text-[#003366]">회원사 (대리점)</div>
            <div className="text-xs text-gray-600 mt-1">상품 판매 및 수수료</div>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4" />
                이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                전화번호
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              이메일 *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4" />
                비밀번호 *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                placeholder="최소 8자 이상"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4" />
                비밀번호 확인 *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            </div>
          </div>

          {/* Partner-only Fields */}
          {userType === "partner" && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-lg text-[#003366] mb-4">회원사 정보</h3>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4" />
                  회사명 *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required={userType === "partner"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    사업자등록번호 *
                  </label>
                  <input
                    type="text"
                    value={formData.business_number}
                    onChange={(e) =>
                      setFormData({ ...formData, business_number: e.target.value })
                    }
                    required={userType === "partner"}
                    placeholder="123-45-67890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    대표자명
                  </label>
                  <input
                    type="text"
                    value={formData.representative_name}
                    onChange={(e) =>
                      setFormData({ ...formData, representative_name: e.target.value })
                    }
                    placeholder="입력 안하면 이름과 동일"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  회사 주소 *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required={userType === "partner"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>회원사 혜택:</strong>
                </p>
                <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
                  <li>전용 서브페이지 URL 제공</li>
                  <li>예약당 수수료 지급 (기본 8%)</li>
                  <li>대량 예약 시 추가 할인</li>
                  <li>전담 고객 지원</li>
                </ul>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#003366] hover:bg-[#002244] text-white py-6 text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                가입 중...
              </>
            ) : userType === "partner" ? (
              "회원사 등록 신청"
            ) : (
              "회원가입"
            )}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-[#003366] font-semibold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#005599] flex items-center justify-center"><div className="text-white">로딩 중...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
