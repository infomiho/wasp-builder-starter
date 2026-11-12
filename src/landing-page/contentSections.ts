import { MonitorSmartphone, NotebookPen, UserRound } from "lucide-react";
import type { Feature } from "./components/Features";

export const features: Feature[] = [
  {
    name: "Your own account",
    description: "Sign up with a username and password. Only you can see your notes.",
    icon: UserRound,
  },
  {
    name: "Notes",
    description: "Write down anything worth remembering and find it again later.",
    icon: NotebookPen,
  },
  {
    name: "Works everywhere",
    description: "Use it on your phone or your computer, in light or dark mode.",
    icon: MonitorSmartphone,
  },
];
