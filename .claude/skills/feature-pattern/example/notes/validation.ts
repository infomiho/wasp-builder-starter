import * as z from "zod";

export const NOTE_TITLE_MAX_LENGTH = 120;
export const NOTE_CONTENT_MAX_LENGTH = 2000;

export const createNoteInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the note a title.")
    .max(NOTE_TITLE_MAX_LENGTH, `Keep the title under ${NOTE_TITLE_MAX_LENGTH} characters.`),
  content: z
    .string()
    .trim()
    .max(NOTE_CONTENT_MAX_LENGTH, `Keep the note under ${NOTE_CONTENT_MAX_LENGTH} characters.`),
});

export type CreateNoteInput = z.infer<typeof createNoteInputSchema>;

export const deleteNoteInputSchema = z.object({
  id: z.uuid(),
});

export type DeleteNoteInput = z.infer<typeof deleteNoteInputSchema>;
