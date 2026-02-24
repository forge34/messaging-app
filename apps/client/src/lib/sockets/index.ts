import type { ServerToClientEvents, ClientToServerEvents } from "@chat/shared";
import { io, Socket } from "socket.io-client";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_API_URL as string,
  {
    withCredentials: true,
  },
);
