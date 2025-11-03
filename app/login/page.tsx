"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ship, Mail, Lock, ArrowLeft } from "lucide-react";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard/my-bookings";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "naver") => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch (err) {
      setError("소셜 로그인 중 오류가 발생했습니다");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] to-[#004080] flex items-center justify-center px-4">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            메인으로
          </Button>
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-[#003366] mb-4">
            <Ship className="w-12 h-12" />
            <span className="text-3xl font-bold">MSC CRUISES</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">로그인</h1>
          <p className="text-gray-600">계정에 로그인하여 예약을 관리하세요</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-6 flex items-center justify-center gap-3"
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
            <span className="font-semibold">Google로 로그인</span>
          </Button>

          <Button
            type="button"
            onClick={() => handleOAuthSignIn("naver")}
            disabled={isLoading}
            className="w-full bg-[#03C75A] hover:bg-[#02b350] text-white py-6 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
            </svg>
            <span className="font-semibold">네이버로 로그인</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4" />
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="rounded" />
              로그인 상태 유지
            </label>
            <a href="#" className="text-[#003366] hover:underline">
              비밀번호 찾기
            </a>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#003366] hover:bg-[#002244] text-white py-6 text-lg font-semibold"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                로그인 중...
              </>
            ) : (
              "이메일로 로그인"
            )}
          </Button>
        </form>

        {/* Demo Account Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-800 mb-2">💡 OAuth 설정 안내</p>
          <div className="text-xs text-blue-700 space-y-1">
            <div>
              Google/Naver 로그인을 사용하려면 .env 파일에 API 키를 설정해야 합니다.
            </div>
            <div>
              자세한 내용은 README.md를 참고하세요.
            </div>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            계정이 없으신가요?{" "}
            <Link href="/register" className="text-[#003366] font-semibold hover:underline">
              회원가입
            </Link>
          </p>
        </div>

        {/* Partner Registration */}
        <div className="mt-4 text-center">
          <Link
            href="/register?type=partner"
            className="text-sm text-[#FFD700] hover:underline font-semibold"
          >
            🏢 회원사(대리점) 등록하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#005599] flex items-center justify-center"><div className="text-white">로딩 중...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
