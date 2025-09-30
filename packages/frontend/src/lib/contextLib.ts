import { createContext, useContext } from "react";

export interface UserInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface AppContextType {
  isAuthenticated: boolean;
  userHasAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  userInfo?: UserInfo;
  handleLogout?: () => Promise<void>;
}

export const AppContext = createContext<AppContextType>({
  isAuthenticated: false,
  userHasAuthenticated: useAppContext,
});

export function useAppContext() {
  return useContext(AppContext);
}
