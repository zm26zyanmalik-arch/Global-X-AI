import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  name: string;
  email: string;
  class: string;
  language: string;
  teacherChoice: 'Rohan' | 'Priya';
  timeStudiedMins: number;
  chaptersCompleted: number;
  streak: number;
  points: number;
  speechRate?: number;
}

export const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function checkUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null; // Should not reach here
  }
}

export async function createUserProfile(uid: string, profile: Partial<UserProfile>) {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, {
      name: profile.name || '',
      email: profile.email || '',
      class: profile.class || '',
      language: profile.language || 'English',
      teacherChoice: profile.teacherChoice || 'Priya',
      createdAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
      timeStudiedMins: 0,
      chaptersCompleted: 0,
      streak: 0,
      points: 0,
      speechRate: 1.0,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function logout() {
  await firebaseSignOut(auth);
}
