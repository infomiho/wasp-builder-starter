import { MonitorSmartphone, SunMoon, UserRound } from "lucide-react";
import type { Feature } from "./components/Features";

export const features: Feature[] = [
  {
    name: "Your own account",
    description: "Sign up with a username and password, and log in whenever you come back.",
    icon: UserRound,
  },
  {
    name: "Works everywhere",
    description: "Use it on your phone, your tablet or your computer.",
    icon: MonitorSmartphone,
  },
  {
    name: "Light and dark",
    description: "Switch between light and dark mode, whichever is easier on your eyes.",
    icon: SunMoon,
  },
];
