import { ReactNode } from "react";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import logo from "../client/static/logo.svg";
import { APP_NAME } from "../shared/common";

export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12 sm:justify-center sm:px-6 lg:px-8">
      <WaspRouterLink
        to={routes.LandingPageRoute.to}
        className="text-foreground hover:text-primary mb-8 flex items-center gap-2 rounded-md text-sm font-semibold transition-colors"
      >
        <img src={logo} alt="" className="size-8 rounded-md" />
        {APP_NAME}
      </WaspRouterLink>
      <div className="w-full sm:max-w-md">
        <div className="bg-card text-card-foreground ring-border px-6 py-8 shadow-xl ring-1 sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
