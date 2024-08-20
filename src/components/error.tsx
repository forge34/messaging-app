import { useRouteError } from "react-router-dom";

export function ErrorBoundary() {
  const errors = useRouteError();

  console.log(errors);

  return <></>
}
