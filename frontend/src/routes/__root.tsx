import type { QueryClient } from "@tanstack/react-query";
import {
  ErrorComponent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import * as React from "react";
import NotFoundPage from "../components/NotFoundPage";
import { useTheme } from "../lib/hooks/useTheme.hook";

type RouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
});

function RootLayout() {
  useTheme();

  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}
