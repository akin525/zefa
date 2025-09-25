import { createContext, useContext, useState } from "react";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
