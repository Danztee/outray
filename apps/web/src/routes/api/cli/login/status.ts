import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { db } from "../../../../db";
import { cliLoginSessions } from "../../../../db/auth-schema";
import { eq, and, gt } from "drizzle-orm";
export const Route = createFileRoute("/api/cli/login/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const code = url.searchParams.get("code");

          if (!code) {
            return json({ status: "expired" }, { status: 400 });
          }

          const session = await db.query.cliLoginSessions.findFirst({
            where: and(
              eq(cliLoginSessions.code, code),
              gt(cliLoginSessions.expiresAt, new Date()),
            ),
          });

          if (!session) {
            return json({ status: "expired" });
          }

          if (session.status === "authenticated" && session.userToken) {
            return json({
              status: "authenticated",
              userToken: session.userToken,
            });
          }

          return json({ status: "pending" });
        } catch (error) {
          console.error("CLI login status error:", error);
          return json({ error: "Failed to check status" }, { status: 500 });
        }
      },
    },
  },
});
