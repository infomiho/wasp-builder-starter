import { useNavigate } from "react-router";
import { login, signup } from "wasp/client/auth";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { APP_NAME } from "../shared/common";
import { AuthPageLayout } from "./AuthPageLayout";
import { CredentialsForm, type Credentials } from "./CredentialsForm";
import { useRedirectIfLoggedIn } from "./hooks/useRedirectIfLoggedIn";

export function SignupPage() {
  useRedirectIfLoggedIn();
  const navigate = useNavigate();

  async function createAccount(credentials: Credentials) {
    await signup(credentials);
    await login(credentials);
    navigate(routes.LandingPageRoute.to);
  }

  return (
    <AuthPageLayout>
      <h1 className="text-foreground text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="text-muted-foreground mt-1 text-sm">Get started with {APP_NAME}.</p>
      <div className="mt-6">
        <CredentialsForm
          submitLabel="Create account"
          passwordAutoComplete="new-password"
          passwordHint="At least 8 characters, including a number."
          onSubmit={createAccount}
        />
      </div>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already have an account?{" "}
        <WaspRouterLink to={routes.LoginRoute.to} className="text-foreground font-medium underline underline-offset-4">
          Log in
        </WaspRouterLink>
      </p>
    </AuthPageLayout>
  );
}
