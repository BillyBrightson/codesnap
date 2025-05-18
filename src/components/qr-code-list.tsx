"use client";

// Completely redesigned QR code list component
// This implementation uses a simpler approach with no hover effects

import { useQRCodes } from "@/hooks/use-qr-codes";
import { SavedQRCode } from "@/types";
import { format } from "date-fns";
import { Download, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

interface QRCodeListProps {
  onEdit?: (qrCode: SavedQRCode) => void;
  showArchive?: boolean;
}

export function QRCodeList({ onEdit, showArchive = false }: QRCodeListProps) {
  // Get QR codes and actions from the hook
  const { qrCodes = [], loading, moveToArchive, deleteQRCode, restoreFromArchive } = useQRCodes(showArchive);

  // Function to handle downloading a QR code
  const handleDownload = (qrCode: SavedQRCode) => {
    if (!qrCode.imageData) return;

    const link = document.createElement("a");
    link.href = qrCode.imageData;
    link.download = `${qrCode.name}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading QR codes...
      </div>
    );
  }

  // Show empty state
  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {showArchive ? "No archived QR codes." : "No QR codes saved yet. Create your first one!"}
      </div>
    );
  }

  // Render the QR code grid
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {qrCodes.map((qrCode) => (
        <Card key={qrCode.id} className="flex flex-col">
          {/* Card header with QR code name and date */}
          <CardHeader>
            <CardTitle className="text-xl font-bold truncate">{qrCode.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {showArchive
                ? `Archived: ${format(new Date(qrCode.archivedAt || qrCode.updatedAt), "PPP")}` 
                : `Created: ${format(new Date(qrCode.createdAt), "PPP")}`}
            </p>
          </CardHeader>

          {/* QR code image */}
          <CardContent className="flex-grow flex items-center justify-center p-4">
            {qrCode.imageData ? (
              <div className="aspect-square w-full max-w-[200px] mx-auto">
                <img
                  src={qrCode.imageData}
                  alt={`QR code for ${qrCode.name}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-center text-muted-foreground">No image available</div>
            )}
          </CardContent>

          {/* Action buttons */}
          <CardFooter className="flex justify-end gap-2 pt-2">
            {showArchive ? (
              <>
                {/* Archive mode buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restoreFromArchive(qrCode.id)}
                  title="Restore from archive"
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restore</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteQRCode(qrCode.id)}
                  title="Delete permanently"
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </>
            ) : (
              <>
                {/* Normal mode buttons */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDownload(qrCode)}
                  disabled={!qrCode.imageData}
                  title="Download QR code"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveToArchive(qrCode.id)}
                  title="Move to archive"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(qrCode)}
                    title="Edit QR code"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
