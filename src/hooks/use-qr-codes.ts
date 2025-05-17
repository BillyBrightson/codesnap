import { useState, useEffect, useCallback } from 'react';
import { qrCodeService } from '@/lib/qr-service';
import { SavedQRCode } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/auth-provider';

export function useQRCodes(showTrash = false) {
  const [qrCodes, setQRCodes] = useState<SavedQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadQRCodes = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    try {
      const codes = await qrCodeService.getAllQRCodes(user.uid, showTrash);
      setQRCodes(codes || []);
    } catch (error: any) {
      console.error('Error loading QR codes:', error);
      setQRCodes([]);
      
      // Check if it's a permissions error
      const errorMessage = error?.message || '';
      const isPermissionError = 
        errorMessage.includes('permission-denied') || 
        errorMessage.includes('insufficient permissions') ||
        errorMessage.toLowerCase().includes('permission');
      
      toast({
        title: "Error loading QR codes",
        description: isPermissionError 
          ? "You don't have permission to access this data. This feature may not be available yet." 
          : "Failed to load your QR codes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.uid, toast, showTrash]);

  useEffect(() => {
    loadQRCodes();
  }, [loadQRCodes]);

  const createQRCode = useCallback(async (data: Omit<SavedQRCode, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user?.uid) return null;

    try {
      const newQRCode: SavedQRCode = {
        ...data,
        id: qrCodeService.generateId(),
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const formData = {
        name: data.name,
        type: data.type,
        isDynamic: data.isDynamic,
        data: data.data || {}
      };
      await qrCodeService.createQRCode(formData, user.uid, newQRCode.imageData, newQRCode.content);
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

  const updateQRCode = useCallback(async (id: string, updates: Partial<SavedQRCode>) => {
    if (!user?.uid) return false;

    try {
      const existingCode = await qrCodeService.getQRCode(id);
      if (!existingCode) throw new Error('QR code not found');

      const updatedCode = {
        ...existingCode,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await qrCodeService.updateQRCode(id, updates);
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

  const moveToTrash = useCallback(async (id: string) => {
    if (!user?.uid) return false;

    try {
      await qrCodeService.moveToTrash(id);
      setQRCodes(prev => prev.filter(code => code.id !== id));

      toast({
        title: "QR Code moved to trash",
        description: "Your QR code has been moved to trash.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error moving QR code to trash",
        description: "Failed to move QR code to trash. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.uid, toast]);

  const deleteQRCode = useCallback(async (id: string) => {
    if (!user?.uid) return false;

    try {
      await qrCodeService.deleteQRCode(id);
      setQRCodes(prev => prev.filter(code => code.id !== id));

      toast({
        title: "QR Code permanently deleted",
        description: "Your QR code has been permanently deleted.",
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

  const restoreFromTrash = useCallback(async (id: string) => {
    if (!user?.uid) return false;

    try {
      await qrCodeService.restoreFromTrash(id);
      setQRCodes(prev => prev.filter(code => code.id !== id));

      toast({
        title: "QR Code restored",
        description: "Your QR code has been restored from trash.",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error restoring QR code",
        description: "Failed to restore QR code. Please try again.",
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
    moveToTrash,
    deleteQRCode,
    restoreFromTrash,
    refresh: loadQRCodes,
  };
}