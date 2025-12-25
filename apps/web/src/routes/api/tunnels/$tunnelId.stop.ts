import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";
import { db } from "../../../db";
import { tunnels } from "../../../db/app-schema";
import { redis } from "../../../lib/redis";

export const Route = createFileRoute("/api/tunnels/$tunnelId/stop")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tunnelId } = params;

        const [tunnel] = await db
          .select()
          .from(tunnels)
          .where(eq(tunnels.id, tunnelId));

        if (!tunnel) {
          return json({ error: "Tunnel not found" }, { status: 404 });
        }

        if (tunnel.organizationId) {
          const organizations = await auth.api.listOrganizations({
            headers: request.headers,
          });
          const hasAccess = organizations.find(
            (org) => org.id === tunnel.organizationId,
          );
          if (!hasAccess) {
            return json({ error: "Unauthorized" }, { status: 403 });
          }
        } else if (tunnel.userId !== session.user.id) {
          return json({ error: "Unauthorized" }, { status: 403 });
        }

        // Kill the tunnel connection if it's active
        // We use the tunnel URL hostname as the ID for the tunnel server
        let tunnelHostname = tunnel.url;
        try {
          const urlObj = new URL(
            tunnel.url.startsWith("http")
              ? tunnel.url
              : `https://${tunnel.url}`,
          );
          tunnelHostname = urlObj.hostname;
        } catch (e) {
          // ignore
        }

        await redis.publish("tunnel:control", `kill:${tunnelHostname}`);

        return json({ message: "Tunnel stopped" });
      },
    },
  },
});
