import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    // Production: File upload not supported on App Engine
    // Use Google Cloud Storage instead
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error: "File upload is not available in production environment",
          message: "Please contact administrator to set up Google Cloud Storage for file uploads"
        },
        { status: 501 } // Not Implemented
      );
    }

    // Check authentication (개발 모드에서는 우회)
    const isDevelopment = process.env.NODE_ENV === "development";

    if (!isDevelopment) {
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Check if user is partner (admin)
      const userType = (session.user as any).userType;
      if (userType !== "partner") {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }
    } else {
      console.log("[DEV MODE] Skipping authentication for media upload");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const validTypes = [...validImageTypes, ...validVideoTypes];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB for videos, 10MB for images)
    const maxSize = file.type.startsWith("video/") ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Max size: ${file.type.startsWith("video/") ? "50MB" : "10MB"}`
        },
        { status: 400 }
      );
    }

    // App Engine: Use /tmp directory (ephemeral storage)
    // For production, this should use Google Cloud Storage
    const uploadDir = process.env.NODE_ENV === "production"
      ? join("/tmp", "uploads", "cruises")
      : join(process.cwd(), "public", "uploads", "cruises");

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Convert file to buffer and write
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Get file dimensions if image
    let width, height, duration;
    const mediaType = file.type.startsWith("video/") ? "video" : "image";

    if (mediaType === "image") {
      // You can use sharp or image-size library to get dimensions
      // For now, we'll leave it as null and can add later
      width = null;
      height = null;
    }

    // Return file info
    const fileUrl = `/uploads/cruises/${filename}`;

    return NextResponse.json({
      success: true,
      file: {
        url: fileUrl,
        filename: filename,
        originalName: file.name,
        type: mediaType,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        duration,
      },
    });

  } catch (error: any) {
    console.error("[Media Upload Error]", error);
    return NextResponse.json(
      {
        error: "Failed to upload file",
        message: error.message
      },
      { status: 500 }
    );
  }
}
