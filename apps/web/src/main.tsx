// Hooks/Providers/Functional Components
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

// UI/Styles/UI Components
import Loader from "./components/loader";

// Types
import type { RouterAppContext } from "./routes/__root";
import { routeTree } from "./routeTree.gen";

// Libs
import { TwitchAPI } from "./lib/twitch-api-client";
import { TwitchEventSubWebSocket } from "./lib/twitch-eventsub-client";

/**
 * Creates the router context with auth and twitchAPI instances
 * This implements the dependency injection pattern for the router
 */
export function createRouterContext(): RouterAppContext {
	const twitchAPI = new TwitchAPI();
	const twitchEventSubWebSocket = new TwitchEventSubWebSocket();

	return {
		twitchAPI,
		twitchEventSubWebSocket,
	};
}

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPendingComponent: () => <Loader />,
	context: createRouterContext(),
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
