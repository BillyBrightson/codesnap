"use client";

import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Bell } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    console.log("Dashboard layout mounted, auth state:", { 
      user: user?.email || "No user", 
      loading 
    });
  }, []);
  
  useEffect(() => {
    if (mounted && !loading && !user) {
      console.log("No user found in dashboard, redirecting to login");
      router.push("/login");
    }
  }, [user, loading, mounted, router]);

  // Get initials from name or email
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user?.email ? user.email.charAt(0).toUpperCase() : "U";
  };

  // Don't render anything during SSR
  if (!mounted) {
    return null;
  }
  
  // Simple loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // No user, show redirect message
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  // User authenticated, show dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar />
      </div>
      <div className="md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
          <div className="px-6">
            <div className="max-w-7xl mx-auto">
              <div className="h-16 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full overflow-hidden p-0">
                        <Avatar>
                          <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                          <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-6">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 