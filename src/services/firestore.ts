import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { UserProfile } from '@/types/profile';
import { MealLogEntry } from '@/types/api';

// Initialize Firebase Admin lazily
function getDb() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin credentials not fully configured. Falling back to mock data or error.');
      return null;
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return getFirestore();
}

export class FirestoreService {
  static async saveProfile(userId: string, profile: UserProfile) {
    const db = getDb();
    if (!db) return false;
    
    await db.collection('users').doc(userId).set({
      profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    return true;
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const db = getDb();
    if (!db) return null;

    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists) {
      return doc.data()?.profile as UserProfile;
    }
    return null;
  }

  static async logMeal(userId: string, entry: MealLogEntry) {
    const db = getDb();
    if (!db) return false;

    await db.collection('users').doc(userId).collection('mealLogs').doc(entry.id).set({
      ...entry,
      createdAt: new Date().toISOString()
    });
    
    return true;
  }

  static async getMealHistory(userId: string, days: number = 7): Promise<MealLogEntry[]> {
    const db = getDb();
    if (!db) return []; // Fallback to empty array

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const snapshot = await db.collection('users')
      .doc(userId)
      .collection('mealLogs')
      .where('timestamp', '>=', cutoffDate.toISOString())
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as MealLogEntry);
  }
}
