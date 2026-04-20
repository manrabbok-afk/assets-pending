import { createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-2xl font-semibold">404 — Page not found</h1>
        <p className="text-sm text-muted-foreground">The page you requested does not exist.</p>
      </div>
    </div>
  );
}

function RootComponent() {
  return <Outlet />;
}

export function getRouter() {
  const queryClient = new QueryClient();

  const rootRoute = createRootRoute({
    component: () => (
      <QueryClientProvider client={queryClient}>
        <RootComponent />
      </QueryClientProvider>
    ),
    notFoundComponent: NotFound,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: App,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);

  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: ({ error, reset }) => (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md space-y-3 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <button
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => reset()}
          >
            Retry
          </button>
        </div>
      </div>
    ),
  });
}

const router = getRouter();

export default function Router() {
  return <RouterProvider router={router} />;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
