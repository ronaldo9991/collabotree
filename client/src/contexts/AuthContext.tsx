import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, type AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (data: RegisterData) => Promise<AuthUser | null>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  updateStudentProfile: (data: any) => Promise<void>;
  updateBuyerProfile: (data: any) => Promise<void>;
}

interface RegisterData {
  email: string;
  fullName: string;
  password: string;
  role: 'student' | 'buyer';
  university?: string;
  skills?: string[];
  companyName?: string;
  industry?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state (development mode)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser | null> => {
    try {
      const { user, error } = await auth.signIn(email, password);
      if (error) {
        throw new Error(error.message);
      }
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<AuthUser | null> => {
    try {
      const { user, error } = await auth.signUp(data.email, data.password, {
        fullName: data.fullName,
        role: data.role,
        university: data.university,
        skills: data.skills,
        companyName: data.companyName,
        industry: data.industry,
      });

      if (error) {
        throw new Error(error.message);
      }
      setUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const { user: updatedUser, error } = await auth.updateProfile(user.id, data);
      if (error) {
        throw new Error(error.message);
      }
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const updateStudentProfile = async (data: any) => {
    if (!user || user.role !== 'student') throw new Error('No student user logged in');
    
    try {
      const { student, error } = await auth.updateStudentProfile(user.id, data);
      if (error) {
        throw new Error(error.message);
      }
      // Update user with new student profile
      setUser({ ...user, student });
    } catch (error) {
      console.error('Student profile update error:', error);
      throw error;
    }
  };

  const updateBuyerProfile = async (data: any) => {
    if (!user || user.role !== 'buyer') throw new Error('No buyer user logged in');
    
    try {
      const { buyer, error } = await auth.updateBuyerProfile(user.id, data);
      if (error) {
        throw new Error(error.message);
      }
      // Update user with new buyer profile
      setUser({ ...user, buyer });
    } catch (error) {
      console.error('Buyer profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateStudentProfile,
    updateBuyerProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
