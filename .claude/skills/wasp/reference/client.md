# Client: links, pages, layout and assets

## Links

`Link` and `routes` are typed from the routes in the spec, so a link to a page that does not exist is a type error.

```tsx
import { Link, routes } from "wasp/client/router";

<Link to="/notes">All notes</Link>
<Link to={routes.NotesRoute.to}>All notes</Link>
<Link to="/notes/:id" params={{ id: note.id }}>Open</Link>
```

- `to` is the path exactly as the spec declares it, with `:id` left in, and `params` fills it. An address built by hand (`to={"/notes/" + note.id}`) is a type error.
- `routes.<RouteName>.build({ params: { id } })` returns the finished address as a string, for `navigate(...)` or an `href`.

## A page with an id in its address

- Declared as `route("NoteRoute", "/notes/:id", page(NotePage, { authRequired: true }))`.
- Hooks come from `react-router`, because `react-router-dom` is not installed: `useParams`, `useNavigate`, `useLocation`, `useSearchParams`.
- `const { id } = useParams<"id">()` can be `undefined`, so the query waits for it: `useQuery(getNote, { id: id ?? "" }, { enabled: Boolean(id) })`.
- The id from the address is untrusted, so the query validates it with `z.uuid()`.
- After deleting the row, `navigate(routes.NotesRoute.to)` leaves the page.

## Layout, assets and head

- `src/client/App.tsx` is the root component, the one place for navigation and providers. Every page renders inside its `<Outlet />`.
- An image a component shows lives in `src/client/static/` and is imported: `import logo from "../client/static/logo.svg"`.
- A file that needs a fixed address (favicon, `robots.txt`, a social image) lives in `public/` and is used by its root path (`/favicon.ico`). It cannot be imported.
- App-wide `<head>` tags are strings in `src/client/head.wasp.ts`. For one page, `<title>` or `<meta>` rendered inside the component moves to the head.
- Data goes through queries and actions. A custom endpoint is called with `api` from `wasp/client/api` ([apis-and-jobs.md](apis-and-jobs.md)), which knows the server's address.
