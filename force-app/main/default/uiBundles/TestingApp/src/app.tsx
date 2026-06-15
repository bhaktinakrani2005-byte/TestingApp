import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./routes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import { Provider } from "react-redux"
import { store, persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "./components/ui/sonner";

// Normalize basename: strip trailing slash so it matches URLs like /lwr/application/ai/c-app
const rawBasePath = (globalThis as any).SFDC_ENV?.basePath;
const basename = typeof rawBasePath === "string" ? rawBasePath.replace(/\/+$/, "") : undefined;
const router = createBrowserRouter(routes, { basename });

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<RouterProvider router={router} />
				<Toaster />
			</PersistGate>
		</Provider>
	</StrictMode>,
);
