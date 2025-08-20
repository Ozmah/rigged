import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authStore } from "@/stores/auth";

export const Route = createFileRoute("/_twitchAuth")({
	beforeLoad: ({ location }) => {
		if (!authStore.state.isAuthenticated) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
	component: TwitchAuthLayout,
});

function TwitchAuthLayout() {
	return <Outlet />;
}
