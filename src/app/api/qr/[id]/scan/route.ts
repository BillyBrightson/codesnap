import { NextRequest, NextResponse } from "next/server";
import { recordScan } from "@/lib/firebase/scans";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headersList = headers();
    const qrCodeId = params.id;
    const body = await request.json();
    const { userId } = body;

    if (!userId || !qrCodeId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get the forwarded IP or direct IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip');

    // Record scan with additional metadata
    await recordScan(userId, qrCodeId, {
      userAgent: request.headers.get("user-agent") || undefined,
      ipAddress: ip || undefined,
      referrer: request.headers.get("referer") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording scan:", error);
    return NextResponse.json(
      { error: "Failed to record scan" },
      { status: 500 }
    );
  }
} 