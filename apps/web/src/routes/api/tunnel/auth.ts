import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { authTokens } from "../../../db/app-schema";

export const Route = createFileRoute("/api/tunnel/auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { token } = body;

          if (!token) {
            return json(
              { valid: false, error: "Missing Auth Token" },
              { status: 400 },
            );
          }

          const tokenRecord = await db.query.authTokens.findFirst({
            where: eq(authTokens.token, token),
            with: {
              organization: true,
            },
          });

          if (!tokenRecord) {
            return json(
              { valid: false, error: "Invalid Auth Token" },
              { status: 401 },
            );
          }

          await db
            .update(authTokens)
            .set({ lastUsedAt: new Date() })
            .where(eq(authTokens.id, tokenRecord.id));

          return json({
            valid: true,
            userId: tokenRecord.userId,
            organizationId: tokenRecord.organizationId,
            organization: {
              id: tokenRecord.organization.id,
              name: tokenRecord.organization.name,
              slug: tokenRecord.organization.slug,
            },
          });
        } catch (error) {
          console.error("Error in /api/tunnel/auth:", error);
          return json(
            {
              valid: false,
              error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
