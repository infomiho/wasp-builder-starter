import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router";
import { routes } from "wasp/client/router";
import { Toaster } from "../client/components/ui/toaster";
import "./Main.css";
import { NavBar } from "./components/NavBar/NavBar";
import { appNavigationItems } from "./components/NavBar/constants";
import { useApplyColorMode } from "./hooks/useColorMode";

const MAIN_CONTENT_ID = "main-content";

/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export function App() {
  const location = useLocation();
  useApplyColorMode();

  const shouldDisplayAppNavBar = useMemo(() => {
    return (
      location.pathname !== routes.LoginRoute.build() &&
      location.pathname !== routes.SignupRoute.build()
    );
  }, [location]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
  }, [location]);

  return (
    <>
      <div className="bg-background text-foreground min-h-screen">
        <a
          href={`#${MAIN_CONTENT_ID}`}
          className="bg-background text-foreground focus-visible:ring-ring sr-only z-50 rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:ring-2"
        >
          Skip to content
        </a>
        {shouldDisplayAppNavBar && (
          <NavBar navigationItems={appNavigationItems} />
        )}
        <main id={MAIN_CONTENT_ID} className="max-w-(--breakpoint-2xl) mx-auto">
          <Outlet />
        </main>
      </div>
      <Toaster position="bottom-right" />
    </>
  );
}
