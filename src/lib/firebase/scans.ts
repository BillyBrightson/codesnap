import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  increment, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  getDoc
} from "firebase/firestore";

interface ScanEvent {
  qrCodeId: string;
  userId: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}

export async function recordScan(
  userId: string,
  qrCodeId: string,
  scanInfo: Partial<ScanEvent> = {}
) {
  try {
    // Get reference to the QR code document
    const qrCodeRef = doc(db, `users/${userId}/qrcodes/${qrCodeId}`);
    const qrCodeDoc = await getDoc(qrCodeRef);

    if (!qrCodeDoc.exists()) {
      throw new Error('QR code not found');
    }

    // Create a scan event
    const scanEvent: Partial<ScanEvent> = {
      qrCodeId,
      userId,
      timestamp: new Date(),
      ...scanInfo
    };

    // Add scan event to the scans subcollection
    const scansRef = collection(db, `users/${userId}/qrcodes/${qrCodeId}/scans`);
    await addDoc(scansRef, {
      ...scanEvent,
      timestamp: serverTimestamp()
    });

    // Increment the scanCount on the QR code document
    await updateDoc(qrCodeRef, {
      scanCount: increment(1),
      lastScanned: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error recording scan:', error);
    throw error;
  }
}

export async function getQRCodeScans(userId: string, qrCodeId: string) {
  try {
    const scansRef = collection(db, `users/${userId}/qrcodes/${qrCodeId}/scans`);
    const qrCodeRef = doc(db, `users/${userId}/qrcodes/${qrCodeId}`);
    
    // Get the QR code document to check if it exists and get the scan count
    const qrCodeDoc = await getDoc(qrCodeRef);
    
    if (!qrCodeDoc.exists()) {
      throw new Error('QR code not found');
    }

    return {
      scanCount: qrCodeDoc.data().scanCount || 0,
      lastScanned: qrCodeDoc.data().lastScanned?.toDate() || null
    };
  } catch (error) {
    console.error('Error getting QR code scans:', error);
    throw error;
  }
} 