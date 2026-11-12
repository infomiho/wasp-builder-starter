import { ChevronDown, LogOut, User } from "lucide-react";
import { Link as WaspRouterLink } from "wasp/client/router";
import { type User as UserEntity } from "wasp/entities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../client/components/ui/dropdown-menu";
import { useLogOut } from "../auth/hooks/useLogOut";
import { userMenuItems } from "./constants";

export function UserDropdown({ user }: { user: Partial<UserEntity> }) {
  const logOut = useLogOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-foreground hover:text-primary flex items-center gap-1 rounded-md transition-colors duration-300 ease-in-out">
          <span className="text-foreground mr-1 hidden text-right text-sm font-medium lg:block">
            {user.username}
          </span>
          <User className="size-5" aria-hidden="true" />
          <ChevronDown className="size-4" aria-hidden="true" />
          <span className="sr-only lg:hidden">Account menu</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {userMenuItems.map((item) => (
          // `asChild` makes the link itself the menu item, so Enter and clicks both navigate.
          <DropdownMenuItem key={item.name} asChild>
            <WaspRouterLink to={item.to} className="flex w-full items-center gap-3">
              <item.icon size="1.1rem" aria-hidden="true" />
              {item.name}
            </WaspRouterLink>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onSelect={logOut} className="flex items-center gap-3">
          <LogOut size="1.1rem" aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
