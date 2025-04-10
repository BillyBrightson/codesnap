"use client";

import { useQRCodes } from "@/hooks/use-qr-codes";
import { QRCode } from "@/lib/qr-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil, Trash2, Download } from "lucide-react";
import { format } from "date-fns";

interface QRCodeListProps {
  onEdit?: (qrCode: QRCode) => void;
}

export function QRCodeList({ onEdit }: QRCodeListProps) {
  const { qrCodes, loading, deleteQRCode } = useQRCodes();

  const handleDownload = (qrCode: QRCode) => {
    if (!qrCode.data.imageData) return;

    const link = document.createElement("a");
    link.href = qrCode.data.imageData;
    link.download = `${qrCode.name}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading QR codes...
      </div>
    );
  }

  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No QR codes saved yet. Create your first one!
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {qrCodes.map((qrCode) => (
        <Card key={qrCode.id}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{qrCode.name}</CardTitle>
            <CardDescription>
              Created on {format(new Date(qrCode.createdAt), "PPP")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square relative mb-4">
              {qrCode.data.imageData && (
                <img
                  src={qrCode.data.imageData}
                  alt={`QR code for ${qrCode.name}`}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDownload(qrCode)}
                disabled={!qrCode.data.imageData}
              >
                <Download className="h-4 w-4" />
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(qrCode)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => deleteQRCode(qrCode.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 