import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetching user details using the centralized api client
  const fetchUser = async (authToken) => {
    if (!authToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      setAuthToken(authToken);
      const response = await api.get("/users/me");
      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser(token);
  }, [token]);

  // For Successful login
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setAuthToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
