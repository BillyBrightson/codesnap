"use client";

import { QRCodeList } from "@/components/qr-code-list";
import { Button } from "@/components/ui/button";
import { useQRCodes } from "@/hooks/use-qr-codes";
import { Trash2, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { qrCodeService } from "@/lib/qr-service";
import { useAuth } from "@/providers/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ArchivePage() {
  const { qrCodes, loading, deleteQRCode } = useQRCodes(true);
  const { user } = useAuth();

  // Clean up expired archive items when the page loads
  useEffect(() => {
    if (user?.uid) {
      qrCodeService.cleanupExpiredArchiveItems(user.uid);
    }
  }, [user?.uid]);

  const handleEmptyArchive = async () => {
    if (!qrCodes.length) return;
    
    if (window.confirm("Are you sure you want to permanently delete all archived QR codes? This action cannot be undone.")) {
      for (const qrCode of qrCodes) {
        await deleteQRCode(qrCode.id);
      }
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground">
            Archived QR codes are stored here for future reference.
          </p>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleEmptyArchive}
          disabled={!qrCodes.length || loading}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear Archive
        </Button>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Archive Information</AlertTitle>
        <AlertDescription>
          Archived QR codes are kept for your reference. You can restore them at any time or delete them permanently.
        </AlertDescription>
      </Alert>

      <QRCodeList showArchive={true} />
    </div>
  );
}
