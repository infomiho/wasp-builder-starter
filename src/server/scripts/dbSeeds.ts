import type { PrismaClient } from "@prisma/client";
import { sanitizeAndSerializeProviderData } from "wasp/server/auth";
import { DEMO_USER } from "../../shared/demoUser";

const demoNotes = [
  {
    title: "Ideas for the team meeting",
    content: "Share last month's wins.\nPick one thing to improve next.",
  },
  {
    title: "Groceries for the weekend",
    content: "Bread, apples, coffee beans and something for Sunday lunch.",
  },
];

/**
 * This function, which we've imported in `app.db.seeds` in the `main.wasp.ts` file,
 * creates the demo user and their notes via the `wasp db seed` command.
 * It does nothing when the demo user already exists, so it is safe to run more than once.
 * The demo password is public, so never run it against a production database.
 * For more info see: https://wasp.sh/docs/data/databases#seeding-the-database
 */
export async function seedDemoUser(prismaClient: PrismaClient) {
  const existingDemoUser = await prismaClient.user.findUnique({
    where: { username: DEMO_USER.username },
  });
  if (existingDemoUser) {
    console.log("The demo user already exists, skipping the demo seed.");
    return;
  }

  const providerData = await sanitizeAndSerializeProviderData<"username">({
    hashedPassword: DEMO_USER.password,
  });
  await prismaClient.user.create({
    data: {
      username: DEMO_USER.username,
      auth: {
        create: {
          identities: {
            create: {
              providerName: "username",
              providerUserId: DEMO_USER.username,
              providerData,
            },
          },
        },
      },
      notes: { create: demoNotes },
    },
  });
}
