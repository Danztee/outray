import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { subdomains } from "../../../db/app-schema";

export const Route = createFileRoute("/api/tunnel/check-subdomain")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { subdomain, organizationId } = body;

          if (!subdomain) {
            return json(
              { allowed: false, error: "Missing subdomain" },
              { status: 400 },
            );
          }

          const existingSubdomain = await db
            .select({
              subdomain: subdomains.subdomain,
              organizationId: subdomains.organizationId,
            })
            .from(subdomains)
            .where(eq(subdomains.subdomain, subdomain))
            .limit(1);

          if (existingSubdomain.length > 0) {
            const record = existingSubdomain[0];
            if (organizationId && record.organizationId === organizationId) {
              return json({ allowed: true, type: "owned" });
            }
            return json({ allowed: false, error: "Subdomain already taken" });
          }

          return json({ allowed: true, type: "available" });
        } catch (error) {
          console.error("Error in /api/tunnel/check-subdomain:", error);
          return json(
            {
              allowed: false,
              error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
