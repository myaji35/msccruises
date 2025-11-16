"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, Package, Settings, Menu, X } from "lucide-react";

export default function AdminNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { href: "/", label: "메인 페이지", icon: Home },
    { href: "/dashboard/partner", label: "대시보드", icon: LayoutDashboard },
    { href: "/admin/cruises", label: "크루즈 관리", icon: Package },
    { href: "/admin/settings", label: "설정", icon: Settings },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        {/* 데스크톱 메뉴 */}
        <div className="hidden md:flex items-center gap-4">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#003366]">
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* 모바일 햄버거 메뉴 버튼 */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-[#003366]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* 로고 및 관리자 텍스트 */}
        <div className="flex items-center gap-3 md:ml-auto">
          <Image
            src="/msc-logo.svg"
            alt="MSC Cruises"
            width={140}
            height={35}
          />
          <span className="hidden sm:inline text-sm text-gray-600 border-l border-gray-300 pl-3">관리자</span>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden mb-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <nav className="flex flex-col">
            {menuItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-600 hover:text-[#003366] hover:bg-blue-50"
                  style={{
                    borderBottom: index < menuItems.length - 1 ? "1px solid #f3f4f6" : "none",
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
