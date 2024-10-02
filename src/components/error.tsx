import {
  isRouteErrorResponse,
  Navigate,
  useNavigate,
  useRouteError,
} from "react-router-dom";

export function Error() {
  const errors = useRouteError();
  const navigate = useNavigate();

  if (isRouteErrorResponse(errors) && errors.status === 401) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div className="error-page">
      <h1 className="error-code">404</h1>
      <h1 className="error-msg">Page not found</h1>
      <button
        onClick={() => {
          navigate("/");
        }}
      >
        Home page
      </button>
    </div>
  );
}
