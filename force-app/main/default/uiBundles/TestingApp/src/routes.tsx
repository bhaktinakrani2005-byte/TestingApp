import type { RouteObject } from 'react-router';
import TodoListMainPage from './components/todo';
import AuthAppLayout from "./features/authentication/layouts/AuthAppLayout";
import ContactData from './pages/ContactData';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import LoginPage from './pages/Login';
import ProtectedRoute from './pages/ProtectedRoute';

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AuthAppLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
        handle: { showInNavigation: false, label: "Login" }
      },
      {
        path: 'home',
        element: <ProtectedRoute>
          <Home />
        </ProtectedRoute>,
        handle: { showInNavigation: true, label: "Home" }
      },
      {
        path: 'contact',
        element: <ProtectedRoute>
          <ContactData />
        </ProtectedRoute>,
        handle: { showInNavigation: true, label: "Contact" }
      },
      {
        path: 'profile',
        element: <ProtectedRoute>
          <ContactData />
        </ProtectedRoute>,
        handle: { showInNavigation: false, label: "Profile" }
      },
      {
        path: 'todo',
        element: <ProtectedRoute>
          <TodoListMainPage />
        </ProtectedRoute>,
        handle: { showInNavigation: true, label: "Todo" }
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];
