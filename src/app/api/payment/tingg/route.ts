import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { plan } = await req.json();

    // Initialize Tingg checkout request
    const checkoutRequest = {
      merchantTransactionID: `sub_${Date.now()}_${userId}`,
      customerFirstName: "Customer", // You should get this from your user profile
      customerLastName: "",
      msisdn: "", // This will be provided by the customer during checkout
      customerEmail: decodedToken.email || "",
      requestAmount: plan === 'PRO' ? "9.99" : "0",
      currencyCode: "USD",
      accountNumber: userId,
      serviceCode: process.env.TINGG_SERVICE_CODE,
      dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      requestDescription: `${plan} Plan Subscription`,
      countryCode: "KE", // Default to Kenya, should be dynamic based on user
      languageCode: "en",
      paymentWebhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/tingg/webhook`,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=success`,
      failRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?status=failed`,
    };

    // Make request to Tingg API
    const response = await fetch('https://checkout.tingg.africa/v2/custom-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TINGG_API_KEY}`,
      },
      body: JSON.stringify(checkoutRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 