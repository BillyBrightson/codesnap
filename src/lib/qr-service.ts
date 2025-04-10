export interface QRCode {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  type: 'url' | 'text' | 'email' | 'phone' | 'sms' | 'wifi';
  data: {
    [key: string]: string;
  };
}

class QRCodeService {
  private readonly STORAGE_KEY = 'qr_codes';

  getAllQRCodes(userId: string): QRCode[] {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) return [];
      
      const allQRCodes: QRCode[] = JSON.parse(storedData);
      return allQRCodes.filter(code => code.userId === userId);
    } catch (error) {
      console.error('Error retrieving QR codes:', error);
      return [];
    }
  }

  getQRCode(id: string, userId: string): QRCode | null {
    const codes = this.getAllQRCodes(userId);
    return codes.find(code => code.id === id) || null;
  }

  saveQRCode(qrCode: QRCode): void {
    try {
      const codes = this.getAllQRCodes(qrCode.userId);
      const existingIndex = codes.findIndex(code => code.id === qrCode.id);
      
      if (existingIndex >= 0) {
        // Update existing QR code
        codes[existingIndex] = {
          ...qrCode,
          updatedAt: new Date().toISOString()
        };
      } else {
        // Add new QR code
        codes.push({
          ...qrCode,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(codes));
    } catch (error) {
      console.error('Error saving QR code:', error);
      throw new Error('Failed to save QR code');
    }
  }

  deleteQRCode(id: string, userId: string): void {
    try {
      const codes = this.getAllQRCodes(userId);
      const filteredCodes = codes.filter(code => code.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredCodes));
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw new Error('Failed to delete QR code');
    }
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const qrCodeService = new QRCodeService(); 