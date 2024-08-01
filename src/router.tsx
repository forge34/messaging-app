import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import App from ".";
import Signup from "./pages/signup";
import Signin from "./pages/signin";

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
    element: <Signin></Signin>,
  },
  {
    path: "/forgot-password",
    element: <Navigate to={"/signin"}></Navigate>,
  },
];

const router = createBrowserRouter(routes);
export { router };
