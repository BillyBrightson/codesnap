"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  UserCircle, 
  Home, 
  QrCode, 
  Settings, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const isHome = pathname === "/";
  const isLoggedIn = !!user;

  const handleSignOut = async () => {
    await logout();
    router.push("/");
  };

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">CodeSnap QR</span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            <Link
              href="/features"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
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
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/qrcodes" className="flex items-center cursor-pointer">
                    <QrCode className="mr-2 h-4 w-4" />
                    <span>My QR Codes</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/account" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block px-3"
              >
                Sign In
              </Link>
              <Button asChild size="sm" className="rounded-md">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 