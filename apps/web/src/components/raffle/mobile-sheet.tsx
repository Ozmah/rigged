import { EraserIcon } from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-store";
import { useEffect, useId } from "react";
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
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { TypographyH4 } from "@/components/ui/typography";
import { handleRaffleAction } from "@/lib/raffleActionHandler";
import {
	canStartRaffle,
	chatStore,
	debugStateButtonText,
	debugStateButtonVariant,
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

interface MobileSettingsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function MobileSettingsSheet({
	open,
	onOpenChange,
}: MobileSettingsSheetProps) {
	const baseId = useId();

	const participants = useStore(chatStore, (state) => state.participants);
	const isCapturing = useStore(chatStore, (state) => state.isCapturing);
	const isRaffleRigged = useStore(chatStore, (state) => state.isRaffleRigged);
	const raffleConfig = useStore(chatStore, (state) => state.raffleConfig);

	// Derived state
	const canStartRaffleState = useStore(canStartRaffle);
	const hasWinnersState = useStore(hasWinners);
	const showCancelDialogState = useStore(showCancelDialog);
	const hideRaffleControlsState = useStore(hideRaffleControls);
	const primaryButtonTextState = useStore(primaryButtonText);
	const primaryButtonVariantState = useStore(primaryButtonVariant);
	const secondaryButtonTextState = useStore(secondaryButtonText);
	const secondaryButtonDisabledState = useStore(secondaryButtonDisabled);
	const showSubsExtraTicketsState = useStore(showSubsExtraTickets);
	const showVipsExtraTicketsState = useStore(showVipsExtraTickets);

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
			debugStateButtonText.mount(),
			debugStateButtonVariant.mount(),
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
				<SheetContent className="w-full overflow-y-auto p-3">
					<SheetHeader>
						<SheetTitle>Configuración de Rifa</SheetTitle>
						<SheetDescription>
							Controla todos los aspectos de tu rifa desde aquí
						</SheetDescription>
					</SheetHeader>

					<div className="space-y-6 py-4">
						{/* === RAFFLE SECTION === */}
						<section className="space-y-4">
							<TypographyH4>Ajustes de Rifa</TypographyH4>

							{/* Keyword Input */}
							<div className="space-y-2">
								<FloatingInput
									id={`${baseId}-keyword-mobile`}
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

							{/* Primary Actions */}
							<div className="space-y-3">
								<Button
									onClick={() => {
										if (isCapturing || isRaffleRigged) {
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
									className="w-full font-bold"
									size="lg"
								>
									{primaryButtonTextState}
								</Button>

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
									disabled={secondaryButtonDisabledState}
									variant="secondary"
									className="w-full font-bold"
									size="lg"
								>
									{secondaryButtonTextState}
								</Button>

								{/* Clear Participants */}
								{isCapturing && participants.length > 0 && (
									<Button
										onClick={() => {
											handleRaffleAction(
												createRaffleUiAction.clearParticipants(),
											);
										}}
										variant="outline"
										className="w-full"
									>
										<EraserIcon className="mr-2 h-4 w-4" />
										Borrar participantes
									</Button>
								)}
							</div>
						</section>

						{/* Divider */}
						<div className="border-border border-t" />

						{/* === ADVANCED OPTIONS SECTION === */}
						<DisabledOverlay disabled={hideRaffleControlsState}>
							<section className="space-y-4">
								<div className="flex items-center space-x-3">
									<Switch
										checked={raffleConfig.advanced}
										id={`${baseId}-advanced-mobile`}
										onCheckedChange={(checked) =>
											handleRaffleAction(
												createRaffleUiAction.toggleAdvanced(
													checked,
												),
											)
										}
									/>
									<Label
										htmlFor={`${baseId}-advanced-mobile`}
										className="font-medium text-base"
									>
										Opciones avanzadas
									</Label>
								</div>

								{raffleConfig.advanced && (
									<div className="space-y-6 border-muted border-l-2 pl-4">
										{/* Message Filters */}
										<div className="space-y-4">
											<TypographyH4 className="text-sm">
												Filtros de Mensajes
											</TypographyH4>

											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-2">
														<Label
															htmlFor={`${baseId}-ignoreMods-mobile`}
															className="text-sm"
														>
															Ignorar mods
														</Label>
														<TooltipInfo
															icon="QuestionIcon"
															size={14}
															content="No participan los mods"
														/>
													</div>
													<Switch
														checked={
															raffleConfig.ignoreMods
														}
														id={`${baseId}-ignoreMods-mobile`}
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
												</div>

												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-2">
														<Label
															htmlFor={`${baseId}-ignoreSubs-mobile`}
															className="text-sm"
														>
															Ignorar suscriptores
														</Label>
														<TooltipInfo
															icon="QuestionIcon"
															size={14}
															content="No participan los suscriptores"
														/>
													</div>
													<Switch
														checked={
															raffleConfig.ignoreSubs
														}
														id={`${baseId}-ignoreSubs-mobile`}
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
												</div>

												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-2">
														<Label
															htmlFor={`${baseId}-ignoreVips-mobile`}
															className="text-sm"
														>
															Ignorar VIPs
														</Label>
														<TooltipInfo
															icon="QuestionIcon"
															size={14}
															content="No participan los VIPs"
														/>
													</div>
													<Switch
														checked={
															raffleConfig.ignoreVips
														}
														id={`${baseId}-ignoreVips-mobile`}
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
												</div>

												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-2">
														<Label
															htmlFor={`${baseId}-caseSensitive-mobile`}
															className="text-sm"
														>
															Respetar mayúsculas
														</Label>
														<TooltipInfo
															icon="QuestionIcon"
															size={14}
															content="Si palabra es 'Hola' no captura 'hola'"
														/>
													</div>
													<Switch
														checked={
															raffleConfig.caseSensitive
														}
														id={`${baseId}-caseSensitive-mobile`}
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
												</div>
											</div>
										</div>

										{/* Raffle Configuration */}
										<div className="space-y-4">
											<TypographyH4 className="text-sm">
												Configuración de Sorteo
											</TypographyH4>

											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-2">
														<Label
															htmlFor={`${baseId}-removeWinners-mobile`}
															className="text-sm"
														>
															Quitar ganadores
														</Label>
														<TooltipInfo
															icon="QuestionIcon"
															size={14}
															content="Los ganadores no vuelven a participar"
														/>
													</div>
													<Switch
														checked={
															raffleConfig.removeWinners
														}
														id={`${baseId}-removeWinners-mobile`}
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
												</div>

												{/* Subs Extra Tickets */}
												{!raffleConfig.ignoreSubs && (
													<>
														<div className="flex items-center justify-between">
															<div className="flex items-center space-x-2">
																<Label
																	htmlFor={`${baseId}-subsExtraTickets-mobile`}
																	className="text-sm"
																>
																	Subs con más
																	boletos
																</Label>
																<TooltipInfo
																	icon="QuestionIcon"
																	size={14}
																	content="Subs reciben más participaciones"
																/>
															</div>
															<Switch
																checked={
																	raffleConfig.subsExtraTickets
																}
																id={`${baseId}-subsExtraTickets-mobile`}
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
														</div>

														{showSubsExtraTicketsState && (
															<div className="space-y-2 pl-4">
																<Label className="text-muted-foreground text-xs">
																	Boletos
																	extra por
																	sub
																</Label>
																<NumberInput
																	key="subsExtraValue-mobile"
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

												{/* VIPs Extra Tickets */}
												{!raffleConfig.ignoreVips && (
													<>
														<div className="flex items-center justify-between">
															<div className="flex items-center space-x-2">
																<Label
																	htmlFor={`${baseId}-vipsExtraTickets-mobile`}
																	className="text-sm"
																>
																	VIPs con más
																	boletos
																</Label>
																<TooltipInfo
																	icon="QuestionIcon"
																	size={14}
																	content="VIPs reciben más participaciones"
																/>
															</div>
															<Switch
																checked={
																	raffleConfig.vipsExtraTickets
																}
																id={`${baseId}-vipsExtraTickets-mobile`}
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
														</div>

														{showVipsExtraTicketsState && (
															<div className="space-y-2 pl-4">
																<Label className="text-muted-foreground text-xs">
																	Boletos
																	extra por
																	VIP
																</Label>
																<NumberInput
																	key="vipsExtraValue-mobile"
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
									</div>
								)}
							</section>
						</DisabledOverlay>

						{/* Divider */}
						<div className="border-border border-t" />

						{/* === SETTINGS SECTION === */}
						<section className="space-y-4">
							<TypographyH4>
								Configuraciones Generales
							</TypographyH4>
							<div className="rounded-lg border bg-muted/50 p-4">
								<p className="text-muted-foreground text-sm">
									Próximamente: Configuraciones adicionales de
									la aplicación
								</p>
							</div>
						</section>

						{/* Divider */}
						<div className="border-border border-t" />

						{/* === DEV TOOLS SECTION === */}
						{/* Considering removing dev tools from mobile version */}
						{/* <section className="space-y-4">
							<TypographyH4>
								Herramientas de Desarrollo
							</TypographyH4>

							<div className="space-y-3">
								<Button
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
									className="w-full"
								>
									{testMessagesButtonTextState}
								</Button>

								<Button
									onClick={() => {
										handleRaffleAction(
											createRaffleUiAction.toggleDebugState(),
										);
									}}
									variant={debugStateButtonVariantState}
									className="w-full"
								>
									{debugStateButtonTextState}
								</Button>

								<Button
									onClick={() => {
										handleRaffleAction(
											createRaffleUiAction.clearChatMessages(),
										);
									}}
									variant="destructive"
									className="w-full"
								>
									Limpiar Chat
								</Button>
							</div>

							<Alert variant="destructive">
								<WarningDiamondIcon className="h-4 w-4" />
								<AlertTitle>¡Cuidado!</AlertTitle>
								<AlertDescription className="text-sm">
									<p className="mb-2">
										Estos botones pueden afectar la rifa{" "}
										<strong>
											¡No los uses si no estás seguro!
										</strong>
									</p>
									<ul className="list-inside list-disc space-y-1 text-xs">
										<li>
											Generar Mensajes crea mensajes
											simulados que pueden participar en
											la rifa
										</li>
										<li>
											Limpiar Chat elimina todos los
											mensajes permanentemente
										</li>
									</ul>
								</AlertDescription>
							</Alert>
						</section> */}
					</div>
				</SheetContent>
			</Sheet>

			{/* AlertDialog */}
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
