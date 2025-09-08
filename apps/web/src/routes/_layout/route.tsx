import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { authStore } from "@/stores/auth";

export const Route = createFileRoute("/_layout")({
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
	component: Layout,
});

function Layout() {
	return (
		<div className="grid h-screen grid-cols-1 grid-rows-[64px_repeat(7,minmax(10px,1fr))] gap-2 sm:grid-cols-[repeat(6,minmax(10px,1fr))] 2xl:grid-cols-[repeat(10,minmax(10px,1fr))]">
			<Header />
			<Outlet />
		</div>
	);
}
