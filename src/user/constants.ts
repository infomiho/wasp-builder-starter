import { Settings } from "lucide-react";
import { routes } from "wasp/client/router";

export const userMenuItems = [
  {
    name: "Account",
    to: routes.AccountRoute.to,
    icon: Settings,
  },
] as const;
