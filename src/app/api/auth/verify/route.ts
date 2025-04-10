import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Verify the token with Firebase Admin
    try {
      await adminAuth.verifyIdToken(token);
      return NextResponse.json({ valid: true });
    } catch (error) {
      console.error("Invalid Firebase token:", error);
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 