import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "./ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-6">
      <div className="text-center">
        <p className="text-muted-foreground text-sm font-semibold">404</p>
        <h1 className="text-foreground mt-2 text-4xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          This page doesn't exist or has moved.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <WaspRouterLink to={routes.LandingPageRoute.to}>
            Back to the home page
          </WaspRouterLink>
        </Button>
      </div>
    </div>
  );
}
