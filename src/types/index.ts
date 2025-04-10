export type QRCodeType = "url" | "text" | "email" | "phone" | "sms" | "wifi";

export interface SavedQRCode {
  id: string;
  name: string;
  type: QRCodeType;
  content: string;
  isDynamic: boolean;
  createdAt: string;
  imageData?: string;
}

export interface QRCodeFormData {
  name: string;
  type: QRCodeType;
  content: string;
  isDynamic: boolean;
} 