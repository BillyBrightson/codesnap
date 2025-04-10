import { useState, useEffect, useCallback } from 'react';
import { QRCode, qrCodeService } from '@/lib/qr-service';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';

export function useQRCodes() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadQRCodes = useCallback(() => {
    if (!user?.uid) return;
    
    try {
      const codes = qrCodeService.getAllQRCodes(user.uid);
      setQRCodes(codes);
    } catch (error) {
      toast({
        title: "Error loading QR codes",
        description: "Failed to load your QR codes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.uid, toast]);

  useEffect(() => {
    loadQRCodes();
  }, [loadQRCodes]);

  const createQRCode = useCallback(async (data: Omit<QRCode, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user?.uid) return null;

    try {
      const newQRCode: QRCode = {
        ...data,
        id: qrCodeService.generateId(),
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      qrCodeService.saveQRCode(newQRCode);
      setQRCodes(prev => [...prev, newQRCode]);
      
      toast({
        title: "QR Code created",
        description: "Your QR code has been created successfully.",
      });

      return newQRCode;
    } catch (error) {
      toast({
        title: "Error creating QR code",
        description: "Failed to create QR code. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [user?.uid, toast]);

  const updateQRCode = useCallback(async (id: string, updates: Partial<QRCode>) => {
    if (!user?.uid) return false;

    try {
      const existingCode = qrCodeService.getQRCode(id, user.uid);
      if (!existingCode) throw new Error('QR code not found');

      const updatedCode = {
        ...existingCode,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      qrCodeService.saveQRCode(updatedCode);
      setQRCodes(prev => prev.map(code => 
        code.id === id ? updatedCode : code
      ));

      toast({
        title: "QR Code updated",
        description: "Your QR code has been updated successfully.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error updating QR code",
        description: "Failed to update QR code. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.uid, toast]);

  const deleteQRCode = useCallback(async (id: string) => {
    if (!user?.uid) return false;

    try {
      qrCodeService.deleteQRCode(id, user.uid);
      setQRCodes(prev => prev.filter(code => code.id !== id));

      toast({
        title: "QR Code deleted",
        description: "Your QR code has been deleted successfully.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error deleting QR code",
        description: "Failed to delete QR code. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.uid, toast]);

  return {
    qrCodes,
    loading,
    createQRCode,
    updateQRCode,
    deleteQRCode,
    refresh: loadQRCodes,
  };
} 