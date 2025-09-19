// Hooks/Providers/Functional Components

import { WarningDiamondIcon } from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-store";
import { useEffect, useId } from "react";
// UI/Styles/UI Components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TypographyMuted } from "@/components/ui/typography";
import type { TwitchEventSubHookConstructor } from "@/hooks/useTwitchEventSub";
// Libs
import { handleRaffleAction } from "@/lib/raffleActionHandler";
// Types/Store State
import {
	canStartRaffle,
	chatStore,
	hasWinners,
	hideRaffleControls,
	isGeneratingMessages,
	microMenuSelected,
	primaryButtonText,
	primaryButtonVariant,
	secondaryButtonDisabled,
	secondaryButtonText,
	showCancelDialog,
	showDropdownMenu,
	showSubsExtraTickets,
	showVipsExtraTickets,
	testMessagesButtonText,
	testMessagesButtonVariant,
} from "@/stores/chat";
import { createRaffleUiAction } from "@/types/raffle-ui-factory";
import { ChatSettingsPanel } from "./panels/chat-settings-panel";
import { RafflePanel } from "./panels/raffle-panel";

export interface RiggedSettingsProps {
	eventSubHook: TwitchEventSubHookConstructor;
}

export function RiggedSettings({ eventSubHook }: RiggedSettingsProps) {
	const baseId = useId();
	const participants = useStore(chatStore, (state) => state.participants);

	// Derived state
	const hasWinnersState = useStore(hasWinners);
	const showCancelDialogState = useStore(showCancelDialog);
	const microMenuSelectedState = useStore(microMenuSelected);
	const isGeneratingMessagesState = useStore(isGeneratingMessages);
	const testMessagesButtonTextState = useStore(testMessagesButtonText);
	const testMessagesButtonVariantState = useStore(testMessagesButtonVariant);

	// Mount all derived state
	useEffect(() => {
		const unsubscribers = [
			canStartRaffle.mount(),
			hasWinners.mount(),
			showDropdownMenu.mount(),
			showCancelDialog.mount(),
			hideRaffleControls.mount(),
			microMenuSelected.mount(),
			primaryButtonText.mount(),
			primaryButtonVariant.mount(),
			secondaryButtonText.mount(),
			secondaryButtonDisabled.mount(),
			isGeneratingMessages.mount(),
			testMessagesButtonText.mount(),
			testMessagesButtonVariant.mount(),
			showSubsExtraTickets.mount(),
			showVipsExtraTickets.mount(),
		];

		return () => {
			for (const unsub of unsubscribers) {
				unsub();
			}
		};
	}, []);

	// Helper for field IDs
	const createFieldId = (name: string) => `${baseId}-${name}`;

	// Field IDs
	const generateTestMessagesId = createFieldId("generateTestMessages");
	const clearChatId = createFieldId("clearChat");

	return (
		<>
			<div className="@container flex flex-col justify-center space-y-4 rounded-lg bg-card px-4 py-4">
				{/* Main Raffle Controls */}
				{microMenuSelectedState === "raffle" && <RafflePanel />}
				{microMenuSelectedState === "settings" && (
					<ChatSettingsPanel eventSubHook={eventSubHook} />
				)}
				{microMenuSelectedState === "dev" && (
					<section className="my-5 space-y-4 rounded-lg bg-card">
						<div>
							<TypographyMuted>
								Generar mensajes de bots, éstos no se verán
								reflejados en tu chat real, únicamente aquí para
								probar las rifas:
							</TypographyMuted>
						</div>
						<div>
							<Button
								id={generateTestMessagesId}
								onClick={() => {
									if (isGeneratingMessagesState) {
										handleRaffleAction(
											createRaffleUiAction.stopTestMessages(),
										);
									} else {
										handleRaffleAction(
											createRaffleUiAction.startTestMessages(),
										);
									}
								}}
								variant={testMessagesButtonVariantState}
								className="w-full font-bold"
							>
								{testMessagesButtonTextState}
							</Button>
						</div>
						<div>
							<TypographyMuted>
								Limpiar el chat completamente, ésto NO afecta tu
								chat en twitch, únicamente en Rigged:
							</TypographyMuted>
						</div>
						<div>
							<Button
								id={clearChatId}
								onClick={() => {
									handleRaffleAction(
										createRaffleUiAction.clearChatMessages(),
									);
								}}
								variant={"default"}
								className="w-full font-bold"
							>
								Limpiar Chat
							</Button>
						</div>
						<Alert variant="destructive">
							<WarningDiamondIcon />
							<AlertTitle>¡Cuidado!</AlertTitle>
							<AlertDescription>
								<p>
									Estos botones pueden afectar la rifa, úsalos
									con precaución.
								</p>
							</AlertDescription>
						</Alert>
					</section>
				)}
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
