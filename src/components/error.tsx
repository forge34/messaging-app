import { useNavigate, useRouteError } from "react-router-dom";
import { RouteError } from "../utils/fetch-wrapper";

export function Error() {
  const errors = useRouteError() as RouteError;
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <h1 className="error-code">{errors.status}</h1>
      <h1 className="error-msg">{errors.message}</h1>
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
