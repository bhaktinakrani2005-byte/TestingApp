import type { RouteObject } from 'react-router';
import AuthAppLayout from "./features/authentication/layouts/AuthAppLayout";
import Home from './pages/Home';
import NotFound from './pages/NotFound';

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AuthAppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: { showInNavigation: true, label: "Home" }
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];
