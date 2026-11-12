import type { Note } from "wasp/entities";
import { HttpError } from "wasp/server";
import type { CreateNote, GetNotes } from "wasp/server/operations";
import { ensureArgsSchemaOrThrowHttpError } from "../server/validation";
import { createNoteInputSchema, type CreateNoteInput } from "./validation";

//#region Actions
export const createNote: CreateNote<CreateNoteInput, Note> = async (
  rawArgs,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  const { title, content } = ensureArgsSchemaOrThrowHttpError(
    createNoteInputSchema,
    rawArgs,
  );

  return context.entities.Note.create({
    data: {
      title,
      content,
      user: { connect: { id: context.user.id } },
    },
  });
};
//#endregion

//#region Queries
export const getNotes: GetNotes<void, Note[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.Note.findMany({
    where: { user: { id: context.user.id } },
    orderBy: { createdAt: "desc" },
  });
};
//#endregion
