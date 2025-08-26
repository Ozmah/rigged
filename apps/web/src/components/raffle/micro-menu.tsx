import { GiftIcon, SlidersIcon, TestTubeIcon } from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-store";
import { Button } from "@/components/ui/button";
import { uiStore, updateUiState } from "@/stores/ui";

interface MicroMenuProps {
	className?: string;
}

const MENU_ITEMS = [
	{ id: "raffle" as const, icon: GiftIcon, label: "Raffle" },
	{ id: "settings" as const, icon: SlidersIcon, label: "Settings" },
	{ id: "dev" as const, icon: TestTubeIcon, label: "Dev Tools" },
];

export function MicroMenu({ className = "" }: MicroMenuProps) {
	const microMenuSelected = useStore(
		uiStore,
		(state) => state.microMenuSelected,
	);

	const handleMenuClick = (menuId: "raffle" | "settings" | "dev") => {
		updateUiState({ microMenuSelected: menuId });
		// uiStore.setState((state) => ({
		// 	...state,
		// 	microMenuSelected: menuId,
		// }));
	};

	return (
		<div className="flex h-full flex-col items-end justify-start gap-3">
			<div className="flex h-40 w-14 flex-wrap items-center justify-center gap-1 rounded-lg bg-card py-2 transition-colors">
				{MENU_ITEMS.map(({ id, icon: Icon, label }) => (
					<Button
						key={id}
						variant={
							microMenuSelected === id ? "default" : "secondary"
						}
						size="icon"
						className={`size-10 ${className}`}
						onClick={() => handleMenuClick(id)}
						title={label}
					>
						<Icon className="size-6" />
					</Button>
				))}
			</div>
		</div>
	);
}
