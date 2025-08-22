import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Loader from "@/components/loader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { UserDropdown } from "@/components/user-dropdown";
import type { TwitchAPI } from "@/lib/twitch-api-client";
import type { TwitchEventSubWebSocket } from "@/lib/twitch-eventsub-client";
import "../index.css";

export interface RouterAppContext {
	twitchAPI: TwitchAPI;
	twitchEventSubWebSocket: TwitchEventSubWebSocket;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "rigged",
			},
			{
				name: "description",
				content: "rigged is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

	return (
		<>
			<HeadContent />
			<ThemeProvider
				attribute="class"
				defaultTheme="dark"
				disableTransitionOnChange
				storageKey="vite-ui-theme"
			>
				{isFetching ? <Loader /> : <Outlet />}
				<Toaster richColors />
			</ThemeProvider>
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
