import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import App from ".";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Chatarea from "./pages/chat-area";
import People from "./pages/people";
import { QueryClient } from "@tanstack/react-query";
import { conversationLoader, userLoader } from "./utils/queries";
import Conversation from "./pages/conversation";

const queryClient = new QueryClient();

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App></App>,

    children: [
      {
        index: true,
        element: <Navigate to={"conversations"}></Navigate>,
      },
      {
        path: "conversations",
        loader: conversationLoader(queryClient),
        element: <Chatarea></Chatarea>,
        children: [
          {
            path: ":id",
            element: <Conversation></Conversation>,
          },
        ],
      },
      {
        path: "starred",
        element: <h1>Soon</h1>,
      },
      {
        path: "profile",
        element: <h1>Soon</h1>,
      },
      {
        path: "people",
        element: <People></People>,
        loader: userLoader(queryClient),
      },
      {
        path: "settings",
        element: <h1>Soon</h1>,
      },
    ],
  },
  {
    path: "/signup",
    element: <Signup></Signup>,
  },
  {
    path: "/login",
    element: <Login></Login>,
  },
  {
    path: "/forgot-password",
    element: <Navigate to={"/signin"}></Navigate>,
  },
];

const router = createBrowserRouter(routes);
export { router, queryClient };
