import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      phone,
      userType,
      partnerInfo,
    } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "필수 정보를 입력해주세요" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        userType: userType || "customer",
      },
    });

    // If partner, create partner info
    if (userType === "partner" && partnerInfo) {
      const subpageUrl = `/partners/${partnerInfo.companyName
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")}`;

      await prisma.partnerInfo.create({
        data: {
          userId: user.id,
          companyName: partnerInfo.companyName,
          businessNumber: partnerInfo.businessNumber,
          representativeName: partnerInfo.representativeName || name,
          address: partnerInfo.address,
          commissionRate: 0.08,
          subpageUrl,
          status: "pending",
        },
      });
    } else {
      // If customer, create Voyagers Club membership
      await prisma.voyagersClub.create({
        data: {
          userId: user.id,
          membershipNumber: `MSC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          tier: "classic",
          points: 0,
        },
      });
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
        },
        message: "회원가입이 완료되었습니다",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
