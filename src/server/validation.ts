import { HttpError } from "wasp/server";
import * as z from "zod";

export function ensureArgsSchemaOrThrowHttpError<Schema extends z.ZodType>(
  schema: Schema,
  rawArgs: unknown,
): z.infer<Schema> {
  const parseResult = schema.safeParse(rawArgs);
  if (!parseResult.success) {
    console.error(
      // We keep the `cause` property so that errors have stack traces pointing
      // to the original schema.
      new Error(
        "Operation arguments validation failed:\n" +
          z.prettifyError(parseResult.error),
        { cause: parseResult.error },
      ),
    );

    // The schema's own messages tell the person what to fix, so we send them to the client.
    const issueMessages = parseResult.error.issues.map((issue) => issue.message);
    throw new HttpError(400, issueMessages.join(" "), {
      cause: parseResult.error,
    });
  } else {
    return parseResult.data;
  }
}
