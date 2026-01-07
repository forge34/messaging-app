import { useNavigate, useRouteError } from "react-router-dom";
import { RouteError } from "../utils/functions.ts";

export function Error() {
  const error = useRouteError() as RouteError;
  const navigate = useNavigate();


  return (
    <div className="error-page">
      <h1 className="error-code">{error.status}</h1>
      <h1 className="error-msg">{error.message}</h1>
      {error.status === 401 ? <button onClick={() => {
        navigate("/login")
      }}>Go to Login</button> : null}
    </div>
  );
}
