import { QueryClient, queryOptions } from "@tanstack/react-query";

const getUsers = () =>
  queryOptions({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API}/users`, {
        method: "get",
        mode: "cors",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("error during fetch");
      }

      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

const userLoader= (queryClient: QueryClient) => async () => {
  const query = getUsers();

  return queryClient.ensureQueryData(query);
};

export { userLoader, getUsers };
