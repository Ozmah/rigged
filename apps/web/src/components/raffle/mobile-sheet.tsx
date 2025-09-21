// Framework Specific/Hooks/Providers/Functional Components
import { useStore } from "@tanstack/react-store";
import { useEffect } from "react";
import { DevSettingsPanel } from "@/components/raffle/panels/dev-settings-panel";
import { RafflePanel } from "@/components/raffle/panels/raffle-panel";
// UI/Styles/UI Components
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { TwitchEventSubHookConstructor } from "@/hooks/useTwitchEventSub";
// Libs
import { handleRaffleAction } from "@/lib/raffle-action-handler";
// Types/Store State
import {
	canStartRaffle,
	chatStore,
	hasWinners,
	hideRaffleControls,
	primaryButtonText,
	primaryButtonVariant,
	secondaryButtonDisabled,
	secondaryButtonText,
	showCancelDialog,
	showSubsExtraTickets,
	showVipsExtraTickets,
} from "@/stores/chat";
import { createRaffleUiAction } from "@/types/raffle-ui-factory";
import { ChatSettingsPanel } from "./panels/chat-settings-panel";

interface MobileSettingsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventSubHook: TwitchEventSubHookConstructor;
}

export function MobileSettingsSheet({
	open,
	onOpenChange,
	eventSubHook,
}: MobileSettingsSheetProps) {
	const participants = useStore(chatStore, (state) => state.participants);

	// Derived state
	const hasWinnersState = useStore(hasWinners);
	const showCancelDialogState = useStore(showCancelDialog);

	// Mount all derived state
	useEffect(() => {
		const unsubscribers = [
			canStartRaffle.mount(),
			hasWinners.mount(),
			showCancelDialog.mount(),
			hideRaffleControls.mount(),
			primaryButtonText.mount(),
			primaryButtonVariant.mount(),
			secondaryButtonText.mount(),
			secondaryButtonDisabled.mount(),
			showSubsExtraTickets.mount(),
			showVipsExtraTickets.mount(),
		];

		return () => {
			for (const unsub of unsubscribers) {
				unsub();
			}
		};
	}, []);

	return (
		<>
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="w-full overflow-y-auto p-4 pt-10">
					<SheetHeader className="p-0">
						<SheetTitle className="font-['Cabinet_Grotesk'] font-semibold text-xl">
							Ajustes de la Rifa
						</SheetTitle>
					</SheetHeader>
					<SheetDescription>
						Controla todos los aspectos de tu rifa desde aquí
					</SheetDescription>
					<div className="space-y-6 py-4">
						{/* Raffle Panel */}
						<RafflePanel />
						<div className="border-border border-t" />
						{/* Chat Settings Panel */}
						<ChatSettingsPanel eventSubHook={eventSubHook} />
						<div className="border-border border-t" />
						{/* Dev Settings Panel */}
						<DevSettingsPanel />
						<div className="border-border border-t" />
					</div>
				</SheetContent>
			</Sheet>
			{/* AlertDialog for Raffle Cancellation */}
			<AlertDialog
				open={showCancelDialogState}
				onOpenChange={(isOpen) => {
					if (isOpen) {
						handleRaffleAction(
							createRaffleUiAction.openCancelDialog(),
						);
					} else {
						handleRaffleAction(
							createRaffleUiAction.closeCancelDialog(),
						);
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogTitle>
						{hasWinnersState
							? "¿Quieres terminar la rifa?"
							: "¿Quieres cancelar la rifa?"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						Hay {participants.length} participantes que se perderán.
						¿Estás seguro?
					</AlertDialogDescription>
					<AlertDialogFooter>
						<AlertDialogCancel>No, continuar</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								handleRaffleAction(
									createRaffleUiAction.confirmCancelRaffle(),
								);
							}}
						>
							{hasWinnersState
								? "Sí, terminar rifa"
								: "Sí, cancelar rifa"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
