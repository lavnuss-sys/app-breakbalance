import { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface UserData {
  uid: string;
  name: string;
  appStatus: 'welcome' | 'onboarding' | 'dashboard';
  pet_points: number;
  pet_equipped: string;
  pet_purchased: string[];
  accessoryOffsets?: Record<string, { top: number, left: number, scale: number }>;
  stats: {
    activeBreaks: number;
    activities: number;
    sessionsThisWeek: number;
    waterWeek: number;
    waterMonth: number;
    waterToday: number;
    dailyActivity?: number[];
  };
  createdAt?: any;
  updatedAt?: any;
}

export const defaultStats = {
  activeBreaks: 0,
  activities: 0,
  sessionsThisWeek: 0,
  waterWeek: 0,
  waterMonth: 0,
  waterToday: 0,
  dailyActivity: [0, 0, 0, 0, 0, 0, 0]
};

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            const newUser: UserData = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuario',
              appStatus: 'onboarding',
              pet_points: 150,
              pet_equipped: '',
              pet_purchased: [],
              stats: defaultStats,
            };
            
            await setDoc(userDocRef, {
              ...newUser,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            
            setUserData(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error signing in with Google', error);
      alert(`Error al iniciar sesión: ${error.message || 'Verifica que el dominio de Vercel esté autorizado en Firebase.'}`);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      setUserData((prev) => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return { user, userData, loading, signInWithGoogle, signOut, updateUserData };
}
