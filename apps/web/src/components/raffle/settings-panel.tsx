import {
	CaretDownIcon,
	EraserIcon,
	WarningDiamondIcon,
} from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-store";
import { useId, useEffect } from "react";
import { DisabledOverlay } from "@/components/disabled-overlay";
import { NumberInput } from "@/components/number-input";
import { TooltipInfo } from "@/components/tooltip-info";
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
import { Switch } from "@/components/ui/switch";
import { TypographyH4 } from "@/components/ui/typography";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

// Clean imports - universal handler pattern
import { handleRaffleAction } from "@/lib/raffleActionHandler";
import { createRaffleUiAction } from "@/types/raffle-ui-factory";
import {
	chatStore,
	// Derived states
	canStartRaffle,
	hasWinners,
	showDropdownMenu,
	showCancelDialog,
	hideRaffleControls,
	microMenuSelected,
	primaryButtonText,
	primaryButtonVariant,
	secondaryButtonText,
	secondaryButtonDisabled,
	isGeneratingMessages,
	testMessagesButtonText,
	testMessagesButtonVariant,
	debugStateButtonText,
	debugStateButtonVariant,
	showSubsExtraTickets,
	showVipsExtraTickets,
} from "@/stores/chat";

export function SettingsPanel() {
	const baseId = useId();
	const participants = useStore(chatStore, (state) => state.participants);
	const isCapturing = useStore(chatStore, (state) => state.isCapturing);
	const isRaffleRigged = useStore(chatStore, (state) => state.isRaffleRigged);
	const raffleConfig = useStore(chatStore, (state) => state.raffleConfig);

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
	const testMessagesButtonTextState = useStore(testMessagesButtonText);
	const testMessagesButtonVariantState = useStore(testMessagesButtonVariant);
	const debugStateButtonTextState = useStore(debugStateButtonText);
	const debugStateButtonVariantState = useStore(debugStateButtonVariant);
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
			testMessagesButtonText.mount(),
			testMessagesButtonVariant.mount(),
			debugStateButtonText.mount(),
			debugStateButtonVariant.mount(),
			showSubsExtraTickets.mount(),
			showVipsExtraTickets.mount(),
		];

		return () => {
			unsubscribers.forEach((unsub) => unsub());
		};
	}, []);

	return (
		<>
			<div className="@container flex flex-col bg-card justify-center space-y-4 rounded-lg px-4 py-4">
				{microMenuSelectedState === "raffle" && (
					<>
						<section className="space-y-4">
							<div className="space-y-4">
								<div className="">
									<TypographyH4>Ajustes de Rifa</TypographyH4>
								</div>
								<div className="">
									<FloatingInput
										id={`${baseId}-keyword`}
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
						<DisabledOverlay disabled={hideRaffleControlsState}>
							<section className="py-4">
								<div className="inline-flex space-x-3">
									<Switch
										checked={raffleConfig.advanced}
										id={`${baseId}-advanced`}
										onCheckedChange={(checked) =>
											handleRaffleAction(
												createRaffleUiAction.toggleAdvanced(
													checked,
												),
											)
										}
									/>
									<Label htmlFor="advanced">
										¿Opciones avanzadas?
									</Label>
								</div>
							</section>
							{raffleConfig.advanced && (
								<section className="fade-in slide-in-from-top-2 animate-in space-y-4 duration-200 ease-out">
									<div className="space-y-4">
										<div>
											<TypographyH4>
												Filtros de Mensajes
											</TypographyH4>
										</div>
										<div className="space-y-4">
											<div className="inline-flex space-x-3">
												<Switch
													checked={
														raffleConfig.ignoreMods
													}
													id={`${baseId}-ignoreMods`}
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
													htmlFor="ignoreMods"
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
													id={`${baseId}-ignoreSubs`}
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
													htmlFor="ignoreSubs"
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
													id={`${baseId}-ignoreVips`}
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
													htmlFor="ignoreVips"
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
													id={`${baseId}-caseSensitive`}
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
													htmlFor="caseSensitive"
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
											<TypographyH4>
												Configuración de Sorteo
											</TypographyH4>
										</div>
										<div className="space-y-4">
											<div className="inline-flex space-x-3">
												<Switch
													checked={
														raffleConfig.removeWinners
													}
													id={`${baseId}-removeWinners`}
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
													htmlFor="removeWinners"
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
															id={`${baseId}-subsExtraTickets`}
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
															htmlFor="subsExtraTickets"
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
															id={`${baseId}-vipsExtraTickets`}
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
															htmlFor="vipsExtraTickets"
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
					<>
						<section className="my-5 rounded-lg border bg-card">
							<TypographyH4>
								Todavía no tenemos nada aquí
							</TypographyH4>
						</section>
					</>
				)}
				{microMenuSelectedState === "dev" && (
					<>
						<section className="my-5 space-y-4 rounded-lg bg-card">
							<div>
								<Button
									id={`${baseId}-generateTestMessages`}
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
								<Button
									id={`${baseId}-showState`}
									onClick={() => {
										handleRaffleAction(
											createRaffleUiAction.toggleDebugState(),
										);
									}}
									variant={debugStateButtonVariantState}
									className="w-full font-bold"
								>
									{debugStateButtonTextState}
								</Button>
							</div>
							<div>
								<Button
									id={`${baseId}-clearChat`}
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
										Estos botones pueden afectar la rifa{" "}
										<strong>
											{
												"<<¡No los uses si no estas seguro!>>"
											}
										</strong>
									</p>
									<ul className="list-inside list-disc text-sm">
										<li>
											El boton de Generar Mensajes
											comienza a generar mensajes
											aleatorios simulados, pero pueden
											ser considerados en la rifa.
										</li>
										<li>
											El otro botón limpia el chat y esos
											mensajes no se pueden recuperar
										</li>
									</ul>
								</AlertDescription>
							</Alert>
						</section>
					</>
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
