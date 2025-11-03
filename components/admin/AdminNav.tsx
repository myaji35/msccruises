"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, Package } from "lucide-react";

export default function AdminNav() {
  return (
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#003366]">
            <Home className="w-4 h-4 mr-2" />
            메인 페이지
          </Button>
        </Link>
        <Link href="/dashboard/partner">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#003366]">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            대시보드
          </Button>
        </Link>
        <Link href="/admin/cruises">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#003366]">
            <Package className="w-4 h-4 mr-2" />
            크루즈 관리
          </Button>
        </Link>
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-semibold text-[#003366]">🚢 MSC Cruises</span> 관리자
      </div>
    </div>
  );
}
