import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register, getProfile } from '../services/amanpayApi';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  language: string;
  theme: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: any) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = async (credentials: any) => {
    setIsLoading(true);
    try {
      const data = await login(credentials);
      // Remove real person avatar for neutral fallback
      if (data.avatar.includes('pravatar')) data.avatar = '';
      setUser(data);
      await AsyncStorage.setItem('@user', JSON.stringify(data));
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await register(data);
      if (res.avatar.includes('pravatar')) res.avatar = '';
      setUser(res);
      await AsyncStorage.setItem('@user', JSON.stringify(res));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
