"use client";

import { QRCodeList } from "@/components/qr-code-list";
import { Button } from "@/components/ui/button";
import { useQRCodes } from "@/hooks/use-qr-codes";
import { Trash2, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { qrCodeService } from "@/lib/qr-service";
import { useAuth } from "@/providers/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TrashPage() {
  const { qrCodes, loading, deleteQRCode } = useQRCodes(true);
  const { user } = useAuth();

  // Clean up expired trash items when the page loads
  useEffect(() => {
    if (user?.uid) {
      qrCodeService.cleanupExpiredTrashItems(user.uid);
    }
  }, [user?.uid]);

  const handleEmptyTrash = async () => {
    if (!qrCodes.length) return;
    
    if (window.confirm("Are you sure you want to permanently delete all QR codes in the trash? This action cannot be undone.")) {
      for (const qrCode of qrCodes) {
        await deleteQRCode(qrCode.id);
      }
    }
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trash</h1>
          <p className="text-muted-foreground">
            QR codes moved to trash will be stored here for 30 days before being permanently deleted.
          </p>
        </div>
        <Button 
          variant="destructive" 
          onClick={handleEmptyTrash}
          disabled={!qrCodes.length || loading}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Empty Trash
        </Button>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Automatic cleanup</AlertTitle>
        <AlertDescription>
          Items in trash will be automatically deleted after 30 days. You can restore them before that time or delete them permanently now.
        </AlertDescription>
      </Alert>

      <QRCodeList showTrash={true} />
    </div>
  );
}
