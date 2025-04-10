import { NextResponse } from "next/server";

export async function POST() {
  // Create a response
  const response = NextResponse.json({ success: true });
  
  // Clear the auth cookie
  response.cookies.set({
    name: "auth-token",
    value: "",
    expires: new Date(0), // Set expiration to the past to delete the cookie
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return response;
} 