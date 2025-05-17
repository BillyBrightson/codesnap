import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface Notification {
  id?: string;
  title: string;
  message: string;
  createdAt: any;
  read: boolean;
  data?: any;
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  try {
    const notificationRef = doc(db, `users/${userId}/notifications/${notificationId}`);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function createNotification(
  userId: string, 
  notification: Omit<Notification, 'id' | 'createdAt' | 'read'> & { read?: boolean }
) {
  try {
    const notificationsRef = collection(db, `users/${userId}/notifications`);
    await addDoc(notificationsRef, {
      ...notification,
      createdAt: serverTimestamp(),
      read: notification.read ?? false
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

export async function createWelcomeNotification(userId: string) {
  await createNotification(userId, {
    title: 'Welcome!',
    message: 'Your account was successfully created.',
  });
}

export async function createQRCodeNotification(userId: string, name: string, type: 'created' | 'deleted') {
  const title = type === 'created' ? 'QR Code Created' : 'QR Code Deleted';
  const message = type === 'created' 
    ? `Your QR code for ${name} has been saved.`
    : `QR code ${name} has been deleted.`;
    
  await createNotification(userId, {
    title,
    message,
  });
} 