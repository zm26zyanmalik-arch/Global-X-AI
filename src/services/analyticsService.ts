import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';

export interface StudySessionLog {
  userId: string;
  subjectId: string;
  durationSeconds: number;
  createdAt: any;
}

export const logStudySession = async (userId: string, subjectId: string, durationSeconds: number) => {
  try {
    await addDoc(collection(db, 'users', userId, 'studySessions'), {
      userId,
      subjectId,
      durationSeconds,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging study session:', error);
  }
};

export const getStudySessions = async (userId: string) => {
  const q = query(
    collection(db, 'users', userId, 'studySessions'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as StudySessionLog));
};
