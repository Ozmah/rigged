// Framework Specific/Hooks/Providers/Functional Components

import { WarningDiamondIcon } from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-store";
import { useEffect, useId } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// UI/Styles/UI Components
import { Button } from "@/components/ui/button";
import { TypographyMuted } from "@/components/ui/typography";
// Libs
import { handleRaffleAction } from "@/lib/raffle-action-handler";
// Types/Store State
import {
	isGeneratingMessages,
	testMessagesButtonText,
	testMessagesButtonVariant,
} from "@/stores/chat";
import { createRaffleUiAction } from "@/types/raffle-ui-factory";

interface RafflePanel {
	className?: string;
}

export function DevSettingsPanel({ className = "" }: RafflePanel) {
	const baseId = useId();

	// Derived state
	const isGeneratingMessagesState = useStore(isGeneratingMessages);
	const testMessagesButtonTextState = useStore(testMessagesButtonText);
	const testMessagesButtonVariantState = useStore(testMessagesButtonVariant);

	// Mount all derived state
	useEffect(() => {
		const unsubscribers = [
			isGeneratingMessages.mount(),
			testMessagesButtonText.mount(),
			testMessagesButtonVariant.mount(),
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
		<section className={`space-y-4 ${className}`}>
			<div>
				<TypographyMuted>
					Generar mensajes de bots, éstos no se verán reflejados en tu
					chat real, únicamente aquí para probar las rifas:
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
					Limpiar el chat completamente, ésto NO afecta tu chat en
					twitch, únicamente en Rigged:
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
						Estos botones pueden afectar la rifa, úsalos con
						precaución.
					</p>
				</AlertDescription>
			</Alert>
		</section>
	);
}
