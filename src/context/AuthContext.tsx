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
  login: (username: string, password?: string) => void;
  logout: () => void;
  addUser: (username: string, role: Role, password?: string) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) return JSON.parse(savedUsers);
    
    // Default admin user
    const defaultAdmin: User = { id: '1', username: 'admin', role: 'Admin', password: 'admin' };
    localStorage.setItem('users', JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const login = (username: string, password?: string) => {
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      if (existingUser.password && existingUser.password !== password) {
        throw new Error('Invalid password.');
      }
      setUser(existingUser);
    } else {
      throw new Error('User not found. Please contact an Admin.');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const addUser = (username: string, role: Role, password?: string) => {
    if (users.some(u => u.username === username)) {
      throw new Error('Username already exists');
    }
    const newUser: User = {
      id: Date.now().toString(),
      username,
      role,
      password: password || 'password',
    };
    setUsers([...users, newUser]);
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, deleteUser }}>
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
