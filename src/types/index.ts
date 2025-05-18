export type QRCodeType = 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi' | 'vcard';

export interface SavedQRCode {
  id: string;
  name: string;
  type: QRCodeType;
  content: string;
  imageData: string;
  isDynamic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  archivedAt?: string;
  data?: {
    [key: string]: any;
  };
}

export interface QRCodeFormData {
  name: string;
  type: QRCodeType;
  isDynamic: boolean;
  data: {
    [key: string]: any;
  };
} 