import { useNavigate } from "react-router";
import { login } from "wasp/client/auth";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { APP_NAME } from "../shared/common";
import { DEMO_USER } from "../shared/demoUser";
import { AuthPageLayout } from "./AuthPageLayout";
import { CredentialsForm, type Credentials } from "./CredentialsForm";
import { useRedirectIfLoggedIn } from "./hooks/useRedirectIfLoggedIn";

export function LoginPage() {
  useRedirectIfLoggedIn();
  const navigate = useNavigate();

  async function logIn(credentials: Credentials) {
    await login(credentials);
    navigate(routes.LandingPageRoute.to);
  }

  return (
    <AuthPageLayout>
      <h1 className="text-foreground text-2xl font-bold tracking-tight">Log in</h1>
      <p className="text-muted-foreground mt-1 text-sm">Welcome back to {APP_NAME}.</p>
      <div className="mt-6">
        <CredentialsForm submitLabel="Log in" passwordAutoComplete="current-password" onSubmit={logIn} />
      </div>
      {/* The demo user only exists where `wasp db seed` ran, which is the development database. */}
      {import.meta.env.DEV && <DemoUserHint />}
      <p className="text-muted-foreground mt-6 text-center text-sm">
        New here?{" "}
        <WaspRouterLink to={routes.SignupRoute.to} className="text-foreground font-medium underline underline-offset-4">
          Create an account
        </WaspRouterLink>
      </p>
    </AuthPageLayout>
  );
}

function DemoUserHint() {
  return (
    <div className="bg-muted mt-6 rounded-md p-4 text-sm">
      <p className="text-foreground font-medium">Try the demo account</p>
      <p className="text-muted-foreground mt-1">
        Username <code className="text-foreground font-mono">{DEMO_USER.username}</code>, password{" "}
        <code className="text-foreground font-mono">{DEMO_USER.password}</code>
      </p>
    </div>
  );
}
