"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, AlertCircle, Zap } from "lucide-react";

const FEATURES_FREE = [
  "Static QR code generation",
  "Basic customization options",
  "Download as PNG",
  "Up to 5 QR codes",
  "Email support",
];

const FEATURES_PRO = [
  "Dynamic QR code generation",
  "Advanced customization options",
  "Download as PNG, SVG, PDF",
  "Unlimited QR codes",
  "Real-time scan analytics",
  "Priority support",
  "Add custom logo to QR codes",
  "Bulk generation",
];

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<{
    plan: "FREE" | "PRO";
    status: "ACTIVE" | "CANCELED" | "UNPAID" | "TRIAL";
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  }>({
    plan: "FREE",
    status: "ACTIVE",
  });
  
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/subscription');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }

        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);
  
  const handleUpgrade = () => {
    toast.info("Payment integration coming soon!");
  };
  
  const handleCancelSubscription = () => {
    toast.info("Subscription management coming soon!");
  };
  
  const handleResumeSubscription = () => {
    toast.info("Subscription management coming soon!");
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMMM d, yyyy");
  };
  
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <Badge variant={subscription.plan === "PRO" ? "default" : "outline"}>
                {subscription.plan}
              </Badge>
            </div>
            <CardDescription>
              Your current subscription plan and status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={subscription.status === "ACTIVE" ? "success" : "destructive"} className="ml-auto">
                      {subscription.status}
                    </Badge>
                  </div>
                  
                  {subscription.currentPeriodEnd && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Current period ends:</span>
                      <span className="text-sm ml-auto">{formatDate(subscription.currentPeriodEnd)}</span>
                    </div>
                  )}
                  
                  {subscription.cancelAtPeriodEnd && (
                    <div className="flex items-center p-2 bg-amber-50 text-amber-800 rounded-md mt-4">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        Your subscription will cancel on {formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="pt-4">
                  {subscription.plan === "FREE" ? (
                    <Button onClick={handleUpgrade} className="w-full">
                      Upgrade to Pro
                    </Button>
                  ) : subscription.cancelAtPeriodEnd ? (
                    <Button onClick={handleResumeSubscription} className="w-full" variant="outline">
                      Resume Subscription
                    </Button>
                  ) : (
                    <Button onClick={handleCancelSubscription} className="w-full" variant="outline">
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>
              Features available on your current plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">
                  {subscription.plan === "FREE" ? "Free Plan Features" : "Pro Plan Features"}
                </h3>
                <ul className="space-y-2">
                  {(subscription.plan === "FREE" ? FEATURES_FREE : FEATURES_PRO).map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {subscription.plan === "FREE" && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2 text-blue-600 flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    Pro Plan Features
                  </h3>
                  <ul className="space-y-2 opacity-60">
                    {FEATURES_PRO.filter(f => !FEATURES_FREE.includes(f)).map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          {subscription.plan === "FREE" && (
            <CardFooter>
              <Button onClick={handleUpgrade} className="w-full">
                Upgrade to Pro for $9.99/month
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your past invoices and payment history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.plan === "FREE" ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No billing history available on the free plan.</p>
              <Button onClick={handleUpgrade} variant="link" className="mt-2">
                Upgrade to Pro to view billing history
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>Your billing history will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 