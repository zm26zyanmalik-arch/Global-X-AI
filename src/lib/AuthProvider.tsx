import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { checkUserProfile } from './authService';
import { useAppStore } from '../store/useAppStore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setProgress, setAuthReady } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await checkUserProfile(firebaseUser.uid);
          if (profile) {
            setUser({
              id: firebaseUser.uid,
              name: profile.name,
              email: profile.email,
              class: profile.class,
              language: profile.language,
              teacherPreference: profile.teacherChoice,
            });
            setProgress({
              timeStudiedMins: profile.timeStudiedMins,
              chaptersCompleted: profile.chaptersCompleted,
              streak: profile.streak,
              points: profile.points,
            });
          } else {
             // User authed but no profile yet -> keep `user` null or handle onboarding
             setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [setUser, setProgress, setAuthReady]);

  return <>{children}</>;
};
