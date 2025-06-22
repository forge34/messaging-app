import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { queryClient, router } from "./router.tsx";
import "./styles/main.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { MessageDropdownProvider } from "./utils/message-dropdown-context.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster></Toaster>
      <MessageDropdownProvider>
        <RouterProvider router={router} />
      </MessageDropdownProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
