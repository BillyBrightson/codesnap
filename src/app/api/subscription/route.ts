import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // For now, return a basic free plan response
  return NextResponse.json({
    plan: 'FREE',
    status: 'ACTIVE',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false
  });
} 