import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { queryClient } from "../router";

export default function Logout() {
  const mutation = useMutation({
    mutationFn: async () => {
      await fetch(`${import.meta.env.VITE_API}/logout`, {
        mode: "cors",
        method: "POST",
        credentials: "include",
      });

      queryClient.clear();
      queryClient.removeQueries({});
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, [mutation]);

  if (mutation.isPending) {
    return <div>Logging out</div>;
  }

  return <Navigate to={"/login"} />;
}
