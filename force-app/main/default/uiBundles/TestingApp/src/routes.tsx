import type { RouteObject } from 'react-router';
import AuthAppLayout from "./features/authentication/layouts/AuthAppLayout";
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ContactData from './pages/ContactData';
import ChartDataPage from './pages/ChartData';

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
        path: 'contact',
        element: <ContactData />,
        handle: { showInNavigation: true, label: "Contact" }
      },
       {
        path: 'chart',
        element: <ChartDataPage />,
        handle: { showInNavigation: true, label: "ChartData" }
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];
