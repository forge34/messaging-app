import { createContext, useContext } from "react";

export type OnlineUserContextType = {
  onlineUsers: string[];
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>>;
  isOnline: (userId: string) => boolean;
};

export const OnlineUsersContext = createContext<
  OnlineUserContextType | undefined
>(undefined);

export const useOnlineUsers = () => {
  const context = useContext(OnlineUsersContext);
  if (!context) {
    throw new Error("useOnlineUsers must be used within OnlineUsersProvider");
  }
  return context;
};
