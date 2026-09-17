// Firestore Service Layer
// ده الـ layer اللي بيتعامل مع قاعدة البيانات مباشرة

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Issue, User } from '../types';

// Collections
const ISSUES_COLLECTION = 'issues';
const USERS_COLLECTION = 'users';

// Issues Service
export const IssuesService = {
  // Get all issues
  getAll: async (): Promise<Issue[]> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const snapshot = await getDocs(collection(db, ISSUES_COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Issue));
  },

  // Get issues with filters
  getFiltered: async (constraints: QueryConstraint[]): Promise<Issue[]> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const q = query(collection(db, ISSUES_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Issue));
  },

  // Get issues by branch
  getByBranch: async (branchId: string): Promise<Issue[]> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const q = query(
      collection(db, ISSUES_COLLECTION),
      where('branchId', '==', branchId),
      orderBy('reportedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Issue));
  },

  // Get issues by user
  getByUser: async (userId: string): Promise<Issue[]> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const q = query(
      collection(db, ISSUES_COLLECTION),
      where('reportedBy', '==', userId),
      orderBy('reportedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Issue));
  },

  // Get single issue
  getById: async (id: string): Promise<Issue | null> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const docRef = doc(db, ISSUES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Issue;
    }
    return null;
  },

  // Create new issue
  create: async (issue: Omit<Issue, 'id'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const docRef = await addDoc(collection(db, ISSUES_COLLECTION), {
      ...issue,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return docRef.id;
  },

  // Update issue
  update: async (id: string, updates: Partial<Issue>): Promise<void> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const docRef = doc(db, ISSUES_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  // Delete issue
  delete: async (id: string): Promise<void> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const docRef = doc(db, ISSUES_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Real-time listener
  subscribe: (callback: (issues: Issue[]) => void) => {
    if (!isFirebaseConfigured || !db) {
      return () => {}; // Return empty unsubscribe function
    }
    
    const q = query(
      collection(db, ISSUES_COLLECTION),
      orderBy('reportedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const issues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Issue));
      callback(issues);
    });
  }
};

// Users Service
export const UsersService = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  },

  // Get user by ID
  getById: async (id: string): Promise<User | null> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const docRef = doc(db, USERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  },

  // Create user
  create: async (user: Omit<User, 'id'>): Promise<string> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const docRef = await addDoc(collection(db, USERS_COLLECTION), user);
    return docRef.id;
  },

  // Update user
  update: async (id: string, updates: Partial<User>): Promise<void> => {
    if (!isFirebaseConfigured || !db) {
      throw new Error('Firebase not configured');
    }
    
    const docRef = doc(db, USERS_COLLECTION, id);
    await updateDoc(docRef, updates);
  }
};
