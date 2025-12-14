import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "../../../db";
import { tunnels, subdomains } from "../../../db/app-schema";

function generateId(prefix: string = ""): string {
  const random = randomBytes(12).toString("hex");
  return prefix ? `${prefix}_${random}` : random;
}

export const Route = createFileRoute("/api/tunnel/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            subdomain?: string;
            userId?: string;
            organizationId?: string;
          };

          const { subdomain, userId, organizationId } = body;

          if (!subdomain || !userId || !organizationId) {
            return json({ error: "Missing required fields" }, { status: 400 });
          }

          // Check if subdomain already exists
          const [existingSubdomain] = await db
            .select()
            .from(subdomains)
            .where(eq(subdomains.subdomain, subdomain));

          if (existingSubdomain) {
            // Subdomain already registered
            return json({
              success: true,
              tunnelId: existingSubdomain.tunnelId,
            });
          }

          // Create new tunnel record with full URL
          const tunnelUrl = `https://${subdomain}.outray.app`;
          const tunnelRecord = {
            id: generateId("tunnel"),
            url: tunnelUrl,
            userId,
            organizationId,
            name: null,
            lastSeenAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.insert(tunnels).values(tunnelRecord);

          // Create subdomain allocation record
          const subdomainRecord = {
            id: generateId("subdomain"),
            subdomain,
            tunnelId: tunnelRecord.id,
            createdAt: new Date(),
          };

          await db.insert(subdomains).values(subdomainRecord);

          return json({ success: true, tunnelId: tunnelRecord.id });
        } catch (error) {
          console.error("Tunnel registration error:", error);
          return json({ error: "Internal server error" }, { status: 500 });
        }
      },
    },
  },
});
