import { createFileRoute } from "@tanstack/react-router";
import { ReactSpinner } from "@/components/ui/loader";

export const Route = createFileRoute("/_layout/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<>
			<div className="col-start-3 row-span-5 row-start-2">
				<ReactSpinner />
			</div>
			<div className="col-span-2 col-start-4 row-span-5 row-start-2">
				TEST
			</div>
			<div className="col-span-3 col-start-6 row-span-6 row-start-2">
				TEST
			</div>
		</>
	);
}
