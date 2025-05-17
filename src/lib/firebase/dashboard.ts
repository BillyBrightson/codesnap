import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  startOfMonth,
  endOfMonth,
  Timestamp,
} from "firebase/firestore";

interface DashboardMetrics {
  totalQRCodes: number;
  totalScans: number;
  recentQRCodes: Array<{
    id: string;
    name: string;
    type: string;
    scanCount: number;
    createdAt: Date;
  }>;
  monthlyComparison?: {
    qrCodes: {
      current: number;
      previous: number;
      percentageChange: number;
    };
    scans: {
      current: number;
      previous: number;
      percentageChange: number;
    };
  };
}

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  try {
    const userQRCodesRef = collection(db, `users/${userId}/qrcodes`);
    
    // Get all QR codes for total count and scans
    const allQRCodesQuery = query(userQRCodesRef);
    const allQRCodesSnapshot = await getDocs(allQRCodesQuery);
    
    const totalQRCodes = allQRCodesSnapshot.size;
    const totalScans = allQRCodesSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().scanCount || 0);
    }, 0);

    // Get recent QR codes
    const recentQRCodesQuery = query(
      userQRCodesRef,
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const recentQRCodesSnapshot = await getDocs(recentQRCodesQuery);
    const recentQRCodes = recentQRCodesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        scanCount: data.scanCount || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });

    // Calculate monthly comparison
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month QR codes
    const currentMonthQuery = query(
      userQRCodesRef,
      where("createdAt", ">=", Timestamp.fromDate(currentMonthStart))
    );
    const currentMonthSnapshot = await getDocs(currentMonthQuery);
    const currentMonthQRCodes = currentMonthSnapshot.size;
    const currentMonthScans = currentMonthSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().scanCount || 0);
    }, 0);

    // Previous month QR codes
    const previousMonthQuery = query(
      userQRCodesRef,
      where("createdAt", ">=", Timestamp.fromDate(previousMonthStart)),
      where("createdAt", "<=", Timestamp.fromDate(previousMonthEnd))
    );
    const previousMonthSnapshot = await getDocs(previousMonthQuery);
    const previousMonthQRCodes = previousMonthSnapshot.size;
    const previousMonthScans = previousMonthSnapshot.docs.reduce((sum, doc) => {
      return sum + (doc.data().scanCount || 0);
    }, 0);

    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      totalQRCodes,
      totalScans,
      recentQRCodes,
      monthlyComparison: {
        qrCodes: {
          current: currentMonthQRCodes,
          previous: previousMonthQRCodes,
          percentageChange: calculatePercentageChange(currentMonthQRCodes, previousMonthQRCodes)
        },
        scans: {
          current: currentMonthScans,
          previous: previousMonthScans,
          percentageChange: calculatePercentageChange(currentMonthScans, previousMonthScans)
        }
      }
    };
  } catch (error) {
    console.error("Error getting dashboard metrics:", error);
    throw error;
  }
} 