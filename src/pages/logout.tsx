import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function Logout() {
  const mutation = useMutation({
    mutationFn: async () => {
      await fetch(`${import.meta.env.VITE_API}/logout`, {
        mode: "cors",
        method: "POST",
        credentials:"include"
      });
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, []);

  if (mutation.isPending) {
    return <div>Logging out</div>;
  }

  return <Navigate to={"/login"} />;
}
