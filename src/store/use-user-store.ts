import { create } from "zustand";

export interface OnlineUser {
  userId: string;
  socketId: string;
}

interface OnlineUsersStore {
  onlineUsers: OnlineUser[];
  updateOnlineUsers: (online: OnlineUser[]) => void;
}

export const useUserStore = create<OnlineUsersStore>((set) => ({
  onlineUsers: [],
  updateOnlineUsers(online) {
    set({ onlineUsers: online });
  },
}));
