import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: 'BUYER' | 'STUDENT' | 'ADMIN';
  bio?: string;
  university?: string;
  skills?: string;
  isVerified?: boolean;
  idCardUrl?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  username?: string;
  role?: 'BUYER' | 'STUDENT' | 'ADMIN';
  bio?: string;
  skills?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dynamic API URL - same logic as in api.ts
const getApiBaseUrl = () => {
  // Check if we're in production (deployed on Render)
  if (typeof window !== 'undefined' && (window.location.hostname.includes('render.com') || window.location.hostname.includes('onrender.com'))) {
    // Use the same domain for API calls in production
    return `${window.location.protocol}//${window.location.hostname}/api`;
  }
  
  // Check for environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:4000/api';
};

const API_BASE_URL = getApiBaseUrl();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  const refreshToken = async () => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      const { accessToken, refreshToken: newRefreshToken } = data.data;
      const newTokens = { accessToken, refreshToken: newRefreshToken };
      
      setTokens(newTokens);
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');

        if (storedTokens) {
          try {
            const parsedTokens = JSON.parse(storedTokens);

            if (!parsedTokens.accessToken) {
              throw new Error('No access token found');
            }

            setTokens(parsedTokens);

            // Verify token and get user info
            const response = await fetch(`${API_BASE_URL}/me`, {
              headers: {
                'Authorization': `Bearer ${parsedTokens.accessToken}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              setUser(data.data.user);
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('auth_tokens');
              setTokens(null);
              setUser(null);
            }
          } catch (parseError) {
            console.error('Error parsing stored tokens:', parseError);
            localStorage.removeItem('auth_tokens');
            setTokens(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('auth_tokens');
        setTokens(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with API URL:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const { user: userData, accessToken, refreshToken } = data.data;
      
      const authTokens = { accessToken, refreshToken };
      setUser(userData);
      setTokens(authTokens);
      localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
      
      console.log('Login successful:', userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('Attempting registration with API URL:', API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Registration response:', { status: response.status, data: responseData });

      if (!response.ok) {
        throw new Error(responseData.error || 'Registration failed');
      }

      const { user: userData, accessToken, refreshToken } = responseData.data;
      
      const authTokens = { accessToken, refreshToken };
      setUser(userData);
      setTokens(authTokens);
      localStorage.setItem('auth_tokens', JSON.stringify(authTokens));
      
      console.log('Registration successful:', userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('auth_tokens');
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    login,
    register,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;