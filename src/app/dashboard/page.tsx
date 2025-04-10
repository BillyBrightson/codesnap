"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QrCode, BarChart, Plus } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface QRCode {
  id: string;
  name: string;
  type: string;
  scans: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentQRCodes, setRecentQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with an actual API call in a real implementation
    const fetchRecentQRCodes = () => {
      console.log("Dashboard page: Fetching recent QR codes");
      setLoading(true);
      
      // Log the user state
      console.log("Dashboard page: Current user state:", { 
        user: user ? `${user.email} (${user.uid})` : "No user",
        authenticated: !!user
      });
      
      // Simulate API call
      setTimeout(() => {
        console.log("Dashboard page: QR code data loaded");
        setRecentQRCodes([
          {
            id: "1",
            name: "Company Website",
            type: "URL",
            scans: 245,
            createdAt: "2023-03-15T12:00:00Z",
          },
          {
            id: "2",
            name: "Product Catalog",
            type: "URL",
            scans: 187,
            createdAt: "2023-04-02T09:30:00Z",
          },
          {
            id: "3",
            name: "Contact Card",
            type: "VCARD",
            scans: 92,
            createdAt: "2023-04-10T15:45:00Z",
          },
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchRecentQRCodes();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/create">
              <Plus className="mr-2 h-4 w-4" />
              Create QR Code
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">524</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Free</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/dashboard/subscription" className="text-blue-500 hover:underline">
                Upgrade to Pro
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent QR Codes</CardTitle>
            <CardDescription>
              Your most recently created QR codes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentQRCodes.map((qrCode) => (
                  <Link 
                    href={`/dashboard/qrcodes/${qrCode.id}`} 
                    key={qrCode.id}
                    className="flex items-center space-x-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <div className="h-12 w-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <QrCode className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{qrCode.name}</p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="mr-2">{qrCode.type}</span>
                        <span>•</span>
                        <span className="mx-2">{qrCode.scans} scans</span>
                        <span>•</span>
                        <span className="ml-2">Created {formatDate(qrCode.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="pt-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard/qrcodes">View All QR Codes</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 