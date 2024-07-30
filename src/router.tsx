import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import App from ".";
import Signup from "./pages/signup";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App></App>,
  },
  {
    path: "/signup",
    element: <Signup></Signup>,
  },
  {
    path: "/signin",
    element: <h3>Sign in</h3>,
  },
  {
    path: "/forgot-password",
    element: <Navigate to={"/signin"}></Navigate>,
  },
];

const router = createBrowserRouter(routes);
export { router };
