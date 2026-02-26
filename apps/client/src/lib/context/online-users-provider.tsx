import { type ReactNode, useState } from "react";
import { OnlineUsersContext } from "./online-users";

export const OnlineUsersProvider = ({ children }: { children: ReactNode }) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const isOnline = (id: string) => {
    return onlineUsers.includes(id);
  };

  return (
    <OnlineUsersContext.Provider
      value={{
        onlineUsers,
        setOnlineUsers,
        isOnline,
      }}
    >
      {children}
    </OnlineUsersContext.Provider>
  );
};
