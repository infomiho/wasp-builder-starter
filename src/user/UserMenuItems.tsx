import { LogOut } from "lucide-react";
import { Link as WaspRouterLink } from "wasp/client/router";
import { useLogOut } from "../auth/hooks/useLogOut";
import { userMenuItems } from "./constants";

export function UserMenuItems({ onItemClick }: { onItemClick?: () => void }) {
  const logOut = useLogOut();

  return (
    <>
      {userMenuItems.map((item) => (
        <li key={item.name}>
          <WaspRouterLink
            to={item.to}
            onClick={onItemClick}
            className="text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium leading-7 transition-colors"
          >
            <item.icon size="1.1rem" aria-hidden="true" />
            {item.name}
          </WaspRouterLink>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={() => {
            onItemClick?.();
            logOut();
          }}
          className="text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium leading-7 transition-colors"
        >
          <LogOut size="1.1rem" aria-hidden="true" />
          Log out
        </button>
      </li>
    </>
  );
}
