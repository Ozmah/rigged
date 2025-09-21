// Hooks/Providers/Functional Components
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ShowRaffleState } from "@/components/debug/show-raffle-state";
import { ThemeProvider } from "@/components/theme-provider";
// UI/Styles/UI Components
import "@/index.css";
import Loader from "@/components/loader";
import { Toaster } from "@/components/ui/sonner";

// Types

import { TanStackDevtools } from "@tanstack/react-devtools";
// Libs
import type { TwitchAPI } from "@/lib/twitch-api-client";
import type { TwitchEventSubWebSocket } from "@/lib/twitch-eventsub-client";

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
				<Toaster position="bottom-right" richColors />
			</ThemeProvider>

			<TanStackDevtools
				plugins={[
					{
						name: "TanStack Router",
						render: <TanStackRouterDevtools />,
					},
					{
						name: "Raffle State",
						render: <ShowRaffleState />,
					},
					// {
					// 	name: 'EventSub State',
					// 	render: <EventSubDiagnostics />,
					// },
				]}
			/>
		</>
	);
}
