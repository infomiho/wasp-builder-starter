# Client: routes, links, layout and assets

## Links

`Link` and `routes` come from `wasp/client/router`. Both are typed from the routes in the spec, so a link to a page that does not exist is a type error.

```tsx
import { Link, routes } from "wasp/client/router";

<Link to="/notes">All notes</Link>
<Link to={routes.NotesRoute.to}>All notes</Link>
<Link to="/notes/:id" params={{ id: note.id }}>Open</Link>
```

- `to` is the route's path exactly as the spec declares it, with `:id` left in, and `params` fills it. Never build the address by hand (`to={"/notes/" + note.id}` is a type error).
- `routes.<RouteName>.to` is the declared path. `routes.<RouteName>.build({ params: { id } })` returns the finished address as a string, for `navigate(...)` or an `href`.
- `Link` also takes `search` (`{ sort: "date" }`) and `hash`.
- This app imports it as `Link as WaspRouterLink` where a file also uses another `Link`.
- A route exists in `routes` only after the spec that declares it compiled. Link only to pages that exist.

## A page with an id in its address

```ts
route("NoteRoute", "/notes/:id", page(NotePage, { authRequired: true })),
```

```tsx
import { useNavigate, useParams } from "react-router";
import { deleteNote, getNote, useQuery } from "wasp/client/operations";
import { routes } from "wasp/client/router";

export function NotePage() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();
  const { data: note, isLoading, error } = useQuery(getNote, { id: id ?? "" }, { enabled: Boolean(id) });

  async function handleDelete() {
    if (!note) return;
    await deleteNote({ id: note.id });
    navigate(routes.NotesRoute.to);
  }
  // render loading, error and the note
}
```

Hooks (`useParams`, `useNavigate`, `useLocation`, `useSearchParams`) come from `react-router`. The package `react-router-dom` is not installed. The id from the address is untrusted: the query validates it with `z.uuid()`.

## The layout

`src/client/App.tsx` is the root component (`client: { rootComponent: App }` in `main.wasp.ts`). Every page renders inside its `<Outlet />`. It is the one place for navigation, providers and anything on every page. Keep the `<Outlet />`, or no page shows.

Pages are loaded on demand, one file per page. A page component is a named export in its own file under `src/<feature>/`.

## Images and other files

| File | Where it goes | How to use it |
| --- | --- | --- |
| An image a component shows | `src/client/static/` | `import logo from "../client/static/logo.svg"` then `<img src={logo} alt="" />` |
| A file that needs a fixed address (favicon, `robots.txt`, a social image) | `public/` | by its root path: `/favicon.ico`. Cannot be imported |

## Tags in `<head>`

App-wide tags are strings in `src/client/head.wasp.ts`. For one page, render `<title>` or `<meta>` inside the component and React moves it to the head.

## Calling the server

Data goes through queries and actions ([operations.md](operations.md)). Never `fetch` the server by address. For a custom endpoint declared with `api(...)`, use `api` from `wasp/client/api` ([apis-and-jobs.md](apis-and-jobs.md)).
