// Framework Specific/Hooks/Providers/Functional Components
import { useStore } from "@tanstack/react-store";
import { useEffect } from "react";
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
import type { TwitchEventSubHookConstructor } from "@/hooks/useTwitchEventSub";
// Libs
import { handleRaffleAction } from "@/lib/raffle-action-handler";
// Types/Store State
import {
	chatStore,
	hasWinners,
	microMenuSelected,
	showCancelDialog,
} from "@/stores/chat";
import { createRaffleUiAction } from "@/types/raffle-ui-factory";
import { ChatSettingsPanel } from "./panels/chat-settings-panel";
import { DevSettingsPanel } from "./panels/dev-settings-panel";
import { RafflePanel } from "./panels/raffle-panel";

export interface RiggedSettingsProps {
	eventSubHook: TwitchEventSubHookConstructor;
}

export function RiggedSettings({ eventSubHook }: RiggedSettingsProps) {
	const participants = useStore(chatStore, (state) => state.participants);

	// Derived state
	const hasWinnersState = useStore(hasWinners);
	const showCancelDialogState = useStore(showCancelDialog);
	const microMenuSelectedState = useStore(microMenuSelected);

	// Mount all derived state
	useEffect(() => {
		const unsubscribers = [
			hasWinners.mount(),
			showCancelDialog.mount(),
			microMenuSelected.mount(),
		];

		return () => {
			for (const unsub of unsubscribers) {
				unsub();
			}
		};
	}, []);

	return (
		<>
			<div className="@container flex flex-col justify-center space-y-4 rounded-lg bg-card px-4 py-4">
				{/* Main Raffle Controls */}
				{microMenuSelectedState === "raffle" && <RafflePanel />}
				{microMenuSelectedState === "settings" && (
					<ChatSettingsPanel eventSubHook={eventSubHook} />
				)}
				{microMenuSelectedState === "dev" && <DevSettingsPanel />}
			</div>
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
