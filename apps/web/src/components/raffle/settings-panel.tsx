// Hooks/Providers/Functional Components

import {
	CaretDownIcon,
	EraserIcon,
	QuestionIcon,
	WarningDiamondIcon,
} from "@phosphor-icons/react";
import { useRouteContext } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect, useId } from "react";
// UI/Styles/UI Components
import { toast } from "sonner";
import { DisabledOverlay } from "@/components/disabled-overlay";
import { NumberInput } from "@/components/number-input";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TooltipInfo } from "@/components/ui/tooltip-info";
import { TypographyH4, TypographyMuted } from "@/components/ui/typography";
// Libs
import { switchToChannel } from "@/lib/channel-switcher";
import { handleRaffleAction } from "@/lib/raffleActionHandler";
// Types
import type { EventSubSubscriptionsResponse } from "@/lib/twitch-schemas";
import { authStore } from "@/stores/auth";
import {
	canStartRaffle,
	chatStore,
	hasWinners,
	hideRaffleControls,
	isGeneratingMessages,
	isThisMyStream,
	microMenuSelected,
	primaryButtonText,
	primaryButtonVariant,
	secondaryButtonDisabled,
	secondaryButtonText,
	setCurrentChannel,
	showCancelDialog,
	showDropdownMenu,
	showSubsExtraTickets,
	showVipsExtraTickets,
	testMessagesButtonText,
	testMessagesButtonVariant,
} from "@/stores/chat";
import { createRaffleUiAction } from "@/types/raffle-ui-factory";

export interface SettingsPanelProps {
	eventSubHook: {
		connectionStatus: string;
		isConnected: boolean;
		isConnecting: boolean;
		connect: (broadcasterId?: string) => Promise<void>;
		disconnect: () => Promise<void>;
		toggle: () => void;
		diagnoseSubscriptions: () => Promise<EventSubSubscriptionsResponse | null>;
		sessionId: string | null;
		subscriptionId: string | null;
	};
}

// This file will be split soon

export function SettingsPanel({ eventSubHook }: SettingsPanelProps) {
	const baseId = useId();
	const context = useRouteContext({ from: "__root__" });
	const participants = useStore(chatStore, (state) => state.participants);
	const isCapturing = useStore(chatStore, (state) => state.isCapturing);
	const isRaffleRigged = useStore(chatStore, (state) => state.isRaffleRigged);
	const raffleConfig = useStore(chatStore, (state) => state.raffleConfig);
	const user = useStore(authStore, (state) => state.user);
	const modedChannels = useStore(authStore, (state) => state.modedChannels);

	// Derived state
	const canStartRaffleState = useStore(canStartRaffle);
	const hasWinnersState = useStore(hasWinners);
	const showDropdownMenuState = useStore(showDropdownMenu);
	const showCancelDialogState = useStore(showCancelDialog);
	const hideRaffleControlsState = useStore(hideRaffleControls);
	const microMenuSelectedState = useStore(microMenuSelected);
	const primaryButtonTextState = useStore(primaryButtonText);
	const primaryButtonVariantState = useStore(primaryButtonVariant);
	const secondaryButtonTextState = useStore(secondaryButtonText);
	const secondaryButtonDisabledState = useStore(secondaryButtonDisabled);
	const isGeneratingMessagesState = useStore(isGeneratingMessages);
	const isThisMyStreamState = useStore(isThisMyStream);
	const testMessagesButtonTextState = useStore(testMessagesButtonText);
	const testMessagesButtonVariantState = useStore(testMessagesButtonVariant);
	const showSubsExtraTicketsState = useStore(showSubsExtraTickets);
	const showVipsExtraTicketsState = useStore(showVipsExtraTickets);

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
			isThisMyStream.mount(),
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

	const handleChannelSwitch = async (broadcasterId: string) => {
		console.log("🎯 Canal seleccionado:", broadcasterId);

		let selectedChannel = modedChannels?.find(
			(channel) => channel.broadcaster_id === broadcasterId,
		);

		if (user?.id === broadcasterId) {
			selectedChannel = {
				broadcaster_id: user.id,
				broadcaster_login: user.login,
				broadcaster_name: user.display_name,
			};
		}

		if (!selectedChannel) {
			console.error("❌ Canal no encontrado:", broadcasterId);
			toast.error("❌ Error", {
				description: "Canal no encontrado",
				duration: 3000,
			});
			return;
		}

		const channelFallback = chatStore.state.currentChannel;

		if (user) {
			setCurrentChannel({
				id: selectedChannel.broadcaster_id,
				login: selectedChannel.broadcaster_login,
				name: selectedChannel.broadcaster_name,
			});
		}

		try {
			await switchToChannel(
				broadcasterId,
				selectedChannel.broadcaster_name,
				{ eventSubHook },
				context.twitchAPI,
			);
		} catch (error) {
			console.error("❌ Error en cambio de canal:", error);
			if (channelFallback) {
				setCurrentChannel({
					id: channelFallback.id,
					login: channelFallback.login,
					name: channelFallback.name,
				});
			}
		}
	};

	// Helper for field IDs
	const createFieldId = (name: string) => `${baseId}-${name}`;

	// Field IDs
	const keywordId = createFieldId("keyword");
	const advancedId = createFieldId("advanced");
	const ignoreModsId = createFieldId("ignoreMods");
	const ignoreSubsId = createFieldId("ignoreSubs");
	const ignoreVipsId = createFieldId("ignoreVips");
	const caseSensitiveId = createFieldId("caseSensitive");
	const removeWinnersId = createFieldId("removeWinners");
	const subsExtraTicketsId = createFieldId("subsExtraTickets");
	const vipsExtraTicketsId = createFieldId("vipsExtraTickets");
	const sendRaffleUpdatesId = createFieldId("sendRaffleUpdates");
	const generateTestMessagesId = createFieldId("generateTestMessages");
	const clearChatId = createFieldId("clearChat");

	return (
		<>
			<div className="@container flex flex-col justify-center space-y-4 rounded-lg bg-card px-4 py-4">
				{/* Main Raffle Controls */}
				{microMenuSelectedState === "raffle" && (
					<>
						<section className="space-y-4">
							<div className="space-y-4">
								<div className="">
									<TypographyH4>Ajustes de Rifa</TypographyH4>
								</div>
								{/* Key Word */}
								<div className="">
									<FloatingInput
										id={keywordId}
										label="Palabra clave"
										value={raffleConfig.keyword}
										onKeyUp={(
											e: React.KeyboardEvent<HTMLInputElement>,
										) => {
											if (e.key === "Enter") {
												handleRaffleAction(
													createRaffleUiAction.keywordEnterPressed(),
												);
											}
										}}
										onChange={(keyword: string) => {
											handleRaffleAction(
												createRaffleUiAction.updateKeyword(
													keyword,
												),
											);
										}}
										placeholder="Ej: puroprimo"
										disabled={isCapturing || isRaffleRigged}
									/>
								</div>
								{/* Main Raffle Buttons */}
								<div className="space-y-4">
									<div className="flex">
										<Button
											onClick={() => {
												if (
													isCapturing ||
													isRaffleRigged
												) {
													handleRaffleAction(
														createRaffleUiAction.stopRaffle(),
													);
												} else {
													handleRaffleAction(
														createRaffleUiAction.startRaffle(),
													);
												}
											}}
											disabled={!canStartRaffleState}
											variant={primaryButtonVariantState}
											className={`grow-1 font-bold ${showDropdownMenuState && "rounded-r-none"}`}
										>
											{primaryButtonTextState}
										</Button>
										{showDropdownMenuState && (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="default"
														size="icon"
														className="fade-in slide-in-from-left-2 w-8 animate-in rounded-l-none border-l duration-200 ease-out"
													>
														<CaretDownIcon className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => {
															handleRaffleAction(
																createRaffleUiAction.clearParticipants(),
															);
														}}
													>
														<EraserIcon className="h-4 w-4" />{" "}
														¿Borrar participantes?
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</div>
									<div>
										<Button
											onClick={() => {
												if (isRaffleRigged) {
													handleRaffleAction(
														createRaffleUiAction.executeRaffle(),
													);
												} else {
													handleRaffleAction(
														createRaffleUiAction.rigRaffle(),
													);
												}
											}}
											disabled={
												secondaryButtonDisabledState
											}
											variant="secondary"
											className="w-full font-bold"
										>
											{secondaryButtonTextState}
										</Button>
									</div>
								</div>
							</div>
						</section>
						{/* Overlay to disable advanced options */}
						<DisabledOverlay disabled={hideRaffleControlsState}>
							<section className="py-4">
								<div className="inline-flex space-x-3">
									<Switch
										checked={raffleConfig.advanced}
										id={advancedId}
										onCheckedChange={(checked) =>
											handleRaffleAction(
												createRaffleUiAction.toggleAdvanced(
													checked,
												),
											)
										}
									/>
									<Label htmlFor={advancedId}>
										¿Opciones avanzadas?
									</Label>
								</div>
							</section>
							{/* Advanced Options */}
							{raffleConfig.advanced && (
								<section className="fade-in slide-in-from-top-2 animate-in space-y-4 duration-200 ease-out">
									<div className="space-y-4">
										<div>
											<TypographyMuted>
												Filtros de Mensajes
											</TypographyMuted>
										</div>
										<div className="space-y-4">
											<div className="inline-flex space-x-3">
												<Switch
													checked={
														raffleConfig.ignoreMods
													}
													id={ignoreModsId}
													onCheckedChange={(
														checked,
													) =>
														handleRaffleAction(
															createRaffleUiAction.toggleIgnoreMods(
																checked,
															),
														)
													}
												/>
												<Label
													htmlFor={ignoreModsId}
													className="flex-shrink-0 text-sm"
												>
													¿Ignorar mods?
												</Label>
												<TooltipInfo
													icon="QuestionIcon"
													size={16}
													content="No participan los mods"
												/>
											</div>
											<div className="inline-flex space-x-3">
												<Switch
													checked={
														raffleConfig.ignoreSubs
													}
													id={ignoreSubsId}
													onCheckedChange={(
														checked,
													) =>
														handleRaffleAction(
															createRaffleUiAction.toggleIgnoreSubs(
																checked,
															),
														)
													}
												/>
												<Label
													htmlFor={ignoreSubsId}
													className="flex-shrink-0 text-sm"
												>
													¿Ignorar suscriptores?
												</Label>
												<TooltipInfo
													icon="QuestionIcon"
													size={16}
													content="No participan los suscriptores"
												/>
											</div>
											<div className="inline-flex space-x-3">
												<Switch
													checked={
														raffleConfig.ignoreVips
													}
													id={ignoreVipsId}
													onCheckedChange={(
														checked,
													) =>
														handleRaffleAction(
															createRaffleUiAction.toggleIgnoreVips(
																checked,
															),
														)
													}
												/>
												<Label
													htmlFor={ignoreVipsId}
													className="flex-shrink-0 text-sm"
												>
													¿Ignorar VIPs?
												</Label>
												<TooltipInfo
													icon="QuestionIcon"
													size={16}
													content="No participan los VIPs"
												/>
											</div>
											<div className="inline-flex space-x-3">
												<Switch
													checked={
														raffleConfig.caseSensitive
													}
													id={caseSensitiveId}
													onCheckedChange={(
														checked,
													) =>
														handleRaffleAction(
															createRaffleUiAction.toggleCaseSensitive(
																checked,
															),
														)
													}
												/>
												<Label
													htmlFor={caseSensitiveId}
													className="flex-shrink-0 text-sm"
												>
													¿Respetar mayúsculas?
												</Label>
												<TooltipInfo
													icon="QuestionIcon"
													size={16}
													content="Si palabra es 'Hola' no captura 'hola'"
												/>
											</div>
										</div>
										<div>
											<TypographyMuted>
												Configuración de Sorteo
											</TypographyMuted>
										</div>
										<div className="space-y-4">
											<div className="inline-flex space-x-3">
												<Switch
													checked={
														raffleConfig.removeWinners
													}
													id={removeWinnersId}
													onCheckedChange={(
														checked,
													) =>
														handleRaffleAction(
															createRaffleUiAction.toggleRemoveWinners(
																checked,
															),
														)
													}
												/>
												<Label
													htmlFor={removeWinnersId}
													className="flex-shrink-0 text-sm"
												>
													¿Quitar a los ganadores?
												</Label>
												<TooltipInfo
													icon="QuestionIcon"
													size={16}
													content="Los ganadores no vuelven a participar"
												/>
											</div>
											{!raffleConfig.ignoreSubs && (
												<>
													<div className="inline-flex space-x-3">
														<Switch
															checked={
																raffleConfig.subsExtraTickets
															}
															id={
																subsExtraTicketsId
															}
															onCheckedChange={(
																checked,
															) =>
																handleRaffleAction(
																	createRaffleUiAction.toggleSubsExtraTickets(
																		checked,
																	),
																)
															}
														/>
														<Label
															htmlFor={
																subsExtraTicketsId
															}
															className="flex-shrink-0 text-sm"
														>
															¿Subs con más
															boletos?
														</Label>
														<TooltipInfo
															icon="QuestionIcon"
															size={16}
															content="Subs reciben más participaciones"
														/>
													</div>

													{showSubsExtraTicketsState && (
														<div className="fade-in slide-in-from-top-2 animate-in duration-200 ease-out">
															<Label className="my-1 text-foreground text-sm">
																¿Cuántos boletos
																más por sub?
															</Label>
															<NumberInput
																key="subsExtraValue"
																className="py-0"
																minValue={1}
																value={
																	raffleConfig.subsExtraValue
																}
																onClick={(
																	_,
																	counter,
																) =>
																	handleRaffleAction(
																		createRaffleUiAction.updateSubsExtraValue(
																			counter,
																		),
																	)
																}
															/>
														</div>
													)}
												</>
											)}
											{!raffleConfig.ignoreVips && (
												<>
													<div className="inline-flex space-x-3">
														<Switch
															checked={
																raffleConfig.vipsExtraTickets
															}
															id={
																vipsExtraTicketsId
															}
															onCheckedChange={(
																checked,
															) =>
																handleRaffleAction(
																	createRaffleUiAction.toggleVipsExtraTickets(
																		checked,
																	),
																)
															}
														/>
														<Label
															htmlFor={
																vipsExtraTicketsId
															}
															className="flex-shrink-0 text-sm"
														>
															¿VIPs con más
															boletos?
														</Label>
														<TooltipInfo
															icon="QuestionIcon"
															size={16}
															content="VIPs reciben más participaciones"
														/>
													</div>
													{showVipsExtraTicketsState && (
														<div className="fade-in slide-in-from-top-2 animate-in duration-200 ease-out">
															<Label className="my-1 text-foreground text-sm">
																¿Cuántos boletos
																más por VIP?
															</Label>
															<NumberInput
																key="vipsExtraValue"
																className="py-0"
																minValue={1}
																value={
																	raffleConfig.vipsExtraValue
																}
																onClick={(
																	_,
																	counter,
																) =>
																	handleRaffleAction(
																		createRaffleUiAction.updateVipsExtraValue(
																			counter,
																		),
																	)
																}
															/>
														</div>
													)}
												</>
											)}
										</div>
									</div>
								</section>
							)}
						</DisabledOverlay>
					</>
				)}
				{microMenuSelectedState === "settings" && (
					<section className="space-y-4">
						<div className="space-y-4">
							<div>
								<TypographyH4>
									Configuraciones Generales
								</TypographyH4>
							</div>
							<div>
								<TypographyMuted>
									Canales en los que eres Moderador:
								</TypographyMuted>
							</div>
							<div className="space-y-4">
								{modedChannels && modedChannels.length > 0 && (
									<Select onValueChange={handleChannelSwitch}>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Cambia de canal" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>
													Canales que moderas
												</SelectLabel>
												{modedChannels.map((value) => (
													<SelectItem
														key={
															value.broadcaster_id
														}
														value={
															value.broadcaster_id
														}
													>
														{value.broadcaster_name}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								)}
								{isThisMyStreamState ? (
									<div className="inline-flex space-x-3">
										<Switch
											checked={
												raffleConfig.sendRaffleUpdates
											}
											id={sendRaffleUpdatesId}
											onCheckedChange={(checked) =>
												handleRaffleAction(
													createRaffleUiAction.toggleRaffleUpdates(
														checked,
													),
												)
											}
										/>
										<Label
											htmlFor={sendRaffleUpdatesId}
											className="flex-shrink-0 text-sm"
										>
											¿Actualizar chat?
										</Label>
										<TooltipInfo
											icon="QuestionIcon"
											size={16}
											content="Mandar actualizaciones de la rifa al chat con tu usuario"
										/>
									</div>
								) : (
									<div>
										<Button
											onClick={
												user
													? () =>
															handleChannelSwitch(
																user.id,
															)
													: undefined
											}
											variant="secondary"
											className="w-full font-bold"
										>
											¿Volver a tu canal?
										</Button>
									</div>
								)}
								<Alert variant="default">
									<QuestionIcon />
									<AlertDescription>
										<p>Cambiar de canal reinicia la rifa</p>
									</AlertDescription>
								</Alert>
							</div>
						</div>
					</section>
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
