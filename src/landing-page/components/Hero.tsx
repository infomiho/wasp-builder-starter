import { useAuth } from "wasp/client/auth";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "../../client/components/ui/button";
import { APP_DESCRIPTION, APP_NAME } from "../../shared/common";

export function Hero() {
  return (
    <div className="relative w-full">
      <TopGradient />
      <BottomGradient />
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-foreground text-balance text-5xl font-bold tracking-tight sm:text-6xl">
            {APP_NAME}
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8">
            {APP_DESCRIPTION}
          </p>
          <HeroActions />
        </div>
      </div>
    </div>
  );
}

function HeroActions() {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="mt-10 h-10" />;
  }
  if (user) {
    return (
      <div className="mt-10 flex justify-center">
        <Button size="lg" asChild>
          <WaspRouterLink to={routes.NotesRoute.to}>
            Open your notes <span aria-hidden="true">→</span>
          </WaspRouterLink>
        </Button>
      </div>
    );
  }
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <Button size="lg" asChild>
        <WaspRouterLink to={routes.SignupRoute.to}>
          Get started <span aria-hidden="true">→</span>
        </WaspRouterLink>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <WaspRouterLink to={routes.LoginRoute.to}>Log in</WaspRouterLink>
      </Button>
    </div>
  );
}

function TopGradient() {
  return (
    <div
      className="absolute right-0 top-0 -z-10 w-full transform-gpu overflow-hidden blur-3xl sm:top-0"
      aria-hidden="true"
    >
      <div
        className="aspect-1020/880 w-280 bg-linear-to-tr flex-none from-amber-400 to-purple-300 opacity-10 sm:right-1/4 sm:translate-x-1/2 dark:hidden"
        style={{
          clipPath:
            "polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)",
        }}
      />
    </div>
  );
}

function BottomGradient() {
  return (
    <div
      className="absolute inset-x-0 top-[calc(100%-40rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-65rem)]"
      aria-hidden="true"
    >
      <div
        className="aspect-1020/880 w-360 bg-linear-to-br relative from-amber-400 to-purple-300 opacity-10 sm:-left-3/4 sm:translate-x-1/4 dark:hidden"
        style={{
          clipPath: "ellipse(80% 30% at 80% 50%)",
        }}
      />
    </div>
  );
}
