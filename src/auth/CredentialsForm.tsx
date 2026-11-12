import { AlertCircle, Loader2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "../client/components/ui/alert";
import { Button } from "../client/components/ui/button";
import { Input } from "../client/components/ui/input";
import { Label } from "../client/components/ui/label";

export type Credentials = { username: string; password: string };

type CredentialsFormProps = {
  submitLabel: string;
  passwordAutoComplete: "current-password" | "new-password";
  passwordHint?: string;
  onSubmit: (credentials: Credentials) => Promise<void>;
};

type FieldName = keyof Credentials;

/** An error about one field shows under that field, any other error above the form. */
type FormError = { field?: FieldName; message: string };

const PASSWORD_HINT_ID = "password-hint";

/** Username and password form for the login and signup pages, built from the UI kit around Wasp's auth actions. */
export function CredentialsForm({
  submitLabel,
  passwordAutoComplete,
  passwordHint,
  onSubmit,
}: CredentialsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<FormError | null>(null);
  const fieldRefs = {
    username: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({
        username: String(fields.get("username")),
        password: String(fields.get("password")),
      });
    } catch (error) {
      const nextError = toFormError(error);
      setFormError(nextError);
      setIsSubmitting(false);
      if (nextError.field) {
        fieldRefs[nextError.field].current?.focus();
      }
    }
  }

  const usernameError = formError?.field === "username" ? formError.message : undefined;
  const passwordError = formError?.field === "password" ? formError.message : undefined;
  const generalError = formError && !formError.field ? formError.message : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          ref={fieldRefs.username}
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          aria-invalid={Boolean(usernameError)}
          aria-describedby={usernameError ? fieldErrorId("username") : undefined}
        />
        {usernameError && <FieldError field="username" message={usernameError} />}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          ref={fieldRefs.password}
          id="password"
          name="password"
          type="password"
          autoComplete={passwordAutoComplete}
          required
          aria-invalid={Boolean(passwordError)}
          aria-describedby={joinIds(passwordError && fieldErrorId("password"), passwordHint && PASSWORD_HINT_ID)}
        />
        {passwordError && <FieldError field="password" message={passwordError} />}
        {passwordHint && (
          <p id={PASSWORD_HINT_ID} className="text-muted-foreground text-sm">
            {passwordHint}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}

function FieldError({ field, message }: { field: FieldName; message: string }) {
  return (
    <p id={fieldErrorId(field)} className="text-destructive text-sm font-medium">
      {message}
    </p>
  );
}

function fieldErrorId(field: FieldName): string {
  return `${field}-error`;
}

function joinIds(...ids: (string | undefined)[]): string | undefined {
  const presentIds = ids.filter(Boolean);
  return presentIds.length > 0 ? presentIds.join(" ") : undefined;
}

/** Wasp's reasons for a failed signup, rewritten as instructions shown next to the field they are about. */
const SIGNUP_ERRORS: Record<string, FormError> = {
  "password must be at least 8 characters": { field: "password", message: "Use at least 8 characters." },
  "password must contain a number": { field: "password", message: "Include at least one number." },
  "username must be present": { field: "username", message: "Enter a username." },
  "user with the same identity already exists": {
    field: "username",
    message: "That username is taken. Try another one.",
  },
};

const WRONG_CREDENTIALS_ERROR: FormError = {
  message: "That username and password don't match. Check them and try again.",
};

const UNKNOWN_ERROR: FormError = { message: "Unable to continue. Check your connection and try again." };

type AuthHttpError = Error & { statusCode?: number; data?: { data?: { message?: unknown } } };

/** Wasp puts the reason for a failed signup, such as a short password, in `data.data.message`, and answers a failed login with 401. */
function toFormError(error: unknown): FormError {
  const authError = error as AuthHttpError;
  if (authError?.statusCode === 401) {
    return WRONG_CREDENTIALS_ERROR;
  }
  const reason = authError?.data?.data?.message;
  if (typeof reason !== "string") {
    return UNKNOWN_ERROR;
  }
  return SIGNUP_ERRORS[reason] ?? { message: reason };
}
