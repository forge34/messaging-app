import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from ".";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App></App>,
  },
  {
    path: "/signup",
    element: "",
  },
  {
    path: "/signin",
  },
];

const router = createBrowserRouter(routes);
export { router };
