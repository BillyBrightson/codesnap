"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics } from "@/lib/firebase/dashboard";
import { format } from "date-fns";
import { ArrowRight, ArrowUpRight, ArrowDownRight, QrCode, Scan, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardData {
  totalQRCodes: number;
  totalScans: number;
  recentQRCodes: Array<{
    id: string;
    name: string;
    type: string;
    scanCount: number;
    createdAt: Date;
  }>;
  monthlyComparison?: {
    qrCodes: {
      current: number;
      previous: number;
      percentageChange: number;
    };
    scans: {
      current: number;
      previous: number;
      percentageChange: number;
    };
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user?.uid]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const metrics = await getDashboardMetrics(user!.uid);
      setData(metrics);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Overview of your QR codes and analytics.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create QR Code
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalQRCodes || 0}</div>
            {data?.monthlyComparison && (
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                {data.monthlyComparison.qrCodes.percentageChange > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={data.monthlyComparison.qrCodes.percentageChange > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(data.monthlyComparison.qrCodes.percentageChange).toFixed(1)}% from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalScans || 0}</div>
            {data?.monthlyComparison && (
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                {data.monthlyComparison.scans.percentageChange > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={data.monthlyComparison.scans.percentageChange > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(data.monthlyComparison.scans.percentageChange).toFixed(1)}% from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.monthlyComparison?.qrCodes.current || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              QR codes created this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Scans</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.monthlyComparison?.scans.current || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scans this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent QR Codes */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent QR Codes</CardTitle>
            <CardDescription>Your recently created QR codes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentQRCodes.map((qrCode) => (
                <div
                  key={qrCode.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/qrcodes/${qrCode.id}`)}
                >
                  <div className="space-y-1">
                    <p className="font-medium">{qrCode.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{qrCode.type}</span>
                      <span>•</span>
                      <span>{format(qrCode.createdAt, "MM/dd/yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{qrCode.scanCount}</p>
                      <p className="text-xs text-muted-foreground">Scans</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {(!data?.recentQRCodes || data.recentQRCodes.length === 0) && (
                <div className="text-center py-6">
                  <QrCode className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No QR codes created yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 