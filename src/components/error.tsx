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
        <div>
          <h1>Unauthorized , you need to login</h1>
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

  return <></>;
}
