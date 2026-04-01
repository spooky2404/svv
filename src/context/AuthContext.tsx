import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  where,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export type Role = 'Admin' | 'User' | 'Viewer';

export interface User {
  id: string;
  username: string;
  role: Role;
  email: string;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addUser: (email: string, username: string, role: Role) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // Default role for new users (except the bootstrap admin)
          const isAdmin = firebaseUser.email === 'sponki116@gmail.com';
          const newUser: User = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            role: isAdmin ? 'Admin' : 'Viewer',
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.role === 'Admin') {
      const q = collection(db, 'users');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const usersList = snapshot.docs.map(doc => doc.data() as User);
        setUsers(usersList);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const addUser = async (email: string, username: string, role: Role) => {
    // Note: In this simple setup, we can't pre-create Auth users easily.
    // We'll store the invitation/role in a separate collection if needed, 
    // but for now, we'll just allow admins to see the user list.
    // Real user creation happens on first login.
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, deleteUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
