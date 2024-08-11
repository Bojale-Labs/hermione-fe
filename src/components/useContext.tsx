import React, { createContext, useContext, useState } from "react";

// Define the shape of the context data
export type AuthContextType = {
  email: string;
  otp: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  return (
    <AuthContext.Provider value={{ email, otp, setEmail, setOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
