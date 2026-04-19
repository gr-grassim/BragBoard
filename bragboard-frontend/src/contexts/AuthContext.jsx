import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetching user details.....
  const fetchUser = async (authToken) => {
    if (!authToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/users/me", {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        //Token invalid
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
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
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
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
