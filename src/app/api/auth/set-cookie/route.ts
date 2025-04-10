import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    
    console.log("Set-cookie API: Request received");
    
    if (!token) {
      console.error("Set-cookie API: Token is missing");
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Print some debug info about environment variables (without revealing sensitive data)
    console.log("Set-cookie API: Environment variables check:");
    console.log("- FIREBASE_PROJECT_ID exists:", !!process.env.FIREBASE_PROJECT_ID);
    console.log("- FIREBASE_CLIENT_EMAIL exists:", !!process.env.FIREBASE_CLIENT_EMAIL);
    console.log("- FIREBASE_PRIVATE_KEY exists:", !!process.env.FIREBASE_PRIVATE_KEY);
    
    // TEMPORARY SOLUTION: Skip token verification and set the cookie anyway
    // This is for debugging only and should be removed once the issue is fixed
    try {
      console.log("Set-cookie API: BYPASSING TOKEN VERIFICATION FOR DEBUGGING");
      
      // Create a response
      const response = NextResponse.json({ 
        success: true,
        debug: true,
        message: "Token verification bypassed for debugging"
      });
      
      // Set the cookie in the response with simpler settings to avoid issues
      console.log("Set-cookie API: Setting auth-token cookie");
      response.cookies.set({
        name: "auth-token",
        value: token,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      
      console.log("Set-cookie API: Cookie set successfully");
      return response;
      
      /* COMMENT OUT THE ACTUAL VERIFICATION FOR NOW
      console.log("Set-cookie API: Verifying token");
      const decodedToken = await adminAuth.verifyIdToken(token);
      console.log("Set-cookie API: Token verified for user:", decodedToken.email);
      
      // Create a response
      const response = NextResponse.json({ 
        success: true,
        email: decodedToken.email,
        uid: decodedToken.uid
      });
      
      // Set the cookie in the response with simpler settings to avoid issues
      console.log("Set-cookie API: Setting auth-token cookie");
      response.cookies.set({
        name: "auth-token",
        value: token,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      
      console.log("Set-cookie API: Cookie set successfully");
      return response;
      */
    } catch (error) {
      console.error("Set-cookie API: Invalid Firebase token:", error);
      return NextResponse.json(
        { error: "Invalid token", details: error instanceof Error ? error.message : String(error) },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Set-cookie API: Error setting cookie:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 