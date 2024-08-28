import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import App from ".";
import Signup from "./pages/signup";
import Login from "./pages/login";
import People from "./pages/people";
import { QueryClient } from "@tanstack/react-query";
import { conversationIdLoader, conversationLoader, userLoader } from "./utils/queries";
import Conversation from "./pages/conversation";
import { Error} from "./components/error";
import ChatSection from "./pages/chat-section";
import Profile from "./pages/profile";

const queryClient = new QueryClient();

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App></App>,
    errorElement: <Error/>,

    children: [
      {
        index: true,
        element: <Navigate to={"conversations"}></Navigate>,
      },
      {
        path: "conversations",
        loader: conversationLoader(queryClient),
        element: <ChatSection></ChatSection>,
        children: [
          {
            path: ":id",
            element: <Conversation></Conversation>,
            loader:conversationIdLoader(queryClient)
          },
        ],
      },
      {
        path: "starred",
        element: <h1>Soon</h1>,
      },
      {
        path: "profile",
        element: <Profile></Profile>
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
