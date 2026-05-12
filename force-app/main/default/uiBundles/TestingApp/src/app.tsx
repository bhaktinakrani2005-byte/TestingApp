import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "./routes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import {Provider} from "react-redux"
import {store} from "./store/store.js"

// Normalize basename: strip trailing slash so it matches URLs like /lwr/application/ai/c-app
const rawBasePath = (globalThis as any).SFDC_ENV?.basePath;
const basename = typeof rawBasePath === "string" ? rawBasePath.replace(/\/+$/, "") : undefined;
const router = createBrowserRouter(routes, { basename });

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider store={store}>
			 <RouterProvider router={router} />
		</Provider>
	</StrictMode>,
);
