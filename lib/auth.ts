import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Naver OAuth - Custom Provider
    {
      id: "naver",
      name: "Naver",
      type: "oauth",
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      authorization: {
        url: "https://nid.naver.com/oauth2.0/authorize",
        params: {
          response_type: "code",
        },
      },
      token: "https://nid.naver.com/oauth2.0/token",
      userinfo: "https://openapi.naver.com/v1/nid/me",
      profile(profile: any) {
        return {
          id: profile.response.id,
          name: profile.response.name,
          email: profile.response.email,
          image: profile.response.profile_image,
        };
      },
    },
    // Email/Password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            partnerInfo: true,
            voyagersClub: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("등록되지 않은 이메일입니다");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("비밀번호가 일치하지 않습니다");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          userType: user.userType,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;

        // Get user from database to include userType
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            userType: true,
          },
        });

        if (user) {
          session.user.userType = user.userType;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      // OAuth 로그인 시 (Google, Naver)
      if (account?.provider === "google" || account?.provider === "naver") {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // If new user from OAuth, create Voyagers Club membership
        if (!existingUser) {
          // User will be created by PrismaAdapter
          // We'll create Voyagers Club in a separate step after sign in
          return true;
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create Voyagers Club for new OAuth users
      if (user.email && user.userType === "customer") {
        await prisma.voyagersClub.create({
          data: {
            userId: user.id,
            membershipNumber: `MSC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            tier: "classic",
            points: 0,
          },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
