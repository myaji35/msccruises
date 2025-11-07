"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Phone, Building, FileText, MapPin, ArrowLeft } from "lucide-react";
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

      // Handle success based on user type
      if (userType === "partner") {
        alert(
          "회원사 등록 신청이 완료되었습니다.\n관리자 승인 후 이용 가능합니다.\n승인 결과는 이메일로 안내드립니다."
        );
        router.push("/login");
      } else {
        // Auto login after customer registration
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.ok) {
          // Success! Redirect to main page
          alert("회원가입이 완료되었습니다!\n🎉 MSC Voyagers Club 멤버십이 자동으로 등록되었습니다.");
          router.push("/");
          router.refresh();
        } else {
          // Auto login failed, redirect to login page
          alert("회원가입은 완료되었습니다.\n로그인 페이지에서 로그인해주세요.");
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
          <div className="flex justify-center mb-6">
            <Image
              src="/msc-logo.svg"
              alt="MSC Cruises"
              width={200}
              height={60}
            />
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

        {/* Divider - Only show for customer */}
        {userType === "customer" && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는 간편 가입</span>
            </div>
          </div>
        )}

        {/* Social Login Buttons - Only for customers */}
        {userType === "customer" && (
          <div className="space-y-3">
            {/* Google Sign Up */}
            <Button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              variant="outline"
              className="w-full py-6 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-semibold text-gray-700">Google로 가입하기</span>
            </Button>

            {/* Naver Sign Up */}
            <Button
              type="button"
              onClick={() => signIn("naver", { callbackUrl: "/" })}
              className="w-full py-6 bg-[#03C75A] hover:bg-[#02B350] text-white flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
              </svg>
              <span className="font-semibold">네이버로 가입하기</span>
            </Button>

            {/* Info message */}
            <p className="text-xs text-center text-gray-500 mt-4">
              소셜 계정으로 가입 시 자동으로 MSC Voyagers Club 멤버십이 생성됩니다
            </p>
          </div>
        )}

        {/* Partner Info Message */}
        {userType === "partner" && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>안내:</strong> 회원사 등록은 이메일/비밀번호 방식만 지원됩니다.
              관리자 승인 후 이용 가능합니다.
            </p>
          </div>
        )}

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
