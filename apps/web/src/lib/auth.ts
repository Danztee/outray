import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { organization } from "better-auth/plugins";
import { sendViaZepto } from "./send-email";
import { ac, admin, member, owner } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
      sendInvitationEmail: async ({
        email,
        invitation,
        organization,
        inviter,
        role,
      }) => {
        const invitationLink = `${process.env.APP_URL}/invitations/accept?token=${invitation.id}`;
        sendViaZepto({
          recipientEmail: email,
          subject: `You're invited to join ${organization.name} on OutRay`,
          htmlString: `
          <p>Hi,</p>
          <p>${inviter?.user.name || "Someone"} has invited you to join the organization <strong>${organization.name}</strong> on OutRay with the role of <strong>${role}</strong>.</p>
          <p>Please click the link below to accept the invitation:</p>
          <p><a href="${invitationLink}">Accept Invitation</a></p>
          <p>If you did not expect this invitation, you can safely ignore this email.</p>
          <p>Cheers,<br/>The OutRay Team</p>
        `,
        });
      },
    }),
  ],
});
