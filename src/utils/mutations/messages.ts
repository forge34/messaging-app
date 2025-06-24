import { safeFetch } from "../functions";

const bookmarkMessage = async (id: string) => {
  await safeFetch(`${import.meta.env.VITE_API}/message/${id}/bookmark`, {
    method: "post",
  });
};

const deleteMessage = async (id: string) => {
  await safeFetch(`${import.meta.env.VITE_API}/messages/${id}`, {
    method: "delete",
  });
};

export { deleteMessage, bookmarkMessage };
