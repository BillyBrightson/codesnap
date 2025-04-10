"use client";

import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function UserInfo() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  if (!user) {
    return null;
  }

  // Get initials from name or use email first character
  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-card border rounded-lg shadow-sm">
      <Avatar className="h-20 w-20">
        <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">
          {user.displayName || "User"}
        </h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <Button variant="outline" onClick={handleLogout}>
        Sign Out
      </Button>
    </div>
  );
} 