import {
	CaretDownIcon,
	EraserIcon,
	WarningDiamondIcon,
} from "@phosphor-icons/react";
import { useStore } from "@tanstack/react-store";
import { useId } from "react";
import { toast } from "sonner";
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
import {
	chatStore,
	clearChatMessages,
	clearParticipants,
	executeRaffle,
	resetRaffle,
	rigTheRaffle,
	startRaffleCapture,
	startTestMessageGeneration,
	stopRaffleCapture,
	stopTestMessageGeneration,
	updateRaffleConfig,
} from "@/stores/chat";
import { uiStore, updateUiState } from "@/stores/ui";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function SettingsPanel() {
	const baseId = useId();
	const participants = useStore(chatStore, (state) => state.participants);
	const isCapturing = useStore(chatStore, (state) => state.isCapturing);
	const isRaffleRigged = useStore(chatStore, (state) => state.isRaffleRigged);
	const raffleWinners = useStore(chatStore, (state) => state.winners);
	const isConnected = useStore(
		chatStore,
		(state) => state.connectionStatus === "connected",
	);
	const raffleConfig = useStore(chatStore, (state) => state.raffleConfig);

	// UI State
	const microMenuSelected = useStore(
		uiStore,
		(state) => state.microMenuSelected,
	);
	const showCancelDialog = useStore(
		uiStore,
		(state) => state.showCancelDialog,
	);
	const hideRaffleControls = useStore(
		uiStore,
		(state) => state.hideRaffleControls,
	);
	const isRaffleStateOpen = useStore(
		uiStore,
		(state) => state.isRaffleStateOpen,
	);
	const hasValidKeyword =
		raffleConfig.keyword && raffleConfig.keyword.trim() !== "";
	const canStartRaffle = isConnected && hasValidKeyword;

	// All these handles need to go to a single hook
	// Need implementation for a debug mode
	// const debugMode = useStore(authStore, (state) => state.debugMode);
	// if (debugMode)
	const handleAddTestMessages = () => {
		startTestMessageGeneration();
		toast.success("🎲 Generando Mensajes", {
			description: "Creando mensajes para simular rifas",
			duration: 3000,
		});
	};

	const handleStopTestMessages = () => {
		stopTestMessageGeneration();
		toast.success("🎲 Mensajes detenidos", {
			duration: 3000,
		});
	};

	const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleStartCapture();
		}
	};

	const handleCounter = (counterId: string, counter: number) => {
		updateRaffleConfig({ [counterId]: counter });
	};

	const handleToggle = (switchId: string, checked: boolean) => {
		updateRaffleConfig({ [switchId]: checked });
	};

	const handleStartCapture = () => {
		updateUiState({ hideRaffleControls: true });
		startRaffleCapture();
		toast.success("🎲 Captura iniciada", {
			description: `Capturando participantes con la palabra "${raffleConfig.keyword}"`,
			duration: 3000,
		});
	};

	const handleStopCapture = () => {
		if (participants.length > 0) {
			updateUiState({ showCancelDialog: true });
		} else {
			updateUiState({ hideRaffleControls: false });
			stopRaffleCapture();
			toast.info("⏹️ Rifa Cancelada", {
				duration: 3000,
			});
		}
	};

	const handleRaffleFinalStep = () => {
		const winner = executeRaffle();
		console.log("Raffle winner:", winner);

		if (winner) {
			toast.success("🎉 ¡Felicidades!", {
				description: `Ganador: ${winner.displayName}`,
				duration: 8000,
			});
		} else {
			toast.error("❌ Hubo un problema con el sorteo", {
				duration: 4000,
			});
		}
	};

	const handleKeywordChange = (keyword: string) => {
		updateRaffleConfig({ keyword });
	};

	// Debug Options
	const handleShowRaffleState = () => {
		updateUiState({ isRaffleStateOpen: !isRaffleStateOpen });
	};

	const isGeneratingMessages = useStore(
		chatStore,
		(state) => state.debug.isChatGenerating,
	);

	return (
		<>
			<div className="@container flex flex-col justify-center space-y-4 rounded-lg border bg-card px-4 py-4">
				{microMenuSelected === "raffle" && (
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
										onKeyUp={handleKeyUp}
										onChange={handleKeywordChange}
										placeholder="Ej: puroprimo"
										disabled={isCapturing || isRaffleRigged}
									/>
								</div>
								<div className="space-y-4">
									<div className="flex">
										<Button
											onClick={
												isCapturing
													? handleStopCapture
													: isRaffleRigged
														? handleStopCapture
														: handleStartCapture
											}
											disabled={!canStartRaffle}
											variant={
												isCapturing
													? "outline"
													: isRaffleRigged
														? "outline"
														: "default"
											}
											className={`grow-1 font-bold ${isCapturing && participants.length > 0 && "rounded-r-none"}`}
										>
											{isCapturing
												? "Cancelar Rifa"
												: isRaffleRigged
													? raffleWinners.length
														? "Terminar Rifa"
														: "Cancelar Rifa"
													: "Iniciar Rifa"}
										</Button>
										{isCapturing &&
											participants.length > 0 && (
												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
													>
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
																clearParticipants();
															}}
														>
															<EraserIcon className="h-4 w-4" />{" "}
															¿Borrar
															participantes?
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
									</div>
									<div>
										<Button
											onClick={() => {
												isRaffleRigged
													? handleRaffleFinalStep()
													: rigTheRaffle();
											}}
											disabled={
												(!isCapturing &&
													!isRaffleRigged) ||
												participants.length === 0
											}
											variant="secondary"
											className="w-full font-bold"
										>
											{participants.length > 0
												? isRaffleRigged
													? raffleWinners.length
														? "¿Elegir otro ganador?"
														: "¡Elegir un ganador!"
													: "¡Siguiente paso!"
												: "Sin participantes"}
										</Button>
									</div>
								</div>
							</div>
						</section>
						<DisabledOverlay disabled={hideRaffleControls}>
							<section className="py-4">
								<div className="inline-flex space-x-3">
									<Switch
										checked={raffleConfig.advanced}
										id={`${baseId}-advanced`}
										onCheckedChange={(checked) =>
											handleToggle("advanced", checked)
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
														handleToggle(
															"ignoreMods",
															checked,
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
														handleToggle(
															"ignoreSubs",
															checked,
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
														handleToggle(
															"ignoreVips",
															checked,
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
														handleToggle(
															"caseSensitive",
															checked,
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
														handleToggle(
															"removeWinners",
															checked,
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
													// Change hardcoded value
													size={16}
													content="Los ganadores no vuelven a participar"
												/>
											</div>
											{/* <div className="inline-flex space-x-3">
												<Switch
													checked={
														raffleConfig.followersOnly
													}
													id={`${baseId}-followersOnly`}
													onCheckedChange={(checked) =>
														handleToggle(
															"followersOnly",
															checked,
														)
													}
												/>
												<Label
													htmlFor="followersOnly"
													className="flex-shrink-0 text-sm"
												>
													¿Sólo seguidores?
												</Label>
												<TooltipInfo
													icon="QuestionIcon"
													// Change hardcoded value
													size={16}
													content="Si no son seguidores, no participan"
												/>
											</div> */}
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
																handleToggle(
																	"subsExtraTickets",
																	checked,
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
															// Change hardcoded value
															size={16}
															content="Subs reciben más participaciones"
														/>
													</div>

													{raffleConfig.subsExtraTickets && (
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
																	_e,
																	counter,
																) =>
																	handleCounter(
																		"subsExtraValue",
																		counter,
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
																handleToggle(
																	"vipsExtraTickets",
																	checked,
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
															// Change hardcoded value
															size={16}
															content="VIPs reciben más participaciones"
														/>
													</div>
													{raffleConfig.vipsExtraTickets && (
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
																	_e,
																	counter,
																) =>
																	handleCounter(
																		"vipsExtraValue",
																		counter,
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
				{microMenuSelected === "settings" && (
					<>
						{/* Some other settings */}
						<section className="my-5 rounded-lg border bg-card">
							<TypographyH4>
								Todavía no tenemos nada aquí
							</TypographyH4>
						</section>
					</>
				)}
				{microMenuSelected === "dev" && (
					<>
						{/* Debug Tooling */}
						<section className="my-5 space-y-4 rounded-lg bg-card">
							<div>
								<Button
									id={`${baseId}-generateTestMessages`}
									onClick={
										isGeneratingMessages
											? handleStopTestMessages
											: handleAddTestMessages
									}
									variant={
										isGeneratingMessages
											? "secondary"
											: "default"
									}
									className="w-full font-bold"
								>
									{isGeneratingMessages
										? "Detener"
										: "Generar Mensajes"}
								</Button>
							</div>
							<div>
								<Button
									id={`${baseId}-showState`}
									onClick={handleShowRaffleState}
									variant={
										isRaffleStateOpen
											? "secondary"
											: "default"
									}
									className="w-full font-bold"
								>
									{isRaffleStateOpen
										? "Esconder Datos Dev"
										: "Mostrar Datos Dev"}
								</Button>
							</div>
							<div>
								<Button
									id={`${baseId}-clearChat`}
									onClick={clearChatMessages}
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
				open={showCancelDialog}
				onOpenChange={(open) =>
					updateUiState({ showCancelDialog: open })
				}
			>
				<AlertDialogContent>
					<AlertDialogTitle>
						{raffleWinners.length
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
								stopRaffleCapture();
								resetRaffle();
								updateUiState({ hideRaffleControls: false });
								const raffleStatus = raffleWinners.length
									? "Terminada"
									: "Cancelada";
								toast.info(`⏹️ Rifa ${raffleStatus}`, {
									duration: 3000,
								});
							}}
						>
							{raffleWinners.length
								? "Sí, terminar rifa"
								: "Sí, cancelar rifa"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
