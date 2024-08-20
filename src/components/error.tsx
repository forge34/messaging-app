import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

export function ErrorBoundary() {
  const errors = useRouteError();
  const navigate = useNavigate()

  if (isRouteErrorResponse(errors)) {
    if (errors.status) {
      return navigate("/login");
    }
  }

  return <></>;
}
