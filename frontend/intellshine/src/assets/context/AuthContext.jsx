import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(
    localStorage.getItem("token") || null
  );

  const login = (token) => {
    localStorage.setItem("token", token);
    setUserToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};