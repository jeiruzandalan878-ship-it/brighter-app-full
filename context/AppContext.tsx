import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type UserData = {
  user_id: string;
  username: string;
  gmail: string;
  profile_picture: string | null;
  about: string | null;
  age: number | null;
  gender: string | null;
  birthdate: string | null;
  date: string | null;
  color: Record<string, unknown> | null;
  is_following?: boolean;
};

type AppContextType = {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  clearUserData: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userData, setUserDataState] = useState<UserData | null>(null);

  const setUserData = useCallback((data: UserData | null) => {
    setUserDataState(data);
  }, []);

  const clearUserData = useCallback(() => {
    setUserDataState(null);
  }, []);

  return (
    <AppContext.Provider value={{ userData, setUserData, clearUserData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
