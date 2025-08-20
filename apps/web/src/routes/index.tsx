import {
	createFileRoute,
	useRouteContext,
	useRouterState,
} from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const routeState = useRouterState({
		select: (state) => state.matches,
	});
	const currentRoute = routeState.at(-1)?.routeId;
	const context = useRouteContext({ from: currentRoute ?? "__root__" });
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<pre className="overflow-x-auto font-mono text-sm" />
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">API Status</h2>
				</section>
			</div>
		</div>
	);
}
