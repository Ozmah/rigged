import {
	createFileRoute,
	useRouteContext,
	useRouterState,
} from "@tanstack/react-router";
import { MicroMenu } from "@/components/raffle/micro-menu";
import { ReactSpinner } from "@/components/ui/react-spinner";

export const Route = createFileRoute("/_layout/sandbox")({
	component: HomeComponent,
});

function HomeComponent() {
	const routeState = useRouterState({
		select: (state) => state.matches,
	});
	const currentRoute = routeState.at(-1)?.routeId;
	const context = useRouteContext({ from: currentRoute ?? "__root__" });
	return (
		<>
			<div className="col-start-3 row-span-5 row-start-2" />
			<div className="col-span-2 col-start-4 row-span-5 row-start-2">
				<MicroMenu />
			</div>
			<div className="col-span-3 col-start-6 row-span-6 row-start-2">
				4
			</div>
		</>
	);
}
