import { FlaskIcon, GiftIcon, SlidersIcon } from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-store";
import { Button } from "@/components/ui/button";
import { uiStore, updateUiState } from "@/stores/ui";

interface MicroMenuProps {
	className?: string;
}

const MENU_ITEMS = [
	{ id: "raffle" as const, icon: GiftIcon, label: "Rifa" },
	{ id: "settings" as const, icon: SlidersIcon, label: "Opciones del Chat" },
	{ id: "dev" as const, icon: FlaskIcon, label: "Herramientas Dev" },
];

export function MicroMenu({ className = "" }: MicroMenuProps) {
	const microMenuSelected = useStore(
		uiStore,
		(state) => state.microMenuSelected,
	);

	const handleMenuClick = (menuId: "raffle" | "settings" | "dev") => {
		updateUiState({ microMenuSelected: menuId });
	};

	return (
		// <div className="flex sm:h-full sm:flex-col items-end justify-start gap-3">
		<div className="flex h-20 gap-3 rounded-t-2xl border bg-card sm:h-full sm:flex-col sm:items-end sm:border-0 sm:bg-transparent">
			{/* <div className="flex h-40 w-14 flex-wrap items-center justify-center gap-1 rounded-lg bg-card py-2 transition-colors"> */}
			<div className="flex flex-1 items-center justify-between gap-1 px-8 sm:h-40 sm:w-14 sm:flex-none sm:flex-wrap sm:justify-center sm:rounded-lg sm:bg-card sm:px-0 sm:py-2">
				{MENU_ITEMS.map(({ id, icon: Icon, label }) => (
					<Button
						key={id}
						variant={microMenuSelected === id ? "default" : "ghost"}
						className={`${className} size-15 rounded-full sm:size-10 sm:rounded-md`}
						onClick={() => handleMenuClick(id)}
						title={label}
					>
						<Icon className="size-8 sm:size-6" />
					</Button>
				))}
			</div>
		</div>
	);
}
