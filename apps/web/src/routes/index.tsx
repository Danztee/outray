import { createFileRoute, Navigate } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/")({


  component: () => {
const {data, isPending} = authClient.useSession();

if (isPending) return <div>Loading...</div>

if (!data?.session) {
  return <Navigate to="/login" replace />
}

    return  <Navigate to="/dash" replace />
  },
});
