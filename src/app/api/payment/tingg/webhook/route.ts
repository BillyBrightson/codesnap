import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { headers } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const signature = headersList.get('x-tingg-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const payload = await request.json();
    const expectedSignature = crypto
      .createHmac('sha256', process.env.TINGG_SECRET_KEY || '')
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Process the payment notification
    const { statusCode, paymentDetails } = payload;

    // Log the payment details
    console.log('Payment notification received:', {
      statusCode,
      paymentDetails,
    });

    if (statusCode === '000') {
      // Payment was successful
      const userId = paymentDetails.merchantTransactionID;

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          status: 'ACTIVE',
          plan: 'PRO',
          stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
        create: {
          userId,
          status: 'ACTIVE',
          plan: 'PRO',
          stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      });

      return NextResponse.json({ status: 'success' });
    }

    // Payment was not successful
    return NextResponse.json({ status: 'payment_failed' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 