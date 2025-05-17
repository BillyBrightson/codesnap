"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  QrCode, 
  List, 
  BarChart, 
  UserCircle, 
  CreditCard,
  Settings,
  LogOut,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Create QR Code",
    icon: QrCode,
    href: "/dashboard/create",
    color: "text-violet-500",
  },
  {
    label: "My QR Codes",
    icon: List,
    href: "/dashboard/qrcodes",
    color: "text-pink-700",
  },
  {
    label: "Trash",
    icon: Trash2,
    href: "/dashboard/trash",
    color: "text-red-500",
  },
  {
    label: "Analytics",
    icon: BarChart,
    href: "/dashboard/analytics",
    color: "text-orange-500",
  },
  {
    label: "Account",
    icon: UserCircle,
    href: "/dashboard/account",
    color: "text-emerald-500", 
  },
  {
    label: "Subscription",
    icon: CreditCard,
    href: "/dashboard/subscription",
    color: "text-green-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center">
          <h1 className="text-xl font-bold text-white">
            CodeSnap<span className="text-blue-500">QR</span>
          </h1>
        </Link>
      </div>
      <div className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "w-full justify-start text-slate-200 hover:text-white hover:bg-slate-800",
                pathname === route.href && "bg-slate-800 text-white"
              )}
              asChild
            >
              <Link href={route.href}>
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-700">
        <div className="px-3 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-200 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3 text-red-500" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
} 