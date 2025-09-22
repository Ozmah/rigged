import { GiftIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { MobileSettingsSheet } from "@/components/raffle/mobile-sheet";
import { Button } from "@/components/ui/button";
import type { TwitchEventSubHookConstructor } from "@/hooks/useTwitchEventSub";

interface MicroMenuMobileProps {
	className?: string;
	eventSubHook: TwitchEventSubHookConstructor;
}

export function MicroMenuMobile({
	className = "",
	eventSubHook,
}: MicroMenuMobileProps) {
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	return (
		<>
			<div className="-translate-x-1/2 fixed bottom-10 left-1/2 z-50">
				<Button
					variant="default"
					className={`${className} size-20 rounded-full shadow-lg sm:size-10 sm:rounded-md`}
					onClick={() => setIsSheetOpen(true)}
					title="Configuración de Rifa"
				>
					<GiftIcon className="size-16" />
				</Button>
			</div>

			<MobileSettingsSheet
				eventSubHook={eventSubHook}
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
			/>
		</>
	);
}
