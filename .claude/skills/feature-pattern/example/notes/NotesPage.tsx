import { AlertCircle, Loader2, NotebookPen, Trash2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { createNote, deleteNote, getNotes, useQuery } from "wasp/client/operations";
import { type Note } from "wasp/entities";
import * as z from "zod";
import { Alert, AlertDescription } from "../client/components/ui/alert";
import { Button } from "../client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../client/components/ui/card";
import { Input } from "../client/components/ui/input";
import { Label } from "../client/components/ui/label";
import { Textarea } from "../client/components/ui/textarea";
import { toast } from "../client/hooks/use-toast";
import { formatDateTime } from "../shared/format";
import { createNoteInputSchema, NOTE_CONTENT_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from "./validation";

const TITLE_ERROR_ID = "note-title-error";
const UNKNOWN_SAVE_ERROR = "Unable to save the note. Check your connection and try again.";
const UNKNOWN_DELETE_ERROR = "Unable to delete the note. Check your connection and try again.";

export function NotesPage() {
  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h1 className="text-foreground text-4xl font-bold tracking-tight">Notes</h1>
        <p className="text-muted-foreground mt-3 text-lg leading-8">
          Jot down anything worth remembering.
        </p>
        <div className="mt-10 space-y-10">
          <NewNoteForm />
          <NoteList />
        </div>
      </div>
    </div>
  );
}

function NewNoteForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setErrorMessage(null);

    // The server checks the same schema, checking it here first puts the message next to the field.
    const parsed = createNoteInputSchema.safeParse({
      title: String(fields.get("title")),
      content: String(fields.get("content")),
    });
    if (!parsed.success) {
      setTitleError(z.flattenError(parsed.error).fieldErrors.title?.[0] ?? null);
      titleRef.current?.focus();
      return;
    }
    setTitleError(null);

    setIsSaving(true);
    try {
      await createNote(parsed.data);
      form.reset();
      toast({ title: "Note added" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : UNKNOWN_SAVE_ERROR);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground text-base font-semibold">New note</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              ref={titleRef}
              id="note-title"
              name="title"
              maxLength={NOTE_TITLE_MAX_LENGTH}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? TITLE_ERROR_ID : undefined}
            />
            {titleError && (
              <p id={TITLE_ERROR_ID} className="text-destructive text-sm font-medium">
                {titleError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="note-content">Details (optional)</Label>
            <Textarea id="note-content" name="content" rows={3} maxLength={NOTE_CONTENT_MAX_LENGTH} />
          </div>
          {errorMessage && <ErrorAlert message={errorMessage} />}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="animate-spin" />}
              Add note
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NoteList() {
  const { data: notes, isLoading, error } = useQuery(getNotes);

  return (
    <section aria-labelledby="notes-heading" className="space-y-4">
      <h2 id="notes-heading" className="text-foreground text-xl font-semibold">
        Your notes
      </h2>
      {isLoading && <LoadingState />}
      {error && <ErrorAlert message={error.message} />}
      {notes && notes.length === 0 && <EmptyState />}
      {notes && notes.length > 0 && (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id}>
              <NoteCard note={note} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function NoteCard({ note }: { note: Note }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteNote({ id: note.id });
      toast({ title: "Note deleted" });
    } catch (error) {
      toast({
        title: "Couldn't delete the note",
        description: error instanceof Error ? error.message : UNKNOWN_DELETE_ERROR,
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-1 p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-foreground font-semibold">{note.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            onClick={handleDelete}
            aria-label={`Delete the note "${note.title}"`}
          >
            {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 aria-hidden="true" />}
          </Button>
        </div>
        {note.content && (
          <p className="text-muted-foreground whitespace-pre-line text-pretty text-sm leading-6">{note.content}</p>
        )}
        <p className="text-muted-foreground pt-2 text-xs">
          <time dateTime={note.createdAt.toISOString()}>{formatDateTime(note.createdAt)}</time>
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div role="status" className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
      <Loader2 className="size-4 animate-spin" />
      Loading notes…
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
        <NotebookPen className="text-muted-foreground size-8" aria-hidden="true" />
        <p className="text-foreground font-medium">No notes yet</p>
        <p className="text-muted-foreground text-sm">Write your first note above and it will show up here.</p>
      </CardContent>
    </Card>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
