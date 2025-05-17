import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRCodePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string;
  name: string;
  onDownload: () => void;
}

export function QRCodePreviewModal({
  isOpen,
  onClose,
  imageData,
  name,
  onDownload,
}: QRCodePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-md bg-black/30" />
      <DialogContent className="sm:max-w-md bg-white/80 border border-white/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{name}</h3>
        </div>
        <div className="relative aspect-square bg-white rounded-lg p-8 mb-4">
          <img
            src={imageData}
            alt={`QR code for ${name}`}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={onDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 