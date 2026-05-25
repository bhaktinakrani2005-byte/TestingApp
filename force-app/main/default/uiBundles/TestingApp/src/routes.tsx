import type { RouteObject } from 'react-router';
import TodoListMainPage from './components/todo';
import AuthAppLayout from "./features/authentication/layouts/AuthAppLayout";
import ChartDataPage from './pages/ChartData';
import ContactData from './pages/ContactData';
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
        path: 'contact',
        element: <ContactData />,
        handle: { showInNavigation: false, label: "Contact" }
      },
      {
        path: 'todo',
        element: <TodoListMainPage />,
        handle: { showInNavigation: false, label: "Todo" }
      },
      {
        path: 'chart',
        element: <ChartDataPage />,
        handle: { showInNavigation: false, label: "ChartData" }
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];
