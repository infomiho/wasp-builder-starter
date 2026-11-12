import { action, page, query, route, type Spec } from "@wasp.sh/spec";

import { NotesPage } from "./NotesPage" with { type: "ref" };
import { createNote, getNotes } from "./operations" with { type: "ref" };

export const notesSpec: Spec = [
  route("NotesRoute", "/notes", page(NotesPage, { authRequired: true })),
  query(getNotes, { entities: ["Note"] }),
  action(createNote, { entities: ["Note"] }),
];
