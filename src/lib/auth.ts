import { redirect } from "next/navigation";
import { auth } from "@/lib/firebase";

export async function getCurrentUser() {
  const user = auth.currentUser;
  if (!user) return null;
  
  return {
    id: user.uid,
    name: user.displayName,
    email: user.email,
    image: user.photoURL,
  };
}

export function requireAuth() {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  
  return {
    user: {
      id: user.uid,
      name: user.displayName,
      email: user.email,
      image: user.photoURL,
    }
  };
}

export function isFreeUser(user: any) {
  return !user?.subscription || user.subscription.plan === "FREE";
}

export function isProUser(user: any) {
  return user?.subscription && user.subscription.plan === "PRO" && user.subscription.status === "ACTIVE";
} 