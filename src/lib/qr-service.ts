import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, Timestamp, setDoc } from 'firebase/firestore';
import { SavedQRCode, QRCodeFormData } from '@/types';

const QR_CODES_COLLECTION = 'qrcodes';
const ARCHIVE_SUBCOLLECTION = 'archived_qrcodes';

class QRCodeService {
  async getAllQRCodes(userId: string, includeArchived: boolean = false): Promise<SavedQRCode[]> {
    try {
      const collectionPath = includeArchived
        ? collection(db, `users/${userId}/${ARCHIVE_SUBCOLLECTION}`)
        : collection(db, `users/${userId}/${QR_CODES_COLLECTION}`);
      const q = query(collectionPath);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          content: data.content,
          imageData: data.imageData,
          isDynamic: data.isDynamic,
          userId: data.userId,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          archivedAt: data.archivedAt?.toDate?.() ? data.archivedAt.toDate().toISOString() : undefined,
          data: data.data || {}
        } as SavedQRCode;
      });
    } catch (error) {
      console.error('Error getting QR codes:', error);
      throw error;
    }
  }

  async getQRCode(userId: string, id: string, archived = false): Promise<SavedQRCode | null> {
    try {
      const docRef = archived
        ? doc(db, `users/${userId}/${ARCHIVE_SUBCOLLECTION}/${id}`)
        : doc(db, `users/${userId}/${QR_CODES_COLLECTION}/${id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
          archivedAt: data.archivedAt?.toDate?.() ? data.archivedAt.toDate().toISOString() : undefined,
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

      const docRef = await addDoc(collection(db, `users/${userId}/${QR_CODES_COLLECTION}`), qrCodeData);
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

  async updateQRCode(userId: string, id: string, updates: Partial<SavedQRCode>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      const docRef = doc(db, `users/${userId}/${QR_CODES_COLLECTION}/${id}`);
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating QR code:', error);
      throw error;
    }
  }

  async moveToArchive(userId: string, id: string): Promise<void> {
    try {
      // Get the QR code to archive
      const docRef = doc(db, `users/${userId}/${QR_CODES_COLLECTION}/${id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const qrCodeData = docSnap.data();
        // Add to archive subcollection with archivedAt timestamp and same ID
        const archiveData = {
          ...qrCodeData,
          archivedAt: Timestamp.now()
        };
        const archiveRef = doc(db, `users/${userId}/${ARCHIVE_SUBCOLLECTION}/${id}`);
        try {
          await setDoc(archiveRef, archiveData);
          console.log('Successfully wrote to archive subcollection:', `users/${userId}/archived_qrcodes/${id}`);
        } catch (archiveError) {
          console.error('Error writing to archive subcollection:', archiveError);
          throw archiveError;
        }
        // Delete from main collection
        await deleteDoc(docRef);
      } else {
        console.error('QR code to archive does not exist:', id);
      }
    } catch (error) {
      console.error('Error archiving QR code:', error);
      throw error;
    }
  }

  async deleteQRCode(userId: string, id: string, archived = false): Promise<void> {
    try {
      const docRef = archived
        ? doc(db, `users/${userId}/${ARCHIVE_SUBCOLLECTION}/${id}`)
        : doc(db, `users/${userId}/${QR_CODES_COLLECTION}/${id}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error permanently deleting QR code:', error);
      throw error;
    }
  }
  
  async restoreFromArchive(userId: string, id: string): Promise<void> {
    try {
      // Get the QR code from archive
      const docRef = doc(db, `users/${userId}/${ARCHIVE_SUBCOLLECTION}/${id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const qrCodeData = docSnap.data();
        // Remove archivedAt field
        const { archivedAt, ...restoreData } = qrCodeData;
        // Add back to main collection
        await setDoc(doc(db, `users/${userId}/${QR_CODES_COLLECTION}/${id}`), {
          ...restoreData,
          updatedAt: Timestamp.now()
        });
        // Delete from archive subcollection
        await deleteDoc(docRef);
      }
    } catch (error) {
      console.error('Error restoring QR code from archive:', error);
      throw error;
    }
  }

  async cleanupExpiredArchiveItems(userId: string): Promise<void> {
    try {
      // Get all archive items for this user
      const q = query(collection(db, `users/${userId}/${ARCHIVE_SUBCOLLECTION}`));
      const querySnapshot = await getDocs(q);
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      // Check each item and delete if older than 30 days
      const deletePromises = querySnapshot.docs
        .filter(doc => {
          const archivedAt = doc.data().archivedAt?.toDate?.() ? doc.data().archivedAt.toDate() : null;
          return archivedAt && archivedAt < thirtyDaysAgo;
        })
        .map(doc => deleteDoc(doc.ref));
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`Cleaned up ${deletePromises.length} expired archive items`);
      }
    } catch (error) {
      console.error('Error cleaning up expired archive items:', error);
    }
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const qrCodeService = new QRCodeService(); 