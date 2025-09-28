'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/config';
import firebase_app from '@/firebase/config';

export const auth = getAuth(firebase_app);

interface AuthContextType {
  user: User | null;
  role: 'user' | 'admin' | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setRole(null);
    // ✅ send user back to homepage after sign out
    router.push('/');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      setUser(current);

      if (current) {
        const snap = await getDoc(doc(db, 'users', current.uid));
        if (snap.exists()) {
          const data = snap.data() as { role?: string };
          const fetchedRole = (data.role as 'user' | 'admin') ?? 'user';
          setRole(fetchedRole);
          console.log('Fetched role for current user:', fetchedRole);
        } else {
          setRole('user');
          console.log('Fetched role for current user: user (no doc found)');
        }
      } else {
        setRole(null);
        console.log('No user signed in, role set to null');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthContextProvider');
  return ctx;
};
