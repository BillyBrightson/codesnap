"use client";

import { QRCodeGenerator } from "@/components/qr-code-generator";

export default function CreateQRCodePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create QR Code</h1>
          <p className="text-sm text-muted-foreground">
            Generate custom QR codes for various purposes.
          </p>
              </div>
      </div>
      <QRCodeGenerator />
    </div>
  );
} 