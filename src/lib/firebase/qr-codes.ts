import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc,
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy,
  Timestamp,
  updateDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { SavedQRCode } from "@/types";
import { createQRCodeNotification } from "./notifications";

interface QRCode {
  id: string;
  userId: string;
  name: string;
  type: string;
  url: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  scanCount: number;
  data?: Record<string, any>;
}

interface QRCodeData {
  name: string;
  type: string;
  content: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  imageData?: string;
  createdAt?: any;
  updatedAt?: any;
}

export async function saveQRCodeToFirestore(userId: string, data: QRCodeData) {
  try {
    console.log('Saving QR code for user:', userId);
    const userQRCodesRef = collection(db, `users/${userId}/qrcodes`);
    
    const qrCodeData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('Saving QR code with data:', qrCodeData);
    const docRef = await addDoc(userQRCodesRef, qrCodeData);
    console.log('QR code saved successfully with ID:', docRef.id);
    
    // Create notification for the new QR code
    await createQRCodeNotification(userId, data.name, 'created');
    
    return {
      id: docRef.id,
      ...qrCodeData,
      createdAt: new Date().toISOString(), // Client-side timestamp for immediate display
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error saving QR code:", error);
    throw error;
  }
}

export async function getUserQRCodes(userId: string) {
  try {
    console.log('Getting QR codes for user:', userId);
    const userQRCodesRef = collection(db, `users/${userId}/qrcodes`);
    const q = query(
      userQRCodesRef,
      orderBy("createdAt", "desc")
    );
    
    console.log('Executing Firestore query...');
    const snapshot = await getDocs(q);
    console.log(`Found ${snapshot.docs.length} QR codes`);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Handle both server timestamp and client timestamp
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt)
      };
    });
  } catch (error) {
    console.error("Error getting QR codes:", error);
    throw error;
  }
}

export async function deleteQRCode(userId: string, qrCodeId: string) {
  try {
    const qrCodeRef = doc(db, `users/${userId}/qrcodes/${qrCodeId}`);
    await deleteDoc(qrCodeRef);
    return true;
  } catch (error) {
    console.error("Error deleting QR code:", error);
    throw error;
  }
}

export async function updateQRCode(userId: string, qrCodeId: string, updates: Partial<QRCodeData>) {
  try {
    console.log('Updating QR code:', qrCodeId, 'for user:', userId);
    const qrCodeRef = doc(db, `users/${userId}/qrcodes/${qrCodeId}`);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    await updateDoc(qrCodeRef, updateData);
    console.log('QR code updated successfully');
  } catch (error) {
    console.error("Error updating QR code:", error);
    throw error;
  }
}

export async function createQRCode(userId: string, qrCodeData: Omit<QRCode, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'scanCount'>) {
  try {
    const qrCodeRef = collection(db, `users/${userId}/qrcodes`);
    const docRef = await addDoc(qrCodeRef, {
      ...qrCodeData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      scanCount: 0
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating QR code:", error);
    throw error;
  }
} 