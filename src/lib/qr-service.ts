import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { SavedQRCode, QRCodeFormData } from '@/types';

const QR_CODES_COLLECTION = 'qr_codes';
const TRASH_COLLECTION = 'trash_qr_codes';

class QRCodeService {
  async getAllQRCodes(userId: string, includeDeleted: boolean = false): Promise<SavedQRCode[]> {
    try {
      const collectionName = includeDeleted ? TRASH_COLLECTION : QR_CODES_COLLECTION;
      const q = query(collection(db, collectionName), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          deletedAt: data.deletedAt?.toDate?.() ? data.deletedAt.toDate().toISOString() : undefined
        };
      }) as SavedQRCode[];
    } catch (error) {
      console.error('Error getting QR codes:', error);
      throw error;
    }
  }

  async getQRCode(id: string): Promise<SavedQRCode | null> {
    try {
      const docRef = doc(db, QR_CODES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt.toDate().toISOString(),
          updatedAt: data.updatedAt.toDate().toISOString()
        } as SavedQRCode;
      }
      return null;
    } catch (error) {
      console.error('Error getting QR code:', error);
      throw error;
    }
  }

  async createQRCode(data: QRCodeFormData, userId: string, imageData: string, content: string): Promise<SavedQRCode> {
    try {
      const now = Timestamp.now();
      const qrCodeData = {
        ...data,
        userId,
        imageData,
        content,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, QR_CODES_COLLECTION), qrCodeData);
      return {
        id: docRef.id,
        ...qrCodeData,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString()
      } as SavedQRCode;
    } catch (error) {
      console.error('Error creating QR code:', error);
      throw error;
    }
  }

  async updateQRCode(id: string, updates: Partial<SavedQRCode>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      const docRef = doc(db, QR_CODES_COLLECTION, id);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating QR code:', error);
      throw error;
    }
  }

  async moveToTrash(id: string): Promise<void> {
    try {
      // Get the QR code to move to trash
      const docRef = doc(db, QR_CODES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const qrCodeData = docSnap.data();
        
        // Add to trash collection with deletedAt timestamp
        const trashData = {
          ...qrCodeData,
          deletedAt: Timestamp.now()
        };
        
        await addDoc(collection(db, TRASH_COLLECTION), trashData);
        
        // Delete from main collection
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error('Error moving QR code to trash:', error);
      throw error;
    }
  }

  async deleteQRCode(id: string): Promise<void> {
    try {
      const docRef = doc(db, TRASH_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error permanently deleting QR code:', error);
      throw error;
    }
  }
  
  async restoreFromTrash(id: string): Promise<void> {
    try {
      // Get the QR code from trash
      const docRef = doc(db, TRASH_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const qrCodeData = docSnap.data();
        
        // Remove deletedAt field
        const { deletedAt, ...restoreData } = qrCodeData;
        
        // Add back to main collection
        await addDoc(collection(db, QR_CODES_COLLECTION), {
          ...restoreData,
          updatedAt: Timestamp.now()
        });
        
        // Delete from trash collection
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error('Error restoring QR code from trash:', error);
      throw error;
    }
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  async cleanupExpiredTrashItems(userId: string): Promise<void> {
    try {
      // Get all trash items for this user
      const q = query(collection(db, TRASH_COLLECTION), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      // Check each item and delete if older than 30 days
      const deletePromises = querySnapshot.docs
        .filter(doc => {
          const deletedAt = doc.data().deletedAt.toDate();
          return deletedAt < thirtyDaysAgo;
        })
        .map(doc => deleteDoc(doc.ref));
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`Cleaned up ${deletePromises.length} expired trash items`);
      }
    } catch (error) {
      console.error('Error cleaning up expired trash items:', error);
    }
  }
}

export const qrCodeService = new QRCodeService(); 