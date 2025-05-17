"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function QRRedirectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleRedirect() {
      try {
        // Search through all users' QR codes
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        let foundQRCode = null;
        let foundUserId = null;

        // Search through each user's QR codes subcollection
        for (const userDoc of usersSnapshot.docs) {
          const qrCodesRef = collection(db, `users/${userDoc.id}/qrcodes`);
          const qrCodesSnapshot = await getDocs(qrCodesRef);
          
          const qrCode = qrCodesSnapshot.docs.find(doc => doc.id === params.id);
          if (qrCode) {
            foundQRCode = qrCode.data();
            foundUserId = userDoc.id;
            break;
          }
        }

        if (!foundQRCode || !foundUserId) {
          setError("QR code not found");
          return;
        }

        // Record the scan
        await fetch(`/api/qr/${params.id}/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: foundUserId }),
        });

        // Redirect to the target URL
        if (foundQRCode.url) {
          window.location.href = foundQRCode.url;
        } else {
          setError("Invalid QR code data");
        }
      } catch (error) {
        console.error("Error handling QR code redirect:", error);
        setError("Failed to process QR code");
      }
    }

    handleRedirect();
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
} 