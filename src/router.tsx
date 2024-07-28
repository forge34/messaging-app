import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from ".";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App></App>,
  },
];

const router = createBrowserRouter(routes);
export { router };
