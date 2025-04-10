"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
  getIdToken,
  fetchSignInMethodsForEmail,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<{ success: boolean; message?: string; email?: string; isNewUser?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Set firebase persistence to local for better session handling
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Firebase persistence set to LOCAL");
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
  }, []);

  // Handle auth state changes
  useEffect(() => {
    console.log("Setting up auth state listener");
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      
      console.log("Auth state changed:", user ? `User: ${user.email}` : "No user");
      
      if (user) {
        // Set user in state immediately without waiting for cookie
        setUser(user);
        
        // Then try to set cookie as a non-blocking operation
        try {
          console.log("Setting auth cookie for user:", user.email);
          const token = await getIdToken(user, true); // Force token refresh
          
          // Use fetch to set cookie
          const response = await fetch("/api/auth/set-cookie", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });
          
          if (response.ok) {
            console.log("Auth cookie set successfully");
          } else {
            console.error("Failed to set auth cookie:", await response.text());
            console.log("Continuing with authentication despite cookie failure");
          }
        } catch (error) {
          console.error("Error setting auth cookie:", error);
          console.log("Continuing with authentication despite cookie failure");
        }
      } else {
        setUser(null);
      }
      
      // Complete loading regardless of cookie success
      if (isMounted) {
        setLoading(false);
        console.log("Auth loading completed, state:", { user: !!user, loading: false });
      }
    });

    return () => {
      console.log("Cleaning up auth state listener");
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // Get token and set cookie
        const token = await getIdToken(userCredential.user);
        await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
      }
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Get token and set cookie
      const token = await getIdToken(userCredential.user);
      const response = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        console.error("Failed to set auth cookie:", await response.text());
      }
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      
      try {
        // Try to sign in with Google
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const email = user.email;
        
        if (!email) {
          setLoading(false);
          return {
            success: false,
            message: "No email associated with this Google account."
          };
        }
        
        // Get token and set cookie
        const token = await getIdToken(user);
        const response = await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        
        if (!response.ok) {
          console.error("Failed to set auth cookie:", await response.text());
        }
        
        setLoading(false);
        return { success: true };
      } catch (error: any) {
        setLoading(false);
        // Handle specific error cases
        if (error.code === "auth/account-exists-with-different-credential") {
          const email = error.customData?.email;
          if (email) {
            return {
              success: false,
              message: "This email is already registered with a different method. Please sign in with that method.",
              email,
              isNewUser: false
            };
          }
        }
        
        if (error.code === "auth/user-not-found" || error.code === "auth/popup-closed-by-user") {
          // Return info so we can redirect to registration
          return {
            success: false,
            message: "No account found with this email. Please register first.",
            email: error.customData?.email,
            isNewUser: true
          };
        }
        
        throw error;
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // Clear the cookie by making a request to a logout endpoint
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    googleSignIn,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 