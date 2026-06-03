import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
}

export interface UserProfile {
  uid: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address?: string | null;
  addresses?: string[];
  carModel: string | null;
  vehicles?: string[];
  profileCompleted: boolean;
  provider: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fake loading delay for initial render
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const loginWithGoogle = async () => {
    // Mock login
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      uid: 'user123',
      email: 'test@example.com',
      displayName: 'Test User',
      phoneNumber: null
    });
    setUserProfile({
      uid: 'user123',
      fullName: 'Test User',
      phone: null,
      email: 'test@example.com',
      city: null,
      profileCompleted: true,
      provider: 'google',
      isAdmin: false
    });
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const resetPassword = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, ...data });
  };

  const logout = async () => {
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

