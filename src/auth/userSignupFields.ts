import { defineUserSignupFields } from "wasp/auth/providers/types";
import * as z from "zod";

const usernameDataSchema = z.object({
  username: z.string(),
});

// Copies the login username onto the `User` entity, so the app can show it without reading auth identities.
export const getUsernameUserFields = defineUserSignupFields({
  username: (data) => {
    const usernameData = usernameDataSchema.parse(data);
    return usernameData.username;
  },
});
