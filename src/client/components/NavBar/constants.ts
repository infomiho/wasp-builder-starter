import { routes } from "wasp/client/router";
import type { NavigationItem } from "./NavBar";

export const appNavigationItems: NavigationItem[] = [
  { name: "Notes", to: routes.NotesRoute.to },
] as const;
