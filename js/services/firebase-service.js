/**
 * NutriSense AI — Firebase Service
 * Integration with Firebase for user data persistence.
 * Falls back to localStorage when Firebase is not configured.
 */

import { APP_CONFIG } from '../../config/app-config.js';
import { storage } from '../utils/helpers.js';

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.db = null;
    this.auth = null;
    this.currentUser = null;
  }

  /**
   * Initialize Firebase (if configured).
   */
  async initialize() {
    try {
      if (typeof firebase !== 'undefined' && 
          APP_CONFIG.google.firebase.apiKey !== 'YOUR_FIREBASE_API_KEY') {
        
        firebase.initializeApp(APP_CONFIG.google.firebase);
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.isInitialized = true;

        // Anonymous auth for demo purposes
        await this.auth.signInAnonymously();
        this.currentUser = this.auth.currentUser;

        console.log('[Firebase] Initialized successfully');
        return true;
      }
    } catch (err) {
      console.warn('[Firebase] Not available, using localStorage fallback:', err.message);
    }

    this.isInitialized = false;
    return false;
  }

  /**
   * Save user profile.
   */
  async saveProfile(profile) {
    if (this.isInitialized && this.currentUser) {
      try {
        await this.db.collection('users').doc(this.currentUser.uid).set({
          profile,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
      } catch (err) {
        console.warn('[Firebase] Save profile failed:', err);
      }
    }

    // Fallback to localStorage
    storage.set('userProfile', profile);
    return true;
  }

  /**
   * Load user profile.
   */
  async loadProfile() {
    if (this.isInitialized && this.currentUser) {
      try {
        const doc = await this.db.collection('users').doc(this.currentUser.uid).get();
        if (doc.exists) {
          return doc.data().profile;
        }
      } catch (err) {
        console.warn('[Firebase] Load profile failed:', err);
      }
    }

    return storage.get('userProfile', null);
  }

  /**
   * Save meal log entry.
   */
  async logMeal(entry) {
    if (this.isInitialized && this.currentUser) {
      try {
        await this.db.collection('users').doc(this.currentUser.uid)
          .collection('mealLogs').add({
            ...entry,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        return true;
      } catch (err) {
        console.warn('[Firebase] Log meal failed:', err);
      }
    }

    // Fallback: already handled by decision engine localStorage
    return true;
  }

  /**
   * Get sync status for UI display.
   */
  getStatus() {
    return {
      connected: this.isInitialized,
      provider: this.isInitialized ? 'Firebase Cloud' : 'Local Storage',
      icon: this.isInitialized ? '☁️' : '💾',
      userId: this.currentUser?.uid?.slice(0, 8) || 'local'
    };
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
