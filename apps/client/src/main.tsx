import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

import "./index.css";
import { ErrorComponent } from "./components/error-component";
import { queryClient } from "./lib/query-client";

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  context: {
    queryClient,
  },
  defaultErrorComponent: ({ error, reset, info }) => (
    <ErrorComponent error={error} reset={reset} info={info}></ErrorComponent>
  ),
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
