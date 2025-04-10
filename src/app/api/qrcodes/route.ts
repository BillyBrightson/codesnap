import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { isProUser } from "@/lib/auth";

// Schema for creating a new QR code
const createQRCodeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["URL", "TEXT", "EMAIL", "PHONE", "VCARD", "WIFI"]),
  content: z.string().min(1, "Content is required"),
  dynamic: z.boolean().optional().default(false),
  foreground: z.string().optional().default("#000000"),
  background: z.string().optional().default("#FFFFFF"),
  logo: z.string().optional(),
  frameStyle: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        subscription: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const validatedData = createQRCodeSchema.parse(body);
    
    // Check if user is trying to create a dynamic QR code but is not a Pro user
    if (validatedData.dynamic && !isProUser(user)) {
      return NextResponse.json(
        { error: "Dynamic QR codes are only available for Pro users" },
        { status: 403 }
      );
    }
    
    // Create QR code in database
    const qrCode = await db.qRCode.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });
    
    return NextResponse.json(qrCode, { status: 201 });
  } catch (error) {
    console.error("Error creating QR code:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get user from database
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get QR codes for the user
    const qrCodes = await db.qRCode.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(qrCodes);
  } catch (error) {
    console.error("Error getting QR codes:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 