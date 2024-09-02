import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

export function Error() {
  const errors = useRouteError();
  const navigate = useNavigate();

  if (isRouteErrorResponse(errors)) {
    if (errors.status === 401) {
      return (
        <div className="error-page">
          <h1 className="error-code">401</h1>
          <h1 className="error-msg">Unauthorized , you need to login</h1>
          <button
            onClick={() => {
              navigate("/login");
            }}
          >
            login page
          </button>
        </div>
      );
    }
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
