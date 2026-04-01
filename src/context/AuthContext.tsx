import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'Admin' | 'User' | 'Viewer';

export interface User {
  id: string;
  username: string;
  role: Role;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  addUser: (username: string, role: Role, password?: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role === 'Admin') {
        try {
          const res = await fetch('/api/users');
          if (res.ok) {
            const data = await res.json();
            setUsers(data);
          }
        } catch (err) {
          console.error("Failed to fetch users", err);
        }
      }
      setLoading(false);
    };
    fetchUsers();
  }, [user]);

  const login = async (username: string, password?: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const userData = await res.json();
      setUser(userData);
    } else {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const addUser = async (username: string, role: Role, password?: string) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, role, password }),
    });

    if (res.ok) {
      // Refresh user list
      const usersRes = await fetch('/api/users');
      const data = await usersRes.json();
      setUsers(data);
    } else {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to add user');
    }
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id));
    } else {
      throw new Error('Failed to delete user');
    }
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
