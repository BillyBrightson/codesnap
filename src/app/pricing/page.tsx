"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

const freePlanFeatures = [
  "Static QR code generation",
  "Basic customization options",
  "Download as PNG",
  "Up to 5 QR codes per account",
  "Standard support",
];

const proPlanFeatures = [
  "Dynamic QR code generation",
  "Advanced customization options",
  "Download as PNG, SVG, PDF",
  "Unlimited QR codes",
  "Real-time analytics",
  "Priority support",
  "Add custom logo to QR codes",
  "Bulk generation",
];

export default function PricingPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <>
      <SiteHeader />
      <div className="container max-w-6xl py-10">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Choose the plan that's right for you and start creating QR codes today.
          </p>
        </div>

        <div className="grid gap-8 mt-16 md:grid-cols-2">
          {/* Free Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>
                Perfect for personal use or just getting started.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid flex-1 gap-4">
              <div className="text-3xl font-bold">$0</div>
              <p className="text-muted-foreground">
                Free forever, no credit card required.
              </p>
              <ul className="grid gap-2">
                {freePlanFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isLoggedIn ? (
                <Button asChild className="w-full">
                  <Link href="/dashboard/create">Get Started</Link>
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/register">Create Free Account</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="flex flex-col border-blue-600">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20 rounded-t-lg">
              <div className="text-center text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                RECOMMENDED
              </div>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>
                For businesses and professionals who need more features.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid flex-1 gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">
                Billed monthly or $99.99/year.
              </p>
              <ul className="grid gap-2">
                {proPlanFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isLoggedIn ? (
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/dashboard/subscription">Upgrade to Pro</Link>
                </Button>
              ) : (
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/register?plan=pro">Try Pro Free for 7 Days</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mt-20">
          <h2 className="font-bold text-2xl sm:text-3xl">
            Frequently Asked Questions
          </h2>
          
          <div className="grid gap-6 mt-8 text-left">
            <div>
              <h3 className="font-semibold text-xl">What's the difference between static and dynamic QR codes?</h3>
              <p className="text-muted-foreground mt-1">
                Static QR codes have fixed content that cannot be changed once created. Dynamic QR codes allow you to change the destination without reprinting the QR code.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-xl">Can I upgrade or downgrade my plan?</h3>
              <p className="text-muted-foreground mt-1">
                Yes, you can upgrade to Pro at any time. If you need to downgrade, you can do so at the end of your billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-xl">Do you offer custom enterprise plans?</h3>
              <p className="text-muted-foreground mt-1">
                Yes, for large organizations with custom needs, we offer enterprise plans. Please contact our sales team for more information.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-xl">How does the 7-day free trial work?</h3>
              <p className="text-muted-foreground mt-1">
                You can try all Pro features for 7 days without being charged. If you don't cancel before the trial ends, you'll be billed for the Pro plan.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-muted-foreground">
              Have more questions? Contact our <Link href="/contact" className="text-blue-600 underline">support team</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 