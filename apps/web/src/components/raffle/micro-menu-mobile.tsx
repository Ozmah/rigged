import { GiftIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileSettingsSheet } from "./mobile-sheet";

interface MicroMenuMobileProps {
	className?: string;
}

export function MicroMenuMobile({ className = "" }: MicroMenuMobileProps) {
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	return (
		<>
			<div className="fixed left-1/2 bottom-10 -translate-x-1/2 z-50">
				<Button
					variant="default"
					className={`${className} size-20 sm:size-10 rounded-full sm:rounded-md shadow-lg`}
					onClick={() => setIsSheetOpen(true)}
					title="Configuración de Rifa"
				>
					<GiftIcon className="size-16" />
				</Button>
			</div>

			<MobileSettingsSheet
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
			/>
		</>
	);
}
