import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define the User and Auth Context types
interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// 2. Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to check for an existing token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode the JWT to get user info (simplified)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.sub }); // 'sub' is the standard JWT subject claim
      } catch (error) {
        console.error("Failed to parse token on initial load:", error);
        localStorage.removeItem('token'); // Clear invalid token
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = (token: string) => {
    localStorage.setItem('token', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ email: payload.sub });
    } catch (error) {
      console.error("Failed to parse token on login:", error);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Provide the context value to children
  const value = { user, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Create the custom hook for easy context consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
