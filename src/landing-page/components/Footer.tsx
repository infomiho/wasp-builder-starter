import logo from "../../client/static/logo.svg";
import { APP_NAME } from "../../shared/common";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border border-t">
      <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm sm:flex-row lg:px-8">
        <div className="text-foreground flex items-center gap-2 font-semibold">
          <img src={logo} alt="" className="size-6 rounded-md" />
          {APP_NAME}
        </div>
        <p>
          © {currentYear} {APP_NAME}
        </p>
      </div>
    </footer>
  );
}
