import { useNavigate } from "react-router";
import { logout } from "wasp/client/auth";
import { routes } from "wasp/client/router";

/**
 * Leaving the page before logging out sends the person to the home page.
 * Logging out on a page that needs auth would send them to the login page instead.
 */
export function useLogOut() {
  const navigate = useNavigate();

  return async function logOut() {
    await navigate(routes.LandingPageRoute.to);
    await logout();
  };
}
