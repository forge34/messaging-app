import { redirect } from "react-router-dom";

async function createConversation({ otherId }: { otherId: string }) {
  const res = await fetch(`${import.meta.env.VITE_API}/conversation`, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    body: JSON.stringify({ otherId: otherId }),
    headers: { "content-Type": "Application/json" },
  });

  if (res.status === 401) {
    return redirect("/login");
  }

  return res.json();
}

export { createConversation };
